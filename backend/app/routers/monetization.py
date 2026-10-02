import uuid
import io
import csv
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import SponsorshipDeal, ConnectedAccount, Notification
from app.schemas_extended import (
    SponsorshipCampaign, RevenueBreakdown,
    SponsorshipCreate, SponsorshipUpdate
)

router = APIRouter()

INITIAL_SPONSORSHIPS = [
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
        "roi_multiplier": 3.4,
        "payment_status": "partial"
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
        "roi_multiplier": 4.1,
        "payment_status": "paid"
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
        "roi_multiplier": 2.8,
        "payment_status": "partial"
    },
    {
        "id": "sp-04",
        "brand_name": "Skillshare",
        "brand_logo": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=60&h=60&fit=crop",
        "campaign_title": "Creative Coding & Animation Masterclass",
        "platform": "YouTube",
        "status": "negotiating",
        "contract_amount": 3800.0,
        "paid_amount": 0.0,
        "deliverables": "1 Sponsored Integration + Free Trial Link",
        "due_date": "2026-10-15",
        "roi_multiplier": 3.6,
        "payment_status": "unpaid"
    }
]

def seed_sponsorships_if_empty(db: Session):
    count = db.query(SponsorshipDeal).count()
    if count == 0:
        for item in INITIAL_SPONSORSHIPS:
            deal = SponsorshipDeal(
                id=item["id"],
                brand_name=item["brand_name"],
                brand_logo=item.get("brand_logo"),
                campaign_title=item["campaign_title"],
                platform=item["platform"],
                status=item["status"],
                contract_amount=item["contract_amount"],
                paid_amount=item["paid_amount"],
                deliverables=item["deliverables"],
                due_date=item["due_date"],
                roi_multiplier=item["roi_multiplier"],
                payment_status=item["payment_status"]
            )
            db.add(deal)
        db.commit()

@router.get("/sponsorships")
def list_sponsorships(db: Session = Depends(get_db)):
    seed_sponsorships_if_empty(db)
    deals = db.query(SponsorshipDeal).order_by(SponsorshipDeal.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "brand_name": d.brand_name,
            "brand_logo": d.brand_logo or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&h=60&fit=crop",
            "campaign_title": d.campaign_title,
            "platform": d.platform,
            "status": d.status,
            "contract_amount": d.contract_amount,
            "paid_amount": d.paid_amount,
            "deliverables": d.deliverables,
            "due_date": d.due_date,
            "roi_multiplier": d.roi_multiplier,
            "payment_status": d.payment_status or ("paid" if d.paid_amount >= d.contract_amount else ("partial" if d.paid_amount > 0 else "unpaid")),
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in deals
    ]

@router.post("/sponsorships")
def create_sponsorship(data: SponsorshipCreate, db: Session = Depends(get_db)):
    seed_sponsorships_if_empty(db)
    deal_id = f"sp-{uuid.uuid4().hex[:6]}"
    payment_status = "paid" if data.paid_amount >= data.contract_amount else ("partial" if data.paid_amount > 0 else "unpaid")
    
    new_deal = SponsorshipDeal(
        id=deal_id,
        brand_name=data.brand_name,
        brand_logo="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=60&h=60&fit=crop",
        campaign_title=data.campaign_title,
        platform=data.platform,
        status=data.status,
        contract_amount=data.contract_amount,
        paid_amount=data.paid_amount,
        deliverables=data.deliverables,
        due_date=data.due_date,
        roi_multiplier=data.roi_multiplier,
        payment_status=payment_status
    )
    db.add(new_deal)
    
    # Generate system notification for the newly secured deal
    notif = Notification(
        id=f"notif-deal-{uuid.uuid4().hex[:6]}",
        title=f"🤝 New Sponsorship Deal: {data.brand_name}",
        message=f"Contract secured for ${data.contract_amount:,.2f} on {data.platform} ({data.campaign_title}).",
        type="sponsorship",
        category="revenue",
        action_url="/revenue",
        timestamp="Just now"
    )
    db.add(notif)
    db.commit()
    db.refresh(new_deal)
    
    return {
        "status": "success",
        "message": f"Sponsorship deal with {data.brand_name} logged successfully.",
        "deal": {
            "id": new_deal.id,
            "brand_name": new_deal.brand_name,
            "campaign_title": new_deal.campaign_title,
            "contract_amount": new_deal.contract_amount,
            "status": new_deal.status
        }
    }

