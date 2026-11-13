# NetSentinel Viva & Defense Comprehensive Q&A Guide

## 1. Core Architecture & Big Data Concepts

### Q1: What is NetSentinel and what problem does it solve?
**Answer:** NetSentinel is an end-to-end, distributed network traffic intelligence and cyberattack pattern detection system designed for enterprise-scale traffic analysis. Using the CICIDS-2017 Version 2 benchmark dataset (over 2.099 million network flows), it processes raw, high-dimensional flow logs stored in Apache Hadoop HDFS and executes a ten-stage Hadoop Streaming MapReduce pipeline. The aggregated intelligence powers a high-performance FastAPI REST API and a React 18 dashboard.

### Q2: What is the underlying execution mode of your Hadoop environment?
**Answer:** Apache Hadoop 3.3.6 runs locally on Windows 11 with live HDFS services (NameNode on port 9000/9870 and DataNode on port 9864) operating under the **LocalJobRunner** execution engine (`mapreduce.framework.name=local`). Rather than a multi-node YARN cluster, `LocalJobRunner` runs genuine MapReduce tasks inside local worker threads, reading input blocks directly from live HDFS and writing final partition outputs back to HDFS.

### Q3: Why did you choose Hadoop Streaming over Native Java MapReduce?
**Answer:** Hadoop Streaming allows standard UNIX/POSIX stdin/stdout communication between the Hadoop engine and Python mappers/reducers. This decoupled design enabled us to take advantage of Python's robust CSV parsing, datetime parsing, and statistical manipulation libraries while strictly preserving the standard MapReduce paradigms: map, partition, external sort/shuffle, and group reduction.

### Q4: How did you ensure the reducers do not run out of memory?
**Answer:** In MapReduce, keys arriving at the reducer are guaranteed to be globally sorted during the shuffle and sort phase. Consequently, our reducers maintain state strictly for the **currently active key** (e.g. current IP, port, or protocol). Once the key changes, metrics are emitted to stdout and the internal sets/counters are immediately garbage-collected, guaranteeing bounded $O(1)$ or $O(K)$ memory complexity where $K$ is the maximum cardinality of a single key.

---

## 2. Dataset & Data Engineering Details

### Q5: What is the volume and composition of the dataset?
- Total Canonical Network Flows: **2,099,971 flows** across 5 Standard CSV files (Monday through Friday).
- Total Transferred Volume: **47.23 GB** (47,229,026,456 bytes) across **56,129,897 packets**.
- Ground-Truth Labels: **1,582,561 Benign flows (75.36%)** and **517,410 Attack-labelled flows (24.64%)** across 27 distinct attack signatures.

### Q6: What are the 10 MapReduce Analytics Jobs executed in NetSentinel?
1. **Job 1 (Source IP Analytics):** Aggregates flow counts, packet volumes, byte volumes, attack distribution, and distinct target IP/port cardinalities for all 174 source hosts.
2. **Job 2 (Destination IP Analytics):** Analyzes victim/server host reception, detecting targeted infrastructure across 19,044 unique destination IPs.
3. **Job 3 (Destination Port Analytics):** Service identification and attack targeting across 5,066 ports (e.g. Port 80 HTTP DoS, Port 22 SSH Patator).
4. **Job 4 (Protocol Analytics):** Traffic breakdown by protocol (TCP: 67.24%, UDP: 32.55%, ICMP & HOPOPT: <0.21%).
5. **Job 5 (Traffic Volume Tiers):** Classifies flows into 5 logarithmic volume buckets from Micro (<1KB) to Jumbo (>1MB).
6. **Job 6 (Temporal Traffic Analytics):** 60-minute interval breakdown capturing attack wave surges and diurnal peaks.
7. **Job 7 (Attack Label Analytics):** Aggregates metrics for each of the 27 ground-truth attack classes.
8. **Job 8 (Source-Destination Correlation):** Maps 62,107 distinct host-to-host communication channels to identify lateral movement and C2 conduits.
9. **Job 9 (Suspicious Behavior Heuristics):** Evaluates rule-based heuristic detectors (port scanning, volume flooding, slowloris keep-alive, and data exfiltration) against canonical labels.
10. **Job 10 (Daily Comparative Analytics):** Evaluates daily shifts from Monday's benign baseline to coordinated mid-week attack campaigns.

### Q7: How was data validity and reproducibility verified?
**Answer:** Every single MapReduce job was independently audited by a chunked, multi-threaded Python validation scanner that read the raw dataset from disk and cross-compared group cardinalities, total flow counts, total packets, and byte sums against the Hadoop output. **Zero discrepancies (100.00% parity)** were achieved across all 10 jobs.
