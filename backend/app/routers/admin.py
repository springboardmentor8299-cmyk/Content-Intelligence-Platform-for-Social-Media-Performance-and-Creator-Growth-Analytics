import uuid
import io
import csv
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models import ConnectedAccount
from app.routers.auth import MOCK_USERS

router = APIRouter()

class UserRoleUpdate(BaseModel):
    role: str
    is_active: bool

class UserCreate(BaseModel):
    email: str
    full_name: str
    role: str
    password: Optional[str] = "password123"

AUDIT_LOGS = [
    {
        "id": "aud-101",
        "timestamp": "2026-09-15 21:54:15 UTC",
        "actor": "admin@creatoriq.com",
        "action": "SYSTEM_STARTUP",
        "resource": "FastAPI Server & SQLite Engine",
        "status": "SUCCESS",
        "ip_address": "127.0.0.1"
    },
    {
        "id": "aud-102",
        "timestamp": "2026-09-15 21:54:43 UTC",
        "actor": "creator@creatoriq.com",
        "action": "OAUTH_TOKEN_REFRESH",
        "resource": "YouTube Data API v3",
        "status": "SUCCESS",
        "ip_address": "127.0.0.1"
    },
    {
        "id": "aud-103",
        "timestamp": "2026-09-15 21:54:48 UTC",
        "actor": "agency@creatoriq.com",
        "action": "PORTAL_AUTHENTICATION",
        "resource": "Agency Talent Roster",
        "status": "SUCCESS",
        "ip_address": "127.0.0.1"
    },
    {
        "id": "aud-104",
        "timestamp": "2026-09-15 21:55:04 UTC",
        "actor": "marketing@creatoriq.com",
        "action": "CAMPAIGN_ROI_AUDIT",
        "resource": "Notion AI Sponsorship",
        "status": "SUCCESS",
        "ip_address": "127.0.0.1"
    }
]

@router.get("/users")
def get_all_users():
    users_list = []
    for email, user in MOCK_USERS.items():
        users_list.append({
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "avatar_url": user["avatar_url"],
            "is_active": user["is_active"],
            "created_at": user["created_at"].isoformat() if hasattr(user["created_at"], "isoformat") else str(user["created_at"]),
        })
    return users_list

@router.post("/users")
def create_new_user(payload: UserCreate):
    email = payload.email.strip().lower()
    if email in MOCK_USERS:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "email": email,
        "password": payload.password or "password123",
        "full_name": payload.full_name,
        "role": payload.role,
        "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.full_name.replace(' ', '')}",
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    MOCK_USERS[email] = new_user
    
    AUDIT_LOGS.insert(0, {
        "id": f"aud-{datetime.now(timezone.utc).timestamp()}",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "actor": "admin@creatoriq.com",
        "action": f"USER_PROVISION_{payload.role.upper()}",
        "resource": f"Created user {email}",
        "status": "SUCCESS",
        "ip_address": "127.0.0.1"
    })
    
    return {"status": "success", "user": {
        "id": new_user["id"],
        "email": new_user["email"],
        "full_name": new_user["full_name"],
        "role": new_user["role"],
        "is_active": new_user["is_active"]
    }}

@router.patch("/users/{user_id}/status")
def update_user_status(user_id: str, payload: UserRoleUpdate):
    for email, user in MOCK_USERS.items():
        if user["id"] == user_id:
            user["role"] = payload.role
            user["is_active"] = payload.is_active
            AUDIT_LOGS.insert(0, {
                "id": f"aud-{datetime.now(timezone.utc).timestamp()}",
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                "actor": "admin@creatoriq.com",
                "action": f"USER_UPDATE_{payload.role.upper()}",
                "resource": f"User {user['email']}",
                "status": "SUCCESS",
                "ip_address": "127.0.0.1"
            })
            return {"status": "success", "user": user}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/system-health")
def get_system_health(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).all()
    connected_count = len([a for a in accounts if a.is_connected])
    
    return {
        "api_quotas": [
            {
                "service": "YouTube Data API v3",
                "used_units": 1420,
                "daily_limit": 10000,
                "utilization": "14.2%",
                "status": "Optimal"
            },
            {
                "service": "LinkedIn OpenID & UGC API",
                "used_units": 340,
                "daily_limit": 5000,
                "utilization": "6.8%",
                "status": "Optimal"
            },
            {
                "service": "Instagram Graph API",
                "used_units": 80,
                "daily_limit": 4800,
                "utilization": "1.6%",
                "status": "Optimal"
            }
        ],
        "database": {
            "engine": "SQLite / SQLAlchemy ORM",
            "latency_ms": 1.2,
            "connected_accounts_records": len(accounts),
            "active_connections": connected_count,
            "status": "Healthy"
        },
        "system_metrics": {
            "uptime": "99.98%",
            "active_worker_threads": 4,
            "memory_usage_mb": 64.5,
            "environment": "Development / Localhost"
        }
    }

@router.get("/audit-logs")
def get_audit_logs():
    return AUDIT_LOGS

@router.get("/export-audit-csv")
def export_audit_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CreatorIQ Enterprise Security & Audit Log"])
    writer.writerow(["Exported At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    writer.writerow([])
    writer.writerow(["Event ID", "Timestamp", "Actor", "Action", "Target Resource", "Status", "IP Address"])
    for a in AUDIT_LOGS:
        writer.writerow([
            a["id"], a["timestamp"], a["actor"], a["action"],
            a["resource"], a["status"], a["ip_address"]
        ])
        
    filename = f"creatoriq_audit_log_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

