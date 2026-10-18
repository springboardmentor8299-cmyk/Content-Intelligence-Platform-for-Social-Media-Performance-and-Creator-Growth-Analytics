from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth.security import get_current_creator
from app.database import get_db
from app.models import User
from app.models.audience import Audience


router = APIRouter(
    prefix="/audience",
    tags=["Audience"]
)


# =========================
# GET ALL AUDIENCE DATA
# =========================

@router.get("/{creator_id}")
def get_creator_audience(
    creator_id: int,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    audience = (
        db.query(Audience)
        .filter(Audience.creator_id == creator_id)
        .all()
    )

    return audience


# =========================
# GET AUDIENCE SUMMARY
# =========================
# Same age groups will be combined.
#
# Example:
# 18-24 = 500
# 18-24 = 150
#
# Result:
# 18-24 = 650
# =========================

@router.get("/{creator_id}/summary")
def get_audience_summary(
    creator_id: int,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    summary = (
        db.query(
            Audience.age_group,
            func.sum(Audience.audience_count).label(
                "audience_count"
            ),
            func.avg(Audience.engagement_rate).label(
                "engagement_rate"
            )
        )
        .filter(Audience.creator_id == creator_id)
        .group_by(Audience.age_group)
        .order_by(Audience.age_group)
        .all()
    )

    return [
        {
            "age_group": item.age_group,
            "audience_count": int(item.audience_count or 0),
            "engagement_rate": float(
                item.engagement_rate or 0
            )
        }
        for item in summary
    ]


# =========================
# CREATE AUDIENCE DATA
# =========================

@router.post("/{creator_id}")
def create_creator_audience(
    creator_id: int,
    age_group: str,
    gender: str,
    location: str,
    device: str,
    active_hour: str,
    engagement_rate: float = 0.0,
    audience_count: int = 0,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    audience = Audience(
        creator_id=creator_id,
        age_group=age_group,
        gender=gender,
        location=location,
        device=device,
        active_hour=active_hour,
        engagement_rate=engagement_rate,
        audience_count=audience_count
    )

    db.add(audience)
    db.commit()
    db.refresh(audience)

    return audience


def verify_creator_access(creator_id: int, current_user: User):
    if current_user.id != creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access another creator's audience data",
        )