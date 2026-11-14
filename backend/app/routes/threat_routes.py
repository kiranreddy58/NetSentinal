"""
FastAPI Routes for Unified Threat Intelligence & Risk Scoring
"""
from fastapi import APIRouter, Query
from typing import Optional
from backend.app.services.ml_service import MLDataService

router = APIRouter(prefix="/threats", tags=["Threat Intelligence"])


@router.get("/summary")
def get_threat_summary():
    """Retrieve high-level threat metrics and severity counts."""
    return MLDataService.get_threat_summary()


@router.get("/ranking")
def get_threat_ranking():
    """Retrieve top threat sources and destinations by high-risk flow frequency."""
    return {
        "top_sources": MLDataService.get_top_threat_sources(),
        "top_destinations": MLDataService.get_top_threat_destinations()
    }


@router.get("/severity")
def get_severity_distribution():
    """Retrieve breakdown of CRITICAL, HIGH, MEDIUM, and LOW severity flows."""
    return MLDataService.get_severity_distribution()


@router.get("/connections")
def get_threat_connections(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=500)):
    """Retrieve high-risk source-destination connections."""
    return MLDataService.get_threat_records(page=page, page_size=page_size, severity="HIGH")


@router.get("/records")
def get_threat_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Retrieve paginated, searchable, severity-filtered threat records."""
    return MLDataService.get_threat_records(page=page, page_size=page_size, severity=severity, search=search)


@router.get("/explanations")
def get_threat_explanations():
    """Retrieve human-readable explainability records for suspicious and anomalous flows."""
    exp = MLDataService.get_explainability_report()
    return exp.get("local_flow_explanations", [])
