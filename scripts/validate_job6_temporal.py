#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 6 (Temporal Traffic Analytics)
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "temporal_analytics")
STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def compute_ground_truth_job6():
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
                    ts_str = row[5].strip()
                    m = ts_str.split(":")[0].strip().zfill(2) if ":" in ts_str else "00"
                    lbl = row[87].strip().upper()
                except (ValueError, IndexError):
                    continue
                    
                is_benign = 1 if lbl == "BENIGN" else 0
                is_attack = 1 - is_benign
                
                if m not in ground_truth:
                    ground_truth[m] = {"flows": 0, "benign": 0, "attack": 0}
                ground_truth[m]["flows"] += 1
                ground_truth[m]["benign"] += is_benign
                ground_truth[m]["attack"] += is_attack
                total_valid += 1
                
    return ground_truth, total_valid

def validate_job6(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            m = r["minute_bucket"]
            hadoop_records[m] = {
                "flows": int(r["total_flows"]),
                "benign": int(r["benign_flows"]),
                "attack": int(r["attack_flows"])
            }
            
    discrepancies = []
    h_flows = sum(r["flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={gt_flows:,}")
        
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_minutes": len(hadoop_records),
        "total_flows": h_flows,
        "discrepancies": discrepancies
    }
