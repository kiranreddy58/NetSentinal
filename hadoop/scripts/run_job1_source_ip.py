#!/usr/bin/env python3
"""
NetSentinel — MapReduce Job 1 Runner: Source IP Analytics (Phase 7)
Submits genuine Hadoop Streaming MapReduce Job 1 on Apache Hadoop 3.3.6 LocalJobRunner:
- Reads from HDFS: /netsentinel/input/original/
- Writes to HDFS: /netsentinel/output/job1_source_ip_<timestamp>/
- Retrieves and formats HDFS output to results/ip_analytics/source_ip_summary.csv
- Executes independent chunked local validation
- Generates data/metadata/job1_source_ip_report.json
"""

import os
import sys
import csv
import json
import logging
import subprocess
import time
from datetime import datetime

# Setup paths and environment
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from hadoop_env import get_env, HADOOP_DIR, JDK_DIR, run_hadoop, run_hdfs
from validate_job1_source_ip import compute_independent_ground_truth, validate_hadoop_output

LOG_DIR = os.path.join(PROJECT_ROOT, "hadoop", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "job1_source_ip.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STREAMING_JAR = os.path.join(HADOOP_DIR, "share", "hadoop", "tools", "lib", "hadoop-streaming-3.3.6.jar")
MAPPER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "mapper", "source_ip_mapper.py")
REDUCER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "reducer", "source_ip_reducer.py")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results", "ip_analytics")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(METADATA_DIR, exist_ok=True)

HDFS_INPUT_DIR = "/netsentinel/input/original"

