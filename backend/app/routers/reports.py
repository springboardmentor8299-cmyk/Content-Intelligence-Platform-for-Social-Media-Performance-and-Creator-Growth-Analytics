import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter
from app.schemas_extended import ReportExportRequest, ReportExportResponse

router = APIRouter()

EXPORT_HISTORY = [
    {
        "export_id": "exp-2026-08-01",
        "report_name": "Q2 Executive Performance Summary",
        "file_format": "PDF",
        "download_url": "/api/v1/reports/download/exp-2026-08-01",
        "generated_at": "2026-08-01 14:30 UTC",
        "size_kb": 1420,
        "status": "ready"
    },
    {
        "export_id": "exp-2026-08-15",
        "report_name": "Audience Demographics & Geo Distribution",
        "file_format": "CSV",
        "download_url": "/api/v1/reports/download/exp-2026-08-15",
        "generated_at": "2026-08-15 09:12 UTC",
        "size_kb": 280,
        "status": "ready"
    }
]

@router.get("/history", response_model=List[ReportExportResponse])
def get_export_history():
    return EXPORT_HISTORY

@router.post("/generate", response_model=ReportExportResponse)
def generate_report(req: ReportExportRequest):
    new_export = {
        "export_id": f"exp-{uuid.uuid4().hex[:8]}",
        "report_name": f"{req.report_type.replace('_', ' ').title()} ({req.date_range.upper()})",
        "file_format": req.format.upper(),
        "download_url": f"/api/v1/reports/download/{uuid.uuid4().hex[:8]}",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "size_kb": 980 if req.format.lower() == "pdf" else 150,
        "status": "ready"
    }
    EXPORT_HISTORY.insert(0, new_export)
    return new_export

@router.get("/download/{export_id}")
def download_report_payload(export_id: str):
    return {
        "export_id": export_id,
        "status": "download_ready",
        "message": "Report generated and compiled successfully."
    }
