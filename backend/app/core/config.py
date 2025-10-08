from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError
from typing import Optional, List


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./plants_texts.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # App settings - NO DEFAULTS for security-critical values
    secret_key: str
    debug: bool = False  # Default to False for safety
    environment: str = "development"
    
    # Admin API key - Required for admin endpoints
    admin_api_key: str = ""  # Must be set to use admin endpoints
    
    # Twilio settings
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # Production settings
    allowed_hosts: str = "*"  # Comma-separated list
    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://localhost:3001,http://localhost:8080,http://localhost"  # Comma-separated list
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Plant Texts API"
    
    # OpenAI settings
    openai_api_key: str = "your-openai-api-key-here"  # Will be overridden by env
    
    # Braintrust settings
    braintrust_api_key: str = ""  # Optional - for prompt management and evals
    
    # Database connection pool settings
    db_pool_size: int = 20
    db_max_overflow: int = 40
    db_pool_recycle: int = 3600
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Ensure secret key is strong enough"""
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        if v == "dev-secret-key-change-in-production":
            raise ValueError('SECRET_KEY cannot be the default value')
        return v
    
    @field_validator('allowed_hosts')
    @classmethod
    def validate_allowed_hosts(cls, v: str, info) -> str:
        """Warn if allowed_hosts is wildcard in production"""
        environment = info.data.get('environment', 'development')
        if environment == "production" and v == "*":
            import warnings
            warnings.warn("allowed_hosts is set to '*' in production - this is not recommended")
        return v
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    def get_allowed_hosts(self) -> List[str]:
        """Parse allowed hosts from comma-separated string"""
        if self.allowed_hosts == "*":
            return ["*"]
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]
    
    class Config:
        env_file = ".env"


settings = Settings()
