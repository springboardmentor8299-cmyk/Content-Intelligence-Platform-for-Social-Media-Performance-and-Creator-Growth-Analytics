from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.sponsorships.routes import router as sponsorships_router
from app.auth.routes import router as auth_router
from app.analytics.routes import router as analytics_router
from app.audience.routes import router as audience_router
from app.social.routes import router as social_router
from app.earnings.routes import router as earnings_router
from app.reports.routes import router as reports_router
from app.instagram.routes import router as instagram_router
from app.notifications.routes import router as notifications_router
from app.notifications.scheduler import (
    start_notification_scheduler,
    stop_notification_scheduler,
)
app = FastAPI(
    title="CreatorIQ API"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# ROUTES
# =====================================================

# Authentication
app.include_router(auth_router)

# Analytics
app.include_router(analytics_router)

# Audience Analytics
app.include_router(audience_router)

# Social Media / YouTube
app.include_router(social_router)

# Earnings
app.include_router(earnings_router)

# Sponsorships
app.include_router(sponsorships_router)

app.include_router(reports_router)

app.include_router(instagram_router)

app.include_router(notifications_router)
# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():

    return {
        "message": "CreatorIQ API is running"
    }

@app.on_event("startup")
def start_background_tasks():
    start_notification_scheduler()


@app.on_event("shutdown")
def stop_background_tasks():
    stop_notification_scheduler()