# NetSentinel 2.0 — Advanced Visualization & Dashboard Specification

## 1. SOC Design Aesthetic & Philosophy
NetSentinel 2.0 implements a **Tier-1 Security Operations Center (SOC)** user experience:
- **Palette:** Dark theme using Slate-950 (`#020617`), Slate-900 (`#0f172a`), Slate-800 (`#1e293b`).
- **Cybersecurity Status Accents:**
  - Critical: Rose-500 (`#ef4444`)
  - High: Orange-500 (`#f97316`)
  - Medium: Amber-500 (`#eab308`)
  - Nominal / Benign: Emerald-400 (`#10b981`)
  - Intelligence / Big Data: Cyan-400 (`#06b6d4`)
  - Machine Learning: Violet-400 (`#8b5cf6`)
- **Typography:** Inter sans-serif for UI labels, monospace for IP addresses, ports, metrics, and Hadoop counters.

## 2. Interactive Visual Component Suite
1. **Interactive Bar Charts:** Scaled SVG with mouse-hover tooltips, percentage indicators, and dynamic grouping.
2. **Smooth Area Charts:** Gradients under curve, interactive crosshair tooltips, and linear time interpolation.
3. **Donut Breakdown Charts:** Multi-slice SVG arcs with total counters and legend breakdowns.
4. **2x2 Confusion Matrix Cards:** Direct display of TN, FP, FN, TP with percentage distributions.
5. **ROC & Precision-Recall Curve Plots:** High-precision SVG curves with AUC badges and diagonal reference baselines.
6. **Feature Importance Bars:** Horizontal gradient progress bars ranked by Gini MDI or permutation drop.

## 3. Comprehensive 20-Page Navigation Structure
1. Executive Overview
2. Big Data Analytics
3. Hadoop Cluster and Job Monitoring
4. Source IP Intelligence
5. Destination IP Intelligence
6. Port and Protocol Analytics
7. Traffic Volume Analytics
8. Temporal Analytics
9. Attack Intelligence
10. Machine Learning Overview
11. Random Forest Model
12. Gradient Boosting Model
13. Model Comparison
14. Anomaly Detection
15. Explainable AI
16. Threat Intelligence
17. Suspicious Connections
18. Host Correlation Channels
19. MapReduce Threat Ranking (Job 11)
20. Dataset Explorer & About
