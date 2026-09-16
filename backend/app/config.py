from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./creatoriq.db"
    
    # Frontend URL for OAuth redirects
    FRONTEND_URL: str = "http://localhost:5173"

    # YouTube API
    YOUTUBE_CLIENT_ID: Optional[str] = None
    YOUTUBE_CLIENT_SECRET: Optional[str] = None
    YOUTUBE_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/callback/youtube"

    # Instagram API
    INSTAGRAM_CLIENT_ID: Optional[str] = None
    INSTAGRAM_CLIENT_SECRET: Optional[str] = None
    INSTAGRAM_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/callback/instagram"

    # LinkedIn API
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/callback/linkedin"

    # TikTok API
    TIKTOK_CLIENT_KEY: Optional[str] = None
    TIKTOK_CLIENT_SECRET: Optional[str] = None
    TIKTOK_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/callback/tiktok"

    # Twitter/X API
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None
    TWITTER_REDIRECT_URI: str = "http://localhost:8000/api/v1/social/callback/twitter"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
