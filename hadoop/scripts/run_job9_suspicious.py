#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 9 Runner: Suspicious Behavior Analytics
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

LOG_DIR = os.path.join(PROJECT_ROOT, "hadoop", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "job9_suspicious.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STREAMING_JAR = os.path.join(HADOOP_DIR, "share", "hadoop", "tools", "lib", "hadoop-streaming-3.3.6.jar")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "attack_analytics")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

HDFS_INPUT_DIR = "/netsentinel/input/original"

def run_job9():
    t_start = time.time()
    logging.info("=== Starting MapReduce Job 9: Suspicious Behavior Detection ===")
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_output_dir = f"/netsentinel/output/job9_suspicious_{timestamp_str}"
    
    streaming_args = [
        "jar", STREAMING_JAR,
        "-D", "mapreduce.framework.name=local",
        "-D", "mapreduce.task.io.sort.mb=64",
        "-D", "mapreduce.map.memory.mb=1024",
        "-D", "mapreduce.reduce.memory.mb=1024",
        "-file", "hadoop/mapper/suspicious_mapper.py",
        "-file", "hadoop/reducer/suspicious_reducer.py",
        "-mapper", "python suspicious_mapper.py",
        "-reducer", "python suspicious_reducer.py",
        "-input", HDFS_INPUT_DIR,
        "-output", hdfs_output_dir
    ]
    
    logging.info(f"Submitting Job 9 to HDFS output: {hdfs_output_dir}")
    t0 = time.time()
    job_res = run_hadoop(streaming_args, timeout=600)
    duration = time.time() - t0
    
    if job_res.returncode != 0:
        logging.error(f"Job 9 failed:\n{job_res.stderr}")
        raise RuntimeError("Hadoop Streaming Job 9 failed")
        
    job_id = None
    map_in, map_out, red_in, red_groups, red_out = None, None, None, None, None
    for line in job_res.stderr.splitlines():
        if "Running job:" in line:
            job_id = line.split("Running job:")[1].strip()
        if "Map input records=" in line:
            map_in = int(line.split("Map input records=")[1].strip())
        if "Map output records=" in line:
            map_out = int(line.split("Map output records=")[1].strip())
        if "Reduce input records=" in line:
            red_in = int(line.split("Reduce input records=")[1].strip())
        if "Reduce input groups=" in line:
            red_groups = int(line.split("Reduce input groups=")[1].strip())
        if "Reduce output records=" in line:
            red_out = int(line.split("Reduce output records=")[1].strip())
            
    logging.info(f"Job 9 Evidence: ID={job_id}, MapIn={map_in}, RedIn={red_in}, RedGroups={red_groups}, RedOut={red_out}, Time={duration:.2f}s")
    
    # Read output
    cat_res = run_hdfs(["dfs", "-cat", f"{hdfs_output_dir}/part-*"])
    if cat_res.returncode != 0:
        logging.error(f"Failed to read HDFS output: {cat_res.stderr}")
        raise RuntimeError("Could not read HDFS output for Job 9")
        
    csv_file = os.path.join(RESULTS_DIR, "suspicious_behavior_summary.csv")
    rows = []
    for line in cat_res.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) == 2:
            h_name = parts[0]
            vals = parts[1].split(",")
            rows.append([h_name] + vals)
            
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["heuristic_name", "detected_flows", "fwd_packets", "bwd_packets", "total_packets", "total_bytes", "benign_flows", "attack_flows", "precision_percentage"])
        writer.writerows(rows)
        
    logging.info(f"Saved {len(rows)} suspicious detection metrics to {csv_file}")
    
    meta = {
        "job_name": "Job 9: Suspicious Behavior Analytics",
        "job_id": job_id,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "COMPLETED_AND_VERIFIED",
        "execution_duration_sec": round(duration, 2),
        "map_input_records": map_in,
        "map_output_records": map_out,
        "reduce_input_records": red_in,
        "reduce_input_groups": red_groups,
        "reduce_output_records": red_out,
        "total_heuristics": len(rows),
        "results_file": csv_file
    }
    meta_path = os.path.join(METADATA_DIR, "job9_suspicious_report.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
        
    logging.info(f"Job 9 completed successfully in {time.time() - t_start:.2f}s")

if __name__ == '__main__':
    run_job9()
