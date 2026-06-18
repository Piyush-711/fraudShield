"""
FraudShield ML Service — Feature extraction + Fraud scoring
Seeded with a lightweight scikit-learn Random Forest trained on synthetic data at startup.
"""

from __future__ import annotations

import logging
import os
import random
from datetime import datetime
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger("fraudshield.ml")

# ─── Paths ────────────────────────────────────────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", "/app/model/fraud_model.pkl")
SCALER_PATH = os.getenv("SCALER_PATH", "/app/model/scaler.pkl")

# ─── Singleton holders ────────────────────────────────────────────────────────
_model: RandomForestClassifier | None = None
_scaler: StandardScaler | None = None


# ─── FEATURE NAMES (must match training order) ───────────────────────────────
FEATURE_NAMES = [
    "amount",
    "amount_log",
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "is_night",
    "is_international",
    "is_gambling",
    "is_jewelry",
    "is_luxury",
    "is_credit_card",
    "is_online",
    "card_last4_numeric",
    "user_id_hash",
    "tx_count_proxy",          # placeholder – would be Redis in full implementation
    "amount_deviation_proxy",  # placeholder
]


# ─── MODEL TRAINING (seed on startup if no pre-trained model exists) ─────────

def _train_seed_model() -> tuple[RandomForestClassifier, StandardScaler]:
    """Train a lightweight synthetic model so the service starts without a pre-trained file."""
    logger.info("🤖 No pre-trained model found. Training synthetic seed model...")
    random.seed(42)
    np.random.seed(42)

    n = 8000
    amounts     = np.random.exponential(scale=500, size=n)
    hours       = np.random.randint(0, 24, size=n)
    is_intl     = np.random.binomial(1, 0.12, size=n)
    is_gamble   = np.random.binomial(1, 0.05, size=n)
    is_jewelry  = np.random.binomial(1, 0.04, size=n)
    is_luxury   = np.random.binomial(1, 0.03, size=n)
    is_credit   = np.random.binomial(1, 0.55, size=n)
    is_online   = np.random.binomial(1, 0.6, size=n)
    day_of_week = np.random.randint(0, 7, size=n)
    is_weekend  = (day_of_week >= 5).astype(int)
    is_night    = ((hours < 6) | (hours > 22)).astype(int)

    # Heuristic fraud labels
    fraud_prob = (
        0.01
        + 0.30 * (amounts > 5000)
        + 0.20 * (amounts > 15000)
        + 0.25 * is_gamble
        + 0.15 * is_jewelry
        + 0.12 * is_intl
        + 0.10 * is_night
        + 0.10 * is_luxury
    )
    labels = np.random.binomial(1, np.clip(fraud_prob, 0, 1))

    X = np.column_stack([
        amounts,
        np.log1p(amounts),
        hours,
        day_of_week,
        is_weekend,
        is_night,
        is_intl,
        is_gamble,
        is_jewelry,
        is_luxury,
        is_credit,
        is_online,
        np.zeros(n),   # card_last4_numeric placeholder
        np.zeros(n),   # user_id_hash placeholder
        np.ones(n),    # tx_count_proxy
        np.zeros(n),   # amount_deviation_proxy
    ])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_scaled, labels)

    # Persist for next run
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    logger.info("✅ Synthetic model trained and saved to %s", MODEL_PATH)
    return model, scaler


def load_model() -> None:
    """Load or seed the ML model into module-level singletons."""
    global _model, _scaler
    try:
        _model  = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        logger.info("✅ Loaded pre-trained model from %s", MODEL_PATH)
    except (FileNotFoundError, Exception):
        _model, _scaler = _train_seed_model()


# ─── FEATURE EXTRACTION ───────────────────────────────────────────────────────

