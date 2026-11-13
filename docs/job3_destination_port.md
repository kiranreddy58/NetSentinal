# NetSentinel — MapReduce Job 3: Destination Port Analytics Specification & Report

## 1. Executive Summary
**Job 3 (Destination Port Analytics)** computes traffic volume, host cardinalities, protocol distributions, and heuristic port scanning indicators across all destination TCP/UDP ports in the CICIDS-2017 dataset.

---

## 2. Hadoop Architecture & Pipeline

```
[HDFS Input: /netsentinel/input/original/*.csv (2,099,971 flows)]
                       │
                       ▼
       [hadoop/mapper/destination_port_mapper.py]
         - Emits: Dst_Port \t fwd_pkts,bwd_pkts,fwd_bytes,bwd_bytes,is_benign,is_attack,src_ip,dst_ip,proto
                       │
                       ▼ (Hadoop QuickSort / MergeSorter)
       [hadoop/reducer/destination_port_reducer.py]
         - Group-by Dst_Port
         - Maps common IANA service names
         - Accumulates flows, packet/byte metrics, TCP/UDP counts
         - Generates explainable port-scanning indicator
                       │
                       ▼
[HDFS: /netsentinel/output/job3_destination_port_<ts>/part-00000]
                       │
                       ▼
[results/port_analytics/destination_port_summary.csv]
```

---

## 3. Output Schema (`results/port_analytics/destination_port_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `dst_port` | INTEGER | Destination TCP/UDP port number |
| `port_name` | VARCHAR | Known IANA service name (HTTP, HTTPS, SSH, DNS, etc.) |
| `total_flows` | BIGINT | Total flows targeting this port |
| `unique_sources` | INTEGER | Distinct client source IPs contacting this port |
| `unique_destinations` | INTEGER | Distinct server destination IPs listening on this port |
| `total_fwd_packets` | BIGINT | Total forward packets |
| `total_bwd_packets` | BIGINT | Total backward packets |
| `total_packets` | BIGINT | Combined packet volume |
| `total_fwd_bytes` | BIGINT | Total forward payload bytes |
| `total_bwd_bytes` | BIGINT | Total backward payload bytes |
| `total_bytes` | BIGINT | Combined byte volume |
| `benign_flows` | BIGINT | Baseline benign flows |
| `attack_flows` | BIGINT | Malicious attack flows targeting this port |
| `tcp_flows` | BIGINT | Flows using TCP protocol |
| `udp_flows` | BIGINT | Flows using UDP protocol |
| `other_flows` | BIGINT | Flows using ICMP or other protocols |
| `scan_indicator` | VARCHAR | Explainable heuristic classification (e.g. ATTACK_HOTSPOT, HIGH_VOLUME_SERVICE, NORMAL) |
