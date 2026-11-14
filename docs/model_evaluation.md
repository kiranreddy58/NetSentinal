# NetSentinel 2.0 — Comprehensive Model Evaluation & Benchmark Results

## 1. Verified Multi-Model Performance Comparison Table

All metrics calculated independently on the unseen holdout test split (**24,129 flow records**):

| Model | Accuracy | Precision | Recall | F1-Score | Macro F1 | Weighted F1 | ROC-AUC | PR-AUC | FPR | FNR | Train Time | Pred Time | Model Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | 99.95% | 99.95% | 99.93% | 99.94% | 99.95% | 99.95% | 1.0000 | 1.0000 | 0.0004 | 0.0007 | 4.69s | 0.0574s | 4.23 MB |
| **Gradient Boosting** | **99.97%** | 99.94% | **99.98%** | **99.96%** | **99.97%** | **99.97%** | **1.0000** | **1.0000** | 0.0004 | **0.0002** | 16.74s | 0.0416s | 0.42 MB |
| **Baseline (Decision Tree)** | 99.35% | 99.25% | 99.28% | 99.27% | 99.34% | 99.35% | 0.9963 | 0.9956 | 0.0059 | 0.0072 | 2.86s | 0.0080s | 0.01 MB |

## 2. Confusion Matrices (Holdout Test Set: 24,129 Flows)

### Random Forest:
- **True Negative (TN):** 13,443 (Benign correctly identified)
- **False Positive (FP):** 5 (Benign falsely classified as attack)
- **False Negative (FN):** 7 (Attack missed)
- **True Positive (TP):** 10,674 (Attack correctly identified)

### Gradient Boosting (HistGradientBoosting):
- **True Negative (TN):** 13,443
- **False Positive (FP):** 5
- **False Negative (FN):** 2 (Only 2 attacks missed out of 10,681 attack flows!)
- **True Positive (TP):** 10,679

### Baseline Decision Tree:
- **True Negative (TN):** 13,369
- **False Positive (FP):** 79
- **False Negative (FN):** 77
- **True Positive (TP):** 10,604

## 3. Analysis & Key Takeaways
1. **Histogram Gradient Boosting** achieved the highest overall F1-score (99.96%) and the lowest False Negative Rate (0.02%), while producing an ultra-compact artifact of just 0.42 MB.
2. Both ensemble models demonstrate exceptional discrimination on complex attacks with ROC-AUC and PR-AUC rounding to 1.0000.
3. The baseline decision tree achieves 99.27% F1, proving the high quality and discriminative power of the engineered flow features.
