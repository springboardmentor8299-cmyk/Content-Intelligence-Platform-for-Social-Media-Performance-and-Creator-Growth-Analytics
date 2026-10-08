from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import User, RevenueRecord
from app.schemas.schemas import (
    RevenueRecordResponse,
    RevenueRecordCreate,
    RevenueRecordUpdate
)
from app.api.deps import get_current_user

router = APIRouter()


def _get_target_user_id(db: Session, current_user: User) -> int:
    """Helper to resolve target creator user ID for creator, agency, marketing, and admin roles."""
    if current_user.role == "creator":
        return current_user.id
    first_creator = db.query(User).filter(User.role == "creator").first()
    return first_creator.id if first_creator else current_user.id


@router.get("", response_model=List[RevenueRecordResponse])
@router.get("/", response_model=List[RevenueRecordResponse])
def get_revenue_records(
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    query = db.query(RevenueRecord).filter(RevenueRecord.user_id == target_user_id)

    if status and status.lower() != "all":
        query = query.filter(RevenueRecord.status == status.lower())

    if source and source.lower() != "all":
        query = query.filter(RevenueRecord.source == source.lower())

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (RevenueRecord.title.ilike(search_filter)) |
            (RevenueRecord.brand_name.ilike(search_filter)) |
            (RevenueRecord.source.ilike(search_filter))
        )

    return query.order_by(desc(RevenueRecord.date)).all()


@router.get("/summary")
def get_revenue_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
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
        {
            "source": k,
            "raw_source": k.lower().replace(" ", "_"),
            "amount": round(v, 2),
            "percentage": round((v / total_revenue) * 100, 1) if total_revenue > 0 else 0
        }
        for k, v in by_source.items()
    ]

    # Group monthly trend from actual records
    months_order = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"]
    monthly_data = {m: {"month": m, "sponsorships": 0.0, "ads": 0.0, "affiliate": 0.0, "brand_deals": 0.0, "subscriptions": 0.0, "total": 0.0} for m in months_order}

    for r in records:
        if r.date:
            m_name = r.date.strftime("%b")
            if m_name in monthly_data:
                src = r.source.lower()
                amt = float(r.amount)
                if "sponsor" in src:
                    monthly_data[m_name]["sponsorships"] += amt
                elif "ad" in src:
                    monthly_data[m_name]["ads"] += amt
                elif "affiliate" in src:
                    monthly_data[m_name]["affiliate"] += amt
                elif "brand" in src:
                    monthly_data[m_name]["brand_deals"] += amt
                elif "sub" in src:
                    monthly_data[m_name]["subscriptions"] += amt
                monthly_data[m_name]["total"] += amt

    monthly_trend = [monthly_data[m] for m in months_order if monthly_data[m]["total"] > 0]
    if not monthly_trend:
        # Fallback consistent baseline for visualization if database was just seeded
        monthly_trend = [
            {"month": "Apr", "sponsorships": 7500, "ads": 4200, "affiliate": 1500, "brand_deals": 2000, "subscriptions": 800, "total": 16000},
            {"month": "May", "sponsorships": 9200, "ads": 4800, "affiliate": 1800, "brand_deals": 2500, "subscriptions": 950, "total": 19250},
            {"month": "Jun", "sponsorships": 11000, "ads": 5100, "affiliate": 2100, "brand_deals": 3200, "subscriptions": 1100, "total": 22500},
            {"month": "Jul", "sponsorships": 12500, "ads": 5900, "affiliate": 2400, "brand_deals": 3800, "subscriptions": 1300, "total": 25900},
            {"month": "Aug", "sponsorships": 14000, "ads": 6340, "affiliate": 2800, "brand_deals": 4200, "subscriptions": 1450, "total": 28790},
            {"month": "Sep", "sponsorships": 16200, "ads": 7100, "affiliate": 3100, "brand_deals": 4800, "subscriptions": 1600, "total": 32800}
        ]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_paid": round(total_paid, 2),
        "total_pending": round(total_pending, 2),
        "total_contracted": round(total_contracted, 2),
        "deals_count": len(records),
        "source_breakdown": source_breakdown,
        "monthly_trend": monthly_trend,
        "is_demo": True,
        "disclaimer": "Demo Revenue Data / Manually Entered Revenue — Not verified creator earnings"
    }


@router.get("/trends")
def get_revenue_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = get_revenue_summary(db=db, current_user=current_user)
    return {
        "monthly_trend": summary["monthly_trend"],
        "source_breakdown": summary["source_breakdown"],
        "is_demo": True,
        "disclaimer": "Demo Revenue Data / Manually Entered Revenue — Not verified creator earnings"
    }


@router.post("", response_model=RevenueRecordResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=RevenueRecordResponse, status_code=status.HTTP_201_CREATED)
def create_revenue_record(
    record_in: RevenueRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    record = RevenueRecord(
        user_id=target_user_id,
        source=record_in.source,
        title=record_in.title,
        brand_name=record_in.brand_name,
        amount=record_in.amount,
        currency=record_in.currency or "USD",
        status=record_in.status or "paid",
        notes=record_in.notes,
        date=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{revenue_id}", response_model=RevenueRecordResponse)
def get_revenue_record(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    record = db.query(RevenueRecord).filter(
        RevenueRecord.id == revenue_id,
        RevenueRecord.user_id == target_user_id
    ).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Revenue record with ID {revenue_id} not found."
        )
    return record


@router.put("/{revenue_id}", response_model=RevenueRecordResponse)
def update_revenue_record(
    revenue_id: int,
    record_in: RevenueRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    record = db.query(RevenueRecord).filter(
        RevenueRecord.id == revenue_id,
        RevenueRecord.user_id == target_user_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Revenue record with ID {revenue_id} not found."
        )

    update_data = record_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{revenue_id}")
def delete_revenue_record(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    record = db.query(RevenueRecord).filter(
        RevenueRecord.id == revenue_id,
        RevenueRecord.user_id == target_user_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Revenue record with ID {revenue_id} not found."
        )

    db.delete(record)
    db.commit()
    return {"message": "Revenue record deleted successfully", "id": revenue_id}


# Backwards compatibility endpoints for any previous M2 component calls
@router.get("/deals", response_model=List[RevenueRecordResponse])
def get_revenue_deals(
    status: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_revenue_records(status=status, db=db, current_user=current_user)


@router.post("/deals", response_model=RevenueRecordResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    deal_in: RevenueRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_revenue_record(record_in=deal_in, db=db, current_user=current_user)
