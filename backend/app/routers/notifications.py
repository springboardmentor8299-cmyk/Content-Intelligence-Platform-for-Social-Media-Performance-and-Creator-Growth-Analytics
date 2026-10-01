import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Notification, ConnectedAccount
from app.schemas_extended import NotificationCreate

router = APIRouter()

INITIAL_NOTIFICATIONS = [
    {
        "id": "notif-01",
        "title": "🎉 Subscriber Milestone Reached",
        "message": "YouTube channel crossed 100+ active subscribers! Keep up the momentum towards the 1,000 YPP threshold.",
        "type": "milestone",
        "category": "milestone",
        "timestamp": "10 mins ago",
        "is_read": False,
        "action_url": "/dashboard"
    },
    {
        "id": "notif-02",
        "title": "💰 Sponsorship Payout Credited",
        "message": "NordVPN milestone payout ($4,200.00) was successfully processed to your primary bank account.",
        "type": "sponsorship",
        "category": "revenue",
        "timestamp": "2 hours ago",
        "is_read": False,
        "action_url": "/revenue"
    },
    {
        "id": "notif-03",
        "title": "⚡ YouTube Ingestion Live",
        "message": "OAuth data pipeline active for @SPTKING_GAMING.LIVE.. Channel statistics synchronized.",
        "type": "sync",
        "category": "sync",
        "timestamp": "5 hours ago",
        "is_read": True,
        "action_url": "/connections"
    },
    {
        "id": "notif-04",
        "title": "📈 High Engagement Spike Detected",
        "message": "Your latest upload '3 TIPS TO BECOME PRO IN CS2' achieved an 8.4% engagement rate (35% above channel average).",
        "type": "alert",
        "category": "performance",
        "timestamp": "1 day ago",
        "is_read": True,
        "action_url": "/content"
    },
    {
        "id": "notif-05",
        "title": "🛡️ Security Audit: New Login Session",
        "message": "Secure authentication handshake established from macOS Safari (IP: 192.168.1.104).",
        "type": "security",
        "category": "security",
        "timestamp": "2 days ago",
        "is_read": True,
        "action_url": "/settings"
    }
]

def seed_notifications_if_empty(db: Session):
    count = db.query(Notification).count()
    if count == 0:
        for item in INITIAL_NOTIFICATIONS:
            notif = Notification(
                id=item["id"],
                title=item["title"],
                message=item["message"],
                type=item["type"],
                category=item["category"],
                timestamp=item["timestamp"],
                is_read=item["is_read"],
                action_url=item.get("action_url")
            )
            db.add(notif)
        db.commit()

@router.get("/")
def list_notifications(
    category: str = Query("all", description="Filter by category: all, revenue, sync, milestone, security"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    db: Session = Depends(get_db)
):
    seed_notifications_if_empty(db)
    query = db.query(Notification)
    
    if category and category != "all":
        query = query.filter(Notification.category == category)
        
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
        
    items = query.order_by(Notification.created_at.desc()).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "category": n.category,
            "timestamp": n.timestamp or "Recently",
            "is_read": n.is_read,
            "action_url": n.action_url,
            "created_at": n.created_at.isoformat() if n.created_at else None
        }
        for n in items
    ]

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db)):
    seed_notifications_if_empty(db)
    count = db.query(Notification).filter(Notification.is_read == False).count()
    return {"unread_count": count}

@router.post("/create")
def create_notification(data: NotificationCreate, db: Session = Depends(get_db)):
    seed_notifications_if_empty(db)
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:6]}",
        title=data.title,
        message=data.message,
        type=data.type,
        category=data.category,
        timestamp="Just now",
        is_read=False,
        action_url=data.action_url
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return {"status": "success", "notification": {"id": notif.id, "title": notif.title}}

@router.patch("/{notif_id}/read")
def mark_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "success", "id": notif_id, "is_read": True}

@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    seed_notifications_if_empty(db)
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"status": "success", "unread_count": 0}

@router.delete("/{notif_id}")
def delete_notification(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"status": "success", "message": "Notification dismissed"}
