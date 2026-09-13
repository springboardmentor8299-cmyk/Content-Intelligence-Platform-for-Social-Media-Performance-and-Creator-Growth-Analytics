from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    email: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "creator"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class CreatorProfileSchema(BaseModel):
    bio: Optional[str] = None
    niche: Optional[str] = None
    total_reach: int = 0
    total_followers: int = 0
    avg_engagement_rate: float = 0.0
    agency_name: Optional[str] = None
    website: Optional[str] = None

    class Config:
        from_attributes = True


class CreatorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    niche: Optional[str] = None
    agency_name: Optional[str] = None
    website: Optional[str] = None


class AccountSettingsUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    niche: Optional[str] = None
    agency_name: Optional[str] = None
    website: Optional[str] = None
    new_password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    profile: Optional[CreatorProfileSchema] = None

    class Config:
        from_attributes = True


# Social Account Schemas
class SocialAccountBase(BaseModel):
    platform: str
    account_handle: str
    account_name: str
    followers_count: int
    profile_url: Optional[str] = None
    is_connected: bool


class SocialAccountCreate(SocialAccountBase):
    pass


class SocialAccountResponse(SocialAccountBase):
    id: int
    last_synced_at: datetime

    class Config:
        from_attributes = True


# Content Item Schemas
class ContentItemBase(BaseModel):
    platform: str
    title: str
    content_type: str
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    saves: int = 0
    watch_time_hours: float = 0.0
    reach: int = 0
    impressions: int = 0
    engagement_rate: float = 0.0


class ContentItemCreate(ContentItemBase):
    pass


class ContentItemResponse(ContentItemBase):
    id: int
    published_at: datetime

    class Config:
        from_attributes = True


# Audience Demographics
class AudienceDemographicSchema(BaseModel):
    id: int
    platform: str
    category: str
    label: str
    percentage: float
    count: int

    class Config:
        from_attributes = True


# Revenue Schemas
class RevenueRecordBase(BaseModel):
    source: str
    title: str
    brand_name: Optional[str] = None
    amount: float
    currency: str = "USD"
    status: str = "paid"


class RevenueRecordCreate(RevenueRecordBase):
    pass


class RevenueRecordResponse(RevenueRecordBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Analytics Overview Response
class PlatformBreakdown(BaseModel):
    platform: str
    followers: int
    views: int
    engagement_rate: float
    posts_count: int


class AnalyticsOverview(BaseModel):
    total_followers: int
    total_views: int
    total_reach: int
    avg_engagement_rate: float
    total_revenue: float
    followers_growth_pct: float
    views_growth_pct: float
    revenue_growth_pct: float
    platforms: List[PlatformBreakdown]


# Content Comparison Schema
class ContentComparisonItem(BaseModel):
    content: ContentItemResponse
    metrics_score: float


class ContentComparisonResponse(BaseModel):
    items: List[ContentItemResponse]
    winner_id: Optional[int] = None
    metric_analysis: dict
