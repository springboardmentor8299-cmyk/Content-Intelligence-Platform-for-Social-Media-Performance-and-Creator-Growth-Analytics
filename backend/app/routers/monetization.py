from typing import List
from fastapi import APIRouter
from app.schemas_extended import SponsorshipCampaign, RevenueBreakdown

router = APIRouter()

SPONSORSHIPS_DB = [
    {
        "id": "sp-01",
        "brand_name": "Notion AI",
        "brand_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&h=60&fit=crop",
        "campaign_title": "Productivity Reimagined: AI Integrated Workflows",
        "platform": "YouTube",
        "status": "active",
        "contract_amount": 5500.0,
        "paid_amount": 2750.0,
        "deliverables": "1 Dedicated Video + 2 YouTube Shorts",
        "due_date": "2026-09-05",
        "roi_multiplier": 3.4
    },
    {
        "id": "sp-02",
        "brand_name": "NordVPN",
        "brand_logo": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=60&h=60&fit=crop",
        "campaign_title": "Summer Cybersecurity & Data Privacy Awareness",
        "platform": "YouTube",
        "status": "completed",
        "contract_amount": 4200.0,
        "paid_amount": 4200.0,
        "deliverables": "60s Mid-Roll Integration",
        "due_date": "2026-08-15",
        "roi_multiplier": 4.1
    },
    {
        "id": "sp-03",
        "brand_name": "Epidemic Sound",
        "brand_logo": "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=60&h=60&fit=crop",
        "campaign_title": "Creator Audio Mastery Challenge",
        "platform": "Instagram",
        "status": "active",
        "contract_amount": 3000.0,
        "paid_amount": 1500.0,
        "deliverables": "3 Instagram Reels + Story Link",
        "due_date": "2026-08-30",
        "roi_multiplier": 2.8
    }
]

REVENUE_TRENDS = [
    {"period": "Mar 2026", "sponsorships": 6500.0, "adsense": 3200.0, "affiliates": 1400.0, "merchandise": 600.0, "total": 11700.0},
    {"period": "Apr 2026", "sponsorships": 7200.0, "adsense": 3450.0, "affiliates": 1600.0, "merchandise": 750.0, "total": 13000.0},
    {"period": "May 2026", "sponsorships": 8000.0, "adsense": 3900.0, "affiliates": 1900.0, "merchandise": 900.0, "total": 14700.0},
    {"period": "Jun 2026", "sponsorships": 7500.0, "adsense": 4100.0, "affiliates": 2100.0, "merchandise": 850.0, "total": 14550.0},
    {"period": "Jul 2026", "sponsorships": 9200.0, "adsense": 4600.0, "affiliates": 2400.0, "merchandise": 1100.0, "total": 17300.0},
    {"period": "Aug 2026", "sponsorships": 9800.0, "adsense": 4950.0, "affiliates": 2800.0, "merchandise": 1350.0, "total": 18900.0}
]

@router.get("/sponsorships", response_model=List[SponsorshipCampaign])
def list_sponsorships():
    return SPONSORSHIPS_DB

@router.get("/trends", response_model=List[RevenueBreakdown])
def get_revenue_trends():
    return REVENUE_TRENDS

@router.get("/summary")
def get_monetization_summary():
    total_ytd = sum(r["total"] for r in REVENUE_TRENDS)
    active_deals = sum(sp["contract_amount"] for sp in SPONSORSHIPS_DB if sp["status"] == "active")
    avg_cpm = 6.45
    return {
        "monthly_recurring": 18900.0,
        "ytd_earnings": total_ytd,
        "active_pipeline_value": active_deals,
        "average_cpm": avg_cpm,
        "top_earning_stream": "Sponsorships (52%)"
    }

