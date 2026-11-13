# NetSentinel — System Execution & Full-Screen Screenshots Catalog

This document indexes all 14 full-screen (1920x1080) high-resolution screenshots capturing live NetSentinel services, MapReduce analytics views, FastAPI documentation, and Hadoop HDFS infrastructure.

All screenshots are stored in the project directory: [`docs/screenshots/`](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/).

---

## 1. System Overview Dashboard
- **File:** [01_system_overview.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/01_system_overview.png)
- **Description:** Real-time executive dashboard summarizing the processed 2,099,971 canonical flow records, 517,410 attack flows (24.64%), 56.1M packets, 47.23 GB total volume, active Hadoop LocalJobRunner status, and live HDFS NameNode / DataNode health indicators.

## 2. Source IP Analytics (Job 1)
- **File:** [02_source_ip_analytics.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/02_source_ip_analytics.png)
- **Description:** Granular host activity analysis across all 174 source IPs, reporting total flows, packet distributions, payload bytes, attack vs benign breakdown, and distinct destination IP/port counts.

## 3. Destination IP Analytics (Job 2)
- **File:** [03_destination_ip_analytics.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/03_destination_ip_analytics.png)
- **Description:** Targeted victim and server host reception metrics across 19,044 unique destination IPs, with real-time search filtering.

## 4. Port Intelligence (Job 3)
- **File:** [04_port_intelligence.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/04_port_intelligence.png)
- **Description:** Service identification and attack targeting across 5,066 destination ports (including Port 80 HTTP, Port 443 HTTPS, Port 22 SSH, Port 21 FTP).

## 5. Protocol Distribution Analytics (Job 4)
- **File:** [05_protocol_analytics.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/05_protocol_analytics.png)
- **Description:** Protocol layer breakdown showing TCP (67.24%), UDP (32.55%), ICMP, and HOPOPT traffic distributions.

## 6. Traffic Volume Tiers (Job 5)
- **File:** [06_traffic_volume_tiers.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/06_traffic_volume_tiers.png)
- **Description:** Logarithmic volumetric classification from Micro flows (<1KB, 1.38M flows) up to Jumbo flows (>1MB, 33.8 GB transferred across 1,820 flows).

## 7. Temporal Distribution (Job 6)
- **File:** [07_temporal_distribution.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/07_temporal_distribution.png)
- **Description:** 60-minute time-bucketed analysis tracking traffic surge patterns, diurnal shifts, and synchronized attack waves.

## 8. Daily Comparative Analytics (Job 10)
- **File:** [08_daily_comparative.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/08_daily_comparative.png)
- **Description:** Weekly comparative baseline vs attack distributions from Monday's pure benign operations to Friday's intensive DDoS, Botnet, and Portscan activities.

## 9. Attack Taxonomy & Class Distribution (Job 7)
- **File:** [09_attack_taxonomy.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/09_attack_taxonomy.png)
- **Description:** Comprehensive breakdown of all 27 ground-truth attack classes, displaying flow counts, packet volumes, and high-level categorization.

## 10. Host Correlation Channels (Job 8)
- **File:** [10_host_correlation_channels.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/10_host_correlation_channels.png)
- **Description:** Host-to-host interaction matrix mapping 62,107 distinct (Source IP, Destination IP) communication pairs to trace lateral movement and botnet command-and-control channels.

## 11. Suspicious Behavior Heuristics (Job 9)
- **File:** [11_suspicious_heuristics.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/11_suspicious_heuristics.png)
- **Description:** Rule-based anomaly detection results (port scan probes, volume floods, slowloris keep-alive, asymmetric exfiltration) cross-referenced against canonical ground truth.

## 12. Hadoop MapReduce Provenance & Execution Reports
- **File:** [12_mapreduce_provenance.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/12_mapreduce_provenance.png)
- **Description:** Verifiable Hadoop execution metadata showing job IDs, counter values, execution times, and independent chunked scan validation confirmations with 0 discrepancies.

## 13. FastAPI REST API Documentation (Swagger UI)
- **File:** [13_fastapi_swagger_docs.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/13_fastapi_swagger_docs.png)
- **Description:** Interactive OpenAPI Swagger UI documentation at `http://localhost:8000/docs` exposing all 12 analytical REST endpoints.

## 14. Apache Hadoop HDFS NameNode Web UI
- **File:** [14_hdfs_namenode_ui.png](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/screenshots/14_hdfs_namenode_ui.png)
- **Description:** Live Apache Hadoop 3.3.6 NameNode web management console running on `http://localhost:9870`, showing active DataNodes, DFS capacity, and block health.
