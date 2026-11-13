# NetSentinel — MapReduce Job 2: Destination IP Analytics Specification & Report

## 1. Executive Summary
**Job 2 (Destination IP Analytics)** analyzes traffic from the target/recipient perspective. It computes inbound flow volume, distinct interacting sources, aggregate forward/backward packet and byte distributions, benign vs. malicious traffic splits, and dominant attack vectors for every destination IPv4 address across the 2,099,971 flows.

---

## 2. Hadoop Architecture & Pipeline

```
[HDFS Input: /netsentinel/input/original/*.csv (2,099,971 flows)]
                       │
                       ▼
       [hadoop/mapper/destination_ip_mapper.py]
         - Emits: Dst_IP_dec \t fwd_pkts,bwd_pkts,fwd_bytes,bwd_bytes,is_benign,is_attack,src_ip,label
                       │
                       ▼ (Hadoop QuickSort / MergeSorter)
       [hadoop/reducer/destination_ip_reducer.py]
         - Group-by Dst_IP_dec
         - Accumulates incoming flows, packet & byte metrics
         - Tracks distinct contacting sources via set()
         - Determines dominant attack category using frequency counter
                       │
                       ▼
[HDFS: /netsentinel/output/job2_destination_ip_<ts>/part-00000]
                       │
                       ▼
[results/ip_analytics/destination_ip_summary.csv]
```

---

## 3. Output Schema (`results/ip_analytics/destination_ip_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `dst_ip_dec` | BIGINT | Decimal representation of target IPv4 |
| `dst_ip` | VARCHAR | Dotted-quad IPv4 string |
| `total_flows` | BIGINT | Total incoming flows |
| `unique_src_ips` | INTEGER | Distinct source hosts connecting to this destination |
| `total_fwd_packets` | BIGINT | Total forward packets received |
| `total_bwd_packets` | BIGINT | Total backward packets sent in response |
| `total_packets` | BIGINT | Total packet volume |
| `total_fwd_bytes` | BIGINT | Total forward payload bytes |
| `total_bwd_bytes` | BIGINT | Total backward payload bytes |
| `total_bytes` | BIGINT | Combined byte volume |
| `benign_flows` | BIGINT | Normal non-attack flows |
| `attack_flows` | BIGINT | Malicious attack flows targeting this IP |
| `dominant_attack` | VARCHAR | Most frequent attack vector targeting this IP (or NONE) |