CAMPAIGNS_DB = [
    {
        "id": "cmp-01",
        "title": "Fall Q3 Productivity AI Launch",
        "brand": "Notion AI",
        "budget": 25000.0,
        "spend": 18500.0,
        "impressions": 1420000,
        "clicks": 48500,
        "conversions": 3420,
        "roi_multiplier": 3.8,
        "status": "Active",
        "target_creators": ["Jane Doe", "Alex Chen"],
        "brand_safety_score": 98.5
    },
    {
        "id": "cmp-02",
        "title": "Summer Cybersecurity Awareness",
        "brand": "NordVPN",
        "budget": 35000.0,
        "spend": 35000.0,
        "impressions": 2850000,
        "clicks": 92400,
        "conversions": 7100,
        "roi_multiplier": 4.2,
        "status": "Completed",
        "target_creators": ["Alex Chen", "Marcus Brody"],
        "brand_safety_score": 99.1
    },
    {
        "id": "cmp-03",
        "title": "Soundtrack Mastery Challenge",
        "brand": "Epidemic Sound",
        "budget": 15000.0,
        "spend": 9000.0,
        "impressions": 880000,
        "clicks": 28900,
        "conversions": 1940,
        "roi_multiplier": 2.9,
        "status": "Active",
        "target_creators": ["Sophia Martinez"],
        "brand_safety_score": 97.4
    }
]

DISCOVERY_CREATORS = [
    {
        "id": "disc-1",
        "name": "Jane Doe",
        "handle": "@janedoe_tech",
        "niche": "Tech & AI Reviews",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
        "followers": "184.5K",
        "engagement": "6.8%",
        "match_score": "96%",
        "brand_safety": "99%",
        "suggested_rate": "$2,500 / integration"
    },
    {
        "id": "disc-2",
        "name": "Alex Chen",
        "handle": "@chen_creates",
        "niche": "VFX & Cinematography",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
        "followers": "412.0K",
        "engagement": "8.4%",
        "match_score": "94%",
        "brand_safety": "98%",
        "suggested_rate": "$4,200 / integration"
    },
    {
        "id": "disc-3",
        "name": "Marcus Brody",
        "handle": "@brody_fitness",
        "niche": "Fitness & Lifestyle",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop",
        "followers": "290.0K",
        "engagement": "7.1%",
        "match_score": "91%",
        "brand_safety": "97%",
        "suggested_rate": "$3,000 / integration"
    }
]

@router.get("/campaigns")
def list_marketing_campaigns():
    total_budget = sum(c["budget"] for c in CAMPAIGNS_DB)
    total_spend = sum(c["spend"] for c in CAMPAIGNS_DB)
    total_impressions = sum(c["impressions"] for c in CAMPAIGNS_DB)
    avg_roi = round(sum(c["roi_multiplier"] for c in CAMPAIGNS_DB) / len(CAMPAIGNS_DB), 2)
    return {
        "summary": {
            "total_budget": total_budget,
            "total_spend": total_spend,
            "total_impressions": total_impressions,
            "avg_roi_multiplier": avg_roi,
            "active_campaigns_count": len([c for c in CAMPAIGNS_DB if c["status"] == "Active"])
        },
        "campaigns": CAMPAIGNS_DB
    }

@router.get("/discovery")
def discover_influencers():
    return DISCOVERY_CREATORS

from pydantic import BaseModel

class InviteRequest(BaseModel):
    creator_id: str
    campaign_id: str
    offered_rate: float
    deliverables: str
    message: str

@router.post("/invite")
def invite_creator_to_campaign(req: InviteRequest):
    creator = next((c for c in DISCOVERY_CREATORS if c["id"] == req.creator_id), None)
    campaign = next((cp for cp in CAMPAIGNS_DB if cp["id"] == req.campaign_id), None)
    
    if not creator:
        creator_name = "Creator"
    else:
        creator_name = creator["name"]
        creator["invited"] = True
        
    if campaign and creator_name not in campaign["target_creators"]:
        campaign["target_creators"].append(creator_name)
        campaign["spend"] = round(campaign["spend"] + req.offered_rate, 2)
        
    return {
        "status": "success",
        "message": f"Invitation successfully dispatched to {creator_name}.",
        "invitation": {
            "creator_name": creator_name,
            "campaign_title": campaign["title"] if campaign else "Selected Campaign",
            "offered_rate": req.offered_rate,
            "deliverables": req.deliverables,
            "status": "Invitation Sent"
        }
    }


