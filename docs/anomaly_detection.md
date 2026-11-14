# NetSentinel 2.0 — Unsupervised Anomaly Detection

## 1. Methodology & Model Setup
Supervised models excel at detecting known attack patterns but struggle against novel zero-day attacks or stealthy polymorphic probes. To counter this, NetSentinel 2.0 deploys an **Isolation Forest** (`sklearn.ensemble.IsolationForest`):
- **Training Strategy:** Fitted strictly on unlabeled network flow feature representations without target labels.
- **Tree Count:** 100 isolation trees.
- **Contamination Parameter:** 0.08 (calibrated to expected 8% baseline outlier rate).
- **Execution Time:** 0.64 seconds to fit on 112,599 training instances.

## 2. Anomaly Scoring & Evaluation
The continuous decision function is inverted and scaled to a human-interpretable range:
$$S_{\text{anomaly}} = 100 \times \left(1.0 - \frac{s - s_{\min}}{s_{\max} - s_{\min}}\right)$$
Where $S_{\text{anomaly}} \in [0, 100]$ indicates extreme statistical abnormality.

### Offline Evaluation on Holdout Test Set (24,129 Flows)
- **Total Flagged Anomalies:** 1,811 flows (7.51% of test traffic).
- **Unsupervised Attack Capture Rate:** 9.06% of attacks were flagged purely via geometric tree isolation without ever seeing an attack label during training.
- **Benign False Alarm Rate:** 6.27%.

### Anomaly Score Distribution Histogram
- `0 - 20`: 41.2% (Nominal baseline traffic)
- `20 - 40`: 36.8% (Mild deviations, normal packet variance)
- `40 - 60`: 14.5% (Elevated variance)
- `60 - 80`: 5.8% (High anomaly score)
- `80 - 100`: 1.7% (Extreme statistical outliers / severe network anomalies)
