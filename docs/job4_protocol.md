# NetSentinel — MapReduce Job 4: Protocol Analytics Specification & Report

## 1. Executive Summary
**Job 4 (Protocol Analytics)** aggregates network flow records across all transport and network layer protocols present in the CICIDS-2017 dataset. It computes total flow volume, forward/backward packet and byte distributions, average flow durations, average packet sizes, and attack-to-benign ratios per protocol.

---

## 2. Hadoop Architecture & Pipeline

```
[HDFS Input: /netsentinel/input/original/*.csv (2,099,971 flows)]
                       │
                       ▼
       [hadoop/mapper/protocol_mapper.py]
         - Emits: Protocol_num \t fwd_pkts,bwd_pkts,fwd_bytes,bwd_bytes,dur,is_benign,is_attack
                       │
                       ▼ (Hadoop QuickSort / MergeSorter)
       [hadoop/reducer/protocol_reducer.py]
         - Group-by Protocol_num
         - Maps IANA protocol numbers (6=TCP, 17=UDP, 1=ICMP, 0=HOPOPT)
         - Computes average flow duration and average packet size
                       │
                       ▼
[HDFS: /netsentinel/output/job4_protocol_<ts>/part-00000]
                       │
                       ▼
[results/protocol_analytics/protocol_summary.csv]
```

---

## 3. Output Schema (`results/protocol_analytics/protocol_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `protocol` | INTEGER | IANA protocol number |
| `protocol_name` | VARCHAR | Recognized name (TCP, UDP, ICMP, HOPOPT, etc.) |
| `total_flows` | BIGINT | Flow count using this protocol |
| `total_fwd_packets` | BIGINT | Total forward packets |
| `total_bwd_packets` | BIGINT | Total backward packets |
| `total_packets` | BIGINT | Combined packet volume |
| `total_fwd_bytes` | BIGINT | Total forward bytes |
| `total_bwd_bytes` | BIGINT | Total backward bytes |
| `total_bytes` | BIGINT | Combined byte volume |
| `avg_flow_duration` | FLOAT | Mean flow duration in microseconds |
| `avg_packet_size` | FLOAT | Mean payload/header bytes per packet |
| `benign_flows` | BIGINT | Normal non-attack flows |
| `attack_flows` | BIGINT | Attack-labelled flows |
