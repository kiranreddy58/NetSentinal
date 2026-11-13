#!/usr/bin/env python3
"""
NetSentinel — Independent Validation Script for MapReduce Job 1 (Source IP Analytics)
Performs an independent out-of-core chunked scan of the 5 raw Standard CSV files,
computes baseline ground-truth aggregates per source IP, and strictly reconciles
against the Hadoop MapReduce output.
"""

import os
import sys
import csv
import json
import time
from collections import defaultdict

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

def compute_independent_ground_truth(chunk_size=100000):
    """
    Independently aggregates flow data directly from raw CSVs.
    Uses separate data structures and accumulator logic.
    """
    print("Computing independent ground truth via chunked CSV scan...")
    t0 = time.time()
    
    # Store aggregated metrics per source IP
    # key: src_ip_dec (int)
    # val: {flows, fwd_pkts, bwd_pkts, fwd_bytes, bwd_bytes, benign, attack, dst_ips(set), dst_ports(set)}
    ground_truth = {}
    
    total_physical_rows = 0
    total_valid_flows = 0
    total_headers = 0
    total_malformed = 0
    
    for fname in STANDARD_FILES:
        # Check in RAW_DIR first, fall back to PROJECT_ROOT
        fpath = os.path.join(RAW_DIR, fname)
        if not os.path.exists(fpath):
            fpath = os.path.join(PROJECT_ROOT, fname)
            
        print(f"  Scanning {fname}...")
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
                    d_port = int(row[3].strip())
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
                
                if s_ip not in ground_truth:
                    ground_truth[s_ip] = {
                        "flows": 0,
                        "fwd_pkts": 0,
                        "bwd_pkts": 0,
                        "fwd_bytes": 0,
                        "bwd_bytes": 0,
                        "benign": 0,
                        "attack": 0,
                        "dst_ips": set(),
                        "dst_ports": set()
                    }
                    
                entry = ground_truth[s_ip]
                entry["flows"] += 1
                entry["fwd_pkts"] += f_pkts
                entry["bwd_pkts"] += b_pkts
                entry["fwd_bytes"] += f_bytes
                entry["bwd_bytes"] += b_bytes
                entry["benign"] += is_benign
                entry["attack"] += is_attack
                entry["dst_ips"].add(d_ip)
                entry["dst_ports"].add(d_port)
                total_valid_flows += 1

    duration = time.time() - t0
    print(f"Independent ground truth computation completed in {duration:.2f}s.")
    print(f"  Physical Rows: {total_physical_rows:,}")
    print(f"  Headers Skipped: {total_headers}")
    print(f"  Valid Flows: {total_valid_flows:,}")
    print(f"  Malformed: {total_malformed}")
    print(f"  Unique Source IPs: {len(ground_truth)}")
    
    return ground_truth, {
        "total_physical_rows": total_physical_rows,
        "total_headers": total_headers,
        "total_valid_flows": total_valid_flows,
        "total_malformed": total_malformed,
        "duration_sec": round(duration, 2)
    }

