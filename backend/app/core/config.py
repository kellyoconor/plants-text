from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./plants_texts.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # App settings
    secret_key: str = "dev-secret-key-change-in-production"
    debug: bool = True
    environment: str = "development"
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Plant Texts API"
    
    # OpenAI settings
    openai_api_key: str = "your-openai-api-key-here"  # Will be overridden by env
    
    # Braintrust settings
    braintrust_api_key: str = ""  # Optional - for prompt management and evals
    
    class Config:
        env_file = ".env"


settings = Settings()
