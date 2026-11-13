#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 7 (Attack Label Analytics)
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "attack_analytics")
STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def compute_ground_truth_job7():
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
                    lbl = row[87].strip()
                except (ValueError, IndexError):
                    continue
                    
                if lbl not in ground_truth:
                    ground_truth[lbl] = 0
                ground_truth[lbl] += 1
                total_valid += 1
                
    return ground_truth, total_valid

def validate_job7(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            lbl = r["attack_label"]
            hadoop_records[lbl] = int(r["total_flows"])
            
    discrepancies = []
    if len(hadoop_records) != len(ground_truth):
        discrepancies.append(f"Label count mismatch: Hadoop={len(hadoop_records)}, GT={len(ground_truth)}")
        
    h_flows = sum(hadoop_records.values())
    gt_flows = sum(ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={gt_flows:,}")
        
    for lbl, gt_cnt in ground_truth.items():
        if lbl not in hadoop_records:
            discrepancies.append(f"Missing label in Hadoop: {lbl}")
        elif hadoop_records[lbl] != gt_cnt:
            discrepancies.append(f"Count mismatch for '{lbl}': Hadoop={hadoop_records[lbl]}, GT={gt_cnt}")
            
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_labels": len(hadoop_records),
        "total_flows": h_flows,
        "discrepancies": discrepancies
    }
