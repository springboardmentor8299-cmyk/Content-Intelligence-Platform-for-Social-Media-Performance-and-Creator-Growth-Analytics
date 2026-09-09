from typing import Any

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models import User

router = APIRouter()

MOCK_ANALYTICS = {
    "kpis": {
        "reach": 128400,
        "engagement_rate": 8.4,
        "audience_growth": 12.7,
        "revenue": 4820,
    },
    "time_series": [
        {"date": "Mon", "reach": 112000, "views": 18500, "likes": 1420, "growth": 9.1},
        {"date": "Tue", "reach": 117500, "views": 22400, "likes": 1860, "growth": 9.6},
        {"date": "Wed", "reach": 122300, "views": 19800, "likes": 1590, "growth": 10.4},
        {"date": "Thu", "reach": 126900, "views": 27600, "likes": 2310, "growth": 11.2},
        {"date": "Fri", "reach": 131200, "views": 31200, "likes": 2740, "growth": 12.1},
        {"date": "Sat", "reach": 135000, "views": 28900, "likes": 2480, "growth": 12.3},
        {"date": "Sun", "reach": 142400, "views": 34000, "likes": 3020, "growth": 13.1},
    ],
    "engagement": [
        {"date": "Mon", "views": 18500, "likes": 1420},
        {"date": "Tue", "views": 22400, "likes": 1860},
        {"date": "Wed", "views": 19800, "likes": 1590},
        {"date": "Thu", "views": 27600, "likes": 2310},
        {"date": "Fri", "views": 31200, "likes": 2740},
        {"date": "Sat", "views": 28900, "likes": 2480},
        {"date": "Sun", "views": 34000, "likes": 3020},
    ],
    "demographics": [
        {"age": "13-17", "female": 8, "male": 6},
        {"age": "18-24", "female": 28, "male": 22},
        {"age": "25-34", "female": 19, "male": 11},
        {"age": "35-44", "female": 4, "male": 2},
    ],
    "countries": [
        {"country": "United States", "value": 38},
        {"country": "United Kingdom", "value": 23},
        {"country": "Canada", "value": 19},
        {"country": "Australia", "value": 14},
        {"country": "Brazil", "value": 11},
        {"country": "Germany", "value": 9},
    ],
    "active_hours": [
        {"hour": "08:00", "engagement": 18},
        {"hour": "10:00", "engagement": 22},
        {"hour": "12:00", "engagement": 33},
        {"hour": "14:00", "engagement": 48},
        {"hour": "16:00", "engagement": 52},
        {"hour": "18:00", "engagement": 69},
        {"hour": "20:00", "engagement": 58},
        {"hour": "22:00", "engagement": 37},
    ],
    "revenue_trend": [
        {"date": "Mon", "revenue": 420},
        {"date": "Tue", "revenue": 610},
        {"date": "Wed", "revenue": 540},
        {"date": "Thu", "revenue": 780},
        {"date": "Fri", "revenue": 860},
        {"date": "Sat", "revenue": 720},
        {"date": "Sun", "revenue": 890},
    ],
    "content": [
        {"title": "Behind the scenes", "platform": "YouTube", "views": 34000, "engagement": "9.1%", "engagement_rate": "9.1%", "status": "Published", "type": "Short"},
        {"title": "Three editing tips", "platform": "Instagram", "views": 27600, "engagement": "8.6%", "engagement_rate": "8.6%", "status": "Trending", "type": "Reel"},
        {"title": "Weekly creator notes", "platform": "TikTok", "views": 22400, "engagement": "7.8%", "engagement_rate": "7.8%", "status": "Draft", "type": "Video"},
        {"title": "Brand partnership recap", "platform": "YouTube", "views": 40200, "engagement": "10.4%", "engagement_rate": "10.4%", "status": "Published", "type": "Podcast"},
        {"title": "Creator productivity checklist", "platform": "LinkedIn", "views": 18100, "engagement": "6.2%", "engagement_rate": "6.2%", "status": "Published", "type": "Article"},
    ],
}


@router.get("/analytics/overview")
async def analytics_overview(user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {"user_id": user.id, **MOCK_ANALYTICS}


@router.get("/analytics/content")
async def analytics_content(user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {"user_id": user.id, "items": MOCK_ANALYTICS["content"], "filters": ["All", "Published", "Draft", "Trending"]}


@router.get("/analytics/audience")
async def analytics_audience(user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {
        "user_id": user.id,
        "demographics": MOCK_ANALYTICS["demographics"],
        "countries": MOCK_ANALYTICS["countries"],
        "active_hours": MOCK_ANALYTICS["active_hours"],
    }