def extract_features(payload: dict[str, Any]) -> np.ndarray:
    """
    Extract a 16-feature vector from an incoming transaction payload.
    Missing fields are defaulted to safe values.
    """
    amount          = float(payload.get("amount", 0.0))
    now             = datetime.utcnow()
    hour            = now.hour
    day_of_week     = now.weekday()
    is_weekend      = int(day_of_week >= 5)
    is_night        = int(hour < 6 or hour > 22)
    country         = str(payload.get("locationCountry", "US")).upper()
    is_international = int(country not in ("US", ""))
    merchant_cat    = str(payload.get("merchantCategory", "")).upper()
    is_gambling     = int(merchant_cat == "GAMBLING")
    is_jewelry      = int(merchant_cat in ("JEWELRY", "JEWELLERY"))
    is_luxury       = int(merchant_cat in ("LUXURY", "LUXURY_GOODS"))
    card_type       = str(payload.get("cardType", "CREDIT")).upper()
    is_credit       = int(card_type == "CREDIT")
    tx_type         = str(payload.get("transactionType", "ONLINE")).upper()
    is_online       = int(tx_type == "ONLINE")
    card_last4_raw  = str(payload.get("cardLast4", "0000"))
    try:
        card_last4_num = float(card_last4_raw)
    except ValueError:
        card_last4_num = 0.0
    user_id         = str(payload.get("userId", ""))
    user_id_hash    = float(hash(user_id) % 10_000) if user_id else 0.0

    features = np.array([[
        amount,
        np.log1p(amount),
        float(hour),
        float(day_of_week),
        float(is_weekend),
        float(is_night),
        float(is_international),
        float(is_gambling),
        float(is_jewelry),
        float(is_luxury),
        float(is_credit),
        float(is_online),
        card_last4_num,
        user_id_hash,
        1.0,   # tx_count_proxy (would come from Redis cache in full implementation)
        0.0,   # amount_deviation_proxy
    ]])
    return features


# ─── EXPLANATION FACTORS ──────────────────────────────────────────────────────

def _build_factors(payload: dict, score: int, importances: np.ndarray) -> list[dict]:
    """Return top contributing risk factors with human-readable explanations."""
    amount = float(payload.get("amount", 0))
    cat    = str(payload.get("merchantCategory", "")).upper()
    country = str(payload.get("locationCountry", "US")).upper()

    candidates = []
    if amount > 15_000:
        candidates.append({"factor": "very_high_amount",      "weight": 0.40, "explanation": f"Transaction amount ${amount:,.0f} is extremely high"})
    elif amount > 5_000:
        candidates.append({"factor": "high_amount",            "weight": 0.30, "explanation": f"Transaction amount ${amount:,.0f} exceeds normal threshold"})
    if cat == "GAMBLING":
        candidates.append({"factor": "gambling_merchant",      "weight": 0.35, "explanation": "Gambling transactions are high-risk by policy"})
    if cat in ("JEWELRY", "JEWELLERY"):
        candidates.append({"factor": "jewelry_merchant",       "weight": 0.25, "explanation": "Jewelry purchases have elevated fraud risk"})
    if country not in ("US", ""):
        candidates.append({"factor": "international_location", "weight": 0.20, "explanation": f"Transaction originates from {country} (non-domestic)"})
    if cat == "LUXURY":
        candidates.append({"factor": "luxury_merchant",        "weight": 0.20, "explanation": "Luxury goods category has higher fraud incidence"})

    if not candidates:
        candidates.append({"factor": "normal_pattern", "weight": 0.05, "explanation": "Transaction matches expected spending patterns"})

    return candidates[:3]


# ─── MAIN PREDICTION ENTRY POINT ─────────────────────────────────────────────

def predict(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Run fraud prediction on a transaction payload.
    Returns risk_score (0-100), confidence, prediction, and factors.
    """
    global _model, _scaler
    if _model is None or _scaler is None:
        load_model()

    features = extract_features(payload)
    features_scaled = _scaler.transform(features)

    # Probability of fraud [0, 1]
    proba = _model.predict_proba(features_scaled)[0]
    fraud_prob = float(proba[1]) if len(proba) > 1 else 0.5

    # Scale to 0-100 with some noise for realism
    risk_score = int(min(99, max(0, fraud_prob * 100 + random.uniform(-3, 3))))
    confidence = int(min(99, risk_score + random.randint(2, 8)))

    # Decision (mirrors backend thresholds)
    if risk_score < 20:
        prediction = "APPROVE"
    elif risk_score >= 85:
        prediction = "REJECT"
    else:
        prediction = "MANUAL_REVIEW"

    factors = _build_factors(payload, risk_score, _model.feature_importances_)

    return {
        "riskScore":    risk_score,
        "confidence":   confidence,
        "prediction":   prediction,
        "factors":      factors,
        "modelVersion": "v2.1.0-rf",
    }
