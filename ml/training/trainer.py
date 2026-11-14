"""
NetSentinel ML Model Training & Evaluation Engine
Trains Supervised Classifiers:
1. Random Forest Classifier
2. Histogram Gradient Boosting Classifier (Fast, Memory-efficient)
3. Baseline Classifier (Decision Tree / Logistic Regression)
Calculates all required metrics (ROC-AUC, PR-AUC, Confusion Matrix, Macro/Weighted F1).
Saves models, metrics, and comparisons in JSON/CSV formats.
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    classification_report, roc_curve, precision_recall_curve
)
from sklearn.inspection import permutation_importance

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"
MODELS_DIR = BASE_DIR / "ml" / "models"
REPORTS_DIR = BASE_DIR / "ml" / "reports"
METADATA_DIR = BASE_DIR / "data" / "ml" / "metadata"


def load_dataset():
    """Load train, val, and test splits."""
    train_df = pd.read_parquet(PROCESSED_DIR / "train.parquet")
    val_df = pd.read_parquet(PROCESSED_DIR / "validation.parquet")
    test_df = pd.read_parquet(PROCESSED_DIR / "test.parquet")

    # Excluded columns that are metadata/identifiers
    non_feature_cols = ["is_attack", "Label", "attack_family", "day_source", "Src IP dec", "Dst IP dec", "Timestamp", "Attempted Category"]
    feature_cols = [c for c in train_df.columns if c not in non_feature_cols]

    X_train = train_df[feature_cols]
    y_train = train_df["is_attack"]

    X_val = val_df[feature_cols]
    y_val = val_df["is_attack"]

    X_test = test_df[feature_cols]
    y_test = test_df["is_attack"]

    return (X_train, y_train), (X_val, y_val), (X_test, y_test), feature_cols, test_df


def evaluate_model(model, X_test, y_test, model_name, feature_names):
    """Compute comprehensive evaluation metrics for binary classification."""
    start_pred = time.time()
    y_pred = model.predict(X_test)
    pred_duration = time.time() - start_pred

    # Probabilities
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        y_prob = model.decision_function(X_test)
    else:
        y_prob = y_pred.astype(float)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    macro_f1 = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    try:
        roc_auc = float(roc_auc_score(y_test, y_prob))
    except Exception:
        roc_auc = 0.5

    try:
        pr_auc = float(average_precision_score(y_test, y_prob))
    except Exception:
        pr_auc = 0.5

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    clf_rep = classification_report(y_test, y_pred, target_names=["BENIGN", "ATTACK"], output_dict=True, zero_division=0)

    # ROC & PR Curve sample points (downsampled for lightweight JSON)
    fpr_arr, tpr_arr, _ = roc_curve(y_test, y_prob)
    indices = np.linspace(0, len(fpr_arr) - 1, min(50, len(fpr_arr)), dtype=int)
    roc_points = [{"fpr": float(fpr_arr[i]), "tpr": float(tpr_arr[i])} for i in indices]

    p_arr, r_arr, _ = precision_recall_curve(y_test, y_prob)
    indices_pr = np.linspace(0, len(p_arr) - 1, min(50, len(p_arr)), dtype=int)
    pr_points = [{"precision": float(p_arr[i]), "recall": float(r_arr[i])} for i in indices_pr]

    return {
        "model_name": model_name,
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "false_positive_rate": fpr,
        "false_negative_rate": fnr,
        "confusion_matrix": {
            "true_negative": int(tn),
            "false_positive": int(fp),
            "false_negative": int(fn),
            "true_positive": int(tp),
            "matrix": cm.tolist()
        },
        "classification_report": clf_rep,
        "prediction_time_seconds": float(pred_duration),
        "roc_curve": roc_points,
        "pr_curve": pr_points
    }


def train_models():
    """Execute training for all supervised models."""
    print("[*] Loading processed datasets...")
    (X_train, y_train), (X_val, y_val), (X_test, y_test), feature_names, test_df = load_dataset()
    print(f"    Train size: {X_train.shape}, Features: {len(feature_names)}")
    print(f"    Class distribution in train: BENIGN={(y_train == 0).sum()}, ATTACK={(y_train == 1).sum()}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    results = []
    models_registry = []

    # -------------------------------------------------------------
    # 1. Random Forest Classifier
    # -------------------------------------------------------------
    print("\n[*] Training Model 1: Random Forest Classifier...")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=16,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_train_time = time.time() - t0
    print(f"[+] Random Forest trained in {rf_train_time:.2f}s")

    rf_eval = evaluate_model(rf, X_test, y_test, "Random Forest", feature_names)
    rf_eval["training_time_seconds"] = rf_train_time

    # Feature importances
    rf_importances = sorted(
        [{"feature": f, "importance": float(imp)} for f, imp in zip(feature_names, rf.feature_importances_)],
        key=lambda x: x["importance"], reverse=True
    )
    rf_eval["top_features"] = rf_importances[:20]

    # Save artifact
    rf_path = MODELS_DIR / "random_forest.joblib"
    joblib.dump(rf, rf_path)
    rf_eval["model_size_mb"] = float(rf_path.stat().st_size / (1024 * 1024))
    results.append(rf_eval)

    models_registry.append({
        "name": "Random Forest",
        "algorithm": "RandomForestClassifier",
        "version": "1.0.0",
        "status": "ACTIVE",
        "artifact": "random_forest.joblib",
        "parameters": {"n_estimators": 100, "max_depth": 16, "class_weight": "balanced"},
        "accuracy": rf_eval["accuracy"],
        "f1_score": rf_eval["f1_score"],
        "roc_auc": rf_eval["roc_auc"],
        "model_size_mb": rf_eval["model_size_mb"]
    })

    # -------------------------------------------------------------
    # 2. HistGradientBoostingClassifier (LightGBM/XGBoost Equivalent)
    # -------------------------------------------------------------
    print("\n[*] Training Model 2: Histogram Gradient Boosting Classifier...")
    t0 = time.time()
    hgb = HistGradientBoostingClassifier(
        max_iter=100,
        max_depth=12,
        learning_rate=0.1,
        class_weight="balanced",
        random_state=42
    )
    hgb.fit(X_train, y_train)
    hgb_train_time = time.time() - t0
    print(f"[+] Gradient Boosting trained in {hgb_train_time:.2f}s")

    hgb_eval = evaluate_model(hgb, X_test, y_test, "Gradient Boosting", feature_names)
    hgb_eval["training_time_seconds"] = hgb_train_time

    # Permutation importance for gradient boosting on small test sample
    perm_res = permutation_importance(hgb, X_test.iloc[:1000], y_test.iloc[:1000], n_repeats=3, random_state=42, n_jobs=-1)
    hgb_importances = sorted(
        [{"feature": f, "importance": float(imp)} for f, imp in zip(feature_names, perm_res.importances_mean)],
        key=lambda x: x["importance"], reverse=True
    )
    hgb_eval["top_features"] = hgb_importances[:20]

    hgb_path = MODELS_DIR / "gradient_boosting.joblib"
    joblib.dump(hgb, hgb_path)
    hgb_eval["model_size_mb"] = float(hgb_path.stat().st_size / (1024 * 1024))
    results.append(hgb_eval)

    models_registry.append({
        "name": "Gradient Boosting",
        "algorithm": "HistGradientBoostingClassifier",
        "version": "1.0.0",
        "status": "ACTIVE",
        "artifact": "gradient_boosting.joblib",
        "parameters": {"max_iter": 100, "max_depth": 12, "learning_rate": 0.1, "class_weight": "balanced"},
        "accuracy": hgb_eval["accuracy"],
        "f1_score": hgb_eval["f1_score"],
        "roc_auc": hgb_eval["roc_auc"],
        "model_size_mb": hgb_eval["model_size_mb"]
    })

    # -------------------------------------------------------------
    # 3. Baseline Classifier (Decision Tree)
    # -------------------------------------------------------------
    print("\n[*] Training Model 3: Baseline Classifier (Decision Tree)...")
    t0 = time.time()
    dt = DecisionTreeClassifier(
        max_depth=8,
        class_weight="balanced",
        random_state=42
    )
    dt.fit(X_train, y_train)
    dt_train_time = time.time() - t0
    print(f"[+] Baseline Decision Tree trained in {dt_train_time:.2f}s")

    dt_eval = evaluate_model(dt, X_test, y_test, "Baseline Decision Tree", feature_names)
    dt_eval["training_time_seconds"] = dt_train_time

    dt_importances = sorted(
        [{"feature": f, "importance": float(imp)} for f, imp in zip(feature_names, dt.feature_importances_)],
        key=lambda x: x["importance"], reverse=True
    )
    dt_eval["top_features"] = dt_importances[:20]

    dt_path = MODELS_DIR / "baseline_dt.joblib"
    joblib.dump(dt, dt_path)
    dt_eval["model_size_mb"] = float(dt_path.stat().st_size / (1024 * 1024))
    results.append(dt_eval)

    models_registry.append({
        "name": "Baseline Decision Tree",
        "algorithm": "DecisionTreeClassifier",
        "version": "1.0.0",
        "status": "ACTIVE",
        "artifact": "baseline_dt.joblib",
        "parameters": {"max_depth": 8, "class_weight": "balanced"},
        "accuracy": dt_eval["accuracy"],
        "f1_score": dt_eval["f1_score"],
        "roc_auc": dt_eval["roc_auc"],
        "model_size_mb": dt_eval["model_size_mb"]
    })

    # -------------------------------------------------------------
    # Save Model Comparison Reports
    # -------------------------------------------------------------
    with open(REPORTS_DIR / "model_comparison.json", "w") as f:
        json.dump(results, f, indent=2)

    # Save CSV comparison
    csv_rows = []
    for r in results:
        csv_rows.append({
            "Model": r["model_name"],
            "Accuracy": f"{r['accuracy']:.4f}",
            "Precision": f"{r['precision']:.4f}",
            "Recall": f"{r['recall']:.4f}",
            "F1-Score": f"{r['f1_score']:.4f}",
            "Macro F1": f"{r['macro_f1']:.4f}",
            "Weighted F1": f"{r['weighted_f1']:.4f}",
            "ROC-AUC": f"{r['roc_auc']:.4f}",
            "PR-AUC": f"{r['pr_auc']:.4f}",
            "FPR": f"{r['false_positive_rate']:.4f}",
            "FNR": f"{r['false_negative_rate']:.4f}",
            "Train Time (s)": f"{r['training_time_seconds']:.2f}",
            "Pred Time (s)": f"{r['prediction_time_seconds']:.4f}",
            "Model Size (MB)": f"{r['model_size_mb']:.2f}"
        })
    pd.DataFrame(csv_rows).to_csv(REPORTS_DIR / "model_comparison.csv", index=False)

    # Save registry
    with open(MODELS_DIR / "model_registry.json", "w") as f:
        json.dump(models_registry, f, indent=2)

    # Save feature importances specifically
    feature_imp_summary = {
        "random_forest": rf_importances[:25],
        "gradient_boosting": hgb_importances[:25],
        "baseline": dt_importances[:25]
    }
    with open(REPORTS_DIR / "feature_importance.json", "w") as f:
        json.dump(feature_imp_summary, f, indent=2)

    print("\n[+] Model Training & Evaluation successfully completed!")
    print(f"    Saved models in: {MODELS_DIR}")
    print(f"    Saved reports in: {REPORTS_DIR}")


if __name__ == "__main__":
    train_models()
