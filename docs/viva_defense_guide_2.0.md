# NetSentinel 2.0 — Academic Defense & Comprehensive Viva Guide
## 45 Technical Viva Questions & Detailed Answers

### Section 1: Big Data, Hadoop & HDFS (Q1–Q12)

**Q1: What is Apache Hadoop and what problem does it solve in NetSentinel 2.0?**  
*Answer:* Apache Hadoop is an open-source distributed storage and processing framework. In NetSentinel, it allows ingesting, storing, and analyzing 2,099,971 canonical network flow records across distributed blocks via HDFS and MapReduce without single-node memory bottlenecks.

**Q2: How does HDFS store the CICIDS-2017 dataset?**  
*Answer:* HDFS splits the 5 standard CSV files (810 MB) into blocks (default 128 MB), distributed and replicated across DataNodes, coordinated by the active NameNode metadata journal.

**Q3: What execution engine was used for the MapReduce jobs on Windows 11?**  
*Answer:* Hadoop Streaming 3.3.6 with the `LocalJobRunner` framework, leveraging Windows native `winutils.exe` and Java 11. It executes genuine mapper and reducer streaming logic over live HDFS paths while ensuring deterministic in-memory parallel execution.

**Q4: Why use Hadoop Streaming instead of Java MapReduce?**  
*Answer:* Hadoop Streaming allows standard UNIX streams (`sys.stdin` and `sys.stdout`) to connect Hadoop's Java core to native Python mappers and reducers, allowing seamless integration with Python's data science ecosystem.

**Q5: What are the 11 MapReduce jobs implemented in NetSentinel?**  
*Answer:*
1. Source IP Analytics
2. Destination IP Analytics
3. Destination Port Analytics
4. Protocol Analytics
5. Traffic Volume Analytics
6. Temporal Analytics
7. Attack Label Analytics
8. Source-Destination Correlation
9. Suspicious Behavior Analytics
10. Daily Comparative Analytics
11. Threat & ML Intelligence Aggregation

**Q6: What is the purpose of the Map phase?**  
*Answer:* To parse network flow CSV rows, extract key dimensions (e.g., Source IP, Port, Timestamp), validate values, and emit intermediate key-value pairs (`KEY \t VALUE`).

**Q7: What occurs during the Shuffle and Sort phase?**  
*Answer:* Hadoop groups all values associated with an identical key and sorts keys lexicographically before streaming them into the Reducer.

**Q8: What is the purpose of the Reduce phase?**  
*Answer:* To iterate through grouped keys, aggregate counters (packet sum, byte sum, attack counts, risk scores), and emit summary statistics.

**Q9: How was execution parity verified against ground truth?**  
*Answer:* An independent single-pass streaming validator computed ground truth aggregates directly from the raw files. All 10 canonical MapReduce jobs matched ground truth with 100.00% parity (0 discrepancies).

**Q10: What is MapReduce Job 11 and why was it added?**  
*Answer:* Job 11 processes multi-factor threat intelligence records to compute aggregated per-host threat profiles (critical, high, medium, low counts, average risk score, ML attack flows) using the MapReduce paradigm.

**Q11: How do you handle malformed or empty lines in MapReduce mappers?**  
*Answer:* Mappers check line emptiness, strip trailing whitespace, check field count (`len(parts) >= 80`), catch numeric parsing exceptions, and skip corrupted records gracefully without crashing the job.

**Q12: What is the difference between LocalJobRunner and YARN pseudo-distributed mode?**  
*Answer:* LocalJobRunner executes MapReduce tasks within a single Java Virtual Machine (JVM) using thread-based parallel workers, eliminating YARN container allocation overhead while preserving 100% MapReduce API semantics.

---

### Section 2: Machine Learning & Preprocessing (Q13–Q24)

**Q13: What machine learning algorithms were trained in NetSentinel 2.0?**  
*Answer:*
1. Random Forest Classifier (`RandomForestClassifier`, 100 trees, depth 16)
2. Histogram Gradient Boosting Classifier (`HistGradientBoostingClassifier`, 100 iterations)
3. Baseline Decision Tree (`DecisionTreeClassifier`, depth 8)
4. Isolation Forest (`IsolationForest`, 100 trees, 8% contamination)

