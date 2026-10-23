from typing import List, Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ConnectedAccount
from app.schemas import ContentItem
from app.services.youtube import youtube_api
from app.services.linkedin import linkedin_api
from app.services.instagram import instagram_api

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

    # 3. Fetch real posts from Instagram if connected
    ig_acc = next((a for a in accounts if a.platform == "instagram" and a.access_token), None)
    if ig_acc and (not platform or platform.lower() in ["all", "instagram"]):
        try:
            ig_posts = await instagram_api.get_recent_posts(ig_acc.access_token, max_results=20)
            results.extend(ig_posts)
        except Exception as e:
            print(f"Error fetching Instagram content: {e}")

    # Apply search filter
    if search:
        results = [item for item in results if search.lower() in item["title"].lower()]
        
    return results

@router.get("/user", response_model=List[ContentItem])
async def get_user_content(username: str):
    # Fetch posts for a specific username (for Watchlist/Favorites)
    try:
        # We use access_token parameter as the username for SerpApi
        ig_posts = await instagram_api.get_recent_posts(access_token=username, max_results=20)
        return ig_posts
    except Exception as e:
        print(f"Error fetching user content for {username}: {e}")
        return []
