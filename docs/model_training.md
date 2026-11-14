# NetSentinel 2.0 — Supervised Model Training Specifications

## 1. Model Configurations & Hyperparameters

### Model 1: Random Forest Classifier
- **Algorithm:** `sklearn.ensemble.RandomForestClassifier`
- **Parameters:**
  - `n_estimators`: 100
  - `max_depth`: 16
  - `min_samples_split`: 5
  - `min_samples_leaf`: 2
  - `class_weight`: `"balanced"`
  - `random_state`: 42
  - `n_jobs`: -1 (Parallel execution across all CPU cores)
- **Training Time:** 4.69 seconds
- **Model Size:** 4.23 MB

### Model 2: Histogram Gradient Boosting Classifier
- **Algorithm:** `sklearn.ensemble.HistGradientBoostingClassifier`
- **Parameters:**
  - `max_iter`: 100
  - `max_depth`: 12
  - `learning_rate`: 0.1
  - `class_weight`: `"balanced"`
  - `random_state`: 42
- **Training Time:** 16.74 seconds
- **Model Size:** 0.42 MB

### Model 3: Baseline Classifier (Decision Tree)
- **Algorithm:** `sklearn.tree.DecisionTreeClassifier`
- **Parameters:**
  - `max_depth`: 8
  - `class_weight`: `"balanced"`
  - `random_state`: 42
- **Training Time:** 2.86 seconds
- **Model Size:** 0.01 MB

## 2. Resource & Hardware Performance
Trained on Windows 11 with Intel Core i5-1235U (10 cores, 12 threads) and 16 GB RAM. 
Total training duration across all three supervised models: **24.29 seconds**.
Parquet I/O with Snappy compression enabled loading the entire 112,599-sample training matrix in under 0.15 seconds.
