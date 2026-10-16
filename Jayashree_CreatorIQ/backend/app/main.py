from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.youtube import router as youtube_router


app = FastAPI(
    title="CreatorIQ Analytics API",
    description="CreatorIQ Milestone 2 Backend API",
    version="2.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(youtube_router)


@app.get("/")
def home():
    return {
        "message": "CreatorIQ API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }