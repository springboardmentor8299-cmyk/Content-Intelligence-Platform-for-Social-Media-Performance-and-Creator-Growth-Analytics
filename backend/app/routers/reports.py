import uuid
import io
import csv
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ReportExport, ScheduledReport, ConnectedAccount, SponsorshipDeal
from app.schemas_extended import (
    ReportExportRequest, ReportExportResponse,
    ScheduledReportItem, ScheduledReportCreate
)

router = APIRouter()

INITIAL_SCHEDULES = [
    {
        "id": "sched-01",
        "title": "Weekly Exec Summary",
        "sub": "Every Monday at 9:00 AM • PDF",
        "frequency": "Weekly",
        "format": "PDF",
        "enabled": True
    },
    {
        "id": "sched-02",
        "title": "Monthly Finance & Sponsorship Sync",
        "sub": "1st of Month at 12:00 PM • CSV",
        "frequency": "Monthly",
        "format": "CSV",
        "enabled": True
    },
    {
        "id": "sched-03",
        "title": "Audience Retention Audit",
        "sub": "Bi-weekly on Friday at 6:00 PM • PDF",
        "frequency": "Bi-weekly",
        "format": "PDF",
        "enabled": False
    }
]

INITIAL_EXPORTS = [
    {
        "id": "exp-2026-08-01",
        "report_name": "Q2 Executive Performance Summary",
        "report_type": "executive_summary",
        "date_range": "90d",
        "file_format": "PDF",
        "file_content": "CreatorIQ Enterprise Performance Report - Q2 2026\nStatus: Verified\nSummary: 1.2M Views across all channels.",
        "size_kb": 1420,
        "status": "ready"
    },
    {
        "id": "exp-2026-08-15",
        "report_name": "Audience Demographics & Geo Distribution",
        "report_type": "audience_demographics",
        "date_range": "30d",
        "file_format": "CSV",
        "file_content": "Metric,Value\nTotal Followers,184500\nTop Country,United States\nEngagement Rate,6.8%",
        "size_kb": 280,
        "status": "ready"
    },
    {
        "id": "exp-2026-09-01",
        "report_name": "Monetization & Sponsorship Audit",
        "report_type": "monetization_audit",
        "date_range": "30d",
        "file_format": "CSV",
        "file_content": "Brand,Platform,Contract,Paid,Status\nNotion AI,YouTube,5500.0,2750.0,active\nNordVPN,YouTube,4200.0,4200.0,completed\nEpidemic Sound,Instagram,3000.0,1500.0,active",
        "size_kb": 410,
        "status": "ready"
    }
]

def seed_reports_if_empty(db: Session):
    if db.query(ScheduledReport).count() == 0:
        for s in INITIAL_SCHEDULES:
            db.add(ScheduledReport(
                id=s["id"],
                title=s["title"],
                sub=s["sub"],
                frequency=s["frequency"],
                format=s["format"],
                enabled=s["enabled"]
            ))
        db.commit()

    if db.query(ReportExport).count() == 0:
        for exp in INITIAL_EXPORTS:
            db.add(ReportExport(
                id=exp["id"],
                report_name=exp["report_name"],
                report_type=exp["report_type"],
                date_range=exp["date_range"],
                file_format=exp["file_format"],
                file_content=exp["file_content"],
                size_kb=exp["size_kb"],
                status=exp["status"],
                download_url=f"/api/v1/reports/download/{exp['id']}"
            ))
        db.commit()

@router.get("/history", response_model=List[ReportExportResponse])
def get_export_history(db: Session = Depends(get_db)):
    seed_reports_if_empty(db)
    exports = db.query(ReportExport).order_by(ReportExport.created_at.desc()).all()
    return [
        ReportExportResponse(
            export_id=e.id,
            report_name=e.report_name,
            file_format=e.file_format,
            download_url=f"/api/v1/reports/download/{e.id}",
            generated_at=e.created_at.strftime("%b %d, %Y • %H:%M") if e.created_at else "Recently",
            size_kb=e.size_kb or 120,
            status=e.status or "ready"
        )
        for e in exports
    ]

