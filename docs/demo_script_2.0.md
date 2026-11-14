# NetSentinel 2.0 — Live Demonstration Script & Presentation Outline

## Part 1: 5-Minute Live Demonstration Script

### Minute 1: System Ingestion & Hadoop HDFS Overview
- **Action:** Open Dashboard to **Executive Overview** (`http://localhost:5173`).
- **Narrative:**
  > *"Welcome to NetSentinel 2.0. We are presenting an end-to-end Big Data and Machine Learning Cybersecurity Intelligence Platform. Notice our top status bar: 2,099,971 canonical flows from the CICIDS-2017 dataset ingested into Apache Hadoop 3.3.6 HDFS. 75.36% of traffic is benign baseline, and 24.64% represents 27 distinct attack signatures. All 11 Hadoop MapReduce jobs completed with 100% ground-truth parity."*

### Minute 2: Big Data Analytics & Cluster Monitoring
- **Action:** Navigate to **Page 2: Big Data Analytics** and **Page 3: Hadoop Monitoring**.
- **Narrative:**
  > *"Here you can inspect the MapReduce pipeline provenance. 11 streaming jobs processed over 2 million flows each, extracting source/dest IP reputations, port profiles, protocol distributions, and temporal traffic tiers. In the cluster monitoring view, notice that our live HDFS NameNode and DataNode host 810 MB of canonical data across distributed blocks."*

### Minute 3: Supervised Machine Learning & Model Benchmark
- **Action:** Navigate to **Page 10: ML Overview** and **Page 13: Model Comparison**.
- **Narrative:**
  > *"Let's explore our machine learning subsystem. We trained three supervised models: Random Forest, Histogram Gradient Boosting, and a Baseline Decision Tree. Notice our strict data leakage prevention audit: IP addresses and timestamps were completely excluded, and scalers were fit strictly on the training set. On our unseen 24,129-flow test holdout, Gradient Boosting achieved 99.97% accuracy and 99.96% F1-score with a False Negative Rate of only 0.02%—missing just 2 attacks out of over 10,000. Total training took only 16.74 seconds on standard commodity hardware."*

### Minute 4: Anomaly Detection & Explainable AI (XAI)
- **Action:** Navigate to **Page 14: Anomaly Detection** and **Page 15: Explainable AI**.
- **Narrative:**
  > *"To catch zero-day attacks that supervised classifiers might miss, we trained an unsupervised Isolation Forest. Here is the continuous 0–100 anomaly distribution, flagging 1,811 statistical outliers (7.51% of traffic). In the Explainable AI tab, our Gini MDI and Permutation Importance plots show that initial TCP window advertisement sizes and packet length metrics drive classification. Analysts can drill down into individual flows to see exact feature contributions."*

### Minute 5: Threat Intelligence & MapReduce Job 11
- **Action:** Navigate to **Page 16: Threat Intelligence** and **Page 19: MapReduce Threat Ranking**.
- **Narrative:**
  > *"Finally, we synthesize Big Data and ML into our Unified Threat Intelligence Engine. We fuse supervised probabilities (50%), anomaly scores (30%), port scan heuristics (10%), and volumetric burst indicators (10%) into 4 transparent severity tiers: Critical, High, Medium, and Low. In Page 19, MapReduce Job 11 aggregates these threats across source IPs, instantly identifying 172.16.0.1 as the primary adversary with 862 attack flows and an average risk score of 56.23. The platform is responsive, 100% verified, and production-ready."*

---

## Part 2: 10-Minute Presentation Outline

1. **Slide 1 — Title & Executive Summary (1 min)**
   - Project: NetSentinel 2.0
   - Problem Statement: Processing volumetric network traffic and detecting sophisticated cyber attacks using Big Data + ML.
2. **Slide 2 — Distributed Architecture & Data Engineering (2 min)**
   - Apache Hadoop 3.3.6, HDFS block storage, MapReduce Streaming.
   - Chunked preprocessing, 160,857 deduplicated flows across 27 ground-truth classes.
   - Data Leakage Prevention: Zero identity/timestamp memorization.
3. **Slide 3 — Supervised Machine Learning Benchmark (2 min)**
   - Random Forest vs Histogram Gradient Boosting vs Baseline Decision Tree.
   - Key Metrics: Accuracy (99.97%), F1 (99.96%), ROC-AUC (1.0000), FNR (0.02%).
   - Resource metrics: 24.29s total training time, 0.42 MB model size.
4. **Slide 4 — Unsupervised Anomaly Detection & XAI (2 min)**
   - Isolation Forest tree isolation mechanism and anomaly score normalization.
   - Global feature ranking (MDI vs Permutation) and local causal flow explanations.
5. **Slide 5 — Unified Threat Intelligence & MapReduce Job 11 (2 min)**
   - Multi-factor risk scoring formula avoiding single-point false positives.
   - 4-Tier Severity Classification (Critical, High, Medium, Low).
   - Hadoop Job 11 per-host aggregation results.
6. **Slide 6 — Conclusion & Defense Wrap-up (1 min)**
   - 20-Page SOC Dashboard built with React 18 & Vite.
   - 24 passing unit/integration tests (100% pass rate).
   - Q&A.
