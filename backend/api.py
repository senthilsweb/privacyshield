# api.py
"""
FastAPI Router for Privacy Protection and PII Processing
-------------
Author: Senthilnathan Karuppaiah & Claude.ai
Created: 29-Dec-2024
Last Modified: 30-Dec-2024
=====================================================

This module implements the REST API endpoints for privacy protection and PII
processing using the PrivacyShield core functionality.
"""

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from models import (
    TextRequest,
    RedactionRequest,
    PrivacyResponse,
    EnhancedPrivacyResponse
)
from core import PrivacyShield
from config import logger

app = FastAPI(
    title="Privacy Shield API",
    description="API for PII detection, anonymization, and text transformation",
    version="1.0.0"
)

# CORS — env-configurable. Default "*" for local dev; tighten in production
# via CORS_ORIGINS=https://example.com,https://app.example.com
_cors_origins = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

privacy_shield = PrivacyShield()


@app.get("/health")
async def health() -> dict:
    """Lightweight liveness probe used by Docker/K8s healthchecks."""
    return {"status": "ok"}


# Built-in long descriptions for the most common Presidio entity types so the
# UI can render meaningful tooltips. Anything not listed falls back to a
# title-cased version of the entity key.
_ENTITY_DESCRIPTIONS: dict = {
    "PERSON":              "Names of individuals (first, last, full names).",
    "EMAIL_ADDRESS":       "RFC 5322 email addresses.",
    "PHONE_NUMBER":        "Phone numbers in various international formats.",
    "CREDIT_CARD":         "Credit card numbers (Visa, MasterCard, Amex, etc.).",
    "IBAN_CODE":           "International Bank Account Numbers.",
    "US_SSN":              "US Social Security Numbers.",
    "US_ITIN":             "US Individual Taxpayer Identification Numbers.",
    "US_PASSPORT":         "US passport numbers.",
    "US_DRIVER_LICENSE":   "US driver license numbers.",
    "US_BANK_NUMBER":      "US bank account numbers.",
    "IP_ADDRESS":          "IPv4 / IPv6 addresses.",
    "URL":                 "Web URLs.",
    "DATE_TIME":           "Dates and timestamps.",
    "LOCATION":            "Cities, countries, addresses, and other places.",
    "NRP":                 "Nationality, religious or political group.",
    "MEDICAL_LICENSE":     "Medical license numbers.",
    "CRYPTO":              "Crypto wallet addresses (e.g. Bitcoin).",
    "UK_NHS":              "UK National Health Service numbers.",
    "AU_ABN":              "Australian Business Numbers.",
    "AU_ACN":              "Australian Company Numbers.",
    "AU_TFN":              "Australian Tax File Numbers.",
    "AU_MEDICARE":         "Australian Medicare numbers.",
    "ES_NIF":              "Spanish National Identity Numbers (NIF).",
    "IT_FISCAL_CODE":      "Italian fiscal codes.",
    "IT_DRIVER_LICENSE":   "Italian driver license numbers.",
    "IT_VAT_CODE":         "Italian VAT codes.",
    "IT_PASSPORT":         "Italian passport numbers.",
    "IT_IDENTITY_CARD":    "Italian identity card numbers.",
    "SG_NRIC_FIN":         "Singaporean NRIC/FIN.",
}


@app.get("/entities")
async def list_entities(language: str = "en") -> dict:
    """
    List PII entity types supported by the underlying Presidio analyzer.

    Reflects the recognizers actually loaded at runtime, so any custom
    recognizers added in the future appear automatically. Used by the
    *Entities* page so the UI never hardcodes the list.
    """
    try:
        types = sorted(privacy_shield.analyzer.get_supported_entities(language=language))
    except Exception as e:
        logger.error(f"Failed to enumerate entities: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

    items = [
        {
            "type": t,
            "label": t.replace("_", " ").title(),
            "description": _ENTITY_DESCRIPTIONS.get(t, ""),
        }
        for t in types
    ]
    return {"language": language, "count": len(items), "entities": items}


# Prompt templates router — always on. Reads from $PROMPTS_DIR (default ./prompts).
from prompts_router import router as prompts_router  # noqa: E402, WPS433
app.include_router(prompts_router)

# Optional Markitdown router (placeholder, gated behind env flag).
if os.getenv("ENABLE_CONVERT", "false").lower() == "true":
    from markitdown_router import router as markitdown_router  # noqa: WPS433
    app.include_router(markitdown_router)

@app.post("/detect-pii-entities", response_model=PrivacyResponse)
async def detect_pii_entities(request: TextRequest):
    """Detects PII entities and returns text with entity placeholders"""
    try:
        result = privacy_shield.detect_pii_with_placeholders(request.text)
        return PrivacyResponse(
            processed_text=result["processed_text"],
            entities=result["entities"],
            message="PII entities detected successfully"
        )
    except Exception as e:
        logger.error(f"Error detecting PII entities: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anonymize-with-fake-data", response_model=PrivacyResponse)
async def anonymize_with_fake_data(request: TextRequest):
    """Anonymize text by replacing PII with synthetic data"""
    try:
        result = privacy_shield.anonymize_with_fake_data(
            text=request.text,
            faker_seed=request.faker_seed,
            default_prompt_template=request.default_prompt_template,
            default_temperature=request.default_temperature
        )
        return PrivacyResponse(**result)
        
    except Exception as e:
        logger.error(f"Error anonymizing text: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anonymize-and-transform", response_model=EnhancedPrivacyResponse)
async def anonymize_and_transform(request: RedactionRequest):
    try:
        result = privacy_shield.anonymize_and_transform(
            text=request.text,
            prompt_template=request.prompt_template,
            openai_api_key=request.openai_api_key,
            temperature=request.temperature,
            model=request.model
        )
        return EnhancedPrivacyResponse(**result)
    except Exception as e:
        logger.error(f"Error in anonymization and transformation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Static SPA mount (must be LAST so /api routes win over the catch-all).
# In production, the Vite build is copied to backend/static/ inside Docker.
# In local dev, the directory may not exist; the mount is conditional.
# ---------------------------------------------------------------------------
_static_dir = Path(__file__).parent / "static"
if _static_dir.is_dir():
    app.mount(
        "/",
        StaticFiles(directory=str(_static_dir), html=True),
        name="spa",
    )
    logger.info(f"Serving SPA from {_static_dir}")
else:
    logger.info("No static/ directory; SPA mount skipped (dev mode).")