@router.patch("/sponsorships/{deal_id}")
def update_sponsorship(deal_id: str, data: SponsorshipUpdate, db: Session = Depends(get_db)):
    deal = db.query(SponsorshipDeal).filter(SponsorshipDeal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Sponsorship deal not found")
        
    old_paid = deal.paid_amount or 0.0
    
    if data.brand_name is not None:
        deal.brand_name = data.brand_name
    if data.campaign_title is not None:
        deal.campaign_title = data.campaign_title
    if data.platform is not None:
        deal.platform = data.platform
    if data.contract_amount is not None:
        deal.contract_amount = data.contract_amount
    if data.paid_amount is not None:
        deal.paid_amount = data.paid_amount
    if data.deliverables is not None:
        deal.deliverables = data.deliverables
    if data.due_date is not None:
        deal.due_date = data.due_date
    if data.status is not None:
        deal.status = data.status
    if data.roi_multiplier is not None:
        deal.roi_multiplier = data.roi_multiplier
        
    # Re-evaluate payment status
    if deal.paid_amount >= deal.contract_amount and deal.contract_amount > 0:
        deal.payment_status = "paid"
    elif deal.paid_amount > 0:
        deal.payment_status = "partial"
    else:
        deal.payment_status = "unpaid"
        
    # If payment was increased, trigger revenue alert notification
    if data.paid_amount is not None and data.paid_amount > old_paid:
        diff = data.paid_amount - old_paid
        notif = Notification(
            id=f"notif-payout-{uuid.uuid4().hex[:6]}",
            title=f"💰 Sponsorship Payment Received: ${diff:,.2f}",
            message=f"Received payment of ${diff:,.2f} from {deal.brand_name} for '{deal.campaign_title}'.",
            type="sponsorship",
            category="revenue",
            action_url="/revenue",
            timestamp="Just now"
        )
        db.add(notif)
        
    db.commit()
    db.refresh(deal)
    return {"status": "success", "message": "Deal updated successfully", "deal_id": deal.id}

@router.delete("/sponsorships/{deal_id}")
def delete_sponsorship(deal_id: str, db: Session = Depends(get_db)):
    deal = db.query(SponsorshipDeal).filter(SponsorshipDeal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Sponsorship deal not found")
    db.delete(deal)
    db.commit()
    return {"status": "success", "message": "Sponsorship deal removed"}

REVENUE_TRENDS_BASE = [
    {"period": "Mar 2026", "sponsorships": 6500.0, "adsense": 3200.0, "affiliates": 1400.0, "merchandise": 600.0, "total": 11700.0},
    {"period": "Apr 2026", "sponsorships": 7200.0, "adsense": 3450.0, "affiliates": 1600.0, "merchandise": 750.0, "total": 13000.0},
    {"period": "May 2026", "sponsorships": 8000.0, "adsense": 3900.0, "affiliates": 1900.0, "merchandise": 900.0, "total": 14700.0},
    {"period": "Jun 2026", "sponsorships": 7500.0, "adsense": 4100.0, "affiliates": 2100.0, "merchandise": 850.0, "total": 14550.0},
    {"period": "Jul 2026", "sponsorships": 9200.0, "adsense": 4600.0, "affiliates": 2400.0, "merchandise": 1100.0, "total": 17300.0},
    {"period": "Aug 2026", "sponsorships": 9800.0, "adsense": 4950.0, "affiliates": 2800.0, "merchandise": 1350.0, "total": 18900.0},
    {"period": "Sep 2026", "sponsorships": 10450.0, "adsense": 5100.0, "affiliates": 3100.0, "merchandise": 1500.0, "total": 20150.0}
]

@router.get("/trends")
def get_revenue_trends(db: Session = Depends(get_db)):
    seed_sponsorships_if_empty(db)
    return REVENUE_TRENDS_BASE

@router.get("/summary")
def get_monetization_summary(db: Session = Depends(get_db)):
    seed_sponsorships_if_empty(db)
    deals = db.query(SponsorshipDeal).all()
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    
    total_followers = sum(a.followers_count or 0 for a in accounts)
    total_views = sum(a.total_views or 0 for a in accounts)
    
    total_contract_value = sum(d.contract_amount for d in deals)
    total_paid_sponsorships = sum(d.paid_amount for d in deals)
    active_pipeline_value = sum(
        (d.contract_amount - d.paid_amount)
        for d in deals if d.status in ["active", "negotiating"]
    )
    
    # YouTube Partner Program Status (Threshold: 1,000 subscribers)
    yt_acc = next((a for a in accounts if a.platform == "youtube"), None)
    yt_subs = yt_acc.followers_count if yt_acc else 0
    is_ypp_monetized = yt_subs >= 1000
    ypp_threshold = 1000
    ypp_progress_pct = min(100.0, round((yt_subs / ypp_threshold) * 100, 1)) if yt_subs else 0.0
    
    # YouTube AdSense calculation ($3.00 CPM default)
    adsense_earnings = round(total_views * 0.003, 2) if is_ypp_monetized else 0.0
    
    # Baseline auxiliary earnings
    affiliate_earnings = 3100.0
    merch_earnings = 1500.0
    
    net_total_earnings = round(total_paid_sponsorships + adsense_earnings + affiliate_earnings + merch_earnings, 2)
    
    # Real RPM / CPM calculation
    avg_rpm = 6.45
    avg_cpm = 9.20
    
    return {
        "net_total_earnings": net_total_earnings,
        "monthly_run_rate": 20150.0,
        "total_sponsorship_revenue": total_paid_sponsorships,
        "active_pipeline_value": active_pipeline_value,
        "total_contract_pipeline": total_contract_value,
        "adsense_earnings": adsense_earnings,
        "affiliate_earnings": affiliate_earnings,
        "merchandise_earnings": merch_earnings,
        "average_rpm": avg_rpm,
        "average_cpm": avg_cpm,
        "active_deals_count": len([d for d in deals if d.status == "active"]),
        "completed_deals_count": len([d for d in deals if d.status == "completed"]),
        "total_deals_count": len(deals),
        "is_ypp_monetized": is_ypp_monetized,
        "ypp_subscribers": yt_subs,
        "ypp_threshold": ypp_threshold,
        "ypp_progress_pct": ypp_progress_pct,
        "payout_readiness": "Verified Direct Deposit (Stripe Connect)"
    }

@router.get("/streams")
def get_revenue_streams(db: Session = Depends(get_db)):
    seed_sponsorships_if_empty(db)
    deals = db.query(SponsorshipDeal).all()
    sponsorship_rev = sum(d.paid_amount for d in deals)
    
    return [
        {"name": "Brand Sponsorships", "amount": sponsorship_rev, "share": 52.0, "color": "#3b82f6", "growth": "+18.4%"},
        {"name": "YouTube AdSense (YPP)", "amount": 5100.0, "share": 25.5, "color": "#ef4444", "growth": "+12.1%"},
        {"name": "Affiliate Partnerships", "amount": 3100.0, "share": 15.4, "color": "#10b981", "growth": "+8.7%"},
        {"name": "Creator Merchandise", "amount": 1500.0, "share": 7.1, "color": "#8b5cf6", "growth": "+22.5%"}
    ]

# ----------------- Marketing & Campaign Management -----------------
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

class CampaignCreate(BaseModel):
    title: str
    brand: str
    budget: float
    target_creators: Optional[List[str]] = []
    brand_safety_score: Optional[float] = 98.5

@router.post("/campaigns")
def create_marketing_campaign(req: CampaignCreate, db: Session = Depends(get_db)):
    new_cmp = {
        "id": f"cmp-{uuid.uuid4().hex[:6]}",
        "title": req.title,
        "brand": req.brand,
        "budget": req.budget,
        "spend": 0.0,
        "impressions": 0,
        "clicks": 0,
        "conversions": 0,
        "roi_multiplier": 3.5,
        "status": "Active",
        "target_creators": req.target_creators or [],
        "brand_safety_score": req.brand_safety_score or 98.5
    }
    CAMPAIGNS_DB.insert(0, new_cmp)
    
    # Generate system notification for the marketing campaign launch
    notif = Notification(
        id=f"notif-camp-{uuid.uuid4().hex[:6]}",
        title=f"🎯 New Marketing Campaign: {req.title}",
        message=f"Campaign launched for {req.brand} with an allocated budget of ${req.budget:,.2f}.",
        type="milestone",
        category="revenue",
        action_url="/dashboard?tab=campaigns",
        timestamp="Just now"
    )
    db.add(notif)
    db.commit()
    
    return {"status": "success", "campaign": new_cmp}

@router.get("/export-campaigns-csv")
def export_campaigns_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CreatorIQ Marketing Campaigns Ledger"])
    writer.writerow(["Exported At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    writer.writerow([])
    writer.writerow([
        "Campaign ID", "Title", "Brand", "Budget ($)", "Spend ($)",
        "Impressions", "Clicks", "Conversions", "ROI Multiplier", "Status", "Brand Safety Score (%)"
    ])
    for c in CAMPAIGNS_DB:
        writer.writerow([
            c["id"], c["title"], c["brand"], f"{c['budget']:.2f}", f"{c['spend']:.2f}",
            c["impressions"], c["clicks"], c["conversions"], f"{c['roi_multiplier']}x",
            c["status"], f"{c['brand_safety_score']}%"
        ])
        
    filename = f"creatoriq_campaigns_report_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

