#!/usr/bin/env python3
"""
NetSentinel — Hadoop Streaming Smoke Test Runner (Phase 6)
Executes a genuine end-to-end Hadoop Streaming MapReduce job on Apache Hadoop 3.3.6:
- Validates Hadoop Streaming JAR and environment.
- Stages synthetic flow data in HDFS (/netsentinel/test/smoke_input/).
- Submits job using Hadoop Streaming with Python mapper and reducer.
- Retrieves and parses real HDFS MapReduce output (_SUCCESS, part-00000).
- Verifies results against independently calculated expected ground truth.
- Exports metadata to data/metadata/mapreduce_smoke_test.json.
"""

import os
import sys
import json
import logging
import subprocess
import time
from datetime import datetime

# Setup logging
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from hadoop_env import get_env, HADOOP_DIR, JDK_DIR, run_hadoop, run_hdfs

LOG_DIR = os.path.join(PROJECT_ROOT, "hadoop", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, "mapreduce_smoke_test.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)

STREAMING_JAR = os.path.join(HADOOP_DIR, "share", "hadoop", "tools", "lib", "hadoop-streaming-3.3.6.jar")
MAPPER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "mapper", "smoke_mapper.py")
REDUCER_LOCAL = os.path.join(PROJECT_ROOT, "hadoop", "reducer", "smoke_reducer.py")
SAMPLE_CSV_LOCAL = os.path.join(PROJECT_ROOT, "data", "sample", "smoke_test_flows.csv")
METADATA_DIR = os.path.join(PROJECT_ROOT, "data", "metadata")

HDFS_TEST_INPUT_DIR = "/netsentinel/test/smoke_input"
HDFS_TEST_INPUT_FILE = f"{HDFS_TEST_INPUT_DIR}/smoke_test_flows.csv"

