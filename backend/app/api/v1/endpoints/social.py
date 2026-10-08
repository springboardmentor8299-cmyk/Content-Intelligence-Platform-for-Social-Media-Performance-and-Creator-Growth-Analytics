from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, SocialAccount, ContentItem
from app.schemas.schemas import SocialAccountResponse
from app.api.deps import get_current_user, require_role
from app.integrations import (
    YouTubeIntegrationService,
    InstagramIntegrationService,
    FacebookIntegrationService,
    XIntegrationService,
    LinkedInIntegrationService
)

router = APIRouter()

# Strictly the 5 supported platforms: YouTube, Instagram, Facebook, X, LinkedIn. TikTok is strictly excluded.
CORE_PLATFORMS = ["youtube", "instagram", "facebook", "x", "linkedin"]


def _get_target_user_id(db: Session, current_user: User) -> int:
    if current_user.role == "creator":
        return current_user.id
    first_creator = db.query(User).filter(User.role == "creator").first()
    return first_creator.id if first_creator else current_user.id


@router.get("/accounts", response_model=List[SocialAccountResponse])
def get_social_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == target_user_id).all()
    # Filter strictly to the 5 core platforms
    filtered = [a for a in accounts if a.platform.lower() in CORE_PLATFORMS]
    
    # Ensure all 5 platforms exist for consistent ordering
    order_map = {p: i for i, p in enumerate(CORE_PLATFORMS)}
    filtered.sort(key=lambda a: order_map.get(a.platform.lower(), 99))
    return filtered


@router.get("/platforms/status")
def get_platforms_status(
    current_user: User = Depends(get_current_user)
):
    """Returns honest live connector and configuration status for all 5 platforms."""
    yt_status = YouTubeIntegrationService().get_status()
    ig_status = InstagramIntegrationService().get_status()
    fb_status = FacebookIntegrationService().get_status()
    x_status = XIntegrationService().get_status()
    li_status = LinkedInIntegrationService().get_status()

    platforms = [yt_status, ig_status, fb_status, x_status, li_status]
    connected_count = sum(1 for p in platforms if p.get("is_connected"))

    return {
        "platforms": platforms,
        "connected_count": connected_count,
        "total_supported": 5,
        "supported_platforms": CORE_PLATFORMS
    }


@router.post("/accounts/{account_id}/sync", response_model=SocialAccountResponse)
def sync_social_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "agency", "admin"]))
):
    target_user_id = _get_target_user_id(db, current_user)
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == target_user_id
    ).first()

    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Social account not found")

    p = account.platform.lower()
    if p == "youtube":
        yt_service = YouTubeIntegrationService()
        yt_data = yt_service.fetch_public_channel_data()
        if yt_data.get("subscribers"):
            account.followers_count = yt_data["subscribers"]
        account.last_synced_at = datetime.utcnow()
        account.is_connected = True

    elif p == "instagram":
        ig_service = InstagramIntegrationService()
        if ig_service.is_configured():
            ig_data = ig_service.fetch_profile_and_posts()
            if ig_data.get("is_live") and ig_data.get("followers_count") is not None:
                account.followers_count = ig_data["followers_count"]
                account.is_connected = True

                # Cleanly persist returned public posts into ContentItem
                for post in ig_data.get("posts", []):
                    post_url = post.get("url")
                    title = post.get("caption") or "Instagram Post"
                    existing_item = None
                    if post_url:
                        existing_item = db.query(ContentItem).filter(
                            ContentItem.user_id == target_user_id,
                            ContentItem.platform == "instagram",
                            ContentItem.url == post_url
                        ).first()
                    if not existing_item:
                        new_item = ContentItem(
                            user_id=target_user_id,
                            platform="instagram",
                            title=title,
                            content_type="reel" if post.get("views") else "post",
                            url=post_url,
                            views=int(post.get("views") or 0),
                            likes=int(post.get("likes") or 0),
                            comments=int(post.get("comments") or 0),
                            shares=0,
                            saves=0,
                            reach=0,
                            impressions=0,
                            engagement_rate=round(
                                ((int(post.get("likes") or 0) + int(post.get("comments") or 0)) / max(1, int(ig_data.get("followers_count") or 1))) * 100, 2
                            )
                        )
                        db.add(new_item)
                    else:
                        if post.get("views") is not None:
                            existing_item.views = int(post["views"])
                        if post.get("likes") is not None:
                            existing_item.likes = int(post["likes"])
                        if post.get("comments") is not None:
                            existing_item.comments = int(post["comments"])
            else:
                account.is_connected = False
        else:
            # Honest state: RapidAPI credentials required
            account.is_connected = False
        account.last_synced_at = datetime.utcnow()

    elif p == "facebook":
        fb_service = FacebookIntegrationService()
        account.is_connected = fb_service.is_configured()
        account.last_synced_at = datetime.utcnow()

    elif p == "x":
        x_service = XIntegrationService()
        if x_service.is_configured():
            x_data = x_service.get_account_metrics()
            if x_data.get("is_live") and x_data.get("followers_count") is not None:
                account.followers_count = x_data["followers_count"]
                account.is_connected = True
            else:
                account.is_connected = False
        else:
            account.is_connected = False
        account.last_synced_at = datetime.utcnow()

    elif p == "linkedin":
        li_service = LinkedInIntegrationService()
        if li_service.is_configured():
            li_data = li_service.get_organization_page_analytics()
            if li_data.get("is_live"):
                if li_data.get("followers_count") is not None and li_data["followers_count"] > 0:
                    account.followers_count = li_data["followers_count"]
                account.is_connected = True
            else:
                account.is_connected = False
        else:
            account.is_connected = False
        account.last_synced_at = datetime.utcnow()

    db.commit()
    db.refresh(account)
    return account


@router.post("/accounts/{account_id}/toggle", response_model=SocialAccountResponse)
def toggle_social_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    target_user_id = _get_target_user_id(db, current_user)
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == target_user_id
    ).first()

    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Social account not found")

    # In demonstration mode, only verified configured connectors can show connected
    if account.platform.lower() == "youtube":
        account.is_connected = True
    elif account.platform.lower() == "instagram":
        account.is_connected = InstagramIntegrationService().is_configured()
    elif account.platform.lower() == "facebook":
        account.is_connected = FacebookIntegrationService().is_configured()
    elif account.platform.lower() == "x":
        account.is_connected = XIntegrationService().is_configured()
    elif account.platform.lower() == "linkedin":
        account.is_connected = LinkedInIntegrationService().is_configured()

    db.commit()
    db.refresh(account)
    return account
