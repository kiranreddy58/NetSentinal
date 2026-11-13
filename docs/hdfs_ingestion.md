# NetSentinel — HDFS Data Ingestion & Cluster Storage Report (Phase 5)

## 1. Executive Summary

In **Phase 5 (HDFS Data Ingestion)**, the verified **CICIDS-2017 (Version 2 by Bert van Keulen)** dataset was ingested into the native Apache Hadoop 3.3.6 HDFS distributed filesystem. 

A total of **10 CSV files** comprising **1,786,525,423 bytes (~1.70 GB)** were uploaded and verified with 100.00% byte parity and cryptographic SHA-256 hash match between local disk and HDFS data streams.

---

## 2. Strict Dataset Separation Architecture

To prevent analytical distortion and double-counting of network flows, strict physical directory separation has been established in HDFS:

```
hdfs://localhost:9000/netsentinel/
├── input/
│   ├── original/              <-- Canonical Analytics Baseline (Standard Files)
│   │   ├── monday.csv         (146,143,601 bytes | 371,621 flows)
│   │   ├── tuesday.csv        (125,393,583 bytes | 322,078 flows)
│   │   ├── wednesday.csv      (206,984,560 bytes | 496,640 flows)
│   │   ├── thursday.csv       (132,500,204 bytes | 362,075 flows)
│   │   └── friday.csv         (199,983,721 bytes | 547,557 flows)
│   │
│   └── plus/                  <-- Topology & Flow Correlation Baseline (Plus Files)
│       ├── monday_plus.csv    (174,470,811 bytes | 371,621 flows)
│       ├── tuesday_plus.csv   (149,301,905 bytes | 322,078 flows)
│       ├── wednesday_plus.csv (246,436,566 bytes | 496,640 flows)
│       ├── thursday_plus.csv  (161,084,118 bytes | 362,075 flows)
│       └── friday_plus.csv    (244,226,354 bytes | 547,557 flows)
│
└── output/                    <-- Target for Hadoop MapReduce Jobs 1-10
```

> [!IMPORTANT]
> **Strict Pipeline Separation Guarantee:**
> - `/netsentinel/input/original/` contains exactly **5 Standard daily files** representing the **2,099,971 unique underlying network flows**. All primary MapReduce analytical jobs (Jobs 1–10) target this directory.
> - `/netsentinel/input/plus/` contains exactly **5 Plus daily files** with 16 additional subnet topology features.
> - Under no circumstances are the two directories combined as an input path for any single MapReduce job.

---

## 3. Pre-Ingestion Verification & Environment Health

Before file ingestion, safety checks were executed via `hadoop/scripts/ingest_to_hdfs.py`:

1. **HDFS Daemons:** 
   - NameNode (PID 42244) active on IPC `hdfs://localhost:9000`, Web UI `http://localhost:9870`.
   - DataNode (PID 35516) active on IPC `9866`, Web UI `http://localhost:9864`.
2. **Filesystem Connectivity:** Verified via `hdfs dfs -ls /` (Exit code 0).
3. **Storage Capacity:**
   - Total Filesystem Size: `443.0 GB`
   - Available Space: `339.0 GB` (Ingestion of 1.70 GB consumes $<0.5\%$ capacity).
4. **Local Source Integrity:** All 10 local CSV files verified present in `data/raw/` with exact byte matching against `data/metadata/file_inventory.csv`.
5. **Conflict Protection:** Re-run safety enabled. Pre-existing files are validated for size parity and preserved without destructive overwriting.

---

## 4. Ingestion Execution & Performance Metrics

Ingestion was executed sequentially using project-local Hadoop binaries to ensure cluster stability:

