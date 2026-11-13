# NetSentinel — Distributed Network Traffic Intelligence & Attack Pattern Detection System

NetSentinel is an enterprise-scale distributed network analytics and cyberattack detection platform built on **Apache Hadoop 3.3.6 (HDFS & MapReduce)**, **Python FastAPI**, and **React 18**. It ingests and processes **2,099,971 canonical network flow records** (47.23 GB, 56.1 million packets) from the benchmark **CICIDS-2017 Version 2** dataset, evaluating 27 ground-truth attack classes with 100% verified mathematical parity.

---

## 📸 System Demonstration & Telemetry (Key Outputs)

Below are the 5 core composite outputs combining real-time **React Dashboard UI Views** with **Live Apache Hadoop & HDFS Terminal Logs**:

### 1. System Overview Dashboard & HDFS Cluster Health
Real-time executive telemetry tracking 2,099,971 flows, 517,410 attack flows (24.64%), and active LocalJobRunner status alongside live `hdfs dfsadmin -report` cluster health metrics.

![1. System Overview & HDFS Cluster Health](output/1_system_overview_and_hdfs_report.png)

---

### 2. Source IP Analytics (Job 1) & Canonical HDFS Storage
Granular host telemetry across all 174 source IP addresses paired with live `hdfs dfs -ls -h /netsentinel/input/original` directory verification of the canonical Monday–Friday datasets.

![2. Source IP Analytics & Canonical HDFS Storage](output/2_source_ip_analytics_and_hdfs_datasets.png)

---

### 3. Port & Protocol Intelligence (Jobs 3 & 4) & HDFS Reducer Outputs
Port vulnerability and service targeting across 5,066 ports (Port 80 HTTP, Port 443 HTTPS, Port 22 SSH, Port 21 FTP) combined with raw partition outputs emitted directly by MapReduce reducers into HDFS.

![3. Port & Protocol Intelligence & Reducer Outputs](output/3_port_protocol_intelligence_and_mapreduce_output.png)

---

### 4. Attack Taxonomy (27 Classes) & HDFS Storage Quotas
Flow and packet distributions across 27 distinct attack classes (DoS, DDoS, PortScan, Brute Force Patator, Web Attacks, Botnets, Infiltration, Heartbleed) alongside live HDFS storage quotas and block counts.

![4. Attack Taxonomy & HDFS Storage Quotas](output/4_attack_taxonomy_and_hdfs_storage_metrics.png)

---

### 5. MapReduce Provenance & HDFS Job Directories
Execution telemetry, Hadoop Job IDs (`job_local...`), map/reduce record counters, and 0-discrepancy validation confirmation alongside all 10 timestamped MapReduce output directories in HDFS.

![5. MapReduce Provenance & HDFS Output Directories](output/5_mapreduce_provenance_and_hdfs_job_directories.png)

---

## 🚀 Key Architectural Highlights

- **Storage Engine:** Apache Hadoop HDFS with active NameNode (`:9000`) and DataNode (`:9864`).
- **Processing Engine:** Hadoop Streaming MapReduce running across 10 specialized analytics jobs:
  1. Source IP Analytics
  2. Destination IP Analytics
  3. Destination Port Analytics
  4. Protocol Distribution
  5. Volumetric Traffic Tiers
  6. Temporal Diurnal Patterns
  7. Attack Taxonomy & Label Distribution
  8. Host-to-Host Correlation Pairs (62,107 channels)
  9. Suspicious Behavior Heuristics
  10. Daily Comparative Baseline Analysis
- **Backend API:** FastAPI 0.110+ serving 12 analytical endpoints with caching, pagination, and Swagger UI at `http://localhost:8000/docs`.
- **Frontend Dashboard:** Modern React 18 Single Page Application styled with Tailwind CSS and Lucide icons.
- **Verification Parity:** 100.00% exact match (0 discrepancies) between Hadoop MapReduce outputs and independent chunked Python validation scans.

---

## 🛠️ Quick Start

### 1. Launch All Services (Backend & Frontend)
Double-click or run:
```cmd
start_all.cmd
```
- **Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **HDFS NameNode UI:** [http://localhost:9870](http://localhost:9870)

### 2. Run Automated Test Suite
```bash
python -m unittest discover -s tests
```
