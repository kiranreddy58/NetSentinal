# NetSentinel — MapReduce Job 5: Traffic Volume Analytics Specification & Report

## 1. Executive Summary
**Job 5 (Traffic Volume Analytics)** analyzes the payload and packet volume distribution across five hierarchical tiers (Micro, Small, Medium, Large, Jumbo) to establish network bandwidth consumption baselines and volumetric anomaly thresholds across 2,099,971 flows.

---

## 2. Volume Tier Definition

| Tier Code | Label | Payload Byte Range | Typical Network Artifacts |
| :--- | :--- | :--- | :--- |
| `1_MICRO_<1KB` | Micro | $< 1{,}024$ bytes | TCP Handshakes, Port scans, DNS queries, Keep-alives |
| `2_SMALL_1-10KB` | Small | $1{,}024 - 10{,}240$ bytes | Small HTTP GET/POST, SSH auth, small JSON payloads |
| `3_MEDIUM_10-100KB` | Medium | $10{,}240 - 102{,}400$ bytes | Standard web pages, images, API responses |
| `4_LARGE_100KB-1MB` | Large | $102{,}400 - 1{,}048{,}576$ bytes | Document downloads, volumetric flood bursts |
| `5_JUMBO_>1MB` | Jumbo | $> 1{,}048{,}576$ bytes | Large file transfers, DoS bulk floods, video streams |

---

## 3. Output Schema (`results/traffic_analytics/traffic_volume_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `volume_tier` | VARCHAR | Volume bucket identifier |
| `total_flows` | BIGINT | Flow count falling within this bucket |
| `total_fwd_packets` | BIGINT | Forward packet volume |
| `total_bwd_packets` | BIGINT | Backward packet volume |
| `total_packets` | BIGINT | Combined packet volume |
| `total_fwd_bytes` | BIGINT | Forward payload volume |
| `total_bwd_bytes` | BIGINT | Backward payload volume |
| `total_bytes` | BIGINT | Combined byte volume |
| `avg_flow_bytes` | FLOAT | Mean bytes per flow |
| `min_flow_bytes` | BIGINT | Minimum flow size in tier |
| `max_flow_bytes` | BIGINT | Maximum flow size in tier |
