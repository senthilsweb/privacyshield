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

from fastapi import FastAPI, HTTPException
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

privacy_shield = PrivacyShield()

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