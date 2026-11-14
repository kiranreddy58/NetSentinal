"""
FastAPI Routes for Advanced Big Data & MapReduce Analytics
"""
from fastapi import APIRouter, Query
from backend.app.services.data_service import read_csv, paginate
from backend.app.config import (
    TRAFFIC_VOLUME_CSV, TEMPORAL_CSV, DAILY_CSV, ATTACK_CSV, PROTOCOL_CSV, BASE_DIR
)

router = APIRouter(prefix="/bigdata", tags=["Big Data Analytics"])

JOB11_CSV = BASE_DIR / "results" / "threat_analytics" / "hadoop_job11_threat_summary.csv"


@router.get("/summary")
def get_bigdata_summary():
    """Retrieve comprehensive Big Data execution metrics and dataset counters."""
    return {
        "dataset_name": "CICIDS-2017 Version 2 (Canonical 5 Standard CSVs)",
        "total_canonical_records": 2099971,
        "total_mapreduce_jobs": 11,
        "execution_platform": "Apache Hadoop 3.3.6 (LocalJobRunner with live HDFS)",
        "hdfs_storage_path": "/netsentinel/input/original/",
        "jobs_summary": [
            {"job": "Job 1", "name": "Source IP Analytics", "input": 2099976, "groups": 174, "status": "VERIFIED"},
            {"job": "Job 2", "name": "Destination IP Analytics", "input": 2099976, "groups": 19044, "status": "VERIFIED"},
            {"job": "Job 3", "name": "Destination Port Analytics", "input": 2099976, "groups": 5066, "status": "VERIFIED"},
            {"job": "Job 4", "name": "Protocol Analytics", "input": 2099976, "groups": 4, "status": "VERIFIED"},
            {"job": "Job 5", "name": "Traffic Volume Analytics", "input": 2099976, "groups": 5, "status": "VERIFIED"},
            {"job": "Job 6", "name": "Temporal Analytics", "input": 2099976, "groups": 60, "status": "VERIFIED"},
            {"job": "Job 7", "name": "Attack Label Analytics", "input": 2099976, "groups": 27, "status": "VERIFIED"},
            {"job": "Job 8", "name": "Source-Dest Correlation", "input": 2099976, "groups": 62107, "status": "VERIFIED"},
            {"job": "Job 9", "name": "Suspicious Behavior Analytics", "input": 2099976, "groups": 5, "status": "VERIFIED"},
            {"job": "Job 10", "name": "Daily Comparative Analytics", "input": 2099976, "groups": 5, "status": "VERIFIED"},
            {"job": "Job 11", "name": "Threat & ML Intelligence", "input": 2000, "groups": 14, "status": "VERIFIED"}
        ]
    }


@router.get("/trends")
def get_bigdata_trends():
    """Retrieve temporal traffic trends across 60 minute-based time bins."""
    return read_csv(TEMPORAL_CSV)


@router.get("/attacks")
def get_bigdata_attacks():
    """Retrieve ground-truth attack breakdown across all 27 signatures."""
    return read_csv(ATTACK_CSV)


@router.get("/protocols")
def get_bigdata_protocols():
    """Retrieve protocol distribution (TCP, UDP, etc.)."""
    return read_csv(PROTOCOL_CSV)


@router.get("/traffic")
def get_bigdata_traffic():
    """Retrieve volume classification tiers (Elephant, Medium, Mice flows)."""
    return read_csv(TRAFFIC_VOLUME_CSV)


@router.get("/daily-comparison")
def get_bigdata_daily_comparison():
    """Retrieve day-by-day traffic comparison (Monday to Friday)."""
    return read_csv(DAILY_CSV)


@router.get("/job11-threats")
def get_job11_threats(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100)):
    """Retrieve MapReduce Job 11 Source IP threat profiles."""
    if not JOB11_CSV.exists():
        return {"items": [], "total": 0}
    # Read tab-delimited
    rows = []
    with open(JOB11_CSV, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]
        if len(lines) > 1:
            header = lines[0].split("\t")
            for l in lines[1:]:
                vals = l.split("\t")
                rows.append(dict(zip(header, vals)))
    return paginate(rows, page, page_size)
