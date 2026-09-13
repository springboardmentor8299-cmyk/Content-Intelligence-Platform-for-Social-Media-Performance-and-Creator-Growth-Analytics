from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, analytics, content, audience, revenue, social, reports, notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Roles"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(content.router, prefix="/content", tags=["Content Performance"])
api_router.include_router(audience.router, prefix="/audience", tags=["Audience Demographics"])
api_router.include_router(revenue.router, prefix="/revenue", tags=["Revenue & Sponsorships"])
api_router.include_router(social.router, prefix="/social", tags=["Social Media Integrations"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications & Alerts"])
