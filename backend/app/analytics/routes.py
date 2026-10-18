from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import get_current_creator
from app.database import get_db
from app.models import User
from app.models.analytics import Analytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================
# GET ANALYTICS DATA
# =========================

@router.get("/{creator_id}")
def get_creator_analytics(
    creator_id: int,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    analytics = (
        db.query(Analytics)
        .filter(
            Analytics.creator_id == creator_id
        )
        .order_by(
            Analytics.date.asc()
        )
        .all()
    )

    return analytics


# =========================
# CREATE ANALYTICS DATA
# =========================

@router.post("/{creator_id}")
def create_creator_analytics(
    creator_id: int,
    date_value: date,
    views: int = 0,
    likes: int = 0,
    comments: int = 0,
    shares: int = 0,
    saves: int = 0,
    watch_time: float = 0.0,
    followers: int = 0,
    reach: int = 0,
    engagement_rate: float = 0.0,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    analytics = Analytics(
        creator_id=creator_id,
        date=date_value,
        views=views,
        likes=likes,
        comments=comments,
        shares=shares,
        saves=saves,
        watch_time=watch_time,
        followers=followers,
        reach=reach,
        engagement_rate=engagement_rate
    )

    db.add(analytics)
    db.commit()
    db.refresh(analytics)

    return analytics


# =========================
# ENGAGEMENT SUMMARY
# =========================

@router.get("/{creator_id}/engagement")
def get_engagement_summary(
    creator_id: int,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    analytics = (
        db.query(Analytics)
        .filter(
            Analytics.creator_id == creator_id
        )
        .order_by(
            Analytics.date.asc()
        )
        .all()
    )

    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="No analytics data found for this creator"
        )

    total_views = sum(
        item.views for item in analytics
    )

    total_likes = sum(
        item.likes for item in analytics
    )

    total_comments = sum(
        item.comments for item in analytics
    )

    total_shares = sum(
        item.shares for item in analytics
    )

    total_saves = sum(
        item.saves for item in analytics
    )

    total_reach = sum(
        item.reach for item in analytics
    )

    total_engagement = (
        total_likes
        + total_comments
        + total_shares
        + total_saves
    )

    if total_reach > 0:

        engagement_rate = (
            total_engagement
            / total_reach
        ) * 100

    else:

        engagement_rate = 0

    return {
        "creator_id": creator_id,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_saves": total_saves,
        "total_engagement": total_engagement,
        "total_reach": total_reach,
        "engagement_rate": round(
            engagement_rate,
            2
        )
    }


# =========================
# GROWTH & TREND DATA
# =========================

@router.get("/{creator_id}/growth")
def get_creator_growth(
    creator_id: int,
    current_user: User = Depends(get_current_creator),
    db: Session = Depends(get_db)
):
    verify_creator_access(creator_id, current_user)

    analytics = (
        db.query(Analytics)
        .filter(
            Analytics.creator_id == creator_id
        )
        .order_by(
            Analytics.date.asc()
        )
        .all()
    )

    if not analytics:
        raise HTTPException(
            status_code=404,
            detail="No analytics data found for this creator"
        )

    growth_data = []

    previous_views = None
    previous_followers = None
    previous_engagement = None

    for item in analytics:

        # -------------------------
        # TOTAL ENGAGEMENT
        # -------------------------

        total_engagement = (
            item.likes
            + item.comments
            + item.shares
            + item.saves
        )


        # -------------------------
        # VIEWS GROWTH
        # -------------------------

        if previous_views is None:

            views_growth = 0

        elif previous_views > 0:

            views_growth = (
                (item.views - previous_views)
                / previous_views
            ) * 100

        else:

            views_growth = 0


        # -------------------------
        # FOLLOWERS GROWTH
        # -------------------------

        if previous_followers is None:

            followers_growth = 0

        elif previous_followers > 0:

            followers_growth = (
                (item.followers - previous_followers)
                / previous_followers
            ) * 100

        else:

            followers_growth = 0


        # -------------------------
        # ENGAGEMENT GROWTH
        # -------------------------

        if previous_engagement is None:

            engagement_growth = 0

        elif previous_engagement > 0:

            engagement_growth = (
                (
                    total_engagement
                    - previous_engagement
                )
                / previous_engagement
            ) * 100

        else:

            engagement_growth = 0


        # -------------------------
        # ADD RESULT
        # -------------------------

        growth_data.append({

            "date": item.date,

            "views": item.views,

            "followers": item.followers,

            "engagement": total_engagement,

            "views_growth": round(
                views_growth,
                2
            ),

            "followers_growth": round(
                followers_growth,
                2
            ),

            "engagement_growth": round(
                engagement_growth,
                2
            )
        })


        # -------------------------
        # UPDATE PREVIOUS VALUES
        # -------------------------

        previous_views = item.views

        previous_followers = item.followers

        previous_engagement = (
            total_engagement
        )


    return {
        "creator_id": creator_id,
        "growth": growth_data
    }


def verify_creator_access(creator_id: int, current_user: User):
    if current_user.id != creator_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access another creator's analytics",
        )