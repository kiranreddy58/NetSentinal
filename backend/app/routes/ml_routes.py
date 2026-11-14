"""
FastAPI Routes for Machine Learning & Explainability
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from backend.app.services.ml_service import MLDataService
from backend.app.schemas.ml_models import BatchInferenceRequest
from ml.inference.engine import engine

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.get("/models")
def get_registered_models():
    """Retrieve all trained models in registry with hyperparams and test scores."""
    return MLDataService.get_models_registry()


@router.get("/metrics")
def get_metrics():
    """Retrieve full evaluation metrics dictionary across all models."""
    return MLDataService.get_model_comparisons()


@router.get("/comparison")
def get_model_comparison():
    """Retrieve clean tabular model comparison metrics."""
    comparisons = MLDataService.get_model_comparisons()
    summary = []
    for c in comparisons:
        summary.append({
            "model_name": c.get("model_name"),
            "accuracy": c.get("accuracy"),
            "precision": c.get("precision"),
            "recall": c.get("recall"),
            "f1_score": c.get("f1_score"),
            "macro_f1": c.get("macro_f1"),
            "weighted_f1": c.get("weighted_f1"),
            "roc_auc": c.get("roc_auc"),
            "pr_auc": c.get("pr_auc"),
            "false_positive_rate": c.get("false_positive_rate"),
            "false_negative_rate": c.get("false_negative_rate"),
            "training_time_seconds": c.get("training_time_seconds"),
            "prediction_time_seconds": c.get("prediction_time_seconds"),
            "model_size_mb": c.get("model_size_mb")
        })
    return summary


@router.get("/feature-importance")
def get_feature_importance():
    """Retrieve top ranked features for Random Forest, Gradient Boosting, Baseline."""
    return MLDataService.get_feature_importances()


@router.get("/confusion-matrix")
def get_confusion_matrix(model: str = Query("Random Forest")):
    """Retrieve confusion matrix for specific model."""
    comparisons = MLDataService.get_model_comparisons()
    target = next((c for c in comparisons if c.get("model_name", "").lower() == model.lower()), None)
    if not target:
        if comparisons:
            target = comparisons[0]
        else:
            raise HTTPException(status_code=404, detail="No models found")
    return {
        "model_name": target.get("model_name"),
        "confusion_matrix": target.get("confusion_matrix"),
        "accuracy": target.get("accuracy"),
        "f1_score": target.get("f1_score")
    }


@router.get("/roc")
def get_roc_curve(model: str = Query("Random Forest")):
    """Retrieve ROC curve points (FPR vs TPR) for specific model."""
    comparisons = MLDataService.get_model_comparisons()
    target = next((c for c in comparisons if c.get("model_name", "").lower() == model.lower()), None)
    if not target:
        if comparisons:
            target = comparisons[0]
        else:
            raise HTTPException(status_code=404, detail="No models found")
    return {
        "model_name": target.get("model_name"),
        "roc_auc": target.get("roc_auc"),
        "curve": target.get("roc_curve", [])
    }


@router.get("/precision-recall")
def get_pr_curve(model: str = Query("Random Forest")):
    """Retrieve Precision-Recall curve points for specific model."""
    comparisons = MLDataService.get_model_comparisons()
    target = next((c for c in comparisons if c.get("model_name", "").lower() == model.lower()), None)
    if not target:
        if comparisons:
            target = comparisons[0]
        else:
            raise HTTPException(status_code=404, detail="No models found")
    return {
        "model_name": target.get("model_name"),
        "pr_auc": target.get("pr_auc"),
        "curve": target.get("pr_curve", [])
    }


@router.get("/predictions")
def get_sample_predictions(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=500)):
    """Retrieve sample test predictions."""
    return MLDataService.get_threat_records(page=page, page_size=page_size)


@router.get("/training-history")
def get_training_history():
    """Retrieve metadata about training iterations and timings."""
    comparisons = MLDataService.get_model_comparisons()
    history = []
    for c in comparisons:
        history.append({
            "model_name": c.get("model_name"),
            "training_time_s": c.get("training_time_seconds"),
            "evaluation_time_s": c.get("prediction_time_seconds"),
            "model_size_mb": c.get("model_size_mb"),
            "f1_score": c.get("f1_score"),
            "status": "CONVERGED"
        })
    return history


@router.get("/explainability")
def get_explainability():
    """Retrieve SHAP/Permutation feature rankings and local flow explanations."""
    return MLDataService.get_explainability_report()


@router.post("/predict-batch")
def predict_batch(req: BatchInferenceRequest):
    """Run real-time batch inference using selected model."""
    try:
        preds = engine.predict_batch(req.model_name, req.records)
        return {
            "status": "SUCCESS",
            "model": req.model_name,
            "count": len(preds),
            "predictions": preds
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
