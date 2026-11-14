# NetSentinel 2.0 — Threat Intelligence & Risk Scoring Engine

## 1. Multi-Factor Risk Scoring Formula
NetSentinel fuses multiple analytical streams to prevent single-point false alarms. The unified risk score $R \in [0, 100]$ is computed as:

$$R = \min\Big(100,\, w_{\text{ml}} \cdot P_{\text{ensemble}} + w_{\text{iso}} \cdot \frac{S_{\text{anomaly}}}{100} + H_{\text{probe}} + H_{\text{burst}}\Big)$$

Where:
- $P_{\text{ensemble}} = 0.5 \cdot P_{\text{RF}} + 0.5 \cdot P_{\text{GBDT}}$: Supervised probability ($w_{\text{ml}} = 50.0$)
- $S_{\text{anomaly}}$: Isolation Forest score ($w_{\text{iso}} = 30.0$)
- $H_{\text{probe}}$: Port scan / rapid destination probe heuristic (10.0 pts)
- $H_{\text{burst}}$: Extreme volumetric asymmetry or packet surge heuristic (10.0 pts)

## 2. Severity Classification Tiers

| Tier | Risk Score Range | Actions & Characteristics | Test Dataset Count |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | $R \ge 70.0$ | Confirmed high-probability attack with active probe/burst or extreme anomaly. Immediate SOC alert. | **203** (0.84%) |
| **HIGH** | $45.0 \le R < 70.0$ | High ML classifier confidence or strong statistical anomaly. Host inspection recommended. | **10,470** (43.39%) |
| **MEDIUM** | $20.0 \le R < 45.0$ | Mild anomaly or moderate suspicious connection characteristics. | **243** (1.01%) |
| **LOW** | $R < 20.0$ | Nominal baseline traffic, standard protocols, zero indicators. | **13,213** (54.76%) |

## 3. Causal Explanations
Every generated threat record includes deterministic causal text justifying the score, such as:
- *"High ML classifier confidence (99.8%) matching attack traffic signature; Severe statistical feature deviation flagged by Isolation Forest (74.2/100); Port scan probe behaviour detected"*
- *"Baseline nominal network activity"*
