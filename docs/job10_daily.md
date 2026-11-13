# MapReduce Job 10: Daily Comparative Analytics

## 1. Overview
MapReduce Job 10 analyzes temporal distributions across days of the week (Monday through Friday) in the CICIDS-2017 dataset. This reveals diurnal patterns, benign baseline behavior on Monday/Tuesday, and the heavy influx of coordinated attacks on Wednesday (DoS/Heartbleed), Thursday (Web Attacks / Infiltration), and Friday (DDoS / Port Scans).

## 2. Hadoop Streaming Specification
- **Mapper:** `hadoop/mapper/daily_mapper.py` parses timestamps into normalized day groups: `1_MONDAY` to `5_FRIDAY`.
- **Reducer:** `hadoop/reducer/daily_reducer.py` computes total flows, packets, bytes, benign vs attack distribution, and attack proportion per day.
- **HDFS Output:** `/netsentinel/output/job10_daily_<timestamp>/`
- **Results Output:** `results/traffic_analytics/daily_comparative_summary.csv`
