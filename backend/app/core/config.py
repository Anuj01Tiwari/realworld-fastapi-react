import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RealWorld Conduit API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-1234567890")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: Default to sqlite for local dev/testing if DATABASE_URL not set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./realworld.db")

    class Config:
        case_sensitive = True

settings = Settings()
