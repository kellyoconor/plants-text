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
    
    # Twilio settings
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # Plivo settings removed - using demo mode
    
    # Production settings
    allowed_hosts: list = ["*"]  # Configure for production
    cors_origins: list = ["http://localhost:3000"]  # Configure for production
    
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
