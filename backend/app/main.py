from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.database import Base, engine

# Import models so SQLAlchemy knows about the tables
from app.models.user import User
from app.models.creator import Creator
from app.models.analytics import Analytics
from app.models.revenue import Revenue


app = FastAPI(
    title="CreatorIQ API",
    description="Creator Analytics & Content Performance Dashboard",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Authentication routes
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to CreatorIQ API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }