#!/usr/bin/env python3
"""
NetSentinel Big Data Job 11 - Threat & ML Intelligence Reducer
Aggregates per-Source IP threat metrics:
Total flows, Critical count, High count, Medium count, Low count, Avg Risk Score, Attack flows, Anomalies.
Outputs tab-delimited rows.
"""
import sys

def main():
    current_ip = None
    total_flows = 0
    critical_cnt = 0
    high_cnt = 0
    medium_cnt = 0
    low_cnt = 0
    total_risk = 0.0
    attack_flows = 0
    anomaly_flows = 0

    print("source_ip\ttotal_flows\tcritical_threats\thigh_threats\tmedium_threats\tlow_threats\tavg_risk_score\tattack_predicted_flows\tanomaly_flows")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        parts = line.split("\t")
        if len(parts) != 2:
            continue

        ip, val_str = parts[0], parts[1]
        vals = val_str.split(",")
        if len(vals) < 4:
            continue

        severity = vals[0]
        try:
            risk = float(vals[1])
        except ValueError:
            risk = 0.0
        is_attack = int(vals[2]) if vals[2] in ["0", "1"] else 0
        is_anomaly = int(vals[3]) if vals[3] in ["0", "1"] else 0

        if current_ip == ip:
            total_flows += 1
            total_risk += risk
            attack_flows += is_attack
            anomaly_flows += is_anomaly
            if severity == "CRITICAL":
                critical_cnt += 1
            elif severity == "HIGH":
                high_cnt += 1
            elif severity == "MEDIUM":
                medium_cnt += 1
            else:
                low_cnt += 1
        else:
            if current_ip is not None and total_flows > 0:
                avg_risk = round(total_risk / total_flows, 2)
                print(f"{current_ip}\t{total_flows}\t{critical_cnt}\t{high_cnt}\t{medium_cnt}\t{low_cnt}\t{avg_risk}\t{attack_flows}\t{anomaly_flows}")

            current_ip = ip
            total_flows = 1
            total_risk = risk
            attack_flows = is_attack
            anomaly_flows = is_anomaly
            critical_cnt = 1 if severity == "CRITICAL" else 0
            high_cnt = 1 if severity == "HIGH" else 0
            medium_cnt = 1 if severity == "MEDIUM" else 0
            low_cnt = 1 if severity == "LOW" else 0

    if current_ip is not None and total_flows > 0:
        avg_risk = round(total_risk / total_flows, 2)
        print(f"{current_ip}\t{total_flows}\t{critical_cnt}\t{high_cnt}\t{medium_cnt}\t{low_cnt}\t{avg_risk}\t{attack_flows}\t{anomaly_flows}")

if __name__ == "__main__":
    main()
