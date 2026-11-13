# MapReduce Job 8: Source-Destination Pair Correlation Analytics

## 1. Overview
MapReduce Job 8 analyzes traffic interactions at the granularity of unique (Source IP, Destination IP) communication pairs. This allows NetSentinel to observe communication intensity, high-volume host-to-host channels, data exfiltration conduits, and botnet C2 / lateral movement patterns across the enterprise network.

## 2. Hadoop Streaming Specification
- **Mapper:** `hadoop/mapper/source_destination_mapper.py`
  - Input: 5 Standard CICIDS-2017 CSV files from `/netsentinel/input/original/` (2,099,971 flows).
  - Emits: `(src_ip, dst_ip)\tflows,fwd_pkts,bwd_pkts,tot_pkts,fwd_bytes,bwd_bytes,tot_bytes,benign,attack,dst_port`
- **Reducer:** `hadoop/reducer/source_destination_reducer.py`
  - Aggregates by pair `(src_ip, dst_ip)`.
  - Calculates: total flows, forward/backward/total packets, forward/backward/total bytes, benign flows, attack flows, and set of distinct destination ports contacted on that host.
- **HDFS Output:** `/netsentinel/output/job8_correlation_<timestamp>/`
- **Local Analytics Output:** `results/ip_analytics/source_destination_correlation.csv`

## 3. Data Integrity & Verification
- Aggregation is validated against a multi-threaded chunked scan of the 5 canonical Standard CSV files.
- Ensures zero record loss across all pair groups.
