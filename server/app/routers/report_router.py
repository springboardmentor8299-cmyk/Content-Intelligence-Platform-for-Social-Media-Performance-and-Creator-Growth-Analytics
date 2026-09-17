from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.services.analytics_engine import AnalyticsEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/export-pdf")
def export_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    overview = AnalyticsEngine.get_overview_metrics(current_user, db)
    recs = RecommendationEngine.get_actionable_insights(current_user)
    data = {
        "summary": overview.get("summary", {}),
        "growth_trend": overview.get("growth_trend", []),
        "recommendations": recs
    }

    pdf_bytes = ExportService.generate_pdf_report(current_user, data)
    filename = f"CreatorIQ_Report_{current_user.role.value}_{current_user.id[:6]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/export-csv")
def export_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    overview = AnalyticsEngine.get_overview_metrics(current_user, db)
    csv_text = ExportService.generate_csv_report(current_user, overview)
    filename = f"CreatorIQ_Metrics_{current_user.role.value}_{current_user.id[:6]}.csv"

    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
