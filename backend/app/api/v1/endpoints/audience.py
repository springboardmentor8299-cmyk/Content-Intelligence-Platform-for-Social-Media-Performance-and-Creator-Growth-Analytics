from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, AudienceDemographic
from app.schemas.schemas import AudienceDemographicSchema
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/demographics")
def get_audience_demographics(
    platform: Optional[str] = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    query = db.query(AudienceDemographic).filter(AudienceDemographic.user_id == target_user_id)
    if platform and platform != "all":
        query = query.filter(AudienceDemographic.platform == platform.lower())
    
    demographics = query.all()

    # Group by category
    categorized = {
        "age": [],
        "gender": [],
        "country": [],
        "device": [],
        "active_hour": []
    }

    for d in demographics:
        item = {
            "id": d.id,
            "label": d.label,
            "percentage": d.percentage,
            "count": d.count
        }
        if d.category in categorized:
            categorized[d.category].append(item)

    return categorized


@router.get("/growth")
def get_follower_growth(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    growth_history = []
    base_yt = 385000
    base_ig = 162000
    base_tk = 280000
    base_li = 55000
    base_x = 88000

    for i in range(days):
        day_label = f"Day {i + 1}"
        growth_history.append({
            "day": day_label,
            "youtube": base_yt + int(i * 1150),
            "instagram": base_ig + int(i * 760),
            "tiktok": base_tk + int(i * 1000),
            "linkedin": base_li + int(i * 300),
            "twitter": base_x + int(i * 230),
            "total": (base_yt + base_ig + base_tk + base_li + base_x) + int(i * 3440)
        })

    return {"days": days, "history": growth_history}
