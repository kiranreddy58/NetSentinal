# NetSentinel — Primary Deliverable Images Catalog (`output/`)

This directory contains the **five consolidated, presentation-ready master images** combining high-resolution **React Dashboard UI views** with live **Apache Hadoop & HDFS terminal execution logs**.

All images are formatted in ultra-clear full-screen resolution (**1920 × 1260**) with distinct UI headers, analytics tables, and terminal panels.

---

## 1. System Overview Dashboard & HDFS Cluster Health
- **File:** [1_system_overview_and_hdfs_report.png](file:///c:/Users/kiran/OneDrive/Documents/bda/output/1_system_overview_and_hdfs_report.png)
- **UI Content:** Real-time executive metrics (2,099,971 flows, 517,410 attack flows / 24.64%, 56.1M packets, 47.23 GB volume, LocalJobRunner status).
- **Terminal Panel:** `hdfs dfsadmin -report` showing live DataNode status (`127.0.0.1:9866`), Configured Capacity (443.04 GB), DFS Used (1.68 GB), and 0 corrupt/missing blocks.

---

## 2. Source IP Analytics (Job 1) & Canonical HDFS Storage
- **File:** [2_source_ip_analytics_and_hdfs_datasets.png](file:///c:/Users/kiran/OneDrive/Documents/bda/output/2_source_ip_analytics_and_hdfs_datasets.png)
- **UI Content:** Paginated host analytics table across all 174 source IPs (packet totals, byte volumes, attack distribution, distinct targets).
- **Terminal Panel:** `hdfs dfs -ls -h /netsentinel/input/original` displaying all 5 canonical Standard CSV files (`friday.csv`, `monday.csv`, `thursday.csv`, `tuesday.csv`, `wednesday.csv`).

---

## 3. Port & Protocol Intelligence (Jobs 3 & 4) & HDFS Reducer Outputs
- **File:** [3_port_protocol_intelligence_and_mapreduce_output.png](file:///c:/Users/kiran/OneDrive/Documents/bda/output/3_port_protocol_intelligence_and_mapreduce_output.png)
- **UI Content:** Port intelligence table across 5,066 destination ports (identifying targeted services: HTTP Port 80, HTTPS Port 443, SSH Port 22, FTP Port 21).
- **Terminal Panel:** `hdfs dfs -cat .../job4_protocol_*/part-00000` verifying raw tab-delimited protocol aggregation rows written directly to HDFS by MapReduce reducers.

---

## 4. Attack Taxonomy (27 Classes) & HDFS Storage Quotas
- **File:** [4_attack_taxonomy_and_hdfs_storage_metrics.png](file:///c:/Users/kiran/OneDrive/Documents/bda/output/4_attack_taxonomy_and_hdfs_storage_metrics.png)
- **UI Content:** Attack distribution table across all 27 ground-truth attack classes (flow counts, packet volume, byte volume, and high-level categorization).
- **Terminal Panel:** `hdfs dfs -count -q -h -v` detailing directory quotas, block counts, and storage space usage in HDFS input and output paths.

---

## 5. MapReduce Provenance & HDFS Job Directories
- **File:** [5_mapreduce_provenance_and_hdfs_job_directories.png](file:///c:/Users/kiran/OneDrive/Documents/bda/output/5_mapreduce_provenance_and_hdfs_job_directories.png)
- **UI Content:** MapReduce execution provenance table displaying Hadoop Job IDs (`job_local...`), map/reduce record counters, execution times, and independent validation results (0 discrepancies).
- **Terminal Panel:** `hdfs dfs -ls -h /netsentinel/output` verifying all 10 timestamped MapReduce output directories generated across all analytics phases.
