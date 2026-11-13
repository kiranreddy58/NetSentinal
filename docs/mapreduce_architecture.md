# NetSentinel — Distributed MapReduce Architecture & Engine Specification

## 1. System Overview
**NetSentinel** leverages **Apache Hadoop MapReduce** and **Hadoop Streaming** to execute distributed traffic analytics and cybersecurity threat detection across large-scale network flow records captured in the CICIDS-2017 dataset.

By utilizing Hadoop's distributed processing primitives (Map, Shuffle/Sort, and Reduce), NetSentinel transforms multi-gigabyte raw packet flow sequences stored in **HDFS** into aggregated security intelligence tables ready for backend API consumption and frontend visualization.

---

## 2. Hadoop Streaming Execution Engine

### How Hadoop Streaming Works:
Hadoop Streaming is a utility that allows MapReduce jobs to be authored using standard input/output streams (Unix pipes) in any programming language, including Python.

```
+---------------------------------------------------------------------------------------------------+
|                                      APACHE HADOOP MAPREDUCE                                       |
|                                                                                                   |
|  [HDFS Input File]                                                                                |
|          │                                                                                        |
|          ▼                                                                                        |
|  [InputFormat / RecordReader] ──(Line-by-line via STDIN)──► [Python Mapper (smoke_mapper.py)]    |
|                                                                        │                          |
|                                                              (STDOUT: Key \t Value)               |
|                                                                        │                          |
|                                                                        ▼                          |
|  [MapOutputBuffer / Hadoop QuickSort] ◄────────────────────────────────┘                          |
|          │                                                                                        |
|          ▼                                                                                        |
|  [Hadoop Shuffle & MergeSorter] (Groups all values by identical Key)                              |
|          │                                                                                        |
|          ▼ (Sorted Key \t Value stream via STDIN)                                                 |
|  [Python Reducer (smoke_reducer.py)]                                                              |
|          │                                                                                        |
|          ▼ (STDOUT: Aggregated Key \t Metric)                                                     |
|  [FileOutputCommitter] ──► [HDFS Output: part-00000 + _SUCCESS]                                   |
+---------------------------------------------------------------------------------------------------+
```

1. **Input Stage:** The Hadoop `FileInputFormat` reads blocks directly from HDFS (`hdfs://localhost:9000/netsentinel/input/original/`) and streams rows line-by-line across `sys.stdin` to child Python mapper processes.
2. **Map Stage:** The Python mapper parses each CSV flow record, performs validation and field extraction, and emits tab-delimited `Key\tValue` strings to `sys.stdout`.
3. **Hadoop Shuffle and Sort:** Hadoop's Java engine intercepts stdout, buffers records in the `MapOutputBuffer`, performs in-memory sorting using Hadoop's native `QuickSort`, spills partition segments to disk, and executes the merge pass.
4. **Reduce Stage:** Hadoop streams the sorted key-value pairs through `sys.stdin` to Python reducer processes.
5. **Output Stage:** The reducer outputs aggregated metrics to `sys.stdout`, and Hadoop's `FileOutputCommitter` writes atomic `part-XXXXX` files alongside the `_SUCCESS` completion marker into the target HDFS directory.

---

## 3. MapReduce Framework: LocalJobRunner vs. YARN

In Apache Hadoop 3.3.6, MapReduce supports two execution engines:
1. **YARN (Yet Another Resource Negotiator):**
   - Multi-node cluster resource scheduler consisting of `ResourceManager` (port 8032/8088) and `NodeManager` (port 8040/8042).
   - Designed for multi-server physical clusters. On native Windows, YARN container allocation requires complex container execution hooks that introduce unneeded process management overhead for single-node development.
2. **LocalJobRunner (`mapreduce.framework.name=local`):**
   - The official Apache Hadoop execution framework for single-node pseudo-distributed clusters and edge gateways.
   - **Full MapReduce Fidelity:** Executes true MapReduce splits, real child mapper streaming processes, true MapOutputBuffer sorting, real shuffle/merge algorithms, and true `FileOutputCommitter` writes directly to HDFS (`hdfs://localhost:9000`).
   - Produces identical MapReduce counters (`Map input records`, `Reduce input groups`, `Spilled Records`, `File Input Format Counters`).

NetSentinel explicitly utilizes **LocalJobRunner connected to native HDFS**, ensuring 100% genuine Hadoop MapReduce execution with zero simulated Python workarounds.

---

## 4. Planned 10 MapReduce Analytics Jobs

The primary analytical pipeline processes the 5 Standard daily files in `/netsentinel/input/original/` (**2,099,971 unique underlying network flows**):

| Job # | Job Name | Mapper Script | Reducer Script | Analytical Objective |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Source IP Intelligence** | `mapper_ip_src.py` | `reducer_ip_src.py` | Aggregate total flows, forward packets, and byte volumes per Source IPv4 address to discover high-talkers and threat origins. |
| **2** | **Destination IP Targeting** | `mapper_ip_dst.py` | `reducer_ip_dst.py` | Measure victim traffic density, flow concavity, and target server concentration. |
| **3** | **Port Distribution Analysis** | `mapper_port.py` | `reducer_port.py` | Classify destination port activity, service profiling (HTTP, HTTPS, SSH, FTP, DNS), and scan target enumeration. |
| **4** | **Protocol Composition** | `mapper_protocol.py` | `reducer_protocol.py` | Measure protocol breakdown across TCP (6), UDP (17), ICMP (1), and HOPOPT (0). |
| **5** | **Traffic Volume Aggregation** | `mapper_volume.py` | `reducer_volume.py` | Compute network-wide metrics: total bytes transmitted, forward vs. backward packet ratios, and average flow durations. |
| **6** | **Temporal Traffic Dynamics** | `mapper_temporal.py` | `reducer_temporal.py` | Bin traffic flows into minute-level offsets across capture days to uncover volumetric surge events. |
| **7** | **Attack Pattern Detection** | `mapper_attack.py` | `reducer_attack.py` | Classify flows according to ground-truth labels and calculate attack-to-benign ratios across 27 categories. |
| **8** | **Source-Destination Port Pairs** | `mapper_src_dst_port.py` | `reducer_src_dst_port.py` | Map communication channels between host IP addresses and targeted services. |
| **9** | **Heuristic Suspicious Probing** | `mapper_suspicious.py` | `reducer_suspicious.py` | Detect multi-port scanning signatures and rapid subsecond connection bursts. |
| **10** | **Multi-Day Longitudinal Comparison** | `mapper_daily.py` | `reducer_daily.py` | Comparative analysis contrasting normal Monday traffic against attack days (Tuesday through Friday). |

---

## 5. Directory Organization in HDFS

```
hdfs://localhost:9000/netsentinel/
├── input/
│   ├── original/              <-- 5 Standard daily files (Canonical Analytics Baseline)
│   └── plus/                  <-- 5 Plus daily files (Topology baseline)
├── test/
│   ├── smoke_input/           <-- Synthetic smoke test dataset
│   └── smoke_output/          <-- Verified smoke test MapReduce output
└── output/
    ├── job01_ip_src/          <-- Output for Job 1
    ├── job02_ip_dst/          <-- Output for Job 2
    ├── job03_port/            <-- Output for Job 3
    ├── job04_protocol/        <-- Output for Job 4
    ├── job05_volume/          <-- Output for Job 5
    ├── job06_temporal/        <-- Output for Job 6
    ├── job07_attack/          <-- Output for Job 7
    ├── job08_src_dst_port/    <-- Output for Job 8
    ├── job09_suspicious/      <-- Output for Job 9
    └── job10_daily/           <-- Output for Job 10
```
