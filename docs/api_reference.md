# NetSentinel 2.0 — FastAPI REST API Reference

## Base URL: `http://localhost:8000/api`

### 1. Core Analytics Endpoints
- `GET /overview` — High-level summary of canonical flows, packets, bytes, and system state.
- `GET /source-ips` — Paginated and searchable source IP traffic metrics.
- `GET /destination-ips` — Paginated and searchable destination IP metrics.
- `GET /ports` — Destination ports and mapped service intelligence.
- `GET /protocols` — Protocol breakdown (TCP, UDP, etc.).
- `GET /traffic-volume` — Traffic volume classifications (Elephant, Medium, Mice).
- `GET /temporal` — 60-bucket minute-based temporal distribution.
- `GET /daily` — Monday-Friday day-by-day comparison.
- `GET /attacks` — 27 ground-truth attack categories.
- `GET /suspicious` — Suspicious heuristic indicators from Hadoop Job 9.
- `GET /connections` — Source-destination host pairs.
- `GET /jobs` — Hadoop Job 1-10 execution reports.

### 2. Machine Learning Endpoints
- `GET /ml/models` — Registered models with hyperparams, status, and artifact locations.
- `GET /ml/metrics` — Full evaluation dictionaries across models.
- `GET /ml/comparison` — Tabular side-by-side comparison metrics.
- `GET /ml/feature-importance` — Top ranked features for RF, GBDT, and baseline.
- `GET /ml/confusion-matrix?model=Random+Forest` — 2x2 confusion matrix (TN, FP, FN, TP).
- `GET /ml/roc?model=Random+Forest` — Sample points along the ROC curve and ROC-AUC.
- `GET /ml/precision-recall?model=Random+Forest` — PR curve coordinates and PR-AUC.
- `GET /ml/predictions` — Test holdout predictions with confidence scores.
- `GET /ml/training-history` — Training convergence times and artifact sizes.
- `GET /ml/explainability` — Global MDI, permutation importance, and local flow attributions.
- `POST /ml/predict-batch` — Run inference over input network flow dictionaries.

### 3. Anomaly Detection Endpoints
- `GET /anomaly/summary` — Isolation Forest parameters, flagged anomalies, capture rate.
- `GET /anomaly/distribution` — Histogram buckets of anomaly scores (0-100).
- `GET /anomaly/top-sources` — Top source IP addresses exhibiting anomalous patterns.
- `GET /anomaly/top-destinations` — Top target destination IP addresses.
- `GET /anomaly/records` — Paginated anomalous flow records.

### 4. Threat Intelligence Endpoints
- `GET /threats/summary` — High-level counts of Critical, High, Medium, and Low threats.
- `GET /threats/ranking` — Ranked top threat source IPs and targeted destination IPs.
- `GET /threats/severity` — Severity distribution with color tags.
- `GET /threats/connections` — High-risk host communication channels.
- `GET /threats/records` — Searchable, paginated, severity-filtered threat intelligence records.
- `GET /threats/explanations` — Causal textual explanations for flagged threats.

### 5. Big Data & MapReduce Endpoints
- `GET /bigdata/summary` — Execution platform specifications and job provenance.
- `GET /bigdata/trends` — Temporal trends from MapReduce Job 6.
- `GET /bigdata/attacks` — Attack distributions from MapReduce Job 7.
- `GET /bigdata/protocols` — Protocol metrics from MapReduce Job 4.
- `GET /bigdata/traffic` — Volume tiers from MapReduce Job 5.
- `GET /bigdata/daily-comparison` — Daily comparative metrics from MapReduce Job 10.
- `GET /bigdata/job11-threats` — Source IP threat profiles aggregated by MapReduce Job 11.
