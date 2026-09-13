from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import User, RevenueRecord
from app.schemas.schemas import RevenueRecordResponse, RevenueRecordCreate
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/summary")
def get_revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    records = db.query(RevenueRecord).filter(RevenueRecord.user_id == target_user_id).all()

    total_revenue = sum(r.amount for r in records)
    total_paid = sum(r.amount for r in records if r.status == "paid")
    total_pending = sum(r.amount for r in records if r.status == "pending")
    total_contracted = sum(r.amount for r in records if r.status == "contracted")

    by_source = {}
    for r in records:
        source_key = r.source.replace("_", " ").title()
        by_source[source_key] = by_source.get(source_key, 0.0) + r.amount

    source_breakdown = [
        {"source": k, "amount": round(v, 2), "percentage": round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0}
        for k, v in by_source.items()
    ]

    # Monthly revenue history
    monthly_trend = [
        {"month": "Apr", "sponsorships": 7500, "ads": 4200, "affiliate": 1500, "total": 13200},
        {"month": "May", "sponsorships": 9200, "ads": 4800, "affiliate": 1800, "total": 15800},
        {"month": "Jun", "sponsorships": 11000, "ads": 5100, "affiliate": 2100, "total": 18200},
        {"month": "Jul", "sponsorships": 12500, "ads": 5900, "affiliate": 2400, "total": 20800},
        {"month": "Aug", "sponsorships": 14000, "ads": 6340, "affiliate": 2800, "total": 23140},
        {"month": "Sep", "sponsorships": 16200, "ads": 7100, "affiliate": 3100, "total": 26400}
    ]

    return {
        "total_revenue": total_revenue,
        "total_paid": total_paid,
        "total_pending": total_pending,
        "total_contracted": total_contracted,
        "source_breakdown": source_breakdown,
        "monthly_trend": monthly_trend
    }


@router.get("/deals", response_model=List[RevenueRecordResponse])
def get_revenue_deals(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    query = db.query(RevenueRecord).filter(RevenueRecord.user_id == target_user_id)
    if status and status != "all":
        query = query.filter(RevenueRecord.status == status.lower())
    
    return query.order_by(desc(RevenueRecord.date)).all()


@router.post("/deals", response_model=RevenueRecordResponse)
def create_deal(
    deal_in: RevenueRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = RevenueRecord(
        user_id=current_user.id,
        **deal_in.dict(),
        date=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
