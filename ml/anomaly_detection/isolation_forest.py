"""
NetSentinel Unsupervised Anomaly Detection Engine
Uses scikit-learn IsolationForest trained strictly on unlabeled traffic representations.
Calculates continuous anomaly scores, classifies outliers, and evaluates correlation
with ground-truth attack signatures offline.
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"
MODELS_DIR = BASE_DIR / "ml" / "models"
REPORTS_DIR = BASE_DIR / "ml" / "reports"


def train_isolation_forest(contamination=0.08, random_state=42):
    """
    Train Isolation Forest on unlabeled feature matrix.
    Contamination is calibrated based on expected anomaly rate in baseline traffic.
    """
    print("[*] Training Isolation Forest for Unsupervised Anomaly Detection...")
    train_df = pd.read_parquet(PROCESSED_DIR / "train.parquet")
    test_df = pd.read_parquet(PROCESSED_DIR / "test.parquet")

    non_feature_cols = ["is_attack", "Label", "attack_family", "day_source", "Src IP dec", "Dst IP dec", "Timestamp", "Attempted Category"]
    feature_cols = [c for c in train_df.columns if c not in non_feature_cols]

    # Train strictly on feature representations WITHOUT target labels
    X_train = train_df[feature_cols]
    X_test = test_df[feature_cols]

    t0 = time.time()
    iso = IsolationForest(
        n_estimators=100,
        max_samples="auto",
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1
    )
    iso.fit(X_train)
    train_time = time.time() - t0
    print(f"[+] Isolation Forest trained in {train_time:.2f}s")

    # Save model artifact
    iso_path = MODELS_DIR / "isolation_forest.joblib"
    joblib.dump(iso, iso_path)

    # Score test data
    # decision_function: lower is more abnormal. We invert and normalize so higher = higher risk (0 to 100)
    raw_scores = iso.decision_function(X_test)
    preds = iso.predict(X_test) # -1 for anomaly, 1 for inlier

    # Normalization: map negative decision_function to 0..100 anomaly score
    # Min-max scale or sigmoid scale
    score_min = raw_scores.min()
    score_max = raw_scores.max()
    norm_scores = 100.0 * (1.0 - (raw_scores - score_min) / (score_max - score_min + 1e-9))

    is_anomaly = (preds == -1).astype(int)

    # Build anomaly evaluation summary
    total_test = len(test_df)
    total_anomalies = int(is_anomaly.sum())
    anomaly_rate = float(is_anomaly.mean())

    # Offline evaluation against ground-truth labels (for validation only, NEVER used in training)
    ground_truth_attacks = test_df["is_attack"].values
    attack_capture_rate = float(((is_anomaly == 1) & (ground_truth_attacks == 1)).sum() / max(1, (ground_truth_attacks == 1).sum()))
    benign_false_alarm_rate = float(((is_anomaly == 1) & (ground_truth_attacks == 0)).sum() / max(1, (ground_truth_attacks == 0).sum()))

    # Score distribution buckets (0-20, 20-40, 40-60, 60-80, 80-100)
    bins = [0, 20, 40, 60, 80, 100]
    hist, _ = np.histogram(norm_scores, bins=bins)
    distribution_buckets = [
        {"range": f"{bins[i]}-{bins[i+1]}", "count": int(hist[i]), "percentage": round(float(hist[i]/total_test*100), 2)}
        for i in range(len(hist))
    ]

    # Sample anomalous records for inspection
    anomalous_indices = np.where(is_anomaly == 1)[0][:50]
    sample_records = []
    for idx in anomalous_indices:
        sample_records.append({
            "flow_index": int(idx),
            "anomaly_score": round(float(norm_scores[idx]), 2),
            "is_anomaly": True,
            "source_ip_dec": int(test_df.iloc[idx].get("Src IP dec", 0)),
            "dest_ip_dec": int(test_df.iloc[idx].get("Dst IP dec", 0)),
            "protocol": int(test_df.iloc[idx].get("Protocol", 6)),
            "dst_port": int(test_df.iloc[idx].get("Dst Port", 80)),
            "ground_truth_label": str(test_df.iloc[idx].get("Label", "UNKNOWN")),
            "flow_duration": float(test_df.iloc[idx].get("Flow Duration", 0)),
            "day": str(test_df.iloc[idx].get("day_source", "Unknown"))
        })

    anomaly_report = {
        "model_name": "Isolation Forest",
        "contamination": contamination,
        "training_time_seconds": float(train_time),
        "total_test_flows_evaluated": total_test,
        "total_anomalies_flagged": total_anomalies,
        "anomaly_percentage": round(anomaly_rate * 100, 2),
        "attack_capture_rate_unsupervised": round(attack_capture_rate * 100, 2),
        "benign_false_alarm_rate": round(benign_false_alarm_rate * 100, 2),
        "score_distribution": distribution_buckets,
        "sample_anomalies": sample_records[:20]
    }

    with open(REPORTS_DIR / "anomaly_detection_report.json", "w") as f:
        json.dump(anomaly_report, f, indent=2)

    print(f"[+] Isolation Forest evaluation complete: {total_anomalies:,} anomalies flagged ({anomaly_rate*100:.2f}%)")
    print(f"    Attack capture rate (unsupervised): {attack_capture_rate*100:.2f}%")
    return anomaly_report


if __name__ == "__main__":
    train_isolation_forest()
