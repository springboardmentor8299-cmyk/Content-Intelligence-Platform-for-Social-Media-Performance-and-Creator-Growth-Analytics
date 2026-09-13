import csv
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, ContentItem, RevenueRecord, ScheduledReport
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/export-csv")
def export_analytics_csv(
    report_type: str = Query("content"),  # content, revenue
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user_id = current_user.id
    if current_user.role != "creator":
        first_creator = db.query(User).filter(User.role == "creator").first()
        if first_creator:
            target_user_id = first_creator.id

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "revenue":
        records = db.query(RevenueRecord).filter(RevenueRecord.user_id == target_user_id).all()
        writer.writerow(["ID", "Source", "Title", "Brand Name", "Amount ($)", "Status", "Date"])
        for r in records:
            writer.writerow([r.id, r.source, r.title, r.brand_name or "N/A", r.amount, r.status, r.date.strftime("%Y-%m-%d")])
        filename = f"CreatorIQ_Revenue_Export_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    else:
        items = db.query(ContentItem).filter(ContentItem.user_id == target_user_id).all()
        writer.writerow(["ID", "Platform", "Title", "Content Type", "Views", "Likes", "Comments", "Shares", "Saves", "Engagement Rate (%)", "Watch Time (Hrs)", "Published Date"])
        for c in items:
            writer.writerow([
                c.id, c.platform, c.title, c.content_type, c.views, c.likes,
                c.comments, c.shares, c.saves, c.engagement_rate, c.watch_time_hours,
                c.published_at.strftime("%Y-%m-%d")
            ])
        filename = f"CreatorIQ_Content_Export_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/scheduled")
def get_scheduled_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ScheduledReport).filter(ScheduledReport.user_id == current_user.id).all()


@router.post("/scheduled/{report_id}/toggle")
def toggle_scheduled_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rep = db.query(ScheduledReport).filter(ScheduledReport.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Scheduled report not found")
    rep.is_active = not rep.is_active
    db.commit()
    db.refresh(rep)
    return rep
