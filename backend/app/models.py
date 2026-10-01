import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, BigInteger, Integer, JSON, Float, Text
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

class SponsorshipDeal(Base):
    __tablename__ = "sponsorship_deals"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    brand_name = Column(String(100), nullable=False)
    brand_logo = Column(String, nullable=True)
    campaign_title = Column(String(255), nullable=False)
    platform = Column(String(50), default="YouTube")
    status = Column(String(50), default="active") # active, completed, negotiating, paid
    contract_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    deliverables = Column(String(255), default="")
    due_date = Column(String(50), nullable=True)
    roi_multiplier = Column(Float, default=3.2)
    payment_status = Column(String(50), default="partial") # unpaid, partial, paid
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String(50), default="alert") # milestone, alert, sponsorship, sync, security
    category = Column(String(50), default="revenue") # revenue, sync, milestone, security
    timestamp = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class ReportExport(Base):
    __tablename__ = "report_exports"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True)
    report_name = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False) # revenue_audit, executive_summary, audience_demographics, sponsorship_roi
    date_range = Column(String(50), default="30d")
    file_format = Column(String(20), default="CSV") # CSV, PDF, JSON
    file_content = Column(String, nullable=True)
    size_kb = Column(Integer, default=0)
    status = Column(String(50), default="ready")
    download_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    sub = Column(String(255), nullable=True)
    frequency = Column(String(50), default="Weekly")
    format = Column(String(20), default="PDF")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

