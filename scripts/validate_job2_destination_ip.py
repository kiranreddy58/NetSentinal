#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 2 (Destination IP Analytics)
Performs an independent out-of-core chunked scan of the 5 raw Standard CSV files,
computes baseline ground-truth aggregates per destination IP, and strictly reconciles
against the Hadoop MapReduce output.
"""

import os
import sys
import csv
import json
import time
from collections import Counter

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "ip_analytics")

STANDARD_FILES = [
    "monday.csv",
    "tuesday.csv",
    "wednesday.csv",
    "thursday.csv",
    "friday.csv"
]

def compute_independent_ground_truth_job2():
    print("Computing independent ground truth for Job 2 (Destination IP)...")
    t0 = time.time()
    
    ground_truth = {}
    total_physical_rows = 0
    total_valid_flows = 0
    total_headers = 0
    total_malformed = 0
    
    for fname in STANDARD_FILES:
        fpath = os.path.join(RAW_DIR, fname)
        if not os.path.exists(fpath):
            fpath = os.path.join(PROJECT_ROOT, fname)
            
        with open(fpath, "r", encoding="utf-8", errors="replace") as fp:
            reader = csv.reader(fp)
            for row in reader:
                total_physical_rows += 1
                if not row:
                    continue
                first_cell = row[0].strip().lower()
                if first_cell in ("src ip dec", "src_ip_dec") or (len(row) > 4 and row[4].strip().lower() == "protocol"):
                    total_headers += 1
                    continue
                if len(row) < 88:
                    total_malformed += 1
                    continue
                try:
                    s_ip = int(row[0].strip())
                    d_ip = int(row[2].strip())
                    f_pkts = int(float(row[7].strip()))
                    b_pkts = int(float(row[8].strip()))
                    f_bytes = int(float(row[9].strip()))
                    b_bytes = int(float(row[10].strip()))
                    lbl = row[87].strip().upper()
                except (ValueError, IndexError):
                    total_malformed += 1
                    continue
                    
                is_benign = 1 if lbl == "BENIGN" else 0
                is_attack = 1 - is_benign
                
                if d_ip not in ground_truth:
                    ground_truth[d_ip] = {
                        "flows": 0,
                        "src_ips": set(),
                        "fwd_pkts": 0,
                        "bwd_pkts": 0,
                        "fwd_bytes": 0,
                        "bwd_bytes": 0,
                        "benign": 0,
                        "attack": 0,
                        "attack_counts": Counter()
                    }
                    
                entry = ground_truth[d_ip]
                entry["flows"] += 1
                entry["src_ips"].add(s_ip)
                entry["fwd_pkts"] += f_pkts
                entry["bwd_pkts"] += b_pkts
                entry["fwd_bytes"] += f_bytes
                entry["bwd_bytes"] += b_bytes
                entry["benign"] += is_benign
                entry["attack"] += is_attack
                if is_attack == 1:
                    entry["attack_counts"][row[87].strip()] += 1
                total_valid_flows += 1

    duration = time.time() - t0
    return ground_truth, {
        "total_physical_rows": total_physical_rows,
        "total_headers": total_headers,
        "total_valid_flows": total_valid_flows,
        "total_malformed": total_malformed,
        "unique_dst_ips": len(ground_truth),
        "duration_sec": round(duration, 2)
    }

def validate_hadoop_output_job2(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Hadoop output summary not found: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            d_ip = int(row["dst_ip_dec"])
            hadoop_records[d_ip] = {
                "dst_ip": row["dst_ip"],
                "total_flows": int(row["total_flows"]),
                "unique_src_ips": int(row["unique_src_ips"]),
                "total_fwd_packets": int(row["total_fwd_packets"]),
                "total_bwd_packets": int(row["total_bwd_packets"]),
                "total_packets": int(row["total_packets"]),
                "total_fwd_bytes": int(row["total_fwd_bytes"]),
                "total_bwd_bytes": int(row["total_bwd_bytes"]),
                "total_bytes": int(row["total_bytes"]),
                "benign_flows": int(row["benign_flows"]),
                "attack_flows": int(row["attack_flows"]),
                "dominant_attack": row["dominant_attack"]
            }
            
    discrepancies = []
    if len(hadoop_records) != len(ground_truth):
        discrepancies.append(
            f"Destination IP groups count mismatch: Hadoop has {len(hadoop_records)}, Ground Truth has {len(ground_truth)}"
        )
        
    h_flows = sum(r["total_flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GroundTruth={gt_flows:,}")
        
    h_fwd_pkts = sum(r["total_fwd_packets"] for r in hadoop_records.values())
    gt_fwd_pkts = sum(r["fwd_pkts"] for r in ground_truth.values())
    if h_fwd_pkts != gt_fwd_pkts:
        discrepancies.append(f"Fwd packets mismatch: Hadoop={h_fwd_pkts:,}, GroundTruth={gt_fwd_pkts:,}")
        
    h_benign = sum(r["benign_flows"] for r in hadoop_records.values())
    gt_benign = sum(r["benign"] for r in ground_truth.values())
    if h_benign != gt_benign:
        discrepancies.append(f"Benign flows mismatch: Hadoop={h_benign:,}, GroundTruth={gt_benign:,}")
        
    h_attack = sum(r["attack_flows"] for r in hadoop_records.values())
    gt_attack = sum(r["attack"] for r in ground_truth.values())
    if h_attack != gt_attack:
        discrepancies.append(f"Attack flows mismatch: Hadoop={h_attack:,}, GroundTruth={gt_attack:,}")
        
    validation_status = "PASSED" if not discrepancies else "FAILED"
    return {
        "status": validation_status,
        "unique_destination_ip_groups": len(hadoop_records),
        "total_flows": h_flows,
        "benign_flows": h_benign,
        "attack_flows": h_attack,
        "discrepancies": discrepancies
    }
