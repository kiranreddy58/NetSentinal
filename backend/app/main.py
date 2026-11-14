"""
NetSentinel 2.0 - FastAPI Main Application
Enterprise Big Data & Machine Learning Cybersecurity Intelligence Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Existing Core Router
from backend.app.routes.api import router as api_router

# NetSentinel 2.0 ML, Anomaly, Threat & Big Data Routers
from backend.app.routes.ml_routes import router as ml_router
from backend.app.routes.anomaly_routes import router as anomaly_router
from backend.app.routes.threat_routes import router as threat_router
from backend.app.routes.bigdata_routes import router as bigdata_router

app = FastAPI(
    title="NetSentinel 2.0 API",
    description="Distributed Big Data & Machine Learning Network Threat Intelligence Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(api_router, prefix="/api")
app.include_router(ml_router, prefix="/api")
app.include_router(anomaly_router, prefix="/api")
app.include_router(threat_router, prefix="/api")
app.include_router(bigdata_router, prefix="/api")


@app.get("/")
def root():
    return {
        "system": "NetSentinel 2.0",
        "title": "Big Data + Machine Learning Cybersecurity Intelligence Platform",
        "status": "ONLINE",
        "version": "2.0.0",
        "api_docs": "/docs",
        "modules": [
            "Hadoop MapReduce Big Data Analytics",
            "Supervised Machine Learning (Random Forest, Gradient Boosting, Baseline)",
            "Unsupervised Anomaly Detection (Isolation Forest)",
            "Model Explainability (XAI / Permutation Importance)",
            "Unified Threat Intelligence & Multi-Factor Risk Scoring",
            "Batch Inference Engine"
        ]
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False)
