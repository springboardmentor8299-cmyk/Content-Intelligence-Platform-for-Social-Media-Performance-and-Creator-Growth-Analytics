from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models import UserRole

# Auth & User Schemas
class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.CREATOR

class LoginSchema(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: UserRole
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Social Integration Schemas
class ConnectAccountSchema(BaseModel):
    platform: str  # instagram, youtube, linkedin
    account_handle: str
    access_token: Optional[str] = None

class SocialAccountResponse(BaseModel):
    id: str
    platform: str
    account_handle: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    follower_count: int
    connected_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Content Schemas
class ContentPostResponse(BaseModel):
    id: str
    platform: str
    title: str
    post_url: Optional[str]
    thumbnail_url: Optional[str]
    views: int
    likes: int
    comments: int
    shares: int
    engagement_rate: float
    published_at: datetime

    class Config:
        from_attributes = True

# Revenue Schemas
class RevenueRecordCreate(BaseModel):
    title: str
    source_type: str
    amount: float
    brand_name: Optional[str] = None
    status: Optional[str] = "Completed"

class RevenueRecordResponse(BaseModel):
    id: str
    title: str
    source_type: str
    amount: float
    brand_name: Optional[str]
    status: str
    deal_date: datetime

    class Config:
        from_attributes = True

# Agency Schemas
class AgencyClientResponse(BaseModel):
    id: str
    client_name: str
    channel_handle: str
    tier: str
    monthly_views: int
    commission_pct: float
    monthly_revenue: float
    status: str

    class Config:
        from_attributes = True
