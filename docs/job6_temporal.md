# NetSentinel — MapReduce Job 6: Temporal Traffic Analytics Specification & Report

## 1. Executive Summary
**Job 6 (Temporal Traffic Analytics)** processes flow timestamps across all five capture days. Preserving the exact dataset session semantics (`MM:SS.s`), it extracts the minute-offset capture buckets ($00$ through $59$) and computes longitudinal flow density, protocol composition, and attack/benign distributions across time.

---

## 2. Output Schema (`results/temporal_analytics/temporal_traffic_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `minute_bucket` | VARCHAR | Two-digit minute window (00-59) |
| `total_flows` | BIGINT | Flow count observed in this minute window |
| `total_fwd_packets` | BIGINT | Forward packet volume |
| `total_bwd_packets` | BIGINT | Backward packet volume |
| `total_packets` | BIGINT | Total packet volume |
| `total_fwd_bytes` | BIGINT | Forward byte volume |
| `total_bwd_bytes` | BIGINT | Backward byte volume |
| `total_bytes` | BIGINT | Combined byte volume |
| `benign_flows` | BIGINT | Normal flows in window |
| `attack_flows` | BIGINT | Attack flows in window |
| `tcp_flows` | BIGINT | TCP flows in window |
| `udp_flows` | BIGINT | UDP flows in window |
| `other_flows` | BIGINT | ICMP and other protocol flows |
