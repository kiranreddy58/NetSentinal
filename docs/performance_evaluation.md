# NetSentinel 2.0 — Performance, Memory & Resource Optimization

## 1. Hardware Environment Specifications
- **Operating System:** Windows 11 Enterprise (64-bit)
- **Processor:** 12th Gen Intel Core i5-1235U (10 Cores: 2 P-Cores, 8 E-Cores; 12 Threads)
- **Installed System Memory:** 16.0 GB RAM
- **Storage Subsystem:** Fast NVMe SSD

## 2. Ingestion & Preprocessing Efficiency
- **Raw Input Processed:** 2,099,971 flow records across 5 standard CSV files (810 MB).
- **Chunk Size:** 100,000 flows per buffer to enforce an upper memory ceiling < 600 MB.
- **Deduplication:** Dropped 38,920 exact flow pattern duplicates without losing rare classes.
- **Export Format:** Snappy-compressed Apache Parquet (`train.parquet`, `validation.parquet`, `test.parquet`).
  - Read speed: ~0.12 seconds for 112,599 rows x 75 columns.
  - Disk compression: > 75% reduction versus uncompressed CSV.

## 3. Model Training Benchmark (Measured on i5-1235U)
| Model | Training Time | Test Inference Time (24,129 Rows) | Per-Sample Latency | Disk Footprint |
| :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | 4.69 s | 0.0574 s | 2.37 microseconds | 4.23 MB |
| **HistGradientBoosting** | 16.74 s | 0.0416 s | 1.72 microseconds | 0.42 MB |
| **Baseline Decision Tree** | 2.86 s | 0.0080 s | 0.33 microseconds | 0.01 MB |
| **Isolation Forest** | 0.64 s | 0.0210 s | 0.87 microseconds | 1.15 MB |

## 4. API & Frontend Optimization
- **Zero Retraining on API Calls:** All model artifacts and evaluation summaries are pre-computed, version-stamped, and served from memory/disk in < 5 milliseconds.
- **FastAPI Throughput:** Over 2,400 requests/second handled via Uvicorn ASGI workers.
- **Frontend Production Bundle:** Built with Vite in 2.08 seconds; final minified bundle is ~59 KB gzipped with zero external charting bloat.
