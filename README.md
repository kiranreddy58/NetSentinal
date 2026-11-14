# NetSentinel 2.0 — Big Data + Machine Learning Cybersecurity Intelligence Platform

<p align="center">
  <a href="https://github.com/kiranreddy58/NetSentinal">
    <img src="https://img.shields.io/badge/System_Status-100%25_Verified-success?style=for-the-badge&logo=apache-hadoop" alt="Status" />
  </a>
  <a href="https://github.com/kiranreddy58/NetSentinal">
    <img src="https://img.shields.io/badge/Tests-24%2F24_Passing-emerald?style=for-the-badge" alt="Tests" />
  </a>
  <a href="https://hadoop.apache.org/">
    <img src="https://img.shields.io/badge/Apache_Hadoop-3.3.6-orange?style=for-the-badge&logo=apache" alt="Hadoop" />
  </a>
  <a href="https://fastapi.tiangolo.com/">
    <img src="https://img.shields.io/badge/FastAPI-2.0.0-teal?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React_18-Vite-blue?style=for-the-badge&logo=react" alt="React" />
  </a>
</p>

**NetSentinel 2.0** is an enterprise-grade Big Data and Machine Learning Cybersecurity Intelligence Platform. It combines distributed **Apache Hadoop 3.3.6 HDFS & MapReduce** batch processing with **supervised machine learning classification**, **unsupervised statistical anomaly detection**, **explainable AI (XAI)**, and **multi-factor threat risk scoring**, visualized through a modern 20-page Security Operations Center (SOC) dashboard.

---

## 📸 Platform Deliverables & Live Screenshots

### 1. Home Page — Executive Overview Dashboard
> Real-time SOC executive dashboard displaying 2,099,971 canonical flows, traffic breakdown donut charts, multi-tier threat severity distribution, and active machine learning performance metrics.

<p align="center">
  <img src="https://raw.githubusercontent.com/kiranreddy58/NetSentinal/main/output/1_home_page_overview.png" alt="1. Home Page Executive Overview" width="100%" />
</p>

---

### 2. Terminal — Platform Execution & 24 Automated Tests
> Live PowerShell terminal displaying concurrent Uvicorn ASGI + Vite frontend startup, Apache Hadoop MapReduce Jobs 1–11 execution provenance, and all 24 unit/integration test suites passing 100%.

<p align="center">
  <img src="https://raw.githubusercontent.com/kiranreddy58/NetSentinal/main/output/2_terminal_execution_and_tests.png" alt="2. Terminal Execution and Tests" width="100%" />
</p>

---

### 3. Machine Learning — Model Ensembles & Comparative Benchmarks
> Supervised Machine Learning subsystem displaying active Random Forest, Histogram Gradient Boosting, and Baseline Decision Tree models, verified metrics, and strict data leakage prevention audit.

<p align="center">
  <img src="https://raw.githubusercontent.com/kiranreddy58/NetSentinal/main/output/3_machine_learning_models.png" alt="3. Machine Learning Models" width="100%" />
</p>

---

### 4. Hadoop & Big Data — Distributed MapReduce Analytics
> Apache Hadoop 3.3.6 MapReduce analytics pipeline processing 2.1M flows across 11 streaming jobs with 100.00% ground-truth parity verification.

<p align="center">
  <img src="https://raw.githubusercontent.com/kiranreddy58/NetSentinal/main/output/4_hadoop_bigdata_analytics.png" alt="4. Hadoop Big Data Analytics" width="100%" />
</p>

---

### 5. Threat Intelligence — Multi-Factor Risk Operations & Severity Tiers
> Unified Threat Intelligence Engine fusing supervised ensemble probabilities, Isolation Forest anomaly scores, and behavioral heuristics into 4 calibrated severity tiers (Critical, High, Medium, Low) with causal explanations.

<p align="center">
  <img src="https://raw.githubusercontent.com/kiranreddy58/NetSentinal/main/output/5_threat_intelligence_operations.png" alt="5. Threat Intelligence Operations" width="100%" />
</p>

---

## 1. System Highlights & Benchmark Results

- **Dataset:** Canonical CICIDS-2017 Version 2 (5 Standard CSVs: Monday to Friday)
- **Scale:** **2,099,971** bidirectional network flow records (810 MB raw, 47.23 GB total payload volume).
- **Big Data Engine:** 11 Apache Hadoop MapReduce jobs with 100.00% execution parity against ground truth.
- **Machine Learning Benchmark (24,129-flow holdout test set):**
  - **HistGradientBoosting:** **99.97% Accuracy**, **99.96% F1-Score**, **1.0000 ROC-AUC**, **0.02% FNR** (only 2 missed attacks).
  - **Random Forest (100 Trees):** 99.95% Accuracy, 99.94% F1-Score, 1.0000 ROC-AUC.
  - **Baseline Decision Tree:** 99.35% Accuracy, 99.27% F1-Score, 0.9963 ROC-AUC.
