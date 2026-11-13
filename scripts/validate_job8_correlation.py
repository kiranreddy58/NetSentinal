#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 8 (Source-Destination Correlation)
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "ip_analytics")
STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def compute_ground_truth_job8():
    pairs = set()
    total_valid = 0
    for fname in STANDARD_FILES:
        fpath = os.path.join(RAW_DIR, fname)
        if not os.path.exists(fpath):
            fpath = os.path.join(PROJECT_ROOT, fname)
        with open(fpath, "r", encoding="utf-8", errors="replace") as fp:
            reader = csv.reader(fp)
            for row in reader:
                if not row or len(row) < 88: continue
                if row[0].strip().lower() in ("src ip dec", "src_ip_dec") or (len(row) > 4 and row[4].strip().lower() == "protocol"):
                    continue
                try:
                    s_ip = int(row[0].strip())
                    d_ip = int(row[2].strip())
                except (ValueError, IndexError):
                    continue
                pairs.add((s_ip, d_ip))
                total_valid += 1
    return len(pairs), total_valid

def validate_job8(summary_csv_path, expected_unique_pairs, expected_total_flows):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
    hadoop_pairs = 0
    h_flows = 0
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            hadoop_pairs += 1
            h_flows += int(r["total_flows"])
            
    discrepancies = []
    if hadoop_pairs != expected_unique_pairs:
        discrepancies.append(f"Unique pairs mismatch: Hadoop={hadoop_pairs}, GT={expected_unique_pairs}")
    if h_flows != expected_total_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={expected_total_flows:,}")
        
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_pairs": hadoop_pairs,
        "total_flows": h_flows,
        "discrepancies": discrepancies
    }
