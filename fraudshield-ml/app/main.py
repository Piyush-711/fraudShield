"""
FraudShield ML Service — FastAPI application entry point
Endpoints:
  GET  /health                — liveness probe
  POST /api/v1/predict        — synchronous ML fraud prediction
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any

from app.services.ml_service import load_model, predict

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("fraudshield.main")

# ─── Startup / Shutdown ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting FraudShield ML Service...")
    # Load model in a thread pool so we don't block the event loop
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, load_model)
    logger.info("✅ ML Service ready")
    yield
    logger.info("👋 Shutting down ML Service")


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FraudShield ML Service",
    description="AI-powered fraud scoring for the FraudShield platform",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    transactionId:    str             = Field(..., description="Unique transaction ID")
    userId:           str             = Field(..., description="User / customer ID")
    userEmail:        str | None      = None
    amount:           float           = Field(..., gt=0)
    currency:         str             = "USD"
    merchantName:     str | None      = None
    merchantCategory: str | None      = None
    cardType:         str | None      = None
    cardLast4:        str | None      = None
    transactionType:  str | None      = None
    locationCity:     str | None      = None
    locationCountry:  str | None      = None
    locationIp:       str | None      = None
    deviceType:       str | None      = None
    deviceOs:         str | None      = None

    model_config = {"extra": "allow"}


class FactorItem(BaseModel):
    factor:      str
    weight:      float
    explanation: str


class PredictResponse(BaseModel):
    transactionId: str
    riskScore:     int
    confidence:    int
    prediction:    str
    factors:       list[FactorItem]
    modelVersion:  str


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Monitoring"])
async def health():
    return {
        "status": "UP",
        "service": "fraudshield-ml",
        "version": "2.1.0",
    }


@app.post("/api/v1/predict", response_model=PredictResponse, tags=["ML"])
async def predict_fraud(request: PredictRequest):
    try:
        loop = asyncio.get_event_loop()
        payload = request.model_dump()
        result = await loop.run_in_executor(None, predict, payload)
        return PredictResponse(transactionId=request.transactionId, **result)
    except Exception as e:
        logger.error("Prediction failed for transaction %s: %s", request.transactionId, e)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
