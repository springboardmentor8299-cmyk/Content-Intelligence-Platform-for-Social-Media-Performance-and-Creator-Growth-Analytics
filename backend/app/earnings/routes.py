
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_creator
from app.database import get_db
from app.models import User
from app.models.earnings import Earnings
from app.models.sponsorship import Sponsorship

router = APIRouter(
    prefix="/earnings",
    tags=["Earnings"]
)


# =====================================================
# AUTHORIZATION HELPER
# =====================================================

def verify_creator_access(
    creator_id: int,
    current_user: User
):
    if current_user.id != creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access another creator's earnings"
        )


# =====================================================
# GET ALL EARNINGS
# =====================================================

@router.get("/{creator_id}")
def get_creator_earnings(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    verify_creator_access(creator_id, current_user)

    earnings = (
        db.query(Earnings)
        .filter(Earnings.creator_id == creator_id)
        .order_by(Earnings.date.asc())
        .all()
    )

    if not earnings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No earnings data found for this creator"
        )

    return earnings


# =====================================================
# GET EARNINGS SUMMARY
# =====================================================


@router.get("/{creator_id}/summary")
def get_earnings_summary(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    verify_creator_access(creator_id, current_user)

    earnings = (
        db.query(Earnings)
        .filter(Earnings.creator_id == creator_id)
        .order_by(Earnings.date.asc())
        .all()
    )

    sponsorships = (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == creator_id)
        .all()
    )

    total_estimated_revenue = sum(
        float(item.estimated_revenue or 0)
        for item in earnings
    )

    total_ad_revenue = sum(
        float(item.ad_revenue or 0)
        for item in earnings
    )

    total_monetized_views = sum(
        int(item.monetized_views or 0)
        for item in earnings
    )

    # Keep sponsorship totals grouped by currency.
    sponsorship_totals = {}

    for sponsorship in sponsorships:
        currency = (sponsorship.currency or "INR").upper()

        if currency not in sponsorship_totals:
            sponsorship_totals[currency] = {
                "paid": 0.0,
                "pending": 0.0
            }

        if sponsorship.payment_status == "Paid":
            sponsorship_totals[currency]["paid"] += float(
                sponsorship.amount or 0
            )
        elif sponsorship.payment_status == "Pending":
            sponsorship_totals[currency]["pending"] += float(
                sponsorship.amount or 0
            )

    platform_currency = (
        earnings[0].currency or "USD"
        if earnings
        else "USD"
    )

    platform_currency = platform_currency.upper()

    paid_sponsorships = sponsorship_totals.get(
        platform_currency, {}
    ).get("paid", 0.0)

    pending_sponsorships = sponsorship_totals.get(
        platform_currency, {}
    ).get("pending", 0.0)

    return {
        "creator_id": creator_id,
        "total_estimated_revenue": round(
            total_estimated_revenue, 2
        ),
        "total_ad_revenue": round(total_ad_revenue, 2),
        "total_monetized_views": total_monetized_views,
        "currency": platform_currency,
        "paid_sponsorship_amount": round(
            paid_sponsorships, 2
        ),
        "pending_sponsorship_amount": round(
            pending_sponsorships, 2
        ),
        "total_earned": round(
            total_estimated_revenue + paid_sponsorships, 2
        )
    }


# =====================================================
# GET EARNINGS TREND
# =====================================================

@router.get("/{creator_id}/trend")
def get_earnings_trend(
    creator_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    verify_creator_access(creator_id, current_user)

    earnings = (
        db.query(Earnings)
        .filter(Earnings.creator_id == creator_id)
        .order_by(Earnings.date.asc())
        .all()
    )

    if not earnings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No earnings data found for this creator"
        )

    trend = []
    previous_revenue = None

    for item in earnings:
        revenue = float(item.estimated_revenue or 0)

        if previous_revenue is None or previous_revenue <= 0:
            growth = 0
        else:
            growth = (
                (revenue - previous_revenue)
                / previous_revenue
            ) * 100

        trend.append({
            "date": item.date,
            "estimated_revenue": round(revenue, 2),
            "ad_revenue": round(
                float(item.ad_revenue or 0), 2
            ),
            "monetized_views": int(
                item.monetized_views or 0
            ),
            "growth": round(growth, 2),
            "currency": item.currency or "USD"
        })

        previous_revenue = revenue

    return {
        "creator_id": creator_id,
        "trend": trend
    }


# =====================================================
# CREATE EARNINGS DATA
# =====================================================

@router.post("/{creator_id}")
def create_creator_earnings(
    creator_id: int,
    date_value: date,
    estimated_revenue: float = 0.0,
    ad_revenue: float = 0.0,
    monetized_views: int = 0,
    currency: str = "USD",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    verify_creator_access(creator_id, current_user)

    if estimated_revenue < 0 or ad_revenue < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Revenue values cannot be negative"
        )

    if monetized_views < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Monetized views cannot be negative"
        )

    currency = currency.strip().upper()

    if len(currency) != 3 or not currency.isalpha():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Currency must be a three-letter code, such as USD or INR"
        )

    earnings = Earnings(
        creator_id=creator_id,
        date=date_value,
        estimated_revenue=estimated_revenue,
        ad_revenue=ad_revenue,
        monetized_views=monetized_views,
        currency=currency
    )

    try:
        db.add(earnings)
        db.commit()
        db.refresh(earnings)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save earnings data"
        )

    return earnings
