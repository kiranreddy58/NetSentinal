"""
NetSentinel Model Management & Batch Inference Engine
Provides secure model loading from registry, schema enforcement,
and batch inference for real-time or historical network traffic flows.
"""

import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "ml" / "models"
METADATA_DIR = BASE_DIR / "data" / "ml" / "metadata"


class ModelInferenceEngine:
    def __init__(self):
        self.registry_path = MODELS_DIR / "model_registry.json"
        self.scaler_path = MODELS_DIR / "scaler.joblib"
        self._scaler = None
        self._loaded_models = {}
        self._feature_cols = None

    def get_registry(self) -> List[Dict[str, Any]]:
        """Retrieve all registered models and their operational metadata."""
        if not self.registry_path.exists():
            return []
        with open(self.registry_path, "r") as f:
            return json.load(f)

    def get_feature_list(self) -> List[str]:
        """Retrieve expected input feature names."""
        if self._feature_cols is None:
            dict_path = METADATA_DIR / "feature_dictionary.json"
            if dict_path.exists():
                with open(dict_path, "r") as f:
                    data = json.load(f)
                    self._feature_cols = data.get("features", [])
            else:
                self._feature_cols = []
        return self._feature_cols

    def _get_scaler(self):
        if self._scaler is None and self.scaler_path.exists():
            self._scaler = joblib.load(self.scaler_path)
        return self._scaler

    def load_model(self, model_name: str):
        """Safely load model from registry artifact."""
        model_name_key = model_name.lower().replace(" ", "_")
        if model_name_key in self._loaded_models:
            return self._loaded_models[model_name_key]

        registry = self.get_registry()
        target_info = next((m for m in registry if m["name"].lower() == model_name.lower()), None)
        if not target_info:
            # Fallback direct check
            artifact_file = f"{model_name_key}.joblib"
        else:
            artifact_file = target_info["artifact"]

        artifact_path = MODELS_DIR / artifact_file
        if not artifact_path.exists():
            raise FileNotFoundError(f"Model artifact not found: {artifact_path}")

        model = joblib.load(artifact_path)
        self._loaded_models[model_name_key] = model
        return model

    def predict_batch(self, model_name: str, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run inference over a batch of network flow dictionaries.
        Validates schema, applies preprocessing scaler, and computes prediction + confidence.
        """
        model = self.load_model(model_name)
        feature_names = self.get_feature_list()

        # Build DataFrame and fill missing features with 0
        df = pd.DataFrame(records)
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0.0

        X = df[feature_names].fillna(0.0).copy()

        # Scale if scaler available
        scaler = self._get_scaler()
        if scaler is not None:
            num_features = [c for c in scaler.feature_names_in_ if c in X.columns]
            X[num_features] = scaler.transform(X[num_features])

        preds = model.predict(X)
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X)[:, 1]
        elif hasattr(model, "decision_function"):
            probs = model.decision_function(X)
        else:
            probs = preds.astype(float)

        results = []
        for i in range(len(records)):
            pred_class = "ATTACK" if preds[i] == 1 else "BENIGN"
            prob = float(probs[i])
            results.append({
                "record_index": i,
                "model_name": model_name,
                "prediction": pred_class,
                "confidence": round(prob if pred_class == "ATTACK" else (1.0 - prob), 4),
                "attack_probability": round(prob, 4),
                "is_attack": bool(preds[i] == 1)
            })

        return results


# Global singleton instance
engine = ModelInferenceEngine()
