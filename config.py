# config.py
"""
Configuration Management and Logging Setup
-------------
Author: Senthilnathan Karuppaiah & Claude.ai
Created: 29-Dec-2024
Last Modified: 30-Dec-2024
=======================================

This module manages application configuration and logging setup for the Privacy Shield
application. It handles environment variables, default settings, and logging
configuration for all components.

Key Features:
------------
- Environment variable management with type validation
- Centralized logging configuration
- Default settings management
- Cache configuration for performance optimization

Configuration Parameters:
-----------------------
- API keys and service credentials
- Model parameters and thresholds
- Logging levels and destinations
- Performance optimization settings

Usage:
------
Import the config module to access application settings and logging
configuration throughout the application.
"""
import logging
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path
import os

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(logs_dir / "privacy_shield.log"),
        logging.StreamHandler()
    ]
)

class Settings(BaseSettings):
    """Environment variables and defaults configuration"""
    OPENAI_API_KEY: str = ""
    DEFAULT_TEMPERATURE: float = 0
    DEFAULT_PROMPT_TEMPLATE: str = "Rewrite this text into an official, short email:\n\n{anonymized_text}"
    DEFAULT_FAKER_SEED: int | None = None
    LOG_LEVEL: str = "INFO"
    DEFAULT_MODEL: str = 'gpt-3.5-turbo'
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

# Create logger instance
logger = logging.getLogger("privacy_shield")
logger.setLevel(get_settings().LOG_LEVEL)