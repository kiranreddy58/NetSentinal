# NetSentinel — MapReduce Job 1: Source IP Analytics Specification & Report

## 1. Executive Summary
**Job 1 (Source IP Analytics)** is the foundational analytical stage of the NetSentinel distributed processing pipeline. It processes the entire canonical Standard CICIDS-2017 dataset stored in Apache Hadoop HDFS (`/netsentinel/input/original/`) across all five capture days (Monday through Friday), comprising **2,099,971 bidirectional network flows** totaling **811.01 MB**.

The job computes comprehensive per-source-IP volume, packet, byte, attack, and destination diversity metrics, transforming unstructured flow sequences into structured host intelligence profiles.

---

## 2. Hadoop MapReduce Architecture & Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APACHE HADOOP HDFS & MAPREDUCE                      │
│                                                                        │
│  [HDFS Input: /netsentinel/input/original/*.csv (2,099,971 flows)]     │
│                                │                                       │
│                                ▼                                       │
│                 [InputFormat / RecordReader]                           │
│                                │                                       │
│                                ▼ (Line-by-line via STDIN pipe)         │
│             [Python Mapper: source_ip_mapper.py]                       │
│                                │                                       │
│                                ▼ (STDOUT: Key \t Value Tuple)          │
│                      [MapOutputBuffer]                                 │
│                                │                                       │
│                                ▼ (Hadoop QuickSort / MergeSorter)      │
│                     [Shuffle & Sort Engine]                            │
│                                │                                       │
│                                ▼ (Sorted & Grouped stream via STDIN)   │
│             [Python Reducer: source_ip_reducer.py]                     │
│                                │                                       │
│                                ▼ (STDOUT: 13 Analytical Columns)       │
│                 [FileOutputCommitter (HDFS)]                           │
│                                │                                       │
│                                ▼                                       │
│  [HDFS Output: /netsentinel/output/job1_source_ip_<ts>/part-00000]     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mapper Design (`hadoop/mapper/source_ip_mapper.py`)

- **Input Stream:** Reads CSV records from standard input (`sys.stdin`) using Python's `csv.reader` to ensure proper delimiter and quotation handling.
- **Multi-File Header Filtering:** Detects and skips CSV header rows across all five daily files (`monday.csv`, `tuesday.csv`, `wednesday.csv`, `thursday.csv`, `friday.csv`).
- **Data Integrity & Validation:**
  - Validates that each record satisfies the 89-column schema ($N \ge 88$).
  - Validates `Src IP dec` and `Dst IP dec` against the 32-bit unsigned IPv4 integer range ($0 \le \text{IP} \le 4{,}294{,}967{,}295$).
  - Validates `Dst Port` within valid TCP/UDP port bounds ($0 \le \text{Port} \le 65535$).
  - Explicitly converts numeric metrics (`Total Fwd Packet`, `Total Bwd packets`, `Total Length of Fwd Packet`, `Total Length of Bwd Packet`) without silent corruption.
  - Rejects negative traffic values and writes diagnostics to `sys.stderr`.
- **Emitted Key-Value Record:**
  - **Key:** `src_ip_dec`
  - **Value:** `fwd_pkts,bwd_pkts,fwd_bytes,bwd_bytes,is_benign,is_attack,dst_ip_dec,dst_port`

---

## 4. Reducer Design (`hadoop/reducer/source_ip_reducer.py`)

- **Input Stream:** Consumes sorted stream from Hadoop shuffle/sort engine where records are clustered contiguously by `src_ip_dec`.
- **Aggregation Accumulators:**
  - `total_flows`: Flow count per source IP.
  - `total_fwd_packets`: Sum of forward packets.
  - `total_bwd_packets`: Sum of backward packets.
  - `total_packets`: Total packets (`fwd + bwd`).
  - `total_fwd_bytes`: Total forward bytes (`Total Length of Fwd Packet`).
  - `total_bwd_bytes`: Total backward bytes (`Total Length of Bwd Packet`).
  - `total_bytes`: Combined byte volume.
  - `benign_flows`: Count of flows with ground-truth label `BENIGN`.
  - `attack_flows`: Count of flows with any malicious attack label.
- **Exact Distinct Destination Tracking:**
  - Uses Python `set()` instances for `dst_ips` and `dst_ports` scoped strictly to the current `src_ip_dec`.
  - When the key transitions, the set sizes (`len(dst_ips)`, `len(dst_ports)`) are emitted and memory is immediately reclaimed.
  - Maximum unique destinations for any source IP is $\sim 3{,}300$, keeping reducer memory consumption below $1\text{ MB}$.
- **IP Representation:** Dotted-quad IPv4 string is derived using standard bit-shift operations:
  $$\text{Octets} = [(D \gg 24) \& 255, (D \gg 16) \& 255, (D \gg 8) \& 255, D \& 255]$$

---

## 5. Output Schema

The final output is formatted and saved to `results/ip_analytics/source_ip_summary.csv` with the following 13 columns:

| Column | Type | Description |
| :--- | :--- | :--- |
| `src_ip_dec` | BIGINT | Original 32-bit unsigned decimal IPv4 representation |
| `src_ip` | VARCHAR | Dotted-quad IPv4 address string (e.g. `192.168.10.9`) |
| `total_flows` | BIGINT | Total bidirectional network flows originated by this IP |
| `total_fwd_packets` | BIGINT | Total packets transmitted in the forward direction |
| `total_bwd_packets` | BIGINT | Total packets transmitted in the backward direction |
| `total_packets` | BIGINT | Combined packet count across all flows |
| `total_fwd_bytes` | BIGINT | Total payload and header bytes in the forward direction |
| `total_bwd_bytes` | BIGINT | Total payload and header bytes in the backward direction |
| `total_bytes` | BIGINT | Combined byte volume |
| `benign_flows` | BIGINT | Number of baseline benign flows originated |
| `attack_flows` | BIGINT | Number of attack-labelled flows originated |
| `distinct_dst_ips` | INTEGER | Exact number of distinct destination IPs targeted |
| `distinct_dst_ports` | INTEGER | Exact number of distinct destination ports contacted |

---

## 6. Independent Ground-Truth Validation Methodology

To ensure 100% scientific validity and prevent circular verification:
1. `scripts/validate_job1_source_ip.py` performs an independent chunked scan of the raw Standard files.
2. It accumulates ground-truth metrics using completely independent logic and structures.
3. It performs a strict row-by-row and aggregate-by-aggregate reconciliation against the Hadoop MapReduce results.
4. Validation checks verify:
   - Identical unique source IP groups ($174 = 174$).
   - Exact flow count match ($2{,}099{,}971 = 2{,}099{,}971$).
   - Exact packet sum reconciliation.
   - Exact byte sum reconciliation.
   - Exact benign and attack flow reconciliation ($1{,}582{,}561$ benign, $517{,}410$ attack).
   - Zero missing or unexpected IP groups.
