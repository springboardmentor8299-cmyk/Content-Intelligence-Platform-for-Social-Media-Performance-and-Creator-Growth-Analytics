from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import urllib.parse
import httpx

from app.database import get_db
from app.models import ConnectedAccount
from app.schemas_extended import SocialConnection, SyncRequest, SyncResponse
from app.config import settings

# Import API services
from app.services.youtube import youtube_api
from app.services.instagram import instagram_api
from app.services.linkedin import linkedin_api
from app.services.tiktok import tiktok_api
from app.services.twitter import twitter_api

router = APIRouter()

API_SERVICES = {
    "youtube": youtube_api,
    "instagram": instagram_api,
    "linkedin": linkedin_api,
    "tiktok": tiktok_api,
    "twitter": twitter_api,
}

ICON_BGS = {
    "youtube": "#ff0000",
    "instagram": "#e4405f",
    "linkedin": "#0a66c2",
    "tiktok": "#010101",
    "twitter": "#1da1f2"
}

@router.get("/", response_model=List[SocialConnection])
def list_connections(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).all()
    result = []
    for acc in accounts:
        result.append(SocialConnection(
            id=acc.id,
            platform=acc.platform.capitalize(),
            username=acc.username,
            platform_user_id=acc.platform_user_id or "",
            followers=acc.followers_count or 0,
            is_connected=acc.is_connected,
            status="connected" if acc.is_connected else "disconnected",
            last_synced="Just now" if acc.last_synced_at else "Never",
            icon_bg=acc.icon_bg or ICON_BGS.get(acc.platform.lower(), "#2563eb")
        ))
    return result

@router.get("/connect/{platform}")
def connect_platform(platform: str):
    platform_key = platform.lower()
    if platform_key not in API_SERVICES:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    api = API_SERVICES[platform_key]
    auth_url = api.get_auth_url()
    return {"auth_url": auth_url}

@router.get("/callback/{platform}")
async def callback_platform(
    platform: str, 
    code: Optional[str] = Query(None), 
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    platform_key = platform.lower()
    if platform_key not in API_SERVICES:
        raise HTTPException(status_code=400, detail="Unsupported platform")
    
    if error or not code:
        err_msg = error_description or error or "OAuth authorization was denied or failed"
        encoded_err = urllib.parse.quote(err_msg)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?error={encoded_err}&platform={platform_key}")
    
    api = API_SERVICES[platform_key]
    
    try:
        # 1. Exchange code for token
        token_data = await api.exchange_code(code)
        access_token = token_data.get("access_token")
        
        # 2. Fetch real profile info
        profile = await api.get_user_profile(access_token)
        
        # 3. Save or update database
        account = db.query(ConnectedAccount).filter(ConnectedAccount.platform == platform_key).first()
        if not account:
            account = ConnectedAccount(platform=platform_key)
            db.add(account)
            
        account.access_token = access_token
        account.refresh_token = token_data.get("refresh_token") or account.refresh_token
        account.platform_user_id = profile.get("platform_user_id")
        account.username = profile.get("username", "Connected User")
        account.followers_count = profile.get("followers_count", 0)
        account.total_views = profile.get("total_views", 0)
        account.video_count = profile.get("video_count", 0)
        account.profile_picture_url = profile.get("profile_picture_url")
        account.is_connected = True
        account.icon_bg = ICON_BGS.get(platform_key, "#2563eb")
        account.last_synced_at = datetime.now(timezone.utc)
        
        db.commit()
        
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?success=true&platform={platform_key}")
        
    except Exception as e:
        print(f"OAuth Error for {platform}: {e}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/connections?error=token_exchange_failed&platform={platform_key}")

@router.post("/disconnect/{platform}")
def disconnect_platform(platform: str, db: Session = Depends(get_db)):
    platform_key = platform.lower()
    account = db.query(ConnectedAccount).filter(ConnectedAccount.platform == platform_key).first()
    if not account:
        raise HTTPException(status_code=404, detail="Platform connection not found")
        
    account.is_connected = False
    account.access_token = None
    account.refresh_token = None
    db.commit()
    
    return {"status": "success", "message": f"Disconnected {platform_key}"}

@router.post("/sync", response_model=SyncResponse)
async def sync_social_data(request: SyncRequest, db: Session = Depends(get_db)):
    platform_key = request.platform.lower()
    if platform_key != "all":
        accounts = db.query(ConnectedAccount).filter(
            ConnectedAccount.platform == platform_key,
            ConnectedAccount.is_connected == True
        ).all()
    else:
        accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()

    total_synced = 0
    new_views = 0
    new_likes = 0
    new_comments = 0
    new_followers = 0
    
    for acc in accounts:
        api = API_SERVICES.get(acc.platform)
        if api and acc.access_token:
            try:
                profile = await api.get_user_profile(acc.access_token)
                if "followers_count" in profile:
                    acc.followers_count = profile["followers_count"]
                if "total_views" in profile:
                    acc.total_views = profile["total_views"]
                if "video_count" in profile:
                    acc.video_count = profile["video_count"]
                    
                acc.last_synced_at = datetime.now(timezone.utc)
                total_synced += acc.video_count or 1
                new_views += acc.total_views or 0
            except Exception as e:
                print(f"Sync error for {acc.platform}: {e}")
                
    db.commit()
    
    return {
        "status": "success",
        "platform": request.platform,
        "records_synced": total_synced,
        "synced_at": datetime.now(timezone.utc).isoformat(),
        "metrics_summary": {
            "new_views": new_views,
            "new_likes": new_likes,
            "new_comments": new_comments,
            "net_followers_gained": new_followers
        }
    }
