from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, SocialAccount
from app.schemas.schemas import SocialAccountResponse
from app.api.deps import get_current_user, require_role

router = APIRouter()


@router.get("/accounts", response_model=List[SocialAccountResponse])
def get_social_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    return db.query(SocialAccount).filter(SocialAccount.user_id == target_user_id).all()


@router.post("/accounts/{account_id}/sync", response_model=SocialAccountResponse)
def sync_social_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "agency", "admin"]))
):
    account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")

    # Simulate realistic demo sync bump
    account.last_synced_at = datetime.utcnow()
    account.followers_count += 120  # organic telemetry increase
    db.commit()
    db.refresh(account)
    return account


@router.post("/accounts/{account_id}/toggle", response_model=SocialAccountResponse)
def toggle_social_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["creator", "admin"]))
):
    account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")

    account.is_connected = not account.is_connected
    db.commit()
    db.refresh(account)
    return account
