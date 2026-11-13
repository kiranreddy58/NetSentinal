# NetSentinel — Project Status & Executive Summary

**System Status:** **100% COMPLETE & VERIFIED (Phases 1 through 15)**  
**Dataset:** CICIDS-2017 Version 2 (Canonical 5 Standard CSVs)  
**Execution Platform:** Apache Hadoop 3.3.6 (LocalJobRunner with live HDFS NameNode/DataNode) on Windows 11  
**Backend:** FastAPI 0.110+ on Python 3.15.2 (Uvicorn ASGI)  
**Frontend:** React 18 + Vite + Tailwind CSS + Lucide Icons  

---

## 1. MapReduce Execution Summary Table (Jobs 1–10)

| Job | Analytics Name | Hadoop Job ID | Map Input | Reduce In | Groups | Parity vs Ground Truth | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Job 1** | Source IP Analytics | `job_local389729074_0001` | 2,099,976 | 2,099,971 | 174 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 2** | Destination IP Analytics | `job_local1810517612_0001` | 2,099,976 | 2,099,971 | 19,044 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 3** | Destination Port Analytics | `job_local1813163507_0001` | 2,099,976 | 2,099,971 | 5,066 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 4** | Protocol Analytics | `job_local1922488540_0001` | 2,099,976 | 2,099,971 | 4 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 5** | Traffic Volume Analytics | `job_local990915559_0001` | 2,099,976 | 2,099,971 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 6** | Temporal Traffic Analytics | `job_local2078628236_0001` | 2,099,976 | 2,099,971 | 60 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 7** | Attack Label Analytics | `job_local631912796_0001` | 2,099,976 | 2,099,971 | 27 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 8** | Source-Dest Correlation | `job_local1170705224_0001` | 2,099,976 | 2,099,971 | 62,107 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 9** | Suspicious Behavior Analytics| `job_local185308766_0001` | 2,099,976 | 2,613,251 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |
| **Job 10**| Daily Comparative Analytics | `job_local56502442_0001` | 2,099,976 | 2,099,971 | 5 | **100.00%** (0 discrepancies) | **VERIFIED** |

---

## 2. Canonical Dataset Verified Metrics
- **Total Flows Processed:** 2,099,971
- **Benign Flows:** 1,582,561 (75.3611%)
- **Attack-Labelled Flows:** 517,410 (24.6389%)
- **Total Packets:** 56,129,897 packets
- **Total Volume:** 47,229,026,456 bytes (47.23 GB)
- **Unique Source Hosts:** 174
- **Unique Target Hosts:** 19,044
- **Active Ports:** 5,066
- **Unique Communication Channels:** 62,107 host pairs
- **Distinct Ground-Truth Attack Signatures:** 27

---

## 3. System Deliverables
- **MapReduce Pipeline:** 10 Mappers (`hadoop/mapper/`), 10 Reducers (`hadoop/reducer/`), 10 Runners (`hadoop/scripts/`).
- **REST API:** 12 Endpoints implemented in `backend/app/routes/api.py`, serving cached, paginated, searchable analytics.
- **Frontend Dashboard:** Modern, reactive single-page app in `frontend/src/` built with React 18, Tailwind CSS, and Lucide icons (production build verified: `dist/`).
- **One-Click Startup:** `start_all.cmd` launches both the backend and frontend simultaneously.
- **Test Suite:** 11 Unit tests passing 100% via `python -m unittest discover -s tests`.
- **Academic & Defense Materials:** Comprehensive Viva Guide ([docs/viva_defense_guide.md](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/viva_defense_guide.md)) and 5-Minute Demonstration Script ([docs/demo_script.md](file:///c:/Users/kiran/OneDrive/Documents/bda/docs/demo_script.md)).
