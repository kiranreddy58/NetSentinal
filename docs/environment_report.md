# NetSentinel — Environment Inspection & Deployment Report

## 1. Executive Summary
This document provides the certified record of environment inspection, dependency resolution, directory structuring, and Hadoop cluster deployment for **NetSentinel** (Distributed Network Traffic Intelligence & Attack Pattern Detection System Using Apache Hadoop and MapReduce).

---

## 2. Certified Host Environment

| Parameter | Detected Value | Verification Status |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 (NT 10.0.26100 / 26300) | Fully Operational |
| **Processor (CPU)** | 12th Gen Intel(R) Core(TM) i5-1235U (10 Cores, 12 Threads) | Verified |
| **System Memory** | 16.0 GB Total RAM (~6.1 GB Available) | Verified |
| **Free Storage** | 368.6 GB Available on C: Drive | Verified |
| **Workspace Directory** | `C:\Users\kiran\OneDrive\Documents\bda` | Active Project Root |

---

## 3. Runtimes & Dependencies Inventory

| Runtime / Tool | Deployed Version / Location | Verification Output / Checksum |
| :--- | :--- | :--- |
| **Python** | 3.15.2 (64-bit) | FastAPI 0.162.5, Uvicorn 0.54.0, Pydantic 2.14.3, Pandas 3.1.1, NumPy 2.5.4 |
| **Java JDK** | Eclipse Temurin OpenJDK 11.0.33+10 (`tools/jdk-11`) | SHA-256: `cff2e75657c96a718974732b4a7b2c81a245a0b2ea44e6d8ea08cd0248d8fa9d` |
| **Apache Hadoop** | 3.3.6 Single-Node Pseudo-Distributed (`tools/hadoop-3.3.6`) | SHA-512: `de3eaca2e0517e4b569a88b63c89fae19cb8ac6c01ff990f1ff8f0cc0f3128c8e8a23db01577ca562a0e0bb1b4a3889f8c74384e609cd55e537aada3dcaa9f8a` |
| **Windows Native Subsystem** | `winutils.exe` & `hadoop.dll` (cdarlint release) | `hadoop checknative`: `winutils: true`, `hadoop: true` |
| **Hadoop Streaming JAR** | `share/hadoop/tools/lib/hadoop-streaming-3.3.6.jar` | Verified present (141,267 bytes) |
| **Node.js / npm** | Node v26.13.0, npm 11.20.0 | Verified available |
| **Git** | 2.56.1.windows.1 | Verified available |

---

## 4. Dataset Preservation & Staging

All 10 original dataset files have been strictly preserved in the root folder and copied to `data/raw/` with 100% byte verification:

| Filename | Root File Size | `data/raw/` File Size | Integrity Check |
| :--- | :--- | :--- | :--- |
| `friday.csv` | 199,983,721 bytes | 199,983,721 bytes | **VERIFIED MATCH** |
| `friday_plus.csv` | 244,226,354 bytes | 244,226,354 bytes | **VERIFIED MATCH** |
| `monday.csv` | 146,143,601 bytes | 146,143,601 bytes | **VERIFIED MATCH** |
| `monday_plus.csv` | 174,470,811 bytes | 174,470,811 bytes | **VERIFIED MATCH** |
| `thursday.csv` | 132,500,204 bytes | 132,500,204 bytes | **VERIFIED MATCH** |
| `thursday_plus.csv` | 161,084,118 bytes | 161,084,118 bytes | **VERIFIED MATCH** |
| `tuesday.csv` | 125,393,583 bytes | 125,393,583 bytes | **VERIFIED MATCH** |
| `tuesday_plus.csv` | 149,301,905 bytes | 149,301,905 bytes | **VERIFIED MATCH** |
| `wednesday.csv` | 206,984,560 bytes | 206,984,560 bytes | **VERIFIED MATCH** |
| `wednesday_plus.csv` | 246,436,566 bytes | 246,436,566 bytes | **VERIFIED MATCH** |
| **Total** | **1,787,030,423 bytes** | **1,787,030,423 bytes** | **100% Identical** |

---

## 5. Live Hadoop HDFS Services
- **NameNode Status:** RUNNING (PID confirmed via JPS, IPC Port 9000, WebUI Port 9870).
- **DataNode Status:** RUNNING (PID confirmed via JPS, WebUI Port 9864).
- **HDFS Root Paths Created:** `/netsentinel/input`, `/netsentinel/output`.
- **HDFS Lifecycle Tested:** PUT, LS, CAT, RM executed with 0 error codes.
