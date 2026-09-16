import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, analytics, creators, content, social, monetization, notifications, reports, admin
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CreatorIQ Enterprise Analytics API",
    description="High-performance backend for multi-platform creator metrics, RBAC, social API sync, monetization, notifications, and exportable reports.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Feature Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication & RBAC"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics & Engagement Tracking"])
app.include_router(creators.router, prefix="/api/v1/creators", tags=["Creator Management"])
app.include_router(content.router, prefix="/api/v1/content", tags=["Content Analytics"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social Media APIs & Data Sync"])
app.include_router(monetization.router, prefix="/api/v1/monetization", tags=["Monetization & Sponsorships"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications & Alerts"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Exportable Reports & Downloads"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin & System Governance"])


@app.get("/")
def root():
    return {
        "service": "CreatorIQ Enterprise Analytics API",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0",
        "modules": [
            "auth", "analytics", "creators", "content",
            "social_connections", "monetization_sponsorships",
            "notifications_alerts", "exportable_reports"
        ]
    }

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected", "workers": 4}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
