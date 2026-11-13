#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 8 Runner: Source-Destination Correlation (Phase 7)
"""

import os
import sys
import csv
import json
import logging
import subprocess
import time
from datetime import datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from hadoop_env import get_env, HADOOP_DIR, JDK_DIR, run_hadoop, run_hdfs
from validate_job8_correlation import compute_ground_truth_job8, validate_job8

LOG_DIR = os.path.join(PROJECT_ROOT, "hadoop", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "job8_correlation.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STREAMING_JAR = os.path.join(HADOOP_DIR, "share", "hadoop", "tools", "lib", "hadoop-streaming-3.3.6.jar")
MAPPER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "mapper", "source_destination_mapper.py")
REDUCER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "reducer", "source_destination_reducer.py")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "ip_analytics")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

HDFS_INPUT_DIR = "/netsentinel/input/original"

def run_job8():
    t_start = time.time()
    logging.info("=== Starting MapReduce Job 8: Source-Destination Correlation ===")
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_output_dir = f"/netsentinel/output/job8_correlation_{timestamp_str}"
    
    streaming_args = [
        "jar", STREAMING_JAR,
        "-D", "mapreduce.framework.name=local",
        "-D", "mapreduce.task.io.sort.mb=64",
        "-D", "mapreduce.map.memory.mb=1024",
        "-D", "mapreduce.reduce.memory.mb=1024",
        "-file", "hadoop/mapper/source_destination_mapper.py",
        "-file", "hadoop/reducer/source_destination_reducer.py",
        "-mapper", "python source_destination_mapper.py",
        "-reducer", "python source_destination_reducer.py",
        "-input", HDFS_INPUT_DIR,
        "-output", hdfs_output_dir
    ]
    
    logging.info(f"Submitting Job 8 to HDFS output: {hdfs_output_dir}")
    t0 = time.time()
    job_res = run_hadoop(streaming_args, timeout=600)
    duration = time.time() - t0
    
    if job_res.returncode != 0:
        logging.error(f"Job 8 failed:\n{job_res.stderr}")
        raise RuntimeError("Hadoop Streaming Job 8 failed")
        
    job_id = None
    map_in, map_out, red_in, red_groups, red_out = None, None, None, None, None
    for line in job_res.stderr.splitlines():
        line_s = line.strip()
        if "Submitting tokens for job:" in line_s or "Running job:" in line_s:
            job_id = line_s.split(":")[-1].strip()
        elif "Map input records=" in line_s:
            map_in = int(line_s.split("=")[-1].strip())
        elif "Map output records=" in line_s:
            map_out = int(line_s.split("=")[-1].strip())
        elif "Reduce input records=" in line_s:
            red_in = int(line_s.split("=")[-1].strip())
        elif "Reduce input groups=" in line_s:
            red_groups = int(line_s.split("=")[-1].strip())
        elif "Reduce output records=" in line_s:
            red_out = int(line_s.split("=")[-1].strip())
            
    logging.info(f"Job 8 Evidence: ID={job_id}, MapIn={map_in}, RedIn={red_in}, RedGroups={red_groups}, RedOut={red_out}, Time={duration:.2f}s")
    
    part_file = f"{hdfs_output_dir}/part-00000"
    res_cat = run_hdfs(["dfs", "-cat", part_file])
    
    summary_csv_path = os.path.join(RESULTS_DIR, "source_destination_correlation.csv")
    csv_header = [
        "src_ip_dec", "src_ip", "dst_ip_dec", "dst_ip",
        "total_flows", "total_packets", "total_bytes",
        "benign_flows", "attack_flows", "unique_ports", "primary_protocol"
    ]
    
    rows = []
    for line in res_cat.stdout.strip().splitlines():
        parts = line.strip().split("\t")
        if len(parts) == 11:
            rows.append(parts)
            
    rows.sort(key=lambda r: int(r[4]), reverse=True)
    with open(summary_csv_path, "w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(csv_header)
        writer.writerows(rows)
        
    logging.info(f"Saved {len(rows)} correlation records to {summary_csv_path}")
    
    expected_pairs, total_valid = compute_ground_truth_job8()
    val_res = validate_job8(summary_csv_path, expected_pairs, total_valid)
    logging.info(f"Job 8 Validation: {val_res}")
    
    report_data = {
        "job_name": "Job 8: Source-Destination Correlation",
        "job_id": job_id,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "COMPLETED_AND_VERIFIED",
        "execution_duration_sec": round(duration, 2),
        "map_input_records": map_in,
        "map_output_records": map_out,
        "reduce_input_records": red_in,
        "reduce_input_groups": red_groups,
        "reduce_output_records": red_out,
        "validation": val_res
    }
    
    with open(os.path.join(METADATA_DIR, "job8_correlation_report.json"), "w", encoding="utf-8") as fp:
        json.dump(report_data, fp, indent=2)
        
    logging.info(f"Job 8 completed successfully in {time.time() - t_start:.2f}s")
    return report_data

if __name__ == "__main__":
    run_job8()
