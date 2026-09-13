from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import User, Notification
from app.schemas.schemas import NotificationResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    return db.query(Notification).filter(
        Notification.user_id == target_user_id
    ).order_by(desc(Notification.created_at)).all()


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    db.query(Notification).filter(
        Notification.user_id == target_user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
