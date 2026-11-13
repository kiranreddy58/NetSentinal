# NetSentinel — Hadoop Streaming Smoke Test Verification Report (Phase 6)

## 1. Executive Summary
In **Phase 6 (Hadoop Streaming MapReduce Foundation)**, a genuine end-to-end MapReduce job was executed using **Apache Hadoop Streaming** on native Windows. 

The test verified that:
1. The Hadoop Streaming framework (`hadoop-streaming-3.3.6.jar`) correctly initializes and executes child Python mapper and reducer processes.
2. Hadoop's native `FileInputFormat` reads records directly from HDFS (`hdfs://localhost:9000`).
3. Hadoop's internal sorting engine (`MapOutputBuffer`, `QuickSort`, `MergeSorter`) correctly partitions, sorts, and shuffles intermediate `Key\tValue` pairs.
4. Python reducers stream sorted inputs, perform deterministic aggregation, and emit final metrics.
5. Hadoop's `FileOutputCommitter` writes `part-00000` and `_SUCCESS` back into HDFS.
6. Aggregated results match independently calculated ground-truth counts with 100.00% precision.

---

## 2. Reconciliation of Dataset Volume (505,000-Byte Accounting)

Before job execution, a discrepancy of **505,000 bytes** between the Phase 3 summary note (`1,787,030,423 bytes`) and the Phase 5 verified total (`1,786,525,423 bytes`) was audited:

- **Audit Procedure:** A file-by-file audit of `data/metadata/file_inventory.csv`, local files in `data/raw/`, and HDFS directories was performed.
- **Finding:** The physical byte sizes of the 10 dataset files have remained completely static and identical:
  - `friday.csv`: `199,983,721` bytes
  - `friday_plus.csv`: `244,226,354` bytes
  - `monday.csv`: `146,143,601` bytes
  - `monday_plus.csv`: `174,470,811` bytes
  - `thursday.csv`: `132,500,204` bytes
  - `thursday_plus.csv`: `161,084,118` bytes
  - `tuesday.csv`: `125,393,583` bytes
  - `tuesday_plus.csv`: `149,301,905` bytes
  - `wednesday.csv`: `206,984,560` bytes
  - `wednesday_plus.csv`: `246,436,566` bytes
  - **Exact Sum:** $\mathbf{1,786,525,423\text{ bytes}}$.
- **Cause:** The number `1,787,030,423` was an arithmetic/transcription error in an early markdown summary line ($1,786,525,423 + 505,000$). No files were modified, truncated, or lost. The true, verified dataset size across all 10 CSVs is **1,786,525,423 bytes**.

---

## 3. Hadoop Streaming Capability & Environment

- **Hadoop Version:** Apache Hadoop 3.3.6
- **Java Version:** Eclipse Temurin OpenJDK 11.0.33+10 (64-Bit)
- **Streaming JAR:** `tools/hadoop-3.3.6/share/hadoop/tools/lib/hadoop-streaming-3.3.6.jar`
- **Streaming JAR Size:** `141,267 bytes`
- **Execution Framework:** `local` (`org.apache.hadoop.mapred.LocalJobRunner`) connected directly to active NameNode (`hdfs://localhost:9000`) and DataNode (`127.0.0.1:9866`).
- **YARN Evaluation:** Standalone YARN ResourceManager and NodeManager daemons are not active. Single-node MapReduce execution is handled via `LocalJobRunner`, which runs genuine Hadoop MapReduce splits, shuffles, and sorts against live HDFS without relying on simulated Python mock scripts.

---

## 4. Controlled Synthetic Test Dataset

A synthetic dataset was generated at `data/sample/smoke_test_flows.csv` containing a standard 89-column header and **12 synthetic network flows**:

- **TCP Flows (6):** HTTP (80), HTTPS (443), SSH (22), FTP (21) across Benign, Portscan, DoS Hulk, DDoS, and FTP-Patator.
- **UDP Flows (3):** DNS (53), Custom Web (8080) across Benign and Botnet.
- **ICMP Flows (2):** Echo requests across Benign and Infiltration.
- **HOPOPT Flows (1):** IPv6 hop-by-hop options across Benign.

### Independent Expected Aggregations:
- `TCP`: 6 flows
- `UDP`: 3 flows
- `ICMP`: 2 flows
- `HOPOPT`: 1 flow
- **Total Flows:** 12 flows

---

## 5. Execution Command & MapReduce Counters

### Invocation Command:
```powershell
hadoop.cmd jar tools/hadoop-3.3.6/share/hadoop/tools/lib/hadoop-streaming-3.3.6.jar `
  -D mapreduce.framework.name=local `
  -file hadoop/mapper/smoke_mapper.py `
  -file hadoop/reducer/smoke_reducer.py `
  -mapper "python smoke_mapper.py" `
  -reducer "python smoke_reducer.py" `
  -input /netsentinel/test/smoke_input/smoke_test_flows.csv `
  -output /netsentinel/test/smoke_output_<timestamp>
```

### Genuine MapReduce Execution Counters:
- **Map Input Records:** 13 (1 header record + 12 flow records)
- **Map Output Records:** 12 (1 header skipped by mapper)
- **Map Output Materialized Bytes:** 107 bytes
- **Shuffle Bytes:** 107 bytes
- **Reduce Input Groups:** 4 groups (`HOPOPT`, `ICMP`, `TCP`, `UDP`)
- **Reduce Input Records:** 12 records
- **Reduce Output Records:** 4 records
- **Exit Code:** `0` (SUCCESS)

---

## 6. HDFS Output Verification & Exact Match

Content of `/netsentinel/test/smoke_output_<timestamp>/part-00000` read via `hdfs dfs -cat`:

```text
HOPOPT	1
ICMP	2
TCP	6
UDP	3
```

| Protocol Name | Expected Flow Count | Actual HDFS Flow Count | Parity Match |
| :--- | :---: | :---: | :---: |
| **HOPOPT** | 1 | 1 | **MATCH** |
| **ICMP** | 2 | 2 | **MATCH** |
| **TCP** | 6 | 6 | **MATCH** |
| **UDP** | 3 | 3 | **MATCH** |
| **Total Reduced Flows** | **12** | **12** | **100.00% EXACT** |

No records were dropped, no malformed data was encountered, and header skipping functioned as expected.

---

## 7. Deliverables Created
1. `data/sample/smoke_test_flows.csv` — Synthetic 89-column test dataset.
2. `hadoop/mapper/smoke_mapper.py` — Protocol extraction mapper with CSV parsing and header handling.
3. `hadoop/reducer/smoke_reducer.py` — Aggregation reducer for protocol counts.
4. `hadoop/scripts/run_smoke_test.py` — End-to-end automation runner with counter parsing and verification.
5. `data/metadata/mapreduce_smoke_test.json` — Certified JSON execution report.
6. `docs/mapreduce_architecture.md` — Complete architectural specification for MapReduce jobs.
7. `docs/mapreduce_smoke_test.md` — Technical report documenting Phase 6 results.
