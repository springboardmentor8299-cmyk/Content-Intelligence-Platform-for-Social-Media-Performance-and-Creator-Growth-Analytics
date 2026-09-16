import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, BigInteger, Integer, JSON
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class ConnectedAccount(Base):
    __tablename__ = "connected_accounts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True) 
    platform = Column(String(50), nullable=False) # 'youtube', 'instagram', 'linkedin', etc.
    platform_user_id = Column(String(255), nullable=True)
    username = Column(String(255), nullable=False)
    
    # OAuth Tokens
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    followers_count = Column(BigInteger, default=0)
    total_views = Column(BigInteger, default=0)
    video_count = Column(Integer, default=0)
    is_connected = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata for icon colors and extra details if needed
    icon_bg = Column(String(20), default="#2563eb")
    profile_picture_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
