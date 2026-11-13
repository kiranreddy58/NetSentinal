#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 6 Runner: Temporal Traffic Analytics (Phase 7)
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
from validate_job6_temporal import compute_ground_truth_job6, validate_job6

LOG_DIR = os.path.join(PROJECT_ROOT, "hadoop", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "job6_temporal.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STREAMING_JAR = os.path.join(HADOOP_DIR, "share", "hadoop", "tools", "lib", "hadoop-streaming-3.3.6.jar")
MAPPER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "mapper", "temporal_mapper.py")
REDUCER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "reducer", "temporal_reducer.py")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "temporal_analytics")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

HDFS_INPUT_DIR = "/netsentinel/input/original"

def run_job6():
    t_start = time.time()
    logging.info("=== Starting MapReduce Job 6: Temporal Traffic Analytics ===")
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_output_dir = f"/netsentinel/output/job6_temporal_{timestamp_str}"
    
    streaming_args = [
        "jar", STREAMING_JAR,
        "-D", "mapreduce.framework.name=local",
        "-D", "mapreduce.task.io.sort.mb=64",
        "-D", "mapreduce.map.memory.mb=1024",
        "-D", "mapreduce.reduce.memory.mb=1024",
        "-file", "hadoop/mapper/temporal_mapper.py",
        "-file", "hadoop/reducer/temporal_reducer.py",
        "-mapper", "python temporal_mapper.py",
        "-reducer", "python temporal_reducer.py",
        "-input", HDFS_INPUT_DIR,
        "-output", hdfs_output_dir
    ]
    
    logging.info(f"Submitting Job 6 to HDFS output: {hdfs_output_dir}")
    t0 = time.time()
    job_res = run_hadoop(streaming_args, timeout=600)
    duration = time.time() - t0
    
    if job_res.returncode != 0:
        logging.error(f"Job 6 failed:\n{job_res.stderr}")
        raise RuntimeError("Hadoop Streaming Job 6 failed")
        
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
            
    logging.info(f"Job 6 Evidence: ID={job_id}, MapIn={map_in}, RedIn={red_in}, RedGroups={red_groups}, RedOut={red_out}, Time={duration:.2f}s")
    
    part_file = f"{hdfs_output_dir}/part-00000"
    res_cat = run_hdfs(["dfs", "-cat", part_file])
    
    summary_csv_path = os.path.join(RESULTS_DIR, "temporal_traffic_summary.csv")
    csv_header = [
        "minute_bucket", "total_flows",
        "total_fwd_packets", "total_bwd_packets", "total_packets",
        "total_fwd_bytes", "total_bwd_bytes", "total_bytes",
        "benign_flows", "attack_flows",
        "tcp_flows", "udp_flows", "other_flows"
    ]
    
    rows = []
    for line in res_cat.stdout.strip().splitlines():
        parts = line.strip().split("\t")
        if len(parts) == 13:
            rows.append(parts)
            
    rows.sort(key=lambda r: r[0])
    with open(summary_csv_path, "w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(csv_header)
        writer.writerows(rows)
        
    logging.info(f"Saved {len(rows)} temporal records to {summary_csv_path}")
    
    gt, total_valid = compute_ground_truth_job6()
    val_res = validate_job6(summary_csv_path, gt)
    logging.info(f"Job 6 Validation: {val_res}")
    
    report_data = {
        "job_name": "Job 6: Temporal Traffic Analytics",
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
    
    with open(os.path.join(METADATA_DIR, "job6_temporal_report.json"), "w", encoding="utf-8") as fp:
        json.dump(report_data, fp, indent=2)
        
    logging.info(f"Job 6 completed successfully in {time.time() - t_start:.2f}s")
    return report_data

if __name__ == "__main__":
    run_job6()
