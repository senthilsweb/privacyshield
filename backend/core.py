# core.py
"""
Core Privacy Shield Business Logic
-------------
Author: Senthilnathan Karuppaiah & Claude.ai
Created: 29-Dec-2024
Last Modified: 30-Dec-2024
================================

This module implements the core business logic for PII detection, anonymization,
and text transformation. It serves as the bridge between the API layer and various
privacy protection services (Presidio, LangChain, etc.).

Key Components:
-------------
- PrivacyShield: Main class handling all privacy operations
    - PII detection using Presidio Analyzer
    - Text anonymization with synthetic data
    - LLM-based text processing with privacy preservation
    - Original data restoration

Implementation Notes:
-------------------
- Uses reversible anonymization for data restoration
- Implements comprehensive logging
- Maintains stateless operations for scalability
"""

from typing import Dict, List, Optional
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
from langchain_experimental.data_anonymizer import PresidioReversibleAnonymizer
from langchain_openai import ChatOpenAI
from langchain_core.prompts.prompt import PromptTemplate
from config import logger, get_settings

settings = get_settings()

class PrivacyShield:
    def __init__(self):
        logger.info("Initializing PrivacyShield")
        self.analyzer = AnalyzerEngine()
        self.anonymizer = AnonymizerEngine()
        self.default_anonymizer = PresidioReversibleAnonymizer(
            faker_seed=settings.DEFAULT_FAKER_SEED
        )

    def analyze_entities(self, text: str) -> List[Dict]:
        """Helper method to analyze entities in text"""
        analyzer_results = self.analyzer.analyze(
            text=text,
            language='en'
        )
        
        entities = []
        for result in analyzer_results:
            entity = {
                "type": result.entity_type,
                "score": result.score,
                "start": result.start,
                "end": result.end,
                "text": text[result.start:result.end]
            }
            entities.append(entity)
        
        return sorted(entities, key=lambda x: x["start"])

    def detect_pii_with_placeholders(self, text: str) -> Dict:
        """[Previous docstring remains the same]"""
        try:
            # Get entities
            entities = self.analyze_entities(text)
            processed_text = text

            # Sort entities by length of the text (longest first) to handle overlapping entities
            sorted_for_replacement = sorted(entities, key=lambda x: len(x["text"]), reverse=True)
            
            # Replace each entity with its type placeholder
            for entity in sorted_for_replacement:
                processed_text = processed_text.replace(
                    entity["text"],
                    f"<{entity['type']}>"
                )

            return {
                "processed_text": processed_text,
                "entities": entities
            }
        except Exception as e:
            logger.error(f"Error in detect_pii_with_placeholders: {str(e)}", exc_info=True)
            raise

    def anonymize_with_fake_data(self, 
                                text: str, 
                                faker_seed: Optional[int] = None, 
                                default_prompt_template: Optional[str] = None,
                                default_temperature: Optional[float] = None) -> Dict:
        """
        Anonymize text by replacing PII with synthetic data.
        Also returns detected entities.
        """
        try:
            logger.info("Starting text anonymization with fake data")
            
            # Original analysis and anonymization
            entities = self.analyze_entities(text)
            anonymized_text = text
            
            
            # Create both anonymized and faked versions
            for entity in sorted(entities, key=lambda x: len(x["text"]), reverse=True):
                anonymized_text = anonymized_text.replace(entity["text"], f"<{entity['type']}>")
 
            # Generate faked version using reversible anonymizer
            faked_text = self.default_anonymizer.anonymize(text)

            logger.info("Text anonymization completed successfully")
            return {
                "processed_text": faked_text,
                "entities": entities
            }
            
        except Exception as e:
            logger.error(f"Error during anonymization: {str(e)}", exc_info=True)
            raise

    def anonymize_and_transform(self, 
                          text: str,
                          prompt_template: Optional[str] = None,
                          openai_api_key: Optional[str] = None,
                          temperature: Optional[float] = None,
                          model: Optional[str] = None) -> Dict:
        try:
            # Original analysis and anonymization
            entities = self.analyze_entities(text)
            anonymized_text = text
            
            
            # Create both anonymized and faked versions
            for entity in sorted(entities, key=lambda x: len(x["text"]), reverse=True):
                anonymized_text = anonymized_text.replace(entity["text"], f"<{entity['type']}>")
                an_text = anonymized_text
            
            # Generate faked version using reversible anonymizer
            faked_text = self.default_anonymizer.anonymize(text)

            print(text)
            print(an_text)
            print(faked_text)
            anonymized_text = faked_text
            # LLM processing
            template = f"{prompt_template or settings.DEFAULT_PROMPT_TEMPLATE}\n\n{{anonymized_text}}"
            temp = temperature if temperature is not None else settings.DEFAULT_TEMPERATURE
            llm_model = model or settings.DEFAULT_MODEL or "gpt-3.5-turbo"
            
            prompt = PromptTemplate.from_template(template)
            llm = ChatOpenAI(
                model=llm_model,
                api_key=openai_api_key or settings.OPENAI_API_KEY,
                temperature=temp
            )
            
            chain = prompt | llm

           
            faked_processed_text = chain.invoke({"anonymized_text": anonymized_text}).content
            processed_text = self.default_anonymizer.deanonymize(faked_processed_text)
            #print(processed_text)
            #print()
            return {
                "original_text": text,
                "anonymized_text": an_text,
                "faked_text": faked_text,
                "faked_processed_text": faked_processed_text,
                "processed_text": processed_text,
                "model_used": llm_model,
                "temperature_used": temp,
                "prompt_used": template,
                "entities": entities
            }
                
        except Exception as e:
            logger.error(f"Error during transformation: {str(e)}", exc_info=True)
            raise