def run_smoke_test():
    t_start = time.time()
    logging.info("=== Starting NetSentinel Hadoop Streaming Smoke Test ===")
    
    # 1. Environment and Capability Verification
    if not os.path.exists(STREAMING_JAR):
        raise FileNotFoundError(f"Hadoop Streaming JAR missing: {STREAMING_JAR}")
    jar_size = os.path.getsize(STREAMING_JAR)
    logging.info(f"Verified Hadoop Streaming JAR: {STREAMING_JAR} ({jar_size:,} bytes)")
    
    # Query Hadoop and Java versions
    res_ver = run_hadoop(["version"])
    hadoop_ver_line = res_ver.stdout.splitlines()[0] if res_ver.stdout else "Hadoop 3.3.6"
    
    java_exe = os.path.join(JDK_DIR, "bin", "java.exe")
    res_java = subprocess.run([java_exe, "-version"], capture_output=True, text=True)
    java_ver_line = res_java.stderr.splitlines()[0] if res_java.stderr else "Java 11"
    
    logging.info(f"Hadoop Version: {hadoop_ver_line}")
    logging.info(f"Java Version: {java_ver_line}")
    
    # 2. Check Local Test CSV and Calculate Expected Results
    if not os.path.exists(SAMPLE_CSV_LOCAL):
        raise FileNotFoundError(f"Sample test CSV not found: {SAMPLE_CSV_LOCAL}")
        
    expected_counts = {}
    total_expected_records = 0
    with open(SAMPLE_CSV_LOCAL, "r", encoding="utf-8") as f:
        import csv
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row or len(row) < 5:
                continue
            proto_val = int(float(row[4].strip()))
            proto_map = {6: "TCP", 17: "UDP", 1: "ICMP", 0: "HOPOPT"}
            p_name = proto_map.get(proto_val, f"OTHER({proto_val})")
            expected_counts[p_name] = expected_counts.get(p_name, 0) + 1
            total_expected_records += 1
            
    logging.info(f"Independently calculated expected counts ({total_expected_records} flows): {expected_counts}")
    
    # 3. Stage Test File in HDFS
    run_hdfs(["dfs", "-mkdir", "-p", HDFS_TEST_INPUT_DIR])
    res_stat = run_hdfs(["dfs", "-ls", HDFS_TEST_INPUT_FILE])
    if res_stat.returncode != 0:
        logging.info(f"Uploading {SAMPLE_CSV_LOCAL} to {HDFS_TEST_INPUT_FILE}...")
        res_put = run_hdfs(["dfs", "-put", SAMPLE_CSV_LOCAL, HDFS_TEST_INPUT_FILE])
        if res_put.returncode != 0:
            raise RuntimeError(f"Failed to put test file to HDFS: {res_put.stderr}")
    else:
        logging.info(f"Test input file already staged in HDFS: {HDFS_TEST_INPUT_FILE}")
        
    # 4. Generate Dedicated Fresh HDFS Output Path
    timestamp_suffix = datetime.now().strftime("%Y%m%d_%H%M%S")
    hdfs_output_dir = f"/netsentinel/test/smoke_output_{timestamp_suffix}"
    logging.info(f"Target dedicated HDFS output directory: {hdfs_output_dir}")
    
    # 5. Build and Execute Real Hadoop Streaming Command
    # Relative paths for shipping to distributed cache
    map_rel = "hadoop/mapper/smoke_mapper.py"
    red_rel = "hadoop/reducer/smoke_reducer.py"
    
    streaming_args = [
        "jar", STREAMING_JAR,
        "-D", "mapreduce.framework.name=local",
        "-file", map_rel,
        "-file", red_rel,
        "-mapper", "python smoke_mapper.py",
        "-reducer", "python smoke_reducer.py",
        "-input", HDFS_TEST_INPUT_FILE,
        "-output", hdfs_output_dir
    ]
    
    full_cmd_str = f"hadoop.cmd {' '.join(streaming_args)}"
    logging.info(f"Submitting Hadoop Streaming Job:\n{full_cmd_str}")
    
    t_job_start = time.time()
    job_res = run_hadoop(streaming_args, timeout=180)
    job_duration = time.time() - t_job_start
    
    logging.info(f"Hadoop Job exited with code: {job_res.returncode} in {job_duration:.2f}s")
    if job_res.returncode != 0:
        logging.error(f"Hadoop Streaming Job FAILED!\nStderr:\n{job_res.stderr}")
        raise RuntimeError(f"Hadoop job execution failed with returncode {job_res.returncode}")
        
    # 6. Parse Job Output & Counters from Hadoop Execution Log
    job_id = None
    input_records = None
    output_records = None
    map_records = None
    reduce_groups = None
    
    for line in job_res.stderr.splitlines():
        if "Submitting tokens for job:" in line:
            job_id = line.split(":")[-1].strip()
        elif "Running job:" in line:
            job_id = line.split(":")[-1].strip()
        elif "Map input records=" in line:
            map_records = int(line.split("=")[-1].strip())
        elif "Reduce input records=" in line:
            input_records = int(line.split("=")[-1].strip())
        elif "Reduce output records=" in line:
            output_records = int(line.split("=")[-1].strip())
        elif "Reduce input groups=" in line:
            reduce_groups = int(line.split("=")[-1].strip())
            
    logging.info(f"Hadoop Execution Evidence:")
    logging.info(f"  Job ID: {job_id}")
    logging.info(f"  Map Input Records: {map_records} (1 header + {total_expected_records} flows)")
    logging.info(f"  Reduce Input Records: {input_records}")
    logging.info(f"  Reduce Input Groups: {reduce_groups}")
    logging.info(f"  Reduce Output Records: {output_records}")
    
    # 7. Verify Output in HDFS
    res_ls = run_hdfs(["dfs", "-ls", hdfs_output_dir])
    if res_ls.returncode != 0 or "_SUCCESS" not in res_ls.stdout:
        raise RuntimeError(f"_SUCCESS marker not found in HDFS output directory {hdfs_output_dir}!")
        
    part_file = f"{hdfs_output_dir}/part-00000"
    res_cat = run_hdfs(["dfs", "-cat", part_file])
    if res_cat.returncode != 0:
        raise RuntimeError(f"Failed to read HDFS output {part_file}: {res_cat.stderr}")
        
    actual_counts = {}
    for line in res_cat.stdout.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) == 2:
            actual_counts[parts[0]] = int(parts[1])
            
    logging.info(f"Actual HDFS Output parsed from {part_file}:\n{actual_counts}")
    
    # 8. Compare Actual vs Expected
    counts_match = (actual_counts == expected_counts)
    if not counts_match:
        raise ValueError(
            f"Result Mismatch!\nExpected: {expected_counts}\nActual: {actual_counts}"
        )
    logging.info("PARITY VERIFIED: All Hadoop MapReduce aggregation counts match expected ground truth exactly!")
    
    # 9. Export Verification Deliverable
    os.makedirs(METADATA_DIR, exist_ok=True)
    report_path = os.path.join(METADATA_DIR, "mapreduce_smoke_test.json")
    report_data = {
        "test_name": "NetSentinel Hadoop Streaming MapReduce Smoke Test",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "PASSED",
        "hadoop_version": hadoop_ver_line,
        "java_version": java_ver_line,
        "streaming_jar_path": STREAMING_JAR,
        "streaming_jar_size_bytes": jar_size,
        "mapreduce_framework": "local (Hadoop LocalJobRunner)",
        "full_command": full_cmd_str,
        "exit_code": job_res.returncode,
        "job_id": job_id,
        "execution_duration_sec": round(job_duration, 2),
        "hdfs_input_path": HDFS_TEST_INPUT_FILE,
        "hdfs_output_path": hdfs_output_dir,
        "map_input_records": map_records,
        "reduce_input_records": input_records,
        "reduce_input_groups": reduce_groups,
        "reduce_output_records": output_records,
        "expected_counts": expected_counts,
        "actual_counts": actual_counts,
        "counts_match": counts_match,
        "hdfs_output_content": res_cat.stdout.strip(),
        "diagnostics": {
            "yarn_status": "OFFLINE (Single-node pseudo-distributed environment uses Hadoop LocalJobRunner for MapReduce)",
            "streaming_pipe": "Standard Unix I/O Pipes (sys.stdin / sys.stdout) via Python runtime",
            "sorting_engine": "Apache Hadoop native MapOutputBuffer QuickSort / MergeSorter"
        }
    }
    
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    logging.info(f"Generated smoke test metadata report: {report_path}")
    
    total_time = time.time() - t_start
    logging.info(f"=== Smoke Test Successfully Completed in {total_time:.2f}s ===")
    return report_data

if __name__ == "__main__":
    try:
        report = run_smoke_test()
        print("\nHadoop Streaming smoke test succeeded!")
    except Exception as e:
        logging.exception(f"Smoke test failed: {e}")
        sys.exit(1)
