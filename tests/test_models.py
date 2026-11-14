"""
Unit Tests for Machine Learning & Anomaly Detection Models
"""
import unittest
import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "ml" / "models"
REPORTS_DIR = BASE_DIR / "ml" / "reports"
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"

class TestMLModels(unittest.TestCase):
    def test_model_artifacts_exist(self):
        """Verify all trained model joblib files exist."""
        expected_models = [
            "random_forest.joblib",
            "gradient_boosting.joblib",
            "baseline_dt.joblib",
            "isolation_forest.joblib",
            "scaler.joblib"
        ]
        for m in expected_models:
            path = MODELS_DIR / m
            self.assertTrue(path.exists(), f"Model artifact missing: {m}")

    def test_model_registry(self):
        """Verify model registry metadata."""
        reg_path = MODELS_DIR / "model_registry.json"
        self.assertTrue(reg_path.exists())
        with open(reg_path, "r") as f:
            registry = json.load(f)
        self.assertGreaterEqual(len(registry), 3)

    def test_model_inference_bounds(self):
        """Verify models produce valid probabilities between 0 and 1."""
        test_df = pd.read_parquet(PROCESSED_DIR / "test.parquet")
        non_feat = ["is_attack", "Label", "attack_family", "day_source", "Src IP dec", "Dst IP dec", "Timestamp", "Attempted Category"]
        features = [c for c in test_df.columns if c not in non_feat]
        sample_X = test_df[features].iloc[:20]

        rf = joblib.load(MODELS_DIR / "random_forest.joblib")
        probs = rf.predict_proba(sample_X)[:, 1]
        self.assertTrue(np.all((probs >= 0.0) & (probs <= 1.0)))

if __name__ == "__main__":
    unittest.main()