def run_job1():
    t_start = time.time()
    logging.info("================================================================================")
    logging.info("=== NetSentinel — Starting MapReduce Job 1: Source IP Analytics               ===")
    logging.info("================================================================================")
    
    # 1. Verification of Streaming JAR and Scripts
    if not os.path.exists(STREAMING_JAR):
        raise FileNotFoundError(f"Hadoop Streaming JAR missing: {STREAMING_JAR}")
    if not os.path.exists(MAPPER_LOCAL):
        raise FileNotFoundError(f"Mapper script missing: {MAPPER_LOCAL}")
    if not os.path.exists(REDUCER_LOCAL):
        raise FileNotFoundError(f"Reducer script missing: {REDUCER_LOCAL}")
        
    logging.info(f"Verified Streaming JAR: {STREAMING_JAR} ({os.path.getsize(STREAMING_JAR):,} bytes)")
    logging.info(f"Verified Mapper: {MAPPER_LOCAL}")
    logging.info(f"Verified Reducer: {REDUCER_LOCAL}")
    
    # Verify HDFS input
    res_input = run_hdfs(["dfs", "-ls", HDFS_INPUT_DIR])
    if res_input.returncode != 0:
        raise RuntimeError(f"HDFS input directory {HDFS_INPUT_DIR} does not exist: {res_input.stderr}")
    logging.info(f"Verified HDFS Input Directory:\n{res_input.stdout.strip()}")
    
    # 2. Build Fresh HDFS Output Path
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_output_dir = f"/netsentinel/output/job1_source_ip_{timestamp_str}"
    logging.info(f"Target HDFS Output Path: {hdfs_output_dir}")
    
    # 3. Configure Hadoop Streaming Parameters
    # LocalJobRunner execution parameters with conservative memory
    streaming_args = [
        "jar", STREAMING_JAR,
        "-D", "mapreduce.framework.name=local",
        "-D", "mapreduce.task.io.sort.mb=64",
        "-D", "mapreduce.map.memory.mb=1024",
        "-D", "mapreduce.reduce.memory.mb=1024",
        "-file", "hadoop/mapper/source_ip_mapper.py",
        "-file", "hadoop/reducer/source_ip_reducer.py",
        "-mapper", "python source_ip_mapper.py",
        "-reducer", "python source_ip_reducer.py",
        "-input", HDFS_INPUT_DIR,
        "-output", hdfs_output_dir
    ]
    
    full_cmd_str = f"hadoop.cmd {' '.join(streaming_args)}"
    logging.info(f"Executing Hadoop Streaming Command:\n{full_cmd_str}\n")
    
    t_job_start = time.time()
    # Execute Hadoop Streaming Job (allow up to 600 seconds for 2.1M records)
    job_res = run_hadoop(streaming_args, timeout=600)
    job_duration = time.time() - t_job_start
    
    logging.info(f"Hadoop Job exited with code {job_res.returncode} in {job_duration:.2f}s")
    if job_res.returncode != 0:
        logging.error(f"Hadoop Job Failed! Stderr:\n{job_res.stderr}")
        raise RuntimeError(f"Hadoop Streaming Job 1 failed with returncode {job_res.returncode}")
        
    # 4. Extract Job Counters & ID
    job_id = None
    map_input_records = None
    map_output_records = None
    reduce_input_records = None
    reduce_input_groups = None
    reduce_output_records = None
    
    for line in job_res.stderr.splitlines():
        line_s = line.strip()
        if "Submitting tokens for job:" in line_s or "Running job:" in line_s:
            job_id = line_s.split(":")[-1].strip()
        elif "Map input records=" in line_s:
            map_input_records = int(line_s.split("=")[-1].strip())
        elif "Map output records=" in line_s:
            map_output_records = int(line_s.split("=")[-1].strip())
        elif "Reduce input records=" in line_s:
            reduce_input_records = int(line_s.split("=")[-1].strip())
        elif "Reduce input groups=" in line_s:
            reduce_input_groups = int(line_s.split("=")[-1].strip())
        elif "Reduce output records=" in line_s:
            reduce_output_records = int(line_s.split("=")[-1].strip())
            
    logging.info("================================================================================")
    logging.info("=== Hadoop MapReduce Job Counters & Evidence ===")
    logging.info(f"  Job ID: {job_id}")
    logging.info(f"  Map Input Records: {map_input_records:,} (2,099,971 flows + 5 headers)")
    logging.info(f"  Map Output Records: {map_output_records:,}")
    logging.info(f"  Reduce Input Records: {reduce_input_records:,}")
    logging.info(f"  Reduce Input Groups: {reduce_input_groups}")
    logging.info(f"  Reduce Output Records: {reduce_output_records}")
    logging.info(f"  Job Duration: {job_duration:.2f} seconds")
    logging.info("================================================================================")
    
    # 5. Verify HDFS Output Files
    res_ls = run_hdfs(["dfs", "-ls", hdfs_output_dir])
    if res_ls.returncode != 0 or "_SUCCESS" not in res_ls.stdout:
        raise RuntimeError(f"_SUCCESS marker missing from HDFS output: {hdfs_output_dir}")
        
    part_file = f"{hdfs_output_dir}/part-00000"
    res_cat = run_hdfs(["dfs", "-cat", part_file])
    if res_cat.returncode != 0:
        raise RuntimeError(f"Failed to read HDFS output {part_file}: {res_cat.stderr}")
        
    # 6. Format and Export to CSV Deliverable
    summary_csv_path = os.path.join(RESULTS_DIR, "source_ip_summary.csv")
    csv_header = [
        "src_ip_dec", "src_ip", "total_flows",
        "total_fwd_packets", "total_bwd_packets", "total_packets",
        "total_fwd_bytes", "total_bwd_bytes", "total_bytes",
        "benign_flows", "attack_flows",
        "distinct_dst_ips", "distinct_dst_ports"
    ]
    
    csv_rows = []
    for line in res_cat.stdout.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) == 13:
            csv_rows.append(parts)
            
    # Sort by total_flows descending for analytical readability
    csv_rows.sort(key=lambda r: int(r[2]), reverse=True)
    
    with open(summary_csv_path, "w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(csv_header)
        writer.writerows(csv_rows)
        
    logging.info(f"Exported formatted summary ({len(csv_rows)} rows) to: {summary_csv_path}")
    
    # 7. Independent Chunked Ground-Truth Validation
    logging.info("Running independent chunked ground-truth validation...")
    ground_truth, audit_stats = compute_independent_ground_truth()
    val_result = validate_hadoop_output(summary_csv_path, ground_truth)
    
    logging.info("================================================================================")
    logging.info(f"=== Independent Validation Status: {val_result['status']} ===")
    logging.info(f"  Hadoop Source IP Groups: {val_result['unique_source_ip_groups']}")
    logging.info(f"  Ground Truth Groups:     {len(ground_truth)}")
    logging.info(f"  Total Flows Reconciled:  {val_result['total_flows']:,} / 2,099,971")
    logging.info(f"  Total Packets:           {val_result['total_packets']:,}")
    logging.info(f"  Total Bytes:             {val_result['total_bytes']:,}")
    logging.info(f"  Benign Flows:            {val_result['benign_flows']:,}")
    logging.info(f"  Attack Flows:            {val_result['attack_flows']:,}")
    logging.info(f"  Discrepancies:           {val_result['discrepancies_count']}")
    logging.info("================================================================================")
    
    if val_result["status"] != "PASSED":
        raise ValueError(f"Job 1 Validation FAILED with discrepancies: {val_result['discrepancies']}")
        
    # 8. Export Metadata Report
    report_path = os.path.join(METADATA_DIR, "job1_source_ip_report.json")
    report_data = {
        "job_name": "Job 1: Source IP Analytics",
        "job_id": job_id,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "COMPLETED_AND_VERIFIED",
        "execution_engine": "Apache Hadoop 3.3.6 (LocalJobRunner)",
        "hdfs_input_path": HDFS_INPUT_DIR,
        "hdfs_output_path": hdfs_output_dir,
        "execution_duration_sec": round(job_duration, 2),
        "map_input_records": map_input_records,
        "map_output_records": map_output_records,
        "reduce_input_records": reduce_input_records,
        "reduce_input_groups": reduce_input_groups,
        "reduce_output_records": reduce_output_records,
        "metrics_summary": {
            "unique_source_ips": val_result["unique_source_ip_groups"],
            "total_flows": val_result["total_flows"],
            "total_packets": val_result["total_packets"],
            "total_bytes": val_result["total_bytes"],
            "benign_flows": val_result["benign_flows"],
            "attack_flows": val_result["attack_flows"],
            "attack_percentage": round((val_result["attack_flows"] / val_result["total_flows"]) * 100, 4)
        },
        "validation": val_result,
        "audit_stats": audit_stats,
        "deliverables": {
            "mapper": "hadoop/mapper/source_ip_mapper.py",
            "reducer": "hadoop/reducer/source_ip_reducer.py",
            "summary_csv": "results/ip_analytics/source_ip_summary.csv",
            "metadata_json": "data/metadata/job1_source_ip_report.json",
            "documentation": "docs/job1_source_ip.md"
        }
    }
    
    with open(report_path, "w", encoding="utf-8") as fp:
        json.dump(report_data, fp, indent=2)
        
    logging.info(f"Saved JSON metadata report to: {report_path}")
    total_elapsed = time.time() - t_start
    logging.info(f"=== Job 1 Completed Successfully in {total_elapsed:.2f}s ===")
    return report_data

if __name__ == "__main__":
    try:
        report = run_job1()
        print("\nMapReduce Job 1 Successfully Executed and Validated!")
    except Exception as e:
        logging.exception(f"Job 1 Execution Failed: {e}")
        sys.exit(1)
