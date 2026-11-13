# NetSentinel — Hadoop and HDFS Live Terminal Execution Logs

**Timestamp:** 2026-11-14 00:37:02  
**Environment:** Apache Hadoop 3.3.6 (Windows 11, LocalJobRunner with Live HDFS)  
**Cluster Status:** Live NameNode (`:9000`), Live DataNode (`:9864`), Live Web UI (`:9870`)  

---

## Terminal Output Artifacts Index

### Hadoop Version Information
- **Command:** `hadoop version`
- **Output File:** [01_hadoop_version.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/01_hadoop_version.txt)
```text
Hadoop 3.3.6
Source code repository https://github.com/apache/hadoop.git -r 1be78238728da9266a4f88195058f08fd012bf9c
Compiled by ubuntu on 2023-06-18T08:22Z
Compiled on platform linux-x86_64
Compiled with protoc 3.7.1
From source with checksum 5652179ad55f76cb287d9c633bb53bbd
This command was run using /C:/Users/kiran/OneDrive/Documents/bda/tools/hadoop-3.3.6/share/hadoop/common/hadoop-common-3.3.6.jar
```

### HDFS DFSAdmin Live Cluster & Node Report
- **Command:** `hdfs dfsadmin -report`
- **Output File:** [02_hdfs_dfsadmin_report.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/02_hdfs_dfsadmin_report.txt)
```text
Configured Capacity: 475705372672 (443.04 GB)
Present Capacity: 360341623767 (335.59 GB)
DFS Remaining: 358535053312 (333.91 GB)
DFS Used: 1806570455 (1.68 GB)
DFS Used%: 0.50%
Replicated Blocks:
	Under replicated blocks: 0
	Blocks with corrupt replicas: 0
	Missing blocks: 0
	Missing blocks (with replication factor 1): 0
	Low redundancy blocks with highest priority to recover: 0
	Pending deletion blocks: 0
Erasure Coded Block Groups: 
	Low redundancy block groups: 0
	Block groups with corrupt internal blocks: 0
	Missing block groups: 0
	Low redundancy blocks with highest priority to recover: 0
	Pending deletion blocks: 0

-------------------------------------------------

... [15 lines truncated - view full file above] ...

Cache Remaining%: 0.00%
Xceivers: 0
Last contact: Sat Nov 14 00:37:03 IST 2026
Last Block Report: Fri Nov 13 22:43:53 IST 2026
Num of Blocks: 33
```

### HDFS Filesystem Health & Block Check (fsck /)
- **Command:** `hdfs fsck / -files -blocks -locations`
- **Output File:** [03_hdfs_fsck_root.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/03_hdfs_fsck_root.txt)
```text
FSCK started by kiran (auth:SIMPLE) from /127.0.0.1 for path / at Sat Nov 14 00:37:10 IST 2026

/ <dir>
/netsentinel <dir>
/netsentinel/input <dir>
/netsentinel/input/original <dir>
/netsentinel/input/original/friday.csv 199983721 bytes, replicated: replication=1, 2 block(s):  OK
0. BP-182519608-10.10.29.238-1794589997861:blk_1073741833_1009 len=134217728 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]
1. BP-182519608-10.10.29.238-1794589997861:blk_1073741834_1010 len=65765993 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]

/netsentinel/input/original/monday.csv 146143601 bytes, replicated: replication=1, 2 block(s):  OK
0. BP-182519608-10.10.29.238-1794589997861:blk_1073741827_1003 len=134217728 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]
1. BP-182519608-10.10.29.238-1794589997861:blk_1073741828_1004 len=11925873 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]

/netsentinel/input/original/thursday.csv 132500204 bytes, replicated: replication=1, 1 block(s):  OK
0. BP-182519608-10.10.29.238-1794589997861:blk_1073741832_1008 len=132500204 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]

/netsentinel/input/original/tuesday.csv 125393583 bytes, replicated: replication=1, 1 block(s):  OK
0. BP-182519608-10.10.29.238-1794589997861:blk_1073741829_1005 len=125393583 Live_repl=1  [DatanodeInfoWithStorage[127.0.0.1:9866,DS-f7d15cc7-cf89-47c6-b2be-7584a6f6e685,DISK]]


... [159 lines truncated - view full file above] ...

 Blocks queued for replication:	0
FSCK ended at Sat Nov 14 00:37:10 IST 2026 in 23 milliseconds


The filesystem under path '/' is HEALTHY
```

### HDFS Ingested Canonical Standard Datasets (/netsentinel/input/original)
- **Command:** `hdfs dfs -ls -h /netsentinel/input/original`
- **Output File:** [04_hdfs_ls_input_original.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/04_hdfs_ls_input_original.txt)
```text
Found 5 items
-rw-r--r--   1 kiran supergroup    190.7 M 2026-11-13 23:06 /netsentinel/input/original/friday.csv
-rw-r--r--   1 kiran supergroup    139.4 M 2026-11-13 23:02 /netsentinel/input/original/monday.csv
-rw-r--r--   1 kiran supergroup    126.4 M 2026-11-13 23:05 /netsentinel/input/original/thursday.csv
-rw-r--r--   1 kiran supergroup    119.6 M 2026-11-13 23:05 /netsentinel/input/original/tuesday.csv
-rw-r--r--   1 kiran supergroup    197.4 M 2026-11-13 23:05 /netsentinel/input/original/wednesday.csv
```

