import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CreatorIQ API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT & Auth - Configurable via SECRET_KEY env variable, dev default for local
    SECRET_KEY: str = os.getenv("SECRET_KEY", "creatoriq-dev-insecure-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: SQLite default for local, or PostgreSQL if configured via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./creator_iq.db")

    # Future Social Media API Integration Credentials (Environment Variables)
    # YouTube Data & Analytics API
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    YOUTUBE_CLIENT_ID: str = os.getenv("YOUTUBE_CLIENT_ID", "")
    YOUTUBE_CLIENT_SECRET: str = os.getenv("YOUTUBE_CLIENT_SECRET", "")
    YOUTUBE_REDIRECT_URI: str = os.getenv("YOUTUBE_REDIRECT_URI", "")

    # Meta Graph API (Instagram Graph API & Facebook Graph API)
    META_APP_ID: str = os.getenv("META_APP_ID", "")
    META_APP_SECRET: str = os.getenv("META_APP_SECRET", "")
    INSTAGRAM_REDIRECT_URI: str = os.getenv("INSTAGRAM_REDIRECT_URI", "")
    FACEBOOK_REDIRECT_URI: str = os.getenv("FACEBOOK_REDIRECT_URI", "")

    # RapidAPI — Glavier Instagram API
    RAPIDAPI_KEY: str = os.getenv("RAPIDAPI_KEY", "")
    RAPIDAPI_HOST: str = os.getenv("RAPIDAPI_HOST", "instagram-bulk-profile-scrapper.p.rapidapi.com")

    # Facebook Credentials
    FACEBOOK_CLIENT_ID: str = os.getenv("FACEBOOK_CLIENT_ID", "")
    FACEBOOK_CLIENT_SECRET: str = os.getenv("FACEBOOK_CLIENT_SECRET", "")

    # X (Twitter) API Integration
    X_CLIENT_ID: str = os.getenv("X_CLIENT_ID", "")
    X_CLIENT_SECRET: str = os.getenv("X_CLIENT_SECRET", "")
    X_API_KEY: str = os.getenv("X_API_KEY", "")
    X_API_SECRET: str = os.getenv("X_API_SECRET", "")
    X_REDIRECT_URI: str = os.getenv("X_REDIRECT_URI", "")

    # LinkedIn Marketing & Community Management API
    LINKEDIN_CLIENT_ID: str = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    LINKEDIN_REDIRECT_URI: str = os.getenv("LINKEDIN_REDIRECT_URI", "")
    
    # CORS - Configurable via FRONTEND_URL env variable while keeping localhost origins
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "")
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    def __init__(self, **values):
        super().__init__(**values)
        frontend_url = self.FRONTEND_URL or os.getenv("FRONTEND_URL", "")
        if frontend_url:
            for url in frontend_url.split(","):
                clean = url.strip().rstrip("/")
                if clean and clean not in self.BACKEND_CORS_ORIGINS:
                    self.BACKEND_CORS_ORIGINS.append(clean)

    def get_cors_origins(self) -> List[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        frontend_url = self.FRONTEND_URL or os.getenv("FRONTEND_URL", "")
        if frontend_url:
            for url in frontend_url.split(","):
                clean = url.strip().rstrip("/")
                if clean and clean not in origins:
                    origins.append(clean)
        return origins

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()

