"""
Pydantic Schemas for NetSentinel 2.0 ML, Anomaly Detection & Threat Intelligence
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ModelMetadata(BaseModel):
    name: str
    algorithm: str
    version: str
    status: str
    artifact: str
    parameters: Dict[str, Any]
    accuracy: float
    f1_score: float
    roc_auc: float
    model_size_mb: float

class ConfusionMatrixSchema(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int
    matrix: List[List[int]]

class ModelEvaluationSchema(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    macro_f1: float
    weighted_f1: float
    roc_auc: float
    pr_auc: float
    false_positive_rate: float
    false_negative_rate: float
    confusion_matrix: ConfusionMatrixSchema
    classification_report: Dict[str, Any]
    training_time_seconds: float
    prediction_time_seconds: float
    model_size_mb: float

class CurvePoint(BaseModel):
    fpr: Optional[float] = None
    tpr: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class AnomalySummarySchema(BaseModel):
    model_name: str
    contamination: float
    training_time_seconds: float
    total_test_flows_evaluated: int
    total_anomalies_flagged: int
    anomaly_percentage: float
    attack_capture_rate_unsupervised: float
    benign_false_alarm_rate: float
    score_distribution: List[Dict[str, Any]]
    sample_anomalies: List[Dict[str, Any]]

class ThreatSummarySchema(BaseModel):
    total_flows_evaluated: int
    critical_threats: int
    high_threats: int
    medium_threats: int
    low_threats: int
    threat_percentage: float
    scoring_weights: Dict[str, str]

class ThreatRecordSchema(BaseModel):
    record_id: int
    source_ip: str
    destination_ip: str
    destination_port: int
    protocol: str
    flow_duration_us: float
    total_packets: int
    total_bytes: int
    ground_truth_label: str
    random_forest_prediction: str
    rf_probability: float
    gradient_boosting_prediction: str
    gb_probability: float
    isolation_forest_anomaly_score: float
    is_anomaly: bool
    risk_score: float
    severity: str
    detection_method: str
    explanation: str

class BatchInferenceRequest(BaseModel):
    model_name: str
    records: List[Dict[str, Any]]
