from fastapi import APIRouter

from app.analytics.engagement import calculate_engagement
from app.analytics.audience import audience_report
from app.analytics.trends import calculate_growth
from app.integrations.social_media import get_social_media_data


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# 1. Engagement Analytics
@router.get("/engagement")
def engagement(
    likes: int,
    comments: int,
    shares: int,
    views: int
):
    return calculate_engagement(
        likes,
        comments,
        shares,
        views
    )


# 2. Audience Analytics
@router.get("/audience")
def audience(
    followers: int,
    new_followers: int,
    returning_followers: int
):
    return audience_report(
        followers,
        new_followers,
        returning_followers
    )


# 3. Growth & Trends
@router.get("/trends")
def trends(data: str):
    numbers = [int(x) for x in data.split(",")]
    return calculate_growth(numbers)


# 4. Social Media Integration
@router.get("/social-media")
def social_media(platform: str=None):
    return get_social_media_data(platform)