def validate_hadoop_output(summary_csv_path, ground_truth):
    """
    Compares the Hadoop MapReduce generated CSV summary against the independent ground truth.
    """
    print(f"Validating Hadoop output: {summary_csv_path}...")
    if not os.path.exists(summary_csv_path):
        raise FileNotFoundError(f"Hadoop output summary not found: {summary_csv_path}")
        
    hadoop_records = {}
    with open(summary_csv_path, "r", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            s_ip = int(row["src_ip_dec"])
            hadoop_records[s_ip] = {
                "src_ip": row["src_ip"],
                "total_flows": int(row["total_flows"]),
                "total_fwd_packets": int(row["total_fwd_packets"]),
                "total_bwd_packets": int(row["total_bwd_packets"]),
                "total_packets": int(row["total_packets"]),
                "total_fwd_bytes": int(row["total_fwd_bytes"]),
                "total_bwd_bytes": int(row["total_bwd_bytes"]),
                "total_bytes": int(row["total_bytes"]),
                "benign_flows": int(row["benign_flows"]),
                "attack_flows": int(row["attack_flows"]),
                "distinct_dst_ips": int(row["distinct_dst_ips"]),
                "distinct_dst_ports": int(row["distinct_dst_ports"])
            }
            
    # Verification checks
    discrepancies = []
    
    # 1. Source IP Groups Count Check
    if len(hadoop_records) != len(ground_truth):
        discrepancies.append(
            f"Source IP groups count mismatch: Hadoop has {len(hadoop_records)}, Ground Truth has {len(ground_truth)}"
        )
        
    # Check for missing or unexpected keys
    hadoop_keys = set(hadoop_records.keys())
    truth_keys = set(ground_truth.keys())
    
    missing_in_hadoop = truth_keys - hadoop_keys
    if missing_in_hadoop:
        discrepancies.append(f"Missing source IPs in Hadoop output: {len(missing_in_hadoop)} IPs")
    unexpected_in_hadoop = hadoop_keys - truth_keys
    if unexpected_in_hadoop:
        discrepancies.append(f"Unexpected source IPs in Hadoop output: {len(unexpected_in_hadoop)} IPs")
        
    # Aggregate Totals
    h_flows = sum(r["total_flows"] for r in hadoop_records.values())
    gt_flows = sum(r["flows"] for r in ground_truth.values())
    if h_flows != gt_flows:
        discrepancies.append(f"Total flows mismatch: Hadoop={h_flows:,}, GroundTruth={gt_flows:,}")
        
    h_fwd_pkts = sum(r["total_fwd_packets"] for r in hadoop_records.values())
    gt_fwd_pkts = sum(r["fwd_pkts"] for r in ground_truth.values())
    if h_fwd_pkts != gt_fwd_pkts:
        discrepancies.append(f"Fwd pkts mismatch: Hadoop={h_fwd_pkts:,}, GroundTruth={gt_fwd_pkts:,}")
        
    h_bwd_pkts = sum(r["total_bwd_packets"] for r in hadoop_records.values())
    gt_bwd_pkts = sum(r["bwd_pkts"] for r in ground_truth.values())
    if h_bwd_pkts != gt_bwd_pkts:
        discrepancies.append(f"Bwd pkts mismatch: Hadoop={h_bwd_pkts:,}, GroundTruth={gt_bwd_pkts:,}")
        
    h_fwd_bytes = sum(r["total_fwd_bytes"] for r in hadoop_records.values())
    gt_fwd_bytes = sum(r["fwd_bytes"] for r in ground_truth.values())
    if h_fwd_bytes != gt_fwd_bytes:
        discrepancies.append(f"Fwd bytes mismatch: Hadoop={h_fwd_bytes:,}, GroundTruth={gt_fwd_bytes:,}")
        
    h_bwd_bytes = sum(r["total_bwd_bytes"] for r in hadoop_records.values())
    gt_bwd_bytes = sum(r["bwd_bytes"] for r in ground_truth.values())
    if h_bwd_bytes != gt_bwd_bytes:
        discrepancies.append(f"Bwd bytes mismatch: Hadoop={h_bwd_bytes:,}, GroundTruth={gt_bwd_bytes:,}")
        
    h_benign = sum(r["benign_flows"] for r in hadoop_records.values())
    gt_benign = sum(r["benign"] for r in ground_truth.values())
    if h_benign != gt_benign:
        discrepancies.append(f"Benign flows mismatch: Hadoop={h_benign:,}, GroundTruth={gt_benign:,}")
        
    h_attack = sum(r["attack_flows"] for r in hadoop_records.values())
    gt_attack = sum(r["attack"] for r in ground_truth.values())
    if h_attack != gt_attack:
        discrepancies.append(f"Attack flows mismatch: Hadoop={h_attack:,}, GroundTruth={gt_attack:,}")
        
    # Per-IP record audit
    per_ip_mismatches = 0
    for s_ip in truth_keys.intersection(hadoop_keys):
        h_rec = hadoop_records[s_ip]
        g_rec = ground_truth[s_ip]
        
        mismatch_fields = []
        if h_rec["total_flows"] != g_rec["flows"]: mismatch_fields.append("flows")
        if h_rec["total_fwd_packets"] != g_rec["fwd_pkts"]: mismatch_fields.append("fwd_pkts")
        if h_rec["total_bwd_packets"] != g_rec["bwd_pkts"]: mismatch_fields.append("bwd_pkts")
        if h_rec["total_packets"] != (g_rec["fwd_pkts"] + g_rec["bwd_pkts"]): mismatch_fields.append("total_pkts")
        if h_rec["total_fwd_bytes"] != g_rec["fwd_bytes"]: mismatch_fields.append("fwd_bytes")
        if h_rec["total_bwd_bytes"] != g_rec["bwd_bytes"]: mismatch_fields.append("bwd_bytes")
        if h_rec["total_bytes"] != (g_rec["fwd_bytes"] + g_rec["bwd_bytes"]): mismatch_fields.append("total_bytes")
        if h_rec["benign_flows"] != g_rec["benign"]: mismatch_fields.append("benign")
        if h_rec["attack_flows"] != g_rec["attack"]: mismatch_fields.append("attack")
        if h_rec["distinct_dst_ips"] != len(g_rec["dst_ips"]): mismatch_fields.append("dst_ips")
        if h_rec["distinct_dst_ports"] != len(g_rec["dst_ports"]): mismatch_fields.append("dst_ports")
        
        if mismatch_fields:
            per_ip_mismatches += 1
            if per_ip_mismatches <= 5:
                discrepancies.append(f"Mismatch on IP {s_ip} ({h_rec['src_ip']}): {', '.join(mismatch_fields)}")
                
    if per_ip_mismatches > 5:
        discrepancies.append(f"... and {per_ip_mismatches - 5} more IP groups with mismatches.")
        
    validation_status = "PASSED" if not discrepancies else "FAILED"
    
    validation_report = {
        "status": validation_status,
        "unique_source_ip_groups": len(hadoop_records),
        "total_flows": h_flows,
        "total_packets": h_fwd_pkts + h_bwd_pkts,
        "total_bytes": h_fwd_bytes + h_bwd_bytes,
        "benign_flows": h_benign,
        "attack_flows": h_attack,
        "discrepancies_count": len(discrepancies),
        "discrepancies": discrepancies
    }
    
    return validation_report

if __name__ == "__main__":
    gt, stats = compute_independent_ground_truth()
    summary_path = os.path.join(RESULTS_DIR, "source_ip_summary.csv")
    if os.path.exists(summary_path):
        res = validate_hadoop_output(summary_path, gt)
        print("\n=== Validation Report ===")
        print(json.dumps(res, indent=2))
        if res["status"] != "PASSED":
            sys.exit(1)
    else:
        print(f"Summary file not found at {summary_path}. Run Job 1 first.")
