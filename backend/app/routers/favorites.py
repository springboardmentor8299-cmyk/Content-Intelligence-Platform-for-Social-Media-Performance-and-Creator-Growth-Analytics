from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import FavoriteProfile
from pydantic import BaseModel
import httpx
from app.services.instagram import instagram_api

router = APIRouter()

class FavoriteProfileSchema(BaseModel):
    id: str
    platform: str
    username: str
    platform_user_id: Optional[str] = None
    followers_count: int = 0
    profile_picture_url: Optional[str] = None

class AddFavoriteRequest(BaseModel):
    platform: str
    username: str

@router.get("/", response_model=List[FavoriteProfileSchema])
def list_favorites(db: Session = Depends(get_db)):
    return db.query(FavoriteProfile).all()

@router.post("/", response_model=FavoriteProfileSchema)
async def add_favorite(req: AddFavoriteRequest, db: Session = Depends(get_db)):
    # Currently we only support Instagram favorites via SerpApi for this demo
    if req.platform.lower() != "instagram":
        raise HTTPException(status_code=400, detail="Only instagram is supported for favorites demo")
    
    # Check if already exists
    existing = db.query(FavoriteProfile).filter(FavoriteProfile.username == req.username).first()
    if existing:
        return existing
        
    # Fetch profile data from SerpApi
    try:
        profile = await instagram_api.get_user_profile(access_token=req.username)
        new_fav = FavoriteProfile(
            platform="instagram",
            username=req.username,
            platform_user_id=profile.get("platform_user_id"),
            followers_count=profile.get("followers_count", 0),
            profile_picture_url=profile.get("profile_picture_url")
        )
        db.add(new_fav)
        db.commit()
        db.refresh(new_fav)
        return new_fav
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch profile: {str(e)}")

@router.delete("/{fav_id}")
def delete_favorite(fav_id: str, db: Session = Depends(get_db)):
    fav = db.query(FavoriteProfile).filter(FavoriteProfile.id == fav_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"status": "success"}
