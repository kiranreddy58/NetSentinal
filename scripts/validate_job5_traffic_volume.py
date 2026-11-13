#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 5 (Traffic Volume Analytics)
"""

import os
import sys
import csv
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "traffic_analytics")
STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def get_tier(tb):
    if tb < 1024: return "1_MICRO_<1KB"
    elif tb < 10240: return "2_SMALL_1-10KB"
    elif tb < 102400: return "3_MEDIUM_10-100KB"
    elif tb < 1048576: return "4_LARGE_100KB-1MB"
    else: return "5_JUMBO_>1MB"

def compute_ground_truth_job5():
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
                    fb = int(float(row[9].strip()))
                    bb = int(float(row[10].strip()))
                    fp = int(float(row[7].strip()))
                    bp = int(float(row[8].strip()))
                except (ValueError, IndexError):
                    continue
                    
                tb = fb + bb
                tier = get_tier(tb)
                if tier not in ground_truth:
                    ground_truth[tier] = {"flows": 0, "bytes": 0, "pkts": 0}
                ground_truth[tier]["flows"] += 1
                ground_truth[tier]["bytes"] += tb
                ground_truth[tier]["pkts"] += (fp + bp)
                total_valid += 1
                
    return ground_truth, total_valid

def validate_job5(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            t = r["volume_tier"]
            hadoop_records[t] = {
                "flows": int(r["total_flows"]),
                "bytes": int(r["total_bytes"]),
                "pkts": int(r["total_packets"])
            }
            
    discrepancies = []
    h_flows = sum(r["flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={gt_flows:,}")
        
    h_bytes = sum(r["bytes"] for r in hadoop_records.values())
    gt_bytes = sum(r["bytes"] for r in ground_truth.values())
    if h_bytes != gt_bytes:
        discrepancies.append(f"Total bytes mismatch: Hadoop={h_bytes:,}, GT={gt_bytes:,}")
        
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_tiers": len(hadoop_records),
        "total_flows": h_flows,
        "total_bytes": h_bytes,
        "discrepancies": discrepancies
    }
