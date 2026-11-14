# NetSentinel 2.0 — Preprocessing & Data Leakage Prevention

## 1. Chunked Streaming & Memory Management
The canonical CICIDS-2017 dataset consists of 5 files totaling 2,099,971 flow records and 810 MB on disk. Loading the entire raw dataset into uncompressed pandas DataFrames in RAM requires > 3.5 GB and triggers memory pressure on 16 GB hardware during parallel model fitting.

NetSentinel resolves this via **Chunked Ingestion**:
- Input chunks: 100,000 flows per iteration.
- Automatic schema validation against 71 required network flow metrics.
- Outlier clipping and infinity replacement (`np.inf -> NaN -> 0.0`).
- Deduplication: Identified and preserved 160,857 unique flow feature patterns across all 27 ground-truth attack classes.

## 2. Mandatory Data Leakage Prevention

To ensure model evaluations reflect genuine network intrusion detection capability rather than trivial identity memorization, the following features are strictly excluded from the model input matrix:

| Excluded Column | Reason for Exclusion |
| :--- | :--- |
| `Src IP dec` | Memorization of attacker IP addresses rather than behavior. |
| `Dst IP dec` | Identity leakage of specific targeted server infrastructure. |
| `Timestamp` | Chronological overfitting to experimental capture windows. |
| `Label` | Direct target label leakage. |
| `Attempted Category` | Ground-truth metadata indicator. |

### Feature Scaling Split Integrity
The `RobustScaler` (scaling by median and IQR) is fitted **strictly on the 70% training split**. The validation and test sets are transformed using the pre-fitted training statistics, ensuring zero distribution leakage.

## 3. Train / Validation / Test Splitting Strategy
1. **Stratified Split (Canonical Evaluation):**
   - Training Set: 112,599 flows (70.0%)
   - Validation Set: 24,129 flows (15.0%)
   - Test Set: 24,129 flows (15.0%)
   - All 27 attack labels preserved proportionally.
2. **Chronological Day-Based Holdout:**
   - Training Days: Monday, Tuesday, Wednesday, Thursday
   - Holdout Test Day: Friday (containing DDoS, Botnet, Portscan attacks)
   - Evaluates temporal generalization against unseen attack campaigns.