### HDFS Plus Datasets (/netsentinel/input/plus)
- **Command:** `hdfs dfs -ls -h /netsentinel/input/plus`
- **Output File:** [05_hdfs_ls_input_plus.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/05_hdfs_ls_input_plus.txt)
```text
Found 5 items
-rw-r--r--   1 kiran supergroup    232.9 M 2026-11-13 23:07 /netsentinel/input/plus/friday_plus.csv
-rw-r--r--   1 kiran supergroup    166.4 M 2026-11-13 23:06 /netsentinel/input/plus/monday_plus.csv
-rw-r--r--   1 kiran supergroup    153.6 M 2026-11-13 23:07 /netsentinel/input/plus/thursday_plus.csv
-rw-r--r--   1 kiran supergroup    142.4 M 2026-11-13 23:06 /netsentinel/input/plus/tuesday_plus.csv
-rw-r--r--   1 kiran supergroup    235.0 M 2026-11-13 23:06 /netsentinel/input/plus/wednesday_plus.csv
```

### HDFS MapReduce Output Directories (/netsentinel/output)
- **Command:** `hdfs dfs -ls -h /netsentinel/output`
- **Output File:** [06_hdfs_ls_all_outputs.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/06_hdfs_ls_all_outputs.txt)
```text
Found 13 items
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:16 /netsentinel/output/job10_daily_20261114_001541
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:20 /netsentinel/output/job10_daily_20261114_001847
drwxr-xr-x   - kiran supergroup          0 2026-11-13 23:55 /netsentinel/output/job1_source_ip_20261113_235434
drwxr-xr-x   - kiran supergroup          0 2026-11-13 23:57 /netsentinel/output/job1_source_ip_20261113_235618
drwxr-xr-x   - kiran supergroup          0 2026-11-13 23:59 /netsentinel/output/job2_destination_ip_20261113_235815
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:01 /netsentinel/output/job3_destination_port_20261114_000014
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:03 /netsentinel/output/job4_protocol_20261114_000200
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:04 /netsentinel/output/job5_traffic_volume_20261114_000349
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:06 /netsentinel/output/job6_temporal_20261114_000541
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:08 /netsentinel/output/job7_attack_20261114_000735
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:10 /netsentinel/output/job8_correlation_20261114_000940
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:13 /netsentinel/output/job9_suspicious_20261114_001219
drwxr-xr-x   - kiran supergroup          0 2026-11-14 00:15 /netsentinel/output/job9_suspicious_20261114_001404
```

### HDFS Directory Block & Byte Quota Counts (dfs -count -q -h -v)
- **Command:** `hdfs dfs -count -q -h -v /netsentinel/input/original /netsentinel/output`
- **Output File:** [07_hdfs_count_storage.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/07_hdfs_count_storage.txt)
```text
QUOTA       REM_QUOTA     SPACE_QUOTA REM_SPACE_QUOTA    DIR_COUNT   FILE_COUNT       CONTENT_SIZE PATHNAME
        none             inf            none             inf            1            5            773.4 M /netsentinel/input/original
        none             inf            none             inf           14           26              5.8 M /netsentinel/output
```

### HDFS Data Inspection (Sample Head of /netsentinel/input/original/monday.csv)
- **Command:** `hdfs dfs -head /netsentinel/input/original/monday.csv`
- **Output File:** [08_hdfs_sample_head_original.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/08_hdfs_sample_head_original.txt)
```text
Src IP dec,Src Port,Dst IP dec,Dst Port,Protocol,Timestamp,Flow Duration,Total Fwd Packet,Total Bwd packets,Total Length of Fwd Packet,Total Length of Bwd Packet,Fwd Packet Length Max,Fwd Packet Length Min,Fwd Packet Length Mean,Fwd Packet Length Std,Bwd Packet Length Max,Bwd Packet Length Min,Bwd Packet Length Mean,Bwd Packet Length Std,Flow Bytes/s,Flow Packets/s,Flow IAT Mean,Flow IAT Std,Flow IAT Max,Flow IAT Min,Fwd IAT Total,Fwd IAT Mean,Fwd IAT Std,Fwd IAT Max,Fwd IAT Min,Bwd IAT Total,Bwd IAT Mean,Bwd IAT Std,Bwd IAT Max,Bwd IAT Min,Fwd PSH Flags,Bwd PSH Flags,Fwd URG Flags,Bwd URG Flags,Fwd RST Flags,Bwd RST Flags,Fwd Header Length,Bwd Header Length,Fwd Packets/s,Bwd Packets/s,Packet Length Min,Packet Length Max,Packet Length Mean,Packet Length Std,Packet Length Variance,FIN Flag Count,SYN Flag Count,RST Flag Count,PSH Flag Count,ACK Flag Count,URG Flag Count,CWR Flag Count,ECE Flag Count,Down/Up Ratio,Average Packet Size,Fwd Segment Size Avg,Bwd Segment Size Avg,Fwd Bytes/Bulk Avg,Fwd Packet/Bulk Av
```

### HDFS MapReduce Part Output (Sample from /netsentinel/output/job4_protocol_*/part-00000)
- **Command:** `hdfs dfs -cat /netsentinel/output/job4_protocol_20261113_235732/part-00000`
- **Output File:** [09_hdfs_cat_sample_job_output.txt](file:///C:/Users/kiran/OneDrive/Documents/bda/docs/terminal_logs/09_hdfs_cat_sample_job_output.txt)
```text
cat: `/netsentinel/output/job4_protocol_20261113_235732/part-00000': No such file or directory
```
