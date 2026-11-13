#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 3 (Destination Port Analytics)
"""

import os
import sys
import csv
import json
import time

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "port_analytics")

STANDARD_FILES = ["monday.csv", "tuesday.csv", "wednesday.csv", "thursday.csv", "friday.csv"]

def compute_ground_truth_job3():
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
                    port = int(row[3].strip())
                    s_ip = int(row[0].strip())
                    d_ip = int(row[2].strip())
                    lbl = row[87].strip().upper()
                except (ValueError, IndexError):
                    continue
                    
                is_benign = 1 if lbl == "BENIGN" else 0
                is_attack = 1 - is_benign
                
                if port not in ground_truth:
                    ground_truth[port] = {"flows": 0, "benign": 0, "attack": 0, "srcs": set(), "dsts": set()}
                ground_truth[port]["flows"] += 1
                ground_truth[port]["benign"] += is_benign
                ground_truth[port]["attack"] += is_attack
                ground_truth[port]["srcs"].add(s_ip)
                ground_truth[port]["dsts"].add(d_ip)
                total_valid += 1
                
    return ground_truth, total_valid

def validate_job3(summary_csv_path, ground_truth):
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Missing summary CSV: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for r in reader:
            p = int(r["dst_port"])
            hadoop_records[p] = {
                "flows": int(r["total_flows"]),
                "benign": int(r["benign_flows"]),
                "attack": int(r["attack_flows"])
            }
            
    discrepancies = []
    if len(hadoop_records) != len(ground_truth):
        discrepancies.append(f"Port count mismatch: Hadoop={len(hadoop_records)}, GT={len(ground_truth)}")
        
    h_flows = sum(r["flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GT={gt_flows:,}")
        
    return {
        "status": "PASSED" if not discrepancies else "FAILED",
        "unique_ports": len(hadoop_records),
        "total_flows": h_flows,
        "discrepancies": discrepancies
    }
