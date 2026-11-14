# NetSentinel 2.0 — Machine Learning & Threat Architecture

## 1. Executive Architecture Overview

NetSentinel 2.0 integrates high-throughput distributed batch processing via **Apache Hadoop 3.3.6 MapReduce** with an advanced **Machine Learning & Cybersecurity Threat Intelligence Engine**. 

```
                                  [CICIDS-2017 Raw Dataset]
                                     (2,099,971 Flows)
                                             |
                         +-------------------+-------------------+
                         |                                       |
                         v                                       v
               [HDFS Distributed Store]              [ML Data Engineering]
            /netsentinel/input/original/          (Chunked, Zero-Leakage)
                         |                                       |
                         v                                       v
            [Hadoop MapReduce (Jobs 1-10)]        [Stratified Splits (Parquet)]
            - Source / Dest IP Analytics          - Train: 112,599 (70%)
            - Port & Protocol Analytics           - Val:    24,129 (15%)
            - Temporal & Volume Tiers             - Test:   24,129 (15%)
            - Attack Labels & Correlations                       |
                         |                        +--------------+--------------+
                         |                        |              |              |
                         |                        v              v              v
                         |                  [Random Forest]  [Grad Boost]  [Isolation Forest]
                         |                    (100 Trees)     (Hist GBDT)     (Unsupervised)
                         |                        |              |              |
                         +------------------------+--------------+--------------+
                                                  |
                                                  v
                                    [Threat Intelligence Engine]
                                    - Supervised Ensemble (50%)
                                    - Unsupervised Anomaly (30%)
                                    - Heuristic Port Probe (10%)
                                    - Volumetric Asymmetry (10%)
                                                  |
                                                  v
                                     [MapReduce Job 11 Aggregation]
                                     - Per-Host Threat Profiling
                                                  |
                                                  v
                                      [FastAPI 2.0 REST Backend]
                                                  |
                                                  v
                                      [React 18 / Vite SOC Dashboard]
```

## 2. Core Components

1. **Distributed Storage Layer (HDFS):**
   - Live Apache Hadoop 3.3.6 NameNode and DataNode hosting canonical CICIDS-2017 standard CSV files.
   - Fault-tolerant replicated blocks with deterministic LocalJobRunner execution.

2. **Feature Engineering & Preprocessing Pipeline:**
   - Chunked streaming ingestion (100,000 rows/chunk) preventing memory exhaustion on 16 GB RAM systems.
   - Strict data leakage prevention excluding IP addresses, timestamps, and target indicators.
   - Robust scaling using `RobustScaler` (median centering and interquartile range scaling).

3. **Supervised Multi-Model Ensemble:**
   - **Random Forest Classifier:** 100 estimators, max depth 16, balanced class weights.
   - **Histogram Gradient Boosting Classifier:** Fast histogram-binned tree boosting.
   - **Baseline Decision Tree:** Benchmark CART classifier for comparative evaluation.

4. **Unsupervised Anomaly Detection:**
   - **Isolation Forest:** 100 trees, 8% contamination rate, fitted purely on unlabeled flow representations.

5. **Explainable AI (XAI):**
   - Global feature importance (Gini Impurity MDI).
   - Permutation importance (F1 drop on test holdouts).
   - Local causal flow explanations for flagged attack traffic.

6. **Unified Threat Scoring Engine:**
   - Multi-factor risk calculation mapping flows into 4 severity tiers: `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW`.
