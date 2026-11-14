#!/usr/bin/env python3
"""
NetSentinel Big Data Job 11 - Threat & ML Intelligence Mapper
Input: Threat intelligence CSV records
Emits:
  KEY: source_ip \t VALUE: severity,risk_score,is_attack,is_anomaly
"""
import sys

def main():
    header_skipped = False
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        if not header_skipped:
            if "source_ip" in line or "record_id" in line:
                header_skipped = True
                continue
            header_skipped = True

        parts = line.split(",")
        if len(parts) >= 15:
            # record_id(0), source_ip(1), destination_ip(2), destination_port(3), protocol(4),
            # flow_duration_us(5), total_packets(6), total_bytes(7), ground_truth_label(8),
            # rf_pred(9), rf_prob(10), gb_pred(11), gb_prob(12), iso_score(13), is_anomaly(14),
            # risk_score(15), severity(16)
            src_ip = parts[1].strip()
            risk_score = parts[15].strip() if len(parts) > 15 else "0.0"
            severity = parts[16].strip() if len(parts) > 16 else "LOW"
            is_attack = "1" if parts[9].strip() == "ATTACK" else "0"
            is_anomaly = "1" if parts[14].strip().lower() in ["true", "1"] else "0"

            print(f"{src_ip}\t{severity},{risk_score},{is_attack},{is_anomaly}")

if __name__ == "__main__":
    main()
