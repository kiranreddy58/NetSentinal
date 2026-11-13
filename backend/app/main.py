"""
NetSentinel - FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.api import router as api_router

app = FastAPI(
    title="NetSentinel API",
    description="Distributed Network Traffic Intelligence & Attack Pattern Detection System API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "NetSentinel",
        "description": "Distributed Network Traffic Intelligence & Attack Pattern Detection System",
        "status": "ONLINE",
        "api_docs": "/docs"
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=False)
