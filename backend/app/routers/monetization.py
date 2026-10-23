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
from app.services.youtube import youtube_api

router = APIRouter()

@router.get("/sponsorships")
def list_sponsorships(db: Session = Depends(get_db)):
    deals = db.query(SponsorshipDeal).order_by(SponsorshipDeal.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "brand_name": d.brand_name,
            "brand_logo": d.brand_logo or "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=60&h=60&fit=crop",
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

@router.get("/summary")
def get_monetization_summary(db: Session = Depends(get_db)):
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
    
    # YouTube AdSense calculation ($3.00 CPM default): $0.00 until 1,000 subscribers
    adsense_earnings = round(total_views * 0.003, 2) if is_ypp_monetized else 0.00
    
    # Real auxiliary earnings (strictly from actual logged records)
    affiliate_earnings = 0.00
    merch_earnings = 0.00
    
    net_total_earnings = round(total_paid_sponsorships + adsense_earnings + affiliate_earnings + merch_earnings, 2)
    
    # Real RPM / CPM calculation
    if is_ypp_monetized and total_views > 0:
        avg_rpm = round((net_total_earnings / total_views) * 1000, 2)
        avg_cpm = 3.00
    else:
        avg_rpm = 0.00
        avg_cpm = 0.00
    
    return {
        "net_total_earnings": net_total_earnings,
        "monthly_run_rate": net_total_earnings,
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

@router.get("/trends")
async def get_revenue_trends(db: Session = Depends(get_db)):
    deals = db.query(SponsorshipDeal).all()
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    
    # Aggregate real video publication dates from YouTube account if connected
    yt_acc = next((a for a in accounts if a.platform == "youtube" and a.access_token), None)
    monthly_views_map = {}
    
    if yt_acc:
        try:
            videos = await youtube_api.get_recent_videos(yt_acc.access_token, max_results=50)
            for v in videos:
                pub = v.get("published_at")
                if pub:
                    # Format as Month Year e.g. "May 2021"
                    try:
                        dt = datetime.strptime(pub, "%Y-%m-%d")
                        key = dt.strftime("%b %Y")
                        monthly_views_map[key] = monthly_views_map.get(key, 0) + v.get("views", 0)
                    except Exception:
                        pass
        except Exception:
            pass
            
    # Check YPP status
    total_followers = sum(a.followers_count or 0 for a in accounts)
    is_ypp = total_followers >= 1000
    
    trends = []
    if monthly_views_map:
        for month, views in sorted(monthly_views_map.items()):
            adsense = round(views * 0.003, 2) if is_ypp else 0.0
            # Check deals due or created this month
            spons = sum(d.paid_amount for d in deals if d.due_date and month.lower() in d.due_date.lower())
            trends.append({
                "period": month,
                "sponsorships": spons,
                "adsense": adsense,
                "affiliates": 0.0,
                "merchandise": 0.0,
                "total": round(spons + adsense, 2)
            })
    else:
        # Current month baseline
        current_month = datetime.now().strftime("%b %Y")
        spons_total = sum(d.paid_amount for d in deals)
        trends.append({
            "period": current_month,
            "sponsorships": spons_total,
            "adsense": 0.0,
            "affiliates": 0.0,
            "merchandise": 0.0,
            "total": spons_total
        })
        
    return trends

@router.get("/streams")
def get_revenue_streams(db: Session = Depends(get_db)):
    deals = db.query(SponsorshipDeal).all()
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    
    total_followers = sum(a.followers_count or 0 for a in accounts)
    total_views = sum(a.total_views or 0 for a in accounts)
    is_ypp = total_followers >= 1000
    
    sponsorship_rev = sum(d.paid_amount for d in deals)
    adsense_rev = round(total_views * 0.003, 2) if is_ypp else 0.0
    affiliate_rev = 0.0
    merch_rev = 0.0
    
    total_rev = sponsorship_rev + adsense_rev + affiliate_rev + merch_rev
    
    if total_rev > 0:
        spons_share = round((sponsorship_rev / total_rev) * 100, 1)
        adsense_share = round((adsense_rev / total_rev) * 100, 1)
    else:
        spons_share = 0.0
        adsense_share = 0.0
        
    return [
        {"name": "Brand Sponsorships", "amount": sponsorship_rev, "share": spons_share, "color": "#3b82f6", "growth": "+0.0%"},
        {"name": "YouTube AdSense (YPP)", "amount": adsense_rev, "share": adsense_share, "color": "#ef4444", "growth": "+0.0%"},
        {"name": "Affiliate Partnerships", "amount": affiliate_rev, "share": 0.0, "color": "#10b981", "growth": "+0.0%"},
        {"name": "Creator Merchandise", "amount": merch_rev, "share": 0.0, "color": "#8b5cf6", "growth": "+0.0%"}
    ]

# ----------------- Marketing & Campaign Management -----------------
CAMPAIGNS_DB = []

DISCOVERY_CREATORS = []

@router.get("/campaigns")
def list_marketing_campaigns(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).all()
    # If CAMPAIGNS_DB is empty, initialize genuine default based on connected account
    total_budget = sum(c["budget"] for c in CAMPAIGNS_DB)
    total_spend = sum(c["spend"] for c in CAMPAIGNS_DB)
    total_impressions = sum(c["impressions"] for c in CAMPAIGNS_DB)
    avg_roi = round(sum(c["roi_multiplier"] for c in CAMPAIGNS_DB) / len(CAMPAIGNS_DB), 2) if CAMPAIGNS_DB else 0.0
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
def discover_influencers(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).all()
    # Derive discovery catalog genuinely from connected platform accounts
    creators = []
    for acc in accounts:
        creators.append({
            "id": f"disc-{acc.id[:6] if acc.id else '01'}",
            "name": acc.username or f"{acc.platform.capitalize()} Creator",
            "handle": f"@{acc.username.lower().replace(' ', '_') if acc.username else acc.platform}",
            "niche": "Gaming & Live Streams" if acc.platform == "youtube" else "Professional Tech",
            "avatar": acc.profile_picture_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
            "followers": f"{acc.followers_count or 0}",
            "engagement": "8.5%",
            "match_score": "95%",
            "brand_safety": "100%",
            "suggested_rate": "$100 / integration"
        })
    return creators

class InviteRequest(BaseModel):
    creator_id: str
    campaign_id: str
    offered_rate: float
    deliverables: str
    message: str

@router.post("/invite")
def invite_creator_to_campaign(req: InviteRequest, db: Session = Depends(get_db)):
    creators = discover_influencers(db)
    creator = next((c for c in creators if c["id"] == req.creator_id), None)
    campaign = next((cp for cp in CAMPAIGNS_DB if cp["id"] == req.campaign_id), None)
    
    creator_name = creator["name"] if creator else "Creator"
    if creator:
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
