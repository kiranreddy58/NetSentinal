#!/usr/bin/env python3
"""
NetSentinel — HDFS Data Ingestion Script (Phase 5)
Ingests verified CICIDS-2017 Standard and Plus dataset files into separate HDFS directories:
- Standard files -> /netsentinel/input/original/
- Plus files     -> /netsentinel/input/plus/

Strict Separation Enforced:
- Standard and Plus files are NEVER combined in the same directory.
- No existing files are overwritten.
- Full pre-checks, conflict detection, and execution logging.
"""

import os
import sys
import csv
import json
import logging
import subprocess
import time
from datetime import datetime

# Setup logging
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "hdfs_ingestion.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DATA_DIR = os.path.join(PROJECT_ROOT, "data", "raw")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")
JDK_DIR = os.path.join(PROJECT_ROOT, "tools", "jdk-11")
HADOOP_DIR = os.path.join(PROJECT_ROOT, "tools", "hadoop-3.3.6")
CONF_DIR = os.path.join(HADOOP_DIR, "etc", "hadoop")
HDFS_CMD = os.path.join(HADOOP_DIR, "bin", "hdfs.cmd")

HDFS_ORIGINAL_DIR = "/netsentinel/input/original"
HDFS_PLUS_DIR = "/netsentinel/input/plus"

STANDARD_FILES = [
    "monday.csv",
    "tuesday.csv",
    "wednesday.csv",
    "thursday.csv",
    "friday.csv"
]

PLUS_FILES = [
    "monday_plus.csv",
    "tuesday_plus.csv",
    "wednesday_plus.csv",
    "thursday_plus.csv",
    "friday_plus.csv"
]

def get_hadoop_env():
    env = os.environ.copy()
    env["JAVA_HOME"] = JDK_DIR
    env["HADOOP_HOME"] = HADOOP_DIR
    env["HADOOP_CONF_DIR"] = CONF_DIR
    env["HADOOP_COMMON_HOME"] = HADOOP_DIR
    env["HADOOP_HDFS_HOME"] = HADOOP_DIR
    env["HADOOP_MAPRED_HOME"] = HADOOP_DIR
    env["HADOOP_YARN_HOME"] = HADOOP_DIR
    env["PATH"] = (
        os.path.join(HADOOP_DIR, "bin") + ";" +
        os.path.join(JDK_DIR, "bin") + ";" +
        r"C:\Windows\System32" + ";" +
        r"C:\Windows"
    )
    return env

def run_hdfs_cmd(args, timeout=300):
    cmd = [HDFS_CMD] + args
    res = subprocess.run(cmd, env=get_hadoop_env(), capture_output=True, text=True, timeout=timeout)
    return res

def parse_hdfs_ls(hdfs_path):
    res = run_hdfs_cmd(["dfs", "-ls", hdfs_path])
    if res.returncode != 0:
        return None
    for line in res.stdout.splitlines():
        line = line.strip()
        if not line or line.startswith("Found"):
            continue
        parts = line.split()
        if len(parts) >= 8:
            return {
                "permissions": parts[0],
                "replication": int(parts[1]),
                "owner": parts[2],
                "group": parts[3],
                "bytes": int(parts[4]),
                "date": parts[5],
                "time": parts[6],
                "path": parts[7]
            }
    return None