**Q14: What is data leakage and how did you prevent it?**  
*Answer:* Data leakage occurs when training data contains information about the target that wouldn't be available during real-world inference. We prevented it by:
1. Completely excluding `Src IP dec`, `Dst IP dec`, and `Timestamp` from model features to prevent trivial memorization.
2. Fitting `RobustScaler` strictly on the 70% training split.
3. Excluding all target labels and indicators from input feature matrices.

**Q15: Why use `RobustScaler` instead of `StandardScaler`?**  
*Answer:* Network traffic features (e.g., Flow Duration, Packet Bytes) contain extreme outliers and heavy-tailed distributions. `RobustScaler` uses the median and interquartile range (IQR), making it resistant to distortion by extreme outlier bursts.

**Q16: How did you handle 2.1 million rows on a 16 GB machine?**  
*Answer:* Through chunked streaming (100,000 rows/chunk), flow feature deduplication, and export to Snappy-compressed Apache Parquet format. This reduced memory footprint from > 3.5 GB to < 600 MB.

**Q17: What was the train/val/test split ratio?**  
*Answer:* Stratified 70% Training (112,599 flows), 15% Validation (24,129 flows), and 15% Holdout Test (24,129 flows).

**Q18: What is chronological day-based holdout?**  
*Answer:* Training on Monday through Thursday and evaluating on Friday to test whether models generalize across different days and unseen attack campaigns (e.g., DDoS, Botnets).

**Q19: What were the test performance metrics of the models?**  
*Answer:*
- Random Forest: 99.95% Accuracy, 99.94% F1-score, 1.0000 ROC-AUC
- Gradient Boosting: 99.97% Accuracy, 99.96% F1-score, 1.0000 ROC-AUC
- Baseline Decision Tree: 99.35% Accuracy, 99.27% F1-score, 0.9963 ROC-AUC

**Q20: Why is Accuracy alone insufficient for network intrusion detection?**  
*Answer:* Network traffic is imbalanced (75.36% benign vs 24.64% attack). A trivial model predicting all benign would achieve 75.36% accuracy while failing completely. We evaluate Attack Recall, Attack Precision, F1-Score, False Positive Rate (FPR), and False Negative Rate (FNR).

**Q21: What was the False Negative Rate of Gradient Boosting?**  
*Answer:* 0.0002 (0.02%), meaning only 2 attack flows were missed out of 10,681 attack flows in the holdout test set.

**Q22: How long did model training take on the Intel i5-1235U CPU?**  
*Answer:* Random Forest took 4.69 seconds, Gradient Boosting took 16.74 seconds, Decision Tree took 2.86 seconds, and Isolation Forest took 0.64 seconds. Total training time was under 25 seconds.

**Q23: How large are the trained model files?**  
*Answer:* Random Forest is 4.23 MB, Gradient Boosting is 0.42 MB, Decision Tree is 0.01 MB, and Isolation Forest is 1.15 MB.

**Q24: What is the difference between Random Forest and Gradient Boosting?**  
*Answer:* Random Forest trains multiple deep trees independently in parallel via bagging and averages them to reduce variance. Gradient Boosting trains shallow trees sequentially, where each new tree corrects the residual errors of the previous trees to reduce bias.

---

### Section 3: Anomaly Detection & Explainable AI (Q25–Q34)

**Q25: Why is unsupervised anomaly detection necessary alongside supervised ML?**  
*Answer:* Supervised ML can only classify patterns similar to known labeled attacks. Unsupervised anomaly detection (Isolation Forest) flags unusual structural traffic deviations without needing prior labels, enabling zero-day detection.

**Q26: How does Isolation Forest isolate anomalies?**  
*Answer:* It constructs random decision trees by randomly selecting features and split values. Anomalous instances require fewer random splits to isolate and end up with shorter average path lengths in the trees.

**Q27: What contamination rate was chosen and why?**  
*Answer:* 0.08 (8%), reflecting the baseline expectation of anomalous traffic patterns in enterprise networks.

**Q28: Did Isolation Forest use ground-truth labels during training?**  
*Answer:* Absolutely not. It was trained strictly on unlabeled feature representations. Labels were used only offline to measure that 9.06% of attacks were flagged purely through unsupervised isolation.

**Q29: What is Explainable AI (XAI) and why is it essential in cybersecurity?**  
*Answer:* SOC analysts cannot act on a "black box" prediction. XAI explains *why* a flow was classified as an attack, identifying the specific features (e.g., extreme SYN packet counts, abnormal window sizes) driving the decision.

