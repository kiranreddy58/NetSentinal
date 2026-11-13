# MapReduce Job 9: Suspicious Behavior Analytics

## 1. Overview
MapReduce Job 9 runs distributed anomaly heuristics directly across all 2.099 million network flows, flagging potential attack signatures without prior model training:
1. **Port Scan Probes:** Flows with $\le 3$ packets and duration $<100\text{ ms}$.
2. **Volume Floods / Denial of Service:** Flows with $>500$ packets or $>500\text{ KB}$ transferred.
3. **Low & Slow (Slowloris / HTTP Keep-Alive Exhaustion):** Flow duration exceeding 10 seconds with $\le 10$ packets.
4. **Data Exfiltration / Asymmetric Uploads:** Massive forward-to-backward payload ratio ($>100\text{ KB}$ and $>10\times$ backward volume).

## 2. Reducer Aggregation
Each heuristic category is aggregated to evaluate:
- Total flagged flows.
- Total forward and backward packets and volume.
- True Positives vs False Positives by cross-correlating with the canonical ground truth attack labels.
- Precision metric for heuristic evaluation.