def pre_ingestion_checks():
    logging.info("=== Starting Pre-Ingestion Safety Checks ===")
    
    # 1. Check local files and inventory
    inventory_path = os.path.join(METADATA_DIR, "file_inventory.csv")
    if not os.path.exists(inventory_path):
        raise FileNotFoundError(f"Inventory file not found: {inventory_path}")
        
    expected_sizes = {}
    with open(inventory_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            expected_sizes[row["File"]] = int(row["File_Size_Bytes"])
            
    all_target_files = STANDARD_FILES + PLUS_FILES
    if len(all_target_files) != 10:
        raise ValueError(f"Expected 10 files, got {len(all_target_files)}")
        
    for fname in all_target_files:
        lpath = os.path.join(RAW_DATA_DIR, fname)
        if not os.path.exists(lpath):
            raise FileNotFoundError(f"Local source file missing: {lpath}")
        act_size = os.path.getsize(lpath)
        exp_size = expected_sizes.get(fname)
        if act_size != exp_size:
            raise ValueError(f"Size mismatch for {fname}: actual {act_size} != expected {exp_size}")
        logging.info(f"Local file validated: {fname} ({act_size:,} bytes)")
        
    # 2. Check HDFS connectivity
    res = run_hdfs_cmd(["dfs", "-ls", "/"])
    if res.returncode != 0:
        raise RuntimeError(f"HDFS cluster unreachable via 'hdfs dfs -ls /':\n{res.stderr}")
    logging.info("HDFS cluster connectivity: OK")
    
    # 3. Check HDFS available space
    res = run_hdfs_cmd(["dfs", "-df", "-h", "/"])
    if res.returncode != 0:
        raise RuntimeError(f"Failed to query HDFS capacity:\n{res.stderr}")
    logging.info(f"HDFS capacity report:\n{res.stdout.strip()}")
    
    logging.info("=== All Pre-Ingestion Checks Passed Successfully ===")
    return expected_sizes

def ingest_files():
    start_time = time.time()
    logging.info("=== Starting NetSentinel HDFS Ingestion ===")
    
    expected_sizes = pre_ingestion_checks()
    
    # Create target directories
    for hdfs_dir in [HDFS_ORIGINAL_DIR, HDFS_PLUS_DIR]:
        logging.info(f"Ensuring HDFS directory exists: {hdfs_dir}")
        res = run_hdfs_cmd(["dfs", "-mkdir", "-p", hdfs_dir])
        if res.returncode != 0:
            raise RuntimeError(f"Failed to create directory {hdfs_dir}: {res.stderr}")
            
    upload_results = []
    
    # Plan uploads: (local_file, target_hdfs_dir, group_name)
    upload_plan = [
        (f, HDFS_ORIGINAL_DIR, "Standard") for f in STANDARD_FILES
    ] + [
        (f, HDFS_PLUS_DIR, "Plus") for f in PLUS_FILES
    ]
    
    for idx, (fname, hdfs_dir, group) in enumerate(upload_plan, 1):
        local_path = os.path.join(RAW_DATA_DIR, fname)
        hdfs_target = f"{hdfs_dir}/{fname}"
        file_bytes = os.path.getsize(local_path)
        
        # Check if already exists in HDFS
        existing_info = parse_hdfs_ls(hdfs_target)
        if existing_info is not None:
            hdfs_bytes = existing_info["bytes"]
            if hdfs_bytes == file_bytes:
                logging.info(
                    f"[{idx}/10] [PRESERVED / RERUN] {group} file '{fname}' already exists in HDFS ({hdfs_bytes:,} bytes). "
                    f"Skipping upload to avoid overwrite conflict."
                )
                upload_results.append({
                    "file_name": fname,
                    "group": group,
                    "local_path": local_path,
                    "hdfs_path": hdfs_target,
                    "bytes": file_bytes,
                    "upload_duration_sec": 0.0,
                    "transfer_rate_mb_s": 0.0,
                    "status": "PRESERVED_EXISTING"
                })
                continue
            else:
                raise FileExistsError(
                    f"CONFLICT DETECTED: File '{hdfs_target}' exists in HDFS but size ({hdfs_bytes}) "
                    f"does not match local size ({file_bytes})! Halting ingestion to prevent corrupted overwrite."
                )
        
        logging.info(f"[{idx}/10] Uploading {group} file '{fname}' ({file_bytes:,} bytes) to {hdfs_target}...")
        t_upload_start = time.time()
        
        # Sequential upload via put
        res = run_hdfs_cmd(["dfs", "-put", local_path, hdfs_target], timeout=600)
        t_upload_dur = time.time() - t_upload_start
        
        if res.returncode != 0:
            logging.error(f"Failed to upload {fname} to HDFS: {res.stderr}")
            raise RuntimeError(f"Upload failed for {fname}: {res.stderr}")
            
        rate_mb_s = (file_bytes / (1024 * 1024)) / t_upload_dur if t_upload_dur > 0 else 0.0
        logging.info(f"Upload completed in {t_upload_dur:.2f}s ({rate_mb_s:.2f} MB/s)")
        
        # Verify HDFS file existence and size immediately via parse_hdfs_ls
        verified_info = parse_hdfs_ls(hdfs_target)
        if verified_info is None:
            raise RuntimeError(f"Uploaded file not found in HDFS listing: {hdfs_target}")
            
        hdfs_bytes = verified_info["bytes"]
        if hdfs_bytes != file_bytes:
            raise ValueError(f"Byte count mismatch for {fname}: local {file_bytes} != hdfs {hdfs_bytes}")
            
        logging.info(f"Verified byte parity for {fname}: {hdfs_bytes:,} bytes match exactly.")
        
        upload_results.append({
            "file_name": fname,
            "group": group,
            "local_path": local_path,
            "hdfs_path": hdfs_target,
            "bytes": file_bytes,
            "upload_duration_sec": round(t_upload_dur, 2),
            "transfer_rate_mb_s": round(rate_mb_s, 2),
            "status": "UPLOAD_SUCCESS"
        })
        
    total_duration = time.time() - start_time
    total_bytes = sum(r["bytes"] for r in upload_results)
    logging.info(f"=== Ingestion Complete! 10/10 files verified in HDFS ({total_bytes:,} bytes total) in {total_duration:.2f}s ===")
    return upload_results

if __name__ == "__main__":
    try:
        results = ingest_files()
        print("\nAll 10 files successfully uploaded and verified in HDFS!")
    except Exception as e:
        logging.exception(f"Ingestion failed: {e}")
        sys.exit(1)
