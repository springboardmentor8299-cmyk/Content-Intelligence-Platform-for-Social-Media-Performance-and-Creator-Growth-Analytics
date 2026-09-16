from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class SocialConnection(BaseModel):
    id: str
    platform: str
    username: str
    platform_user_id: Optional[str] = None
    followers: int
    is_connected: bool
    status: str
    last_synced: str
    icon_bg: str

class SyncRequest(BaseModel):
    platform: str
    creator_id: Optional[str] = "creator-001"

class SyncResponse(BaseModel):
    status: str
    platform: str
    records_synced: int
    synced_at: str
    metrics_summary: dict

class SponsorshipCampaign(BaseModel):
    id: str
    brand_name: str
    brand_logo: Optional[str] = None
    campaign_title: str
    platform: str
    status: str # active, completed, negotiating, pending_review
    contract_amount: float
    paid_amount: float
    deliverables: str
    due_date: str
    roi_multiplier: float

class RevenueBreakdown(BaseModel):
    period: str
    sponsorships: float
    adsense: float
    affiliates: float
    merchandise: float
    total: float

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: str # milestone, alert, sponsorship, sync, system
    timestamp: str
    is_read: bool
    action_url: Optional[str] = None

class ReportExportRequest(BaseModel):
    report_type: str # executive_summary, audience_demographics, monetization_audit, cross_platform
    date_range: str # 7d, 30d, 90d, custom
    format: str # pdf, csv, json
    platforms: List[str]

class ReportExportResponse(BaseModel):
    export_id: str
    report_name: str
    file_format: str
    download_url: str
    generated_at: str
    size_kb: int
    status: str
