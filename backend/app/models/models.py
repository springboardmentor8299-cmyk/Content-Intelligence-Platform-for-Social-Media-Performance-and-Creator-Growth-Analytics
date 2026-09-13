from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="creator")  # creator, agency, marketing_team, admin
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("CreatorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    social_accounts = relationship("SocialAccount", back_populates="user", cascade="all, delete-orphan")
    content_items = relationship("ContentItem", back_populates="user", cascade="all, delete-orphan")
    demographics = relationship("AudienceDemographic", back_populates="user", cascade="all, delete-orphan")
    revenue_records = relationship("RevenueRecord", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    scheduled_reports = relationship("ScheduledReport", back_populates="user", cascade="all, delete-orphan")


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    niche = Column(String(100), default="Tech & Creative")
    total_reach = Column(Integer, default=0)
    total_followers = Column(Integer, default=0)
    avg_engagement_rate = Column(Float, default=0.0)
    agency_name = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # youtube, instagram, tiktok, linkedin, twitter, facebook
    account_handle = Column(String(100), nullable=False)
    account_name = Column(String(255), nullable=False)
    followers_count = Column(Integer, default=0)
    profile_url = Column(String(500), nullable=True)
    is_connected = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="social_accounts")


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), nullable=False)  # youtube, instagram, tiktok, linkedin, twitter
    title = Column(String(500), nullable=False)
    content_type = Column(String(50), default="video")  # video, reel, short, post
    url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    watch_time_hours = Column(Float, default=0.0)
    reach = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)

    user = relationship("User", back_populates="content_items")


class AudienceDemographic(Base):
    __tablename__ = "audience_demographics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(String(50), default="all")  # all, youtube, instagram, tiktok, linkedin
    category = Column(String(50), nullable=False)  # age, gender, country, device, active_hour
    label = Column(String(100), nullable=False)
    percentage = Column(Float, default=0.0)
    count = Column(Integer, default=0)

    user = relationship("User", back_populates="demographics")


class RevenueRecord(Base):
    __tablename__ = "revenue_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source = Column(String(50), nullable=False)  # sponsorship, ad_revenue, affiliate, brand_deal, subscription
    title = Column(String(255), nullable=False)
    brand_name = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="paid")  # paid, pending, contracted

    user = relationship("User", back_populates="revenue_records")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="alert")  # alert, milestone, report, payment
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_name = Column(String(255), nullable=False)
    frequency = Column(String(50), default="weekly")  # weekly, monthly
    format = Column(String(20), default="pdf")  # pdf, csv, excel
    email_recipient = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    last_generated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="scheduled_reports")
