from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ConnectedAccount
from app.schemas_extended import NotificationItem

router = APIRouter()

@router.get("/", response_model=List[NotificationItem])
def list_notifications(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).all()
    notifications = []
    
    for acc in accounts:
        if acc.is_connected:
            notifications.append({
                "id": f"notif-{acc.platform}-connected",
                "title": f"⚡ {acc.platform.capitalize()} Channel Connected",
                "message": f"Successfully authenticated @{acc.username} with {acc.followers_count or 0} subscribers/followers.",
                "type": "sync",
                "timestamp": "Active",
                "is_read": False,
                "action_url": "/connections"
            })
        else:
            notifications.append({
                "id": f"notif-{acc.platform}-disconnected",
                "title": f"🔌 {acc.platform.capitalize()} Disconnected",
                "message": f"Account @{acc.username} was signed out.",
                "type": "alert",
                "timestamp": "Inactive",
                "is_read": True,
                "action_url": "/connections"
            })
            
    return notifications

@router.post("/mark-all-read")
def mark_all_read():
    return {"status": "success", "unread_count": 0}