@router.post("/generate", response_model=ReportExportResponse)
def generate_report(req: ReportExportRequest, db: Session = Depends(get_db)):
    seed_reports_if_empty(db)
    export_id = f"exp-{uuid.uuid4().hex[:8]}"
    
    # Query database for current metrics
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    deals = db.query(SponsorshipDeal).all()
    
    total_followers = sum(a.followers_count or 0 for a in accounts)
    total_views = sum(a.total_views or 0 for a in accounts)
    total_paid_sponsorships = sum(d.paid_amount for d in deals)
    total_contracts = sum(d.contract_amount for d in deals)
    
    clean_type = req.report_type.replace('_', ' ').title()
    report_name = f"{clean_type} ({req.date_range.upper()})"
    fmt = req.format.upper()
    
    # Build file content based on report type and format
    content_str = ""
    if fmt == "CSV":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["CreatorIQ Enterprise Analytics Report"])
        writer.writerow(["Report Name", report_name])
        writer.writerow(["Generated At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
        writer.writerow(["Date Range", req.date_range])
        writer.writerow([])
        
        # Summary Section
        writer.writerow(["--- HIGH-LEVEL AGGREGATE METRICS ---"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Verified Audience / Followers", total_followers])
        writer.writerow(["Total Aggregated Views", total_views])
        writer.writerow(["Sponsorship Revenue (Realized)", f"${total_paid_sponsorships:,.2f}"])
        writer.writerow(["Active Sponsorship Contract Pipeline", f"${total_contracts:,.2f}"])
        writer.writerow([])
        
        # Connected Accounts
        writer.writerow(["--- CONNECTED PLATFORMS ---"])
        writer.writerow(["Platform", "Handle / Username", "Followers / Subscribers", "Total Views", "Connection Status"])
        for acc in accounts:
            writer.writerow([acc.platform.capitalize(), acc.username, acc.followers_count or 0, acc.total_views or 0, "Connected"])
        writer.writerow([])
        
        # Sponsorship Deals
        writer.writerow(["--- SPONSORSHIP DEALS & MONETIZATION ---"])
        writer.writerow(["Brand", "Campaign Title", "Platform", "Contract Amount ($)", "Paid Amount ($)", "Deliverables", "Status"])
        for d in deals:
            writer.writerow([d.brand_name, d.campaign_title, d.platform, f"{d.contract_amount:.2f}", f"{d.paid_amount:.2f}", d.deliverables, d.status])
            
        content_str = output.getvalue()
    elif fmt == "JSON":
        data = {
            "report_name": report_name,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "date_range": req.date_range,
            "summary": {
                "total_followers": total_followers,
                "total_views": total_views,
                "sponsorship_revenue_paid": total_paid_sponsorships,
                "sponsorship_pipeline_total": total_contracts
            },
            "connected_channels": [
                {"platform": a.platform, "username": a.username, "followers": a.followers_count, "views": a.total_views}
                for a in accounts
            ],
            "sponsorship_deals": [
                {
                    "brand": d.brand_name,
                    "campaign": d.campaign_title,
                    "platform": d.platform,
                    "contract": d.contract_amount,
                    "paid": d.paid_amount,
                    "status": d.status,
                    "deliverables": d.deliverables
                }
                for d in deals
            ]
        }
        content_str = json.dumps(data, indent=2)
    else: # PDF / Text
        content_str = f"""=================================================================
CREATORIQ ENTERPRISE REPORT: {report_name.upper()}
Generated: {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")}
Time Range: {req.date_range}
=================================================================

1. EXECUTIVE KPI SUMMARY
- Total Audience Reach: {total_followers:,} Followers
- Video Impressions & Views: {total_views:,} Views
- Realized Sponsorship Earnings: ${total_paid_sponsorships:,.2f}
- Contracted Deal Pipeline: ${total_contracts:,.2f}
- Verified RPM Benchmark: $6.45 / 1K Views

2. SOCIAL CHANNELS
{chr(10).join([f"- {a.platform.capitalize()} (@{a.username}): {a.followers_count:,} followers, {a.total_views:,} views" for a in accounts])}

3. SPONSORSHIPS & BRAND PARTNERSHIPS
{chr(10).join([f"- {d.brand_name} | {d.campaign_title} | Contract: ${d.contract_amount:,.2f} | Paid: ${d.paid_amount:,.2f} | Status: {d.status.upper()}" for d in deals])}

=================================================================
End of CreatorIQ Verified Report.
"""

    size_kb = max(1, len(content_str.encode('utf-8')) // 1024 + 1)
    
    new_report = ReportExport(
        id=export_id,
        report_name=report_name,
        report_type=req.report_type,
        date_range=req.date_range,
        file_format=fmt,
        file_content=content_str,
        size_kb=size_kb,
        status="ready",
        download_url=f"/api/v1/reports/download/{export_id}"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return ReportExportResponse(
        export_id=new_report.id,
        report_name=new_report.report_name,
        file_format=new_report.file_format,
        download_url=f"/api/v1/reports/download/{new_report.id}",
        generated_at=new_report.created_at.strftime("%b %d, %Y • %H:%M"),
        size_kb=new_report.size_kb,
        status=new_report.status
    )

@router.get("/download/{export_id}")
def download_report_payload(export_id: str, db: Session = Depends(get_db)):
    seed_reports_if_empty(db)
    report = db.query(ReportExport).filter(ReportExport.id == export_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report export not found")
        
    fmt = (report.file_format or "csv").lower()
    content = report.file_content or f"CreatorIQ Report: {report.report_name}"
    
    clean_name = report.report_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
    if fmt == "csv":
        media_type = "text/csv"
        filename = f"{clean_name}.csv"
    elif fmt == "json":
        media_type = "application/json"
        filename = f"{clean_name}.json"
    else:
        media_type = "text/plain"
        filename = f"{clean_name}.txt"
        
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/export-revenue-csv")
def export_revenue_csv(db: Session = Depends(get_db)):
    deals = db.query(SponsorshipDeal).all()
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CreatorIQ Revenue & Monetization Ledger"])
    writer.writerow(["Exported At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    writer.writerow([])
    
    writer.writerow(["--- REVENUE BREAKDOWN BY STREAM ---"])
    writer.writerow(["Stream", "Amount ($)", "Share (%)"])
    sponsorship_total = sum(d.paid_amount for d in deals)
    writer.writerow(["Brand Sponsorships", f"${sponsorship_total:,.2f}", "52.0%"])
    writer.writerow(["YouTube AdSense", "$5,100.00", "25.5%"])
    writer.writerow(["Affiliate Partnerships", "$3,100.00", "15.4%"])
    writer.writerow(["Merchandise Sales", "$1,500.00", "7.1%"])
    writer.writerow([])
    
    writer.writerow(["--- SPONSORSHIP CONTRACTS & DEALS ---"])
    writer.writerow(["Deal ID", "Brand", "Campaign Title", "Platform", "Contract ($)", "Paid ($)", "Deliverables", "Status"])
    for d in deals:
        writer.writerow([d.id, d.brand_name, d.campaign_title, d.platform, f"{d.contract_amount:.2f}", f"{d.paid_amount:.2f}", d.deliverables, d.status])
        
    filename = f"creatoriq_revenue_ledger_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

@router.get("/export-dashboard-csv")
def export_dashboard_csv(db: Session = Depends(get_db)):
    accounts = db.query(ConnectedAccount).filter(ConnectedAccount.is_connected == True).all()
    deals = db.query(SponsorshipDeal).all()
    
    total_followers = sum(a.followers_count or 0 for a in accounts)
    total_views = sum(a.total_views or 0 for a in accounts)
    total_revenue = sum(d.paid_amount for d in deals) + 9700.0
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["CreatorIQ Executive Overview Export"])
    writer.writerow(["Exported At", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")])
    writer.writerow([])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Audience Followers", total_followers])
    writer.writerow(["Total Video Views", total_views])
    writer.writerow(["Estimated & Actual Revenue", f"${total_revenue:,.2f}"])
    writer.writerow(["Average Engagement Rate", "6.4%"])
    writer.writerow([])
    writer.writerow(["Platform", "Handle", "Subscribers/Followers", "Views"])
    for a in accounts:
        writer.writerow([a.platform.capitalize(), a.username, a.followers_count or 0, a.total_views or 0])
        
    filename = f"creatoriq_overview_report_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

# ----------------- Scheduled Reports Management -----------------
@router.get("/schedules")
def list_schedules(db: Session = Depends(get_db)):
    seed_reports_if_empty(db)
    schedules = db.query(ScheduledReport).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "sub": s.sub or f"Every {s.frequency} • {s.format}",
            "frequency": s.frequency,
            "format": s.format,
            "enabled": s.enabled
        }
        for s in schedules
    ]

@router.post("/schedules")
def create_schedule(data: ScheduledReportCreate, db: Session = Depends(get_db)):
    seed_reports_if_empty(db)
    sub_text = data.sub or f"Every {data.frequency} • {data.format}"
    new_s = ScheduledReport(
        id=f"sched-{uuid.uuid4().hex[:6]}",
        title=data.title,
        sub=sub_text,
        frequency=data.frequency,
        format=data.format,
        enabled=data.enabled
    )
    db.add(new_s)
    db.commit()
    db.refresh(new_s)
    return {"status": "success", "schedule": {"id": new_s.id, "title": new_s.title}}

@router.patch("/schedules/{sched_id}/toggle")
def toggle_schedule(sched_id: str, db: Session = Depends(get_db)):
    sched = db.query(ScheduledReport).filter(ScheduledReport.id == sched_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    sched.enabled = not sched.enabled
    db.commit()
    return {"status": "success", "id": sched.id, "enabled": sched.enabled}

@router.delete("/schedules/{sched_id}")
def delete_schedule(sched_id: str, db: Session = Depends(get_db)):
    sched = db.query(ScheduledReport).filter(ScheduledReport.id == sched_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(sched)
    db.commit()
    return {"status": "success", "message": "Schedule removed"}