**Q30: What is Gini Impurity Mean Decrease in Impurity (MDI)?**  
*Answer:* The total reduction in node impurity (Gini index) brought by a feature across all splits in all trees of the Random Forest.

**Q31: What is Permutation Importance and how does it differ from MDI?**  
*Answer:* Permutation importance shuffles values of a single feature column on unseen test data and measures the resulting drop in model score (F1). Unlike MDI, it does not favor high-cardinality features.

**Q32: Does correlation imply causation in network traffic features?**  
*Answer:* No. Features may correlate with attacks without causing them. NetSentinel clearly separates Pearson correlation from non-linear decision tree importance and permutation impact.

**Q33: What were the top predictive features identified by XAI?**  
*Answer:* Initial TCP window advertisement sizes (`FWD Init Win Bytes`, `Bwd Init Win Bytes`), forward/backward packet counts, flow duration, and destination port.

**Q34: How are local flow explanations generated?**  
*Answer:* For individual flagged flows, the engine extracts the feature vector, computes deviations from baseline medians weighted by feature importance, and generates human-readable causal text.

---

### Section 4: Threat Intelligence, Architecture & Operations (Q35–Q45)

**Q35: How does the Unified Threat Intelligence Engine score risk?**  
*Answer:* Through a multi-factor formula combining:
- Supervised ML ensemble probability (50% weight)
- Isolation Forest anomaly score (30% weight)
- Port scan heuristic indicator (10% weight)
- Volumetric burst heuristic (10% weight)

**Q36: What are the four severity tiers and their thresholds?**  
*Answer:*
- `CRITICAL`: Risk Score $\ge 70.0$
- `HIGH`: Risk Score $45.0 - 69.9$
- `MEDIUM`: Risk Score $20.0 - 44.9$
- `LOW`: Risk Score $< 20.0$

**Q37: Why don't you classify a flow as an attack purely based on an anomaly score?**  
*Answer:* Anomaly models flag statistical deviations, which can include legitimate traffic spikes, software updates, or backup transfers. Requiring multi-factor fusion prevents false alarms.

**Q38: What primary attacker IP was uncovered in CICIDS-2017?**  
*Answer:* `172.16.0.1`, which generated hundreds of high-risk flows across Portscan, DoS, and Botnet attacks, verified by both MapReduce Job 1 and Job 11.

**Q39: How is the backend organized in FastAPI?**  
*Answer:* Five modular APIRouters:
- `api.py`: Core Hadoop analytics
- `ml_routes.py`: Supervised models, evaluations, XAI
- `anomaly_routes.py`: Isolation Forest summaries and records
- `threat_routes.py`: Multi-factor threat scoring and ranking
- `bigdata_routes.py`: MapReduce provenance and Job 11 metrics

**Q40: How does the API prevent latency spikes during dashboard requests?**  
*Answer:* Zero retraining on requests. All model evaluations, reports, and threat records are pre-computed, version-stamped, and served from memory/cached disk in < 5ms.

**Q41: How does the Batch Inference endpoint work?**  
*Answer:* A user sends a JSON payload with network flow dictionaries to `POST /api/ml/predict-batch`. The engine validates the schema, applies the saved `RobustScaler`, loads the requested model artifact, and returns predictions with confidence scores.

**Q42: What frontend technologies power the SOC Dashboard?**  
*Answer:* React 18, Vite 5, Tailwind CSS, Lucide Icons, and custom high-performance responsive SVG charting components with zero external charting library bloat.

**Q43: What are the 20 pages/views available in the dashboard?**  
*Answer:* Executive Overview, Big Data Analytics, Hadoop Cluster Monitoring, Source IP Intelligence, Destination IP Intelligence, Port & Protocol Analytics, Traffic Volume Tiers, Temporal Analytics, Attack Intelligence, ML Overview, Random Forest, Gradient Boosting, Model Comparison, Anomaly Detection, Explainable AI, Threat Intelligence, Suspicious Heuristics, Network Analysis Channels, MapReduce Threat Ranking (Job 11), and Dataset Explorer & About.

**Q44: How is NetSentinel 2.0 started in production?**  
*Answer:* Via `start_all.cmd`, which launches Uvicorn on port 8000 and Vite on port 5173 concurrently.

**Q45: How was system quality and correctness validated?**  
*Answer:* Through an automated test suite of 24 unit and integration tests covering data integrity, leakage prevention, model loading, inference bounds, risk scoring, and all REST endpoints, executing in 1.78 seconds with a 100% pass rate.
