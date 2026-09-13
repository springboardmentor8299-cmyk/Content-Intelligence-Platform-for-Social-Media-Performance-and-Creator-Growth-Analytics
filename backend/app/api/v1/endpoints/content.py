from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import User, ContentItem
from app.schemas.schemas import ContentItemResponse, ContentItemCreate, ContentComparisonResponse
from app.api.deps import get_current_user, require_role

router = APIRouter()


@router.get("", response_model=List[ContentItemResponse])
@router.get("/", response_model=List[ContentItemResponse])
def get_content_list(
    platform: Optional[str] = Query("all"),
    content_type: Optional[str] = Query("all"),
    sort_by: str = Query("published_at"),  # published_at, views, likes, engagement_rate, shares
    order: str = Query("desc"),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    query = db.query(ContentItem).filter(ContentItem.user_id == target_user_id)

    if platform and platform != "all":
        query = query.filter(ContentItem.platform == platform.lower())
    
    if content_type and content_type != "all":
        query = query.filter(ContentItem.content_type == content_type.lower())

    sort_column = getattr(ContentItem, sort_by, ContentItem.published_at)
    if order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    return query.limit(limit).all()


@router.get("/top", response_model=List[ContentItemResponse])
def get_top_content(
    limit: int = Query(5, le=20),
    metric: str = Query("views"),  # views, engagement_rate, shares
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    sort_col = getattr(ContentItem, metric, ContentItem.views)
    items = db.query(ContentItem).filter(
        ContentItem.user_id == target_user_id
    ).order_by(desc(sort_col)).limit(limit).all()
    return items


@router.post("/compare", response_model=ContentComparisonResponse)
def compare_content(
    content_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(content_ids) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 content IDs to compare")
    if len(content_ids) > 4:
        raise HTTPException(status_code=400, detail="Cannot compare more than 4 items at once")

    items = db.query(ContentItem).filter(ContentItem.id.in_(content_ids)).all()
    if len(items) < 2:
        raise HTTPException(status_code=404, detail="Could not find specified items for comparison")

    # Determine winner based on weighted performance score
    # Score formula: views * 0.3 + engagement_rate * 25000 + shares * 15 + saves * 20
    best_score = -1.0
    winner_id = None
    scores = {}

    for item in items:
        score = (item.views * 0.3) + (item.engagement_rate * 25000) + (item.shares * 15) + (item.saves * 20)
        scores[item.id] = round(score, 2)
        if score > best_score:
            best_score = score
            winner_id = item.id

    # Comparative analysis
    max_views_item = max(items, key=lambda x: x.views)
    max_eng_item = max(items, key=lambda x: x.engagement_rate)
    max_shares_item = max(items, key=lambda x: x.shares)

    metric_analysis = {
        "highest_views": {"id": max_views_item.id, "title": max_views_item.title, "value": max_views_item.views},
        "highest_engagement": {"id": max_eng_item.id, "title": max_eng_item.title, "value": max_eng_item.engagement_rate},
        "highest_virality_shares": {"id": max_shares_item.id, "title": max_shares_item.title, "value": max_shares_item.shares},
        "scores": scores
    }

    return ContentComparisonResponse(
        items=items,
        winner_id=winner_id,
        metric_analysis=metric_analysis
    )


@router.post("", response_model=ContentItemResponse)
@router.post("/", response_model=ContentItemResponse)
def create_content_item(
    item_in: ContentItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    content = ContentItem(
        user_id=current_user.id,
        **item_in.dict(),
        published_at=datetime.utcnow()
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content
