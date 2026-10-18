
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.security import get_current_creator
from app.database import get_db
from app.models import User
from app.models.sponsorship import Sponsorship


router = APIRouter(
    prefix="/sponsorships",
    tags=["Sponsorships"]
)


class SponsorshipCreate(BaseModel):
    brand_name: str = Field(min_length=1, max_length=255)
    campaign_name: str = Field(min_length=1, max_length=255)
    amount: float = Field(ge=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None


class SponsorshipUpdate(BaseModel):
    payment_status: str
    paid_date: Optional[date] = None


def get_sponsorship_or_404(
    sponsorship_id: int,
    user_id: int,
    db: Session
):
    sponsorship = (
        db.query(Sponsorship)
        .filter(
            Sponsorship.id == sponsorship_id,
            Sponsorship.creator_id == user_id
        )
        .first()
    )

    if not sponsorship:
        raise HTTPException(
            status_code=404,
            detail="Sponsorship not found"
        )

    return sponsorship


# CREATE SPONSORSHIP

@router.post("/")
def create_sponsorship(
    data: SponsorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    currency = data.currency.upper()

    if not currency.isalpha():
        raise HTTPException(
            status_code=422,
            detail="Currency must contain three letters"
        )

    if (
        data.start_date
        and data.due_date
        and data.due_date < data.start_date
    ):
        raise HTTPException(
            status_code=422,
            detail="Due date cannot be before the start date"
        )

    sponsorship = Sponsorship(
        creator_id=current_user.id,
        brand_name=data.brand_name.strip(),
        campaign_name=data.campaign_name.strip(),
        amount=data.amount,
        currency=currency,
        payment_status="Pending",
        start_date=data.start_date,
        due_date=data.due_date,
        notes=data.notes
    )

    try:
        db.add(sponsorship)
        db.commit()
        db.refresh(sponsorship)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create sponsorship"
        )

    return sponsorship


# LIST MY SPONSORSHIPS

@router.get("/")
def list_sponsorships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    return (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == current_user.id)
        .order_by(Sponsorship.id.desc())
        .all()
    )


# UPDATE PAYMENT STATUS

@router.patch("/{sponsorship_id}/payment")
def update_payment_status(
    sponsorship_id: int,
    data: SponsorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    if data.payment_status not in ["Pending", "Paid"]:
        raise HTTPException(
            status_code=422,
            detail="Payment status must be Pending or Paid"
        )

    sponsorship = get_sponsorship_or_404(
        sponsorship_id,
        current_user.id,
        db
    )

    sponsorship.payment_status = data.payment_status

    if data.payment_status == "Paid":
        sponsorship.paid_date = data.paid_date or date.today()
    else:
        sponsorship.paid_date = None

    db.commit()
    db.refresh(sponsorship)

    return sponsorship


# SPONSORSHIP SUMMARY

@router.get("/summary")
def sponsorship_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    sponsorships = (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == current_user.id)
        .all()
    )

    currencies = {s.currency for s in sponsorships}

    if len(currencies) > 1:
        raise HTTPException(
            status_code=400,
            detail="Summary requires sponsorships to use the same currency"
        )

    total_value = sum(s.amount for s in sponsorships)
    paid_amount = sum(
        s.amount for s in sponsorships
        if s.payment_status == "Paid"
    )
    pending_amount = sum(
        s.amount for s in sponsorships
        if s.payment_status == "Pending"
    )

    return {
        "total_sponsorships": len(sponsorships),
        "total_value": round(total_value, 2),
        "paid_amount": round(paid_amount, 2),
        "pending_amount": round(pending_amount, 2),
        "currency": next(iter(currencies), "INR")
    }
