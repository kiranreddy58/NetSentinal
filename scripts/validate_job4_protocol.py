#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 4 (Protocol Analytics)
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "protocol_analytics")
STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def compute_ground_truth_job4():
    ground_truth = {}
    total_valid = 0
    
    for fname in STANDARD_FILES:
        fpath = os.path.join(RAW_DIR, fname)
        if not os.path.exists(fpath):
            fpath = os.path.join(PROJECT_ROOT, fname)
            
        with open(fpath, "r", encoding="utf-8", errors="replace") as fp:
            reader = csv.reader(fp)
            for row in reader:
                if not row or len(row) < 88:
                    continue
                if row[0].strip().lower() in ("src ip dec", "src_ip_dec") or (len(row) > 4 and row[4].strip().lower() == "protocol"):
                    continue
                try:
                    proto = int(float(row[4].strip()))
                    f_pkts = int(float(row[7].strip()))
                    b_pkts = int(float(row[8].strip()))
                    f_bytes = int(float(row[9].strip()))
                    b_bytes = int(float(row[10].strip()))
                    lbl = row[87].strip().upper()
                except (ValueError, IndexError):
                    continue
                    
                is_benign = 1 if lbl == "BENIGN" else 0
                is_attack = 1 - is_benign
                
                if proto not in ground_truth:
                    ground_truth[proto] = {"flows": 0, "fwd_pkts": 0, "bwd_pkts": 0, "fwd_bytes": 0, "bwd_bytes": 0, "benign": 0, "attack": 0}
                ground_truth[proto]["flows"] += 1
                ground_truth[proto]["fwd_pkts"] += f_pkts
                ground_truth[proto]["bwd_pkts"] += b_pkts
                ground_truth[proto]["fwd_bytes"] += f_bytes
                ground_truth[proto]["bwd_bytes"] += b_bytes
                ground_truth[proto]["benign"] += is_benign
                ground_truth[proto]["attack"] += is_attack
                total_valid += 1
                
    return ground_truth, total_valid

def validate_job4(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            p = int(r["protocol"])
            hadoop_records[p] = {
                "flows": int(r["total_flows"]),
                "benign": int(r["benign_flows"]),
                "attack": int(r["attack_flows"])
            }
            
    discrepancies = []
    if len(hadoop_records) != len(ground_truth):
        discrepancies.append(f"Protocol count mismatch: Hadoop={len(hadoop_records)}, GT={len(ground_truth)}")
        
    h_flows = sum(r["flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={gt_flows:,}")
        
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_protocols": len(hadoop_records),
        "total_flows": h_flows,
        "discrepancies": discrepancies
    }
