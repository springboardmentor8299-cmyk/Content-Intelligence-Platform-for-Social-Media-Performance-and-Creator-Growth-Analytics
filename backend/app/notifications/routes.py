
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.security import get_current_user
from app.database import get_db
from app.models import User
from app.models.notification import Notification
from app.models.sponsorship import Sponsorship

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.creator_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.creator_id == current_user.id,
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = 1
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification": notification,
    }


@router.post("/generate-sponsorship-alerts")
def generate_sponsorship_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    upcoming_limit = today + timedelta(days=7)
    sponsorships = (
        db.query(Sponsorship)
        .filter(Sponsorship.creator_id == current_user.id)
        .all()
    )

    created_count = 0

    for sponsorship in sponsorships:
        alerts = []

        if (sponsorship.payment_status or "").lower() == "pending":
            alerts.append((
                "pending_payment",
                f"Payment pending: {sponsorship.campaign_name}",
                f"Payment of {sponsorship.amount} "
                f"{sponsorship.currency} from {sponsorship.brand_name} "
                "is still pending.",
            ))

        if (
            sponsorship.due_date
            and today <= sponsorship.due_date <= upcoming_limit
            and (sponsorship.payment_status or "").lower() != "paid"
        ):
            alerts.append((
                "upcoming_due_date",
                f"Upcoming due date: {sponsorship.campaign_name}",
                f"The sponsorship payment from {sponsorship.brand_name} "
                f"is due on {sponsorship.due_date.isoformat()}.",
            ))

        for alert_type, title, message in alerts:
            existing = (
                db.query(Notification)
                .filter(
                    Notification.creator_id == current_user.id,
                    Notification.notification_type == alert_type,
                    Notification.title == title,
                )
                .first()
            )

            if existing:
                continue

            db.add(Notification(
                creator_id=current_user.id,
                title=title,
                message=message,
                notification_type=alert_type,
                is_read=0,
            ))
            created_count += 1

    db.commit()

    return {
        "message": "Sponsorship alerts processed",
        "created_count": created_count,
    }
