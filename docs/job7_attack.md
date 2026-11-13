# NetSentinel — MapReduce Job 7: Attack Label Analytics Specification & Report

## 1. Executive Summary
**Job 7 (Attack Label Analytics)** conducts an exhaustive analysis of all 27 original ground-truth traffic labels present in the CICIDS-2017 dataset. It maps each attack vector to high-level security categories (e.g. Brute Force, DoS, DDoS, Reconnaissance, Infiltration) while strictly preserving verbatim label spellings.

---

## 2. Ground-Truth Distribution & Categories

| Category | Typical Attack Labels | Attack Mechanisms |
| :--- | :--- | :--- |
| **BENIGN** | BENIGN | Normal baseline enterprise network traffic |
| **DENIAL_OF_SERVICE** | DoS Hulk, DoS GoldenEye, DoS Slowloris, DoS Slowhttptest | High-rate HTTP floods, slow-and-low connection exhaustion |
| **DISTRIBUTED_DOS** | DDoS | High-volume multi-agent LOIC/HOIC distributed floods |
| **RECONNAISSANCE** | Portscan, Infiltration - Portscan | Fast horizontal and vertical TCP port sweeps |
| **BRUTE_FORCE** | FTP-Patator, SSH-Patator | Automated credential guessing on standard administrative ports |
| **WEB_APPLICATION** | Web Attack - Brute Force, Web Attack - XSS, Web Attack - SQL Injection | Application-layer exploits, cross-site scripting, SQL injection |
| **BOTNET** | Botnet, Botnet - Attempted | Command-and-control beaconing and infected node activity |
| **INFILTRATION** | Infiltration, Infiltration - Attempted | Privilege escalation and malware staging |
| **VULNERABILITY_EXPLOIT**| Heartbleed | OpenSSL TLS heartbeat buffer over-read |

---

## 3. Output Schema (`results/attack_analytics/attack_label_summary.csv`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `attack_label` | VARCHAR | Exact original label string |
| `category` | VARCHAR | Standardized high-level classification |
| `total_flows` | BIGINT | Exact flow count matching this label |
| `unique_sources` | INTEGER | Distinct attacker/client IPs involved |
| `unique_destinations` | INTEGER | Distinct victim/server IPs targeted |
| `total_fwd_packets` | BIGINT | Forward packet volume |
| `total_bwd_packets` | BIGINT | Backward packet volume |
| `total_packets` | BIGINT | Combined packet volume |
| `total_fwd_bytes` | BIGINT | Forward byte volume |
| `total_bwd_bytes` | BIGINT | Backward byte volume |
| `total_bytes` | BIGINT | Combined byte volume |
| `avg_duration` | FLOAT | Mean flow duration in microseconds |
| `pct_of_traffic` | FLOAT | Percentage of entire 2,099,971-flow dataset |
