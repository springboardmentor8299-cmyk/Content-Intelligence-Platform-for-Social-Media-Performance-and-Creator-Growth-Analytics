from typing import List, Optional, Literal
from pydantic import BaseModel, EmailStr
from datetime import datetime

UserRole = Literal["creator", "agency", "marketing_team", "admin"]

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = "creator"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class KPIMetric(BaseModel):
    id: str
    label: str
    value: str
    change: str
    is_positive: bool
    description: str

class PerformanceTrendPoint(BaseModel):
    date: str
    views: int
    engagement: float
    revenue: float

class PlatformDistribution(BaseModel):
    platform: str
    share: float
    color: str
    followers: int

class ContentItem(BaseModel):
    id: str
    title: str
    platform: str
    url: Optional[str] = None
    thumbnail: Optional[str] = None
    published_at: str
    views: int
    likes: int
    comments: int
    engagement_rate: float
    revenue: float
    status: str

class AnalyticsOverviewResponse(BaseModel):
    kpis: List[KPIMetric]
    performance_trends: List[PerformanceTrendPoint]
    platform_distribution: List[PlatformDistribution]
    recent_content: List[ContentItem]

class DemographicData(BaseModel):
    age_groups: List[dict]
    gender: List[dict]
    top_countries: List[dict]
