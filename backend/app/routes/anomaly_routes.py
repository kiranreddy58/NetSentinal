"""
FastAPI Routes for Unsupervised Anomaly Detection
"""
from fastapi import APIRouter, Query
from backend.app.services.ml_service import MLDataService

router = APIRouter(prefix="/anomaly", tags=["Anomaly Detection"])


@router.get("/summary")
def get_anomaly_summary():
    """Retrieve Isolation Forest anomaly summary and operational metrics."""
    return MLDataService.get_anomaly_summary()


@router.get("/distribution")
def get_anomaly_distribution():
    """Retrieve anomaly score histogram distribution."""
    summary = MLDataService.get_anomaly_summary()
    return summary.get("score_distribution", [])


@router.get("/top-sources")
def get_top_sources():
    """Retrieve top anomalous source IP addresses."""
    return MLDataService.get_top_threat_sources()


@router.get("/top-destinations")
def get_top_destinations():
    """Retrieve top anomalous destination IP addresses."""
    return MLDataService.get_top_threat_destinations()


@router.get("/records")
def get_anomaly_records(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=500)):
    """Retrieve anomalous flow records."""
    summary = MLDataService.get_anomaly_summary()
    sample = summary.get("sample_anomalies", [])
    total = len(sample)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "items": sample[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0
    }