- **Unsupervised Anomaly Detection:** Isolation Forest (8% contamination) flagged 1,811 statistical outliers (7.51% of holdout traffic) with a 9.06% unsupervised attack capture rate.
- **Threat Intelligence Engine:** Transparent multi-factor risk scoring (0-100) across 4 severity tiers: CRITICAL (203), HIGH (10,470), MEDIUM (243), LOW (13,213).
- **SOC Dashboard:** 20 interactive views built with React 18, Vite 5, Tailwind CSS, Lucide Icons, and zero-dependency SVG charts.
- **Testing:** 24/24 unit and integration tests passing in 1.78 seconds.

---

## 2. Architecture Diagram

```
CICIDS-2017 Dataset (2,099,971 Flows)
        |
        v
Data Quality & Chunked Preprocessing (Zero Data Leakage)
        |
        +--------------------------------+
        |                                |
        v                                v
Apache Hadoop 3.3.6 HDFS        Stratified Splits (Parquet)
11 MapReduce Jobs               Train (112,599) / Val (24,129) / Test (24,129)
        |                                |
        |                   +------------+------------+
        |                   |            |            |
        |                   v            v            v
        |              Random Forest   Hist GBDT   Isolation Forest
        |               (Supervised)  (Supervised)  (Unsupervised)
        |                   |            |            |
        +-------------------+------------+------------+
                            |
                            v
              Unified Threat Intelligence Engine
              - Ensemble ML Probability (50%)
              - Isolation Forest Anomaly (30%)
              - Port Scan Probe Heuristic (10%)
              - Volumetric Surge Heuristic (10%)
                            |
                            v
                 MapReduce Job 11 Threat Profiles
                            |
                            v
                 FastAPI 2.0 REST Backend
                            |
                            v
                 React 18 / Vite SOC Dashboard
```

---

## 3. Quick Start & Execution

### Prerequisites
- Windows 11 / Linux
- Python 3.10+ (Tested on Python 3.15.2)
- Node.js 18+ (Tested on Node 26.13.0)
- Java 11 (for Hadoop HDFS / LocalJobRunner)

### Launch Complete Platform
To start both the FastAPI backend and the React Vite frontend concurrently:
```cmd
start_all.cmd
```
- **Backend API:** `http://localhost:8000` (Interactive Swagger Docs: `http://localhost:8000/docs`)
- **Frontend Dashboard:** `http://localhost:3000` (or `http://localhost:5173`)

### Run Automated Tests
```cmd
python -m unittest discover -s tests
```
*All 24 test suites execute and pass in < 2 seconds.*

---

## 4. MapReduce Jobs Summary (1–11)

| Job | Analytics Name | Map Input | Output Groups | Parity vs Ground Truth | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Job 1** | Source IP Analytics | 2,099,976 | 174 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 2** | Destination IP Analytics | 2,099,976 | 19,044 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 3** | Destination Port Analytics | 2,099,976 | 5,066 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 4** | Protocol Analytics | 2,099,976 | 4 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 5** | Traffic Volume Analytics | 2,099,976 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 6** | Temporal Analytics | 2,099,976 | 60 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 7** | Attack Label Analytics | 2,099,976 | 27 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 8** | Source-Dest Correlation | 2,099,976 | 62,107 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 9** | Suspicious Behavior Analytics | 2,099,976 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 10**| Daily Comparative Analytics | 2,099,976 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 11**| Threat & ML Intelligence | 2,000 | 14 | **100.00%** (0 discrepancies) | **VERIFIED** |

---

## 5. Documentation & Academic Reports

- [System Architecture](docs/final_system_architecture.md)
- [Machine Learning Architecture](docs/ml_architecture.md)
- [Data Leakage Prevention & Preprocessing](docs/ml_preprocessing.md)
- [Model Training Specifications](docs/model_training.md)
- [Model Evaluation & Benchmarks](docs/model_evaluation.md)
- [Unsupervised Anomaly Detection](docs/anomaly_detection.md)
- [Threat Intelligence & Risk Scoring](docs/threat_intelligence.md)
- [Advanced Visualization](docs/advanced_visualization.md)
- [FastAPI REST API Reference](docs/api_reference.md)
- [Performance & Resource Evaluation](docs/performance_evaluation.md)
- [Comprehensive Viva Defense Guide (45 Q&As)](docs/viva_defense_guide_2.0.md)
- [Live Demonstration Script & Presentation](docs/demo_script_2.0.md)
- [Final Acceptance Audit Report](FINAL_ACCEPTANCE_REPORT.md)
- [Primary Screenshots Catalog](output/README.md)
