#!/usr/bin/env python3
"""
NetSentinel - Terminal Log Collector for Hadoop and HDFS
Captures comprehensive live CLI command outputs from Hadoop & HDFS into structured text/markdown files.
"""

import os
import sys
import subprocess
from datetime import datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "scripts"))
from hadoop_env import run_hadoop, run_hdfs

OUT_DIR = os.path.join(PROJECT_ROOT, "docs", "terminal_logs")
os.makedirs(OUT_DIR, exist_ok=True)

COMMANDS = [
    {
        "file": "01_hadoop_version.txt",
        "title": "Hadoop Version Information",
        "runner": run_hadoop,
        "args": ["version"]
    },
    {
        "file": "02_hdfs_dfsadmin_report.txt",
        "title": "HDFS DFSAdmin Live Cluster & Node Report",
        "runner": run_hdfs,
        "args": ["dfsadmin", "-report"]
    },
    {
        "file": "03_hdfs_fsck_root.txt",
        "title": "HDFS Filesystem Health & Block Check (fsck /)",
        "runner": run_hdfs,
        "args": ["fsck", "/", "-files", "-blocks", "-locations"]
    },
    {
        "file": "04_hdfs_ls_input_original.txt",
        "title": "HDFS Ingested Canonical Standard Datasets (/netsentinel/input/original)",
        "runner": run_hdfs,
        "args": ["dfs", "-ls", "-h", "/netsentinel/input/original"]
    },
    {
        "file": "05_hdfs_ls_input_plus.txt",
        "title": "HDFS Plus Datasets (/netsentinel/input/plus)",
        "runner": run_hdfs,
        "args": ["dfs", "-ls", "-h", "/netsentinel/input/plus"]
    },
    {
        "file": "06_hdfs_ls_all_outputs.txt",
        "title": "HDFS MapReduce Output Directories (/netsentinel/output)",
        "runner": run_hdfs,
        "args": ["dfs", "-ls", "-h", "/netsentinel/output"]
    },
    {
        "file": "07_hdfs_count_storage.txt",
        "title": "HDFS Directory Block & Byte Quota Counts (dfs -count -q -h -v)",
        "runner": run_hdfs,
        "args": ["dfs", "-count", "-q", "-h", "-v", "/netsentinel/input/original", "/netsentinel/output"]
    },
    {
        "file": "08_hdfs_sample_head_original.txt",
        "title": "HDFS Data Inspection (Sample Head of /netsentinel/input/original/monday.csv)",
        "runner": run_hdfs,
        "args": ["dfs", "-head", "/netsentinel/input/original/monday.csv"]
    },
    {
        "file": "09_hdfs_cat_sample_job_output.txt",
        "title": "HDFS MapReduce Part Output (Sample from /netsentinel/output/job4_protocol_*/part-00000)",
        "runner": run_hdfs,
        "args": ["dfs", "-cat", "/netsentinel/output/job4_protocol_20261113_235732/part-00000"]
    }
]

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Collecting live Hadoop and HDFS terminal outputs...")
    summary_lines = [
        "# NetSentinel — Hadoop and HDFS Live Terminal Execution Logs",
        "",
        f"**Timestamp:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ",
        "**Environment:** Apache Hadoop 3.3.6 (Windows 11, LocalJobRunner with Live HDFS)  ",
        "**Cluster Status:** Live NameNode (`:9000`), Live DataNode (`:9864`), Live Web UI (`:9870`)  ",
        "",
        "---",
        "",
        "## Terminal Output Artifacts Index",
        ""
    ]

    for item in COMMANDS:
        fname = item["file"]
        title = item["title"]
        runner = item["runner"]
        args = item["args"]
        cmd_str = ("hadoop " if runner == run_hadoop else "hdfs ") + " ".join(args)
        
        print(f"Executing: {cmd_str} -> {fname}")
        res = runner(args)
        out_text = res.stdout if res.stdout else res.stderr
        
        file_path = os.path.join(OUT_DIR, fname)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"================================================================================\n")
            f.write(f"COMMAND: {cmd_str}\n")
            f.write(f"TITLE:   {title}\n")
            f.write(f"TIME:    {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"EXIT:    {res.returncode}\n")
            f.write(f"================================================================================\n\n")
            f.write(out_text)
            
        summary_lines.append(f"### {title}")
        summary_lines.append(f"- **Command:** `{cmd_str}`")
        summary_lines.append(f"- **Output File:** [{fname}](file:///{file_path.replace(os.sep, '/')})")
        summary_lines.append("```text")
        # Add head/tail preview
        preview_lines = out_text.strip().splitlines()
        if len(preview_lines) > 25:
            preview = "\n".join(preview_lines[:20]) + f"\n\n... [{len(preview_lines) - 25} lines truncated - view full file above] ...\n\n" + "\n".join(preview_lines[-5:])
        else:
            preview = "\n".join(preview_lines)
        summary_lines.append(preview)
        summary_lines.append("```")
        summary_lines.append("")

    summary_file = os.path.join(PROJECT_ROOT, "docs", "HADOOP_TERMINAL_OUTPUTS.md")
    with open(summary_file, "w", encoding="utf-8") as f:
        f.write("\n".join(summary_lines))
        
    print(f"Successfully generated summary catalog: {summary_file}")

if __name__ == '__main__':
    main()
