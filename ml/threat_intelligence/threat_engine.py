"""
NetSentinel Advanced Network Threat Intelligence Engine
Fuses:
1. Ground-truth baseline labels
2. Hadoop MapReduce analytics (IP reputation, heuristics)
3. Supervised ML predictions (Random Forest & Gradient Boosting)
4. Unsupervised Anomaly Detection (Isolation Forest)
5. Heuristic behavioural indicators (Port scan probes, packet bursts)

Produces normalized threat records with configurable transparent risk scoring (0-100)
and severity tiers (CRITICAL, HIGH, MEDIUM, LOW) with deterministic causal explanations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "ml" / "processed"
MODELS_DIR = BASE_DIR / "ml" / "models"
RESULTS_DIR = BASE_DIR / "results"
THREAT_DIR = RESULTS_DIR / "threat_analytics"
ML_ANALYTICS_DIR = RESULTS_DIR / "ml_analytics"


def ip_dec_to_str(ip_dec):
    """Convert integer decimal IP back to dotted IPv4 string."""
    try:
        ip_int = int(ip_dec)
        return f"{(ip_int >> 24) & 255}.{(ip_int >> 16) & 255}.{(ip_int >> 8) & 255}.{ip_int & 255}"
    except Exception:
        return str(ip_dec)


def calculate_risk_score(rf_prob, hgb_prob, anomaly_score, is_scanner=False, is_volume_burst=False):
    """
    Calibrated transparent weighted risk calculation:
    - ML Ensemble Probability (50%): 50.0 * (0.5*rf + 0.5*hgb)
    - Unsupervised Anomaly Score (30%): 0.30 * anomaly_score
    - Port Scan / Probe Heuristic (10%): 10.0 if scanner else 0
    - Volume Burst / Asymmetry (10%): 10.0 if burst else 0
    Severity tiers:
    - >= 70.0: CRITICAL
    - >= 45.0: HIGH
    - >= 20.0: MEDIUM
    - < 20.0: LOW
    """
    ml_ensemble_prob = (0.5 * rf_prob) + (0.5 * hgb_prob)
    ml_component = 50.0 * ml_ensemble_prob
    anomaly_component = 0.30 * anomaly_score
    heuristic_scan = 10.0 if is_scanner else 0.0
    heuristic_burst = 10.0 if is_volume_burst else 0.0

    total_score = min(100.0, max(0.0, ml_component + anomaly_component + heuristic_scan + heuristic_burst))

    if total_score >= 70.0:
        severity = "CRITICAL"
    elif total_score >= 45.0:
        severity = "HIGH"
    elif total_score >= 20.0:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Generate explanatory justification
    explanations = []
    if ml_ensemble_prob >= 0.7:
        explanations.append(f"High ML classifier confidence ({ml_ensemble_prob*100:.1f}%) matching attack traffic signature")
    elif ml_ensemble_prob >= 0.4:
        explanations.append(f"Moderate ML classifier probability ({ml_ensemble_prob*100:.1f}%)")

    if anomaly_score >= 60.0:
        explanations.append(f"Severe statistical feature deviation flagged by Isolation Forest ({anomaly_score:.1f}/100)")
    elif anomaly_score >= 35.0:
        explanations.append(f"Mild statistical anomaly detected ({anomaly_score:.1f}/100)")

    if is_scanner:
        explanations.append("Port scan probe behaviour detected (rapid target port exploration)")
    if is_volume_burst:
        explanations.append("High packet/byte asymmetric volumetric surge")

    if not explanations:
        explanations.append("Baseline nominal network activity")

    return round(total_score, 2), severity, "; ".join(explanations)


def run_threat_intelligence():
    """Execute threat fusion and generate normalized intelligence outputs."""
    print("[*] Launching Unified Threat Intelligence Engine...")
    THREAT_DIR.mkdir(parents=True, exist_ok=True)
    ML_ANALYTICS_DIR.mkdir(parents=True, exist_ok=True)

    test_df = pd.read_parquet(PROCESSED_DIR / "test.parquet")
    rf_model = joblib.load(MODELS_DIR / "random_forest.joblib")
    hgb_model = joblib.load(MODELS_DIR / "gradient_boosting.joblib")
    iso_model = joblib.load(MODELS_DIR / "isolation_forest.joblib")

    non_feature_cols = ["is_attack", "Label", "attack_family", "day_source", "Src IP dec", "Dst IP dec", "Timestamp", "Attempted Category"]
    feature_cols = [c for c in test_df.columns if c not in non_feature_cols]

    X_test = test_df[feature_cols]

    # Model predictions
    print("    -> Scoring test flows across Random Forest, Gradient Boosting, and Isolation Forest...")
    rf_preds = rf_model.predict(X_test)
    rf_probs = rf_model.predict_proba(X_test)[:, 1]

    hgb_preds = hgb_model.predict(X_test)
    if hasattr(hgb_model, "predict_proba"):
        hgb_probs = hgb_model.predict_proba(X_test)[:, 1]
    else:
        hgb_probs = rf_probs

    iso_raw = iso_model.decision_function(X_test)
    iso_min, iso_max = iso_raw.min(), iso_raw.max()
    iso_scores = 100.0 * (1.0 - (iso_raw - iso_min) / (iso_max - iso_min + 1e-9))
    iso_anomalies = (iso_model.predict(X_test) == -1).astype(int)

    # Compile threat records
    print("    -> Fusing heuristic indicators and computing multi-factor risk scores...")
    threat_records = []
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    top_sources = {}
    top_destinations = {}

    total_records = len(test_df)
    for i in range(total_records):
        row = test_df.iloc[i]
        src_ip = ip_dec_to_str(row.get("Src IP dec", 0))
        dst_ip = ip_dec_to_str(row.get("Dst IP dec", 0))
        dst_port = int(row.get("Dst Port", 80))
        protocol = int(row.get("Protocol", 6))
        flow_dur = float(row.get("Flow Duration", 0))
        fwd_pkts = float(row.get("Total Fwd Packet", 0))
        bwd_pkts = float(row.get("Total Bwd packets", 0))
        fwd_bytes = float(row.get("Total Length of Fwd Packet", 0))
        bwd_bytes = float(row.get("Total Length of Bwd Packet", 0))
        ground_label = str(row.get("Label", "UNKNOWN"))

        # Heuristic checks
        is_scanner = (dst_port > 1024 and fwd_pkts <= 2 and flow_dur < 1000) or ("Portscan" in ground_label)
        is_burst = (fwd_bytes + bwd_bytes > 500000) or (fwd_pkts > 500)

        rf_p = float(rf_probs[i])
        hgb_p = float(hgb_probs[i])
        iso_s = float(iso_scores[i])

        risk_score, severity, explanation = calculate_risk_score(rf_p, hgb_p, iso_s, is_scanner, is_burst)
        severity_counts[severity] += 1

        # Track sources and destinations
        if severity in ["CRITICAL", "HIGH"]:
            top_sources[src_ip] = top_sources.get(src_ip, 0) + 1
            top_destinations[dst_ip] = top_destinations.get(dst_ip, 0) + 1

        detection_method = []
        if rf_preds[i] == 1 or hgb_preds[i] == 1:
            detection_method.append("Supervised_ML")
        if iso_anomalies[i] == 1:
            detection_method.append("Anomaly_Detector")
        if is_scanner or is_burst:
            detection_method.append("Heuristic_Rule")
        if not detection_method:
            detection_method.append("Nominal_Baseline")

        record = {
            "record_id": i + 1,
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "destination_port": dst_port,
            "protocol": "TCP" if protocol == 6 else ("UDP" if protocol == 17 else "OTHER"),
            "flow_duration_us": flow_dur,
            "total_packets": int(fwd_pkts + bwd_pkts),
            "total_bytes": int(fwd_bytes + bwd_bytes),
            "ground_truth_label": ground_label,
            "random_forest_prediction": "ATTACK" if rf_preds[i] == 1 else "BENIGN",
            "rf_probability": round(rf_p, 4),
            "gradient_boosting_prediction": "ATTACK" if hgb_preds[i] == 1 else "BENIGN",
            "gb_probability": round(hgb_p, 4),
            "isolation_forest_anomaly_score": round(iso_s, 2),
            "is_anomaly": bool(iso_anomalies[i] == 1),
            "risk_score": risk_score,
            "severity": severity,
            "detection_method": "+".join(detection_method),
            "explanation": explanation
        }
        threat_records.append(record)

    # Save summary
    threat_summary = {
        "total_flows_evaluated": total_records,
        "critical_threats": severity_counts["CRITICAL"],
        "high_threats": severity_counts["HIGH"],
        "medium_threats": severity_counts["MEDIUM"],
        "low_threats": severity_counts["LOW"],
        "threat_percentage": round(((severity_counts["CRITICAL"] + severity_counts["HIGH"]) / total_records) * 100, 2),
        "scoring_weights": {
            "ml_ensemble": "50%",
            "unsupervised_anomaly": "30%",
            "port_scan_heuristic": "10%",
            "volume_burst_heuristic": "10%"
        }
    }

    with open(THREAT_DIR / "threat_summary.json", "w") as f:
        json.dump(threat_summary, f, indent=2)

    # Save top threat sources and destinations
    sorted_sources = [{"ip": ip, "high_risk_flows": cnt} for ip, cnt in sorted(top_sources.items(), key=lambda x: x[1], reverse=True)[:25]]
    sorted_destinations = [{"ip": ip, "high_risk_flows": cnt} for ip, cnt in sorted(top_destinations.items(), key=lambda x: x[1], reverse=True)[:25]]

    with open(THREAT_DIR / "top_threat_sources.json", "w") as f:
        json.dump(sorted_sources, f, indent=2)

    with open(THREAT_DIR / "top_threat_destinations.json", "w") as f:
        json.dump(sorted_destinations, f, indent=2)

    with open(THREAT_DIR / "severity_distribution.json", "w") as f:
        json.dump([
            {"severity": "CRITICAL", "count": severity_counts["CRITICAL"], "color": "#ef4444"},
            {"severity": "HIGH", "count": severity_counts["HIGH"], "color": "#f97316"},
            {"severity": "MEDIUM", "count": severity_counts["MEDIUM"], "color": "#eab308"},
            {"severity": "LOW", "count": severity_counts["LOW"], "color": "#10b981"}
        ], f, indent=2)

    # Save threat records (first 2,000 for fast API querying)
    with open(THREAT_DIR / "threat_records.json", "w") as f:
        json.dump(threat_records[:2000], f, indent=2)

    # Also save as CSV for Hadoop ingestion / aggregation
    pd.DataFrame(threat_records[:2000]).to_csv(THREAT_DIR / "threat_records.csv", index=False)

    print(f"[+] Threat Intelligence generation completed!")
    print(f"    CRITICAL: {severity_counts['CRITICAL']:,}, HIGH: {severity_counts['HIGH']:,}, MEDIUM: {severity_counts['MEDIUM']:,}, LOW: {severity_counts['LOW']:,}")


if __name__ == "__main__":
    run_threat_intelligence()
