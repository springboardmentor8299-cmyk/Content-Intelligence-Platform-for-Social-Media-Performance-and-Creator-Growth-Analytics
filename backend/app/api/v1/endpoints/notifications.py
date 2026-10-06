from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import User, Notification
from app.schemas.schemas import NotificationResponse
from app.api.deps import get_current_user

router = APIRouter()


def _get_target_user_id(db: Session, current_user: User) -> int:
    if current_user.role == "creator":
        return current_user.id
    first_creator = db.query(User).filter(User.role == "creator").first()
    return first_creator.id if first_creator else current_user.id


@router.get("", response_model=List[NotificationResponse])
@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    notification_type: Optional[str] = Query(None),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    query = db.query(Notification).filter(Notification.user_id == target_user_id)

    if notification_type and notification_type.lower() != "all":
        query = query.filter(Notification.notification_type == notification_type.lower())

    if unread_only:
        query = query.filter(Notification.is_read == False)

    return query.order_by(desc(Notification.created_at)).all()


@router.get("/unread-count")
def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    count = db.query(Notification).filter(
        Notification.user_id == target_user_id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == target_user_id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification with ID {notification_id} not found."
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.patch("/read-all")
@router.post("/read-all")
@router.post("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = _get_target_user_id(db, current_user)
    updated_count = db.query(Notification).filter(
        Notification.user_id == target_user_id,
        Notification.is_read == False
    ).update({"is_read": True})

    db.commit()
    return {"message": "All notifications marked as read", "updated_count": updated_count}
