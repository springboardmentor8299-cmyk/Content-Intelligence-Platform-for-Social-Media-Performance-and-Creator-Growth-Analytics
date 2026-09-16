from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ConnectedAccount
from app.schemas import ContentItem
from app.services.youtube import youtube_api
from app.services.linkedin import linkedin_api

router = APIRouter()

@router.get("/", response_model=List[ContentItem])
async def list_content(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    search: Optional[str] = Query(None, description="Search by title"),
    db: Session = Depends(get_db)
):
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    results = []
    
    # 1. Fetch real videos from YouTube if connected
    yt_acc = next((a for a in accounts if a.platform == "youtube" and a.access_token), None)
    if yt_acc and (not platform or platform.lower() in ["all", "youtube"]):
        try:
            yt_videos = await youtube_api.get_recent_videos(yt_acc.access_token, max_results=20)
            results.extend(yt_videos)
        except Exception as e:
            print(f"Error fetching YouTube content: {e}")

    # 2. Fetch real posts from LinkedIn if connected
    li_acc = next((a for a in accounts if a.platform == "linkedin" and a.access_token), None)
    if li_acc and (not platform or platform.lower() in ["all", "linkedin"]):
        try:
            li_posts = await linkedin_api.get_recent_posts(li_acc.access_token, max_results=20)
            results.extend(li_posts)
        except Exception as e:
            print(f"Error fetching LinkedIn content: {e}")

    # Apply search filter
    if search:
        results = [item for item in results if search.lower() in item["title"].lower()]
        
    return results
