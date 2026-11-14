"""
NetSentinel Backend - Machine Learning & Threat Intelligence Data Service
Loads and serves cached ML artifacts, evaluations, and threat analytics.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ML_REPORTS_DIR = BASE_DIR / "ml" / "reports"
MODELS_DIR = BASE_DIR / "ml" / "models"
METADATA_DIR = BASE_DIR / "data" / "ml" / "metadata"
THREAT_DIR = BASE_DIR / "results" / "threat_analytics"


class MLDataService:
    @staticmethod
    def get_models_registry() -> List[Dict[str, Any]]:
        path = MODELS_DIR / "model_registry.json"
        if not path.exists():
            return []
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_model_comparisons() -> List[Dict[str, Any]]:
        path = ML_REPORTS_DIR / "model_comparison.json"
        if not path.exists():
            return []
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_feature_importances() -> Dict[str, Any]:
        path = ML_REPORTS_DIR / "feature_importance.json"
        if not path.exists():
            return {"random_forest": [], "gradient_boosting": [], "baseline": []}
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_explainability_report() -> Dict[str, Any]:
        path = ML_REPORTS_DIR / "explainability_report.json"
        if not path.exists():
            return {}
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_anomaly_summary() -> Dict[str, Any]:
        path = ML_REPORTS_DIR / "anomaly_detection_report.json"
        if not path.exists():
            return {}
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_threat_summary() -> Dict[str, Any]:
        path = THREAT_DIR / "threat_summary.json"
        if not path.exists():
            return {}
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_severity_distribution() -> List[Dict[str, Any]]:
        path = THREAT_DIR / "severity_distribution.json"
        if not path.exists():
            return []
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_top_threat_sources() -> List[Dict[str, Any]]:
        path = THREAT_DIR / "top_threat_sources.json"
        if not path.exists():
            return []
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_top_threat_destinations() -> List[Dict[str, Any]]:
        path = THREAT_DIR / "top_threat_destinations.json"
        if not path.exists():
            return []
        with open(path, "r") as f:
            return json.load(f)

    @staticmethod
    def get_threat_records(page: int = 1, page_size: int = 50, severity: Optional[str] = None, search: Optional[str] = None):
        path = THREAT_DIR / "threat_records.json"
        if not path.exists():
            return {"items": [], "total": 0, "page": page, "page_size": page_size, "total_pages": 0}
        with open(path, "r") as f:
            records = json.load(f)

        filtered = records
        if severity:
            sev_clean = severity.strip().upper()
            filtered = [r for r in filtered if r.get("severity", "").upper() == sev_clean]
        if search:
            s = search.strip().lower()
            filtered = [
                r for r in filtered
                if s in r.get("source_ip", "").lower()
                or s in r.get("destination_ip", "").lower()
                or s in r.get("ground_truth_label", "").lower()
                or s in r.get("explanation", "").lower()
            ]

        total = len(filtered)
        start = (page - 1) * page_size
        end = start + page_size
        items = filtered[start:end]
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
