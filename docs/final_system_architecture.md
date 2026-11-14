# NetSentinel 2.0 — Final System Architecture & Implementation Blueprint

## 1. System High-Level Topology

```
+-----------------------------------------------------------------------------------------+
|                                    NETSENTINEL 2.0                                      |
|                  Big Data + Machine Learning Cybersecurity Platform                     |
+-----------------------------------------------------------------------------------------+
                                             |
                   +-------------------------+-------------------------+
                   |                                                   |
                   v                                                   v
        [BIG DATA SUBSYSTEM]                                [ML & THREAT SUBSYSTEM]
+-----------------------------------+               +-------------------------------------+
| Apache Hadoop 3.3.6               |               | Chunked Zero-Leakage Pipeline       |
| HDFS: /netsentinel/input/original |               | Train / Val / Test (Parquet)        |
| 10 Canonical MapReduce Jobs       |               |-------------------------------------|
| MapReduce Job 11 (Threat Scoring) |               | Supervised Ensembles (RF + GBDT)    |
| Results: CSV / JSON Analytics     |               | Unsupervised Anomaly (Isolation F.) |
| Job Provenance & Block Reports    |               | Explainable AI (XAI / Permutation)  |
+-----------------------------------+               +-------------------------------------+
                   |                                                   |
                   +-------------------------+-------------------------+
                                             |
                                             v
                               [FASTAPI 2.0 BACKEND SERVICE]
                               - Core Analytics Router (/api)
                               - Machine Learning Router (/api/ml)
                               - Anomaly Detection Router (/api/anomaly)
                               - Threat Intelligence Router (/api/threats)
                               - Big Data & MapReduce Router (/api/bigdata)
                                             |
                                             v
                             [REACT 18 + VITE SOC DASHBOARD]
                             - 20 Dedicated Operational Views
                             - Custom Interactive SVG Visualizations
                             - Multi-Tier Severity Filtering
                             - Searchable Host Correlation Matrices
```

## 2. Directory Layout
```
bda/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint mounting all 5 routers
│   │   ├── config.py                   # Path and dataset configuration
│   │   ├── routes/
│   │   │   ├── api.py                  # Core analytics routes
│   │   │   ├── ml_routes.py            # Supervised ML & XAI routes
│   │   │   ├── anomaly_routes.py       # Isolation Forest routes
│   │   │   ├── threat_routes.py        # Threat fusion routes
│   │   │   └── bigdata_routes.py       # Hadoop & MapReduce routes
│   │   ├── schemas/                    # Pydantic schemas
│   │   └── services/                   # Fast disk/memory data services
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # 20-Page SOC Dashboard
│   │   ├── api.js                      # Centralized API client
│   │   └── components/
│   │       └── Charts.jsx              # Responsive SVG Charting Engine
│   └── dist/                           # Compiled production build
├── hadoop/
│   ├── mapper/                         # MapReduce Streaming Mappers (Jobs 1-11)
│   ├── reducer/                        # MapReduce Streaming Reducers (Jobs 1-11)
│   └── scripts/                        # Job runners and verification harnesses
├── ml/
│   ├── preprocessing/                  # Chunked ingestion & zero-leakage pipeline
│   ├── features/                       # Feature dictionary & schema definitions
│   ├── training/                       # Multi-model training engine
│   ├── anomaly_detection/              # Isolation Forest pipeline
│   ├── explainability/                 # XAI & feature attribution
│   ├── threat_intelligence/            # Multi-factor threat scoring engine
│   ├── inference/                      # Batch inference & model registry
│   ├── models/                         # Serialized joblib artifacts & registry
│   └── reports/                        # JSON / CSV comparison reports
├── tests/                              # 24 Passing Unit & Integration Tests
└── docs/                               # Complete Academic Documentation Suite
```
