"""
Application Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "FinSight AI"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Alpha Vantage (Stock Data)
    ALPHA_VANTAGE_API_KEY: Optional[str] = None

    # Pinecone (Vector DB)
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: Optional[str] = None
    PINECONE_INDEX: Optional[str] = None

    # Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Sentry
    SENTRY_DSN: Optional[str] = None

    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379"

    # Email
    RESEND_API_KEY: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3004"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3004,http://localhost:3001"

    @property
    def cors_origins_list(self) -> list:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