| # | File Name | Group | HDFS Destination | File Size (Bytes) | Upload Time | Transfer Rate | Ingestion Status |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: | :---: |
| 1 | `monday.csv` | Standard | `/netsentinel/input/original/monday.csv` | 146,143,601 | 8.04 s | 17.33 MB/s | `PRESERVED_PASSED` |
| 2 | `tuesday.csv` | Standard | `/netsentinel/input/original/tuesday.csv` | 125,393,583 | 7.35 s | 16.27 MB/s | `UPLOAD_SUCCESS` |
| 3 | `wednesday.csv` | Standard | `/netsentinel/input/original/wednesday.csv` | 206,984,560 | 8.58 s | 23.02 MB/s | `UPLOAD_SUCCESS` |
| 4 | `thursday.csv` | Standard | `/netsentinel/input/original/thursday.csv` | 132,500,204 | 6.67 s | 18.95 MB/s | `UPLOAD_SUCCESS` |
| 5 | `friday.csv` | Standard | `/netsentinel/input/original/friday.csv` | 199,983,721 | 7.84 s | 24.34 MB/s | `UPLOAD_SUCCESS` |
| 6 | `monday_plus.csv` | Plus | `/netsentinel/input/plus/monday_plus.csv` | 174,470,811 | 6.56 s | 25.36 MB/s | `UPLOAD_SUCCESS` |
| 7 | `tuesday_plus.csv` | Plus | `/netsentinel/input/plus/tuesday_plus.csv` | 149,301,905 | 7.16 s | 19.89 MB/s | `UPLOAD_SUCCESS` |
| 8 | `wednesday_plus.csv` | Plus | `/netsentinel/input/plus/wednesday_plus.csv` | 246,436,566 | 8.07 s | 29.13 MB/s | `UPLOAD_SUCCESS` |
| 9 | `thursday_plus.csv` | Plus | `/netsentinel/input/plus/thursday_plus.csv` | 161,084,118 | 6.46 s | 23.78 MB/s | `UPLOAD_SUCCESS` |
| 10 | `friday_plus.csv` | Plus | `/netsentinel/input/plus/friday_plus.csv` | 244,226,354 | 8.72 s | 26.72 MB/s | `UPLOAD_SUCCESS` |
| **Total** | **10 Files** | **All** | **HDFS Input Hierarchy** | **1,786,525,423** | **194.37 s** | **~22.5 MB/s Avg** | **100% Ingested** |

---

## 5. Parity & Cryptographic Integrity Verification

Integrity verification was conducted using `hadoop/scripts/verify_hdfs_ingestion.py`. Content from HDFS was streamed out-of-core via `hdfs dfs -cat` in 1 MB blocks to compute true SHA-256 hashes without RAM saturation:

- **Byte Parity:** 10/10 files match exact byte count ($1,786,525,423$ bytes local $=$ $1,786,525,423$ bytes HDFS).
- **Cryptographic Parity:** 10/10 files exhibit exact SHA-256 hash identity between local file and HDFS stream.
- **HDFS Native Checksum:** Captured and recorded via `hdfs dfs -checksum` (MD5-of-CRC32C format).

---

## 6. HDFS Block Topology & Health (FSCK Audit)

HDFS configuration specifies a default block size of **128 MB (134,217,728 bytes)** with a **replication factor of 1** (single-node pseudo-distributed cluster):

- **Cluster Health Status:** `HEALTHY` (0 missing blocks, 0 corrupt blocks, 0 under-replicated blocks).
- **Total Blocks Managed:** `18 blocks` across all 10 files.
- **Block Allocation:**
  - Files under 128 MB (`tuesday.csv`, `thursday.csv`) occupy **1 block**.
  - Files between 128 MB and 256 MB (`monday.csv`, `wednesday.csv`, `friday.csv`, all `_plus.csv` files) occupy **2 blocks**.
- **DataNode Placement:** All blocks reside on DataNode `127.0.0.1:9866` storage directory `DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685`.
- **Replication Clarification:** In this academic single-node environment, a replication factor of 1 guarantees 1 live replica per block on the local DataNode.

---

## 7. Deliverables & Certified Metadata

The following artifacts have been created:
1. `hadoop/scripts/ingest_to_hdfs.py` — Safe ingestion pipeline with conflict detection.
2. `hadoop/scripts/verify_hdfs_ingestion.py` — Streamed byte, SHA-256, and FSCK verification.
3. `data/metadata/hdfs_file_verification.csv` — Full verification table with SHA-256 and byte parity.
4. `data/metadata/hdfs_ingestion_report.json` — Comprehensive JSON execution log.
5. `data/metadata/hdfs_block_report.json` — HDFS block topology and FSCK audit record.
6. `docs/hdfs_ingestion.md` — Technical report documenting Phase 5.
