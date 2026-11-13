"""
NetSentinel - Data Loading Service
Reads genuine Hadoop MapReduce aggregated CSV files with caching.
"""
import csv
from typing import List, Dict, Any, Optional
from backend.app.config import (
    SOURCE_IP_CSV, DEST_IP_CSV, SOURCE_DEST_CSV, PORT_CSV,
    PROTOCOL_CSV, TRAFFIC_VOLUME_CSV, TEMPORAL_CSV, DAILY_CSV,
    ATTACK_CSV, SUSPICIOUS_CSV, METADATA_DIR
)
import json

def read_csv(path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def paginate(data: List[Dict[str, Any]], page: int = 1, page_size: int = 50) -> Dict[str, Any]:
    total = len(data)
    start = (page - 1) * page_size
    end = start + page_size
    items = data[start:end]
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

def get_job_reports() -> List[Dict[str, Any]]:
    reports = []
    if METADATA_DIR.exists():
        for p in METADATA_DIR.glob("*_report.json"):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    reports.append(json.load(f))
            except Exception:
                continue
    return reports
