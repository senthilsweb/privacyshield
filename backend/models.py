# models.py
"""
Data Models for Privacy Shield API
-------------
Author: Senthilnathan Karuppaiah & Claude.ai
Created: 29-Dec-2024
Last Modified: 30-Dec-2024
================================

This module defines all the Pydantic models used for request/response validation
in the Privacy Shield API. These models ensure proper data structure and validation
for all API operations.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class EntityInfo(BaseModel):
    """Model for detected PII entity information"""
    type: str
    score: float
    start: int
    end: int
    text: str

class TextRequest(BaseModel):
    """Request model for text processing endpoints"""
    text: str
    faker_seed: Optional[int] = None
    default_prompt_template: Optional[str] = None
    default_temperature: Optional[float] = None

class RedactionRequest(BaseModel):
    """Request model for LLM processing endpoints"""
    text: str
    prompt_template: Optional[str] = None
    temperature: Optional[float] = None
    openai_api_key: Optional[str] = None
    default_prompt_template: Optional[str] = None
    default_temperature: Optional[float] = None

class PrivacyResponse(BaseModel):
    """Response model for all text processing endpoints"""
    processed_text: str
    entities: List[EntityInfo]
    message: str = "Anonymized with fake data: text processed successfully."

class RedactionRequest(BaseModel):
    text: str
    prompt_template: Optional[str] = None
    temperature: Optional[float] = None
    openai_api_key: Optional[str] = None
    model: Optional[str] = "gpt-3.5-turbo"

class EnhancedPrivacyResponse(BaseModel):
    original_text: str
    anonymized_text: str
    faked_text: str
    faked_processed_text: str
    processed_text: str
    model_used: str
    temperature_used: float
    prompt_used: str
    entities: List[EntityInfo]
    message: str = "Enhanced text processed successfully"