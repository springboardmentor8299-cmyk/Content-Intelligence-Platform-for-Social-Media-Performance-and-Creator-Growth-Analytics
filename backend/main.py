from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import router
from app.core.config import get_settings
from app.db import Base, engine
from app.db import mongodb, redis
from app.db.base import import_models
from app.routers.analytics import router as analytics_router

settings = get_settings()
import_models()
logger = logging.getLogger("creatoriq.startup")


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.environment == "development":
        Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        await mongodb.connect()
        await mongodb.client.admin.command("ping")
        await redis.connect()
        await redis.get_client().ping()
    except Exception as error:
        await redis.disconnect()
        await mongodb.disconnect()
        if settings.environment != "development":
            raise
        logger.warning("Optional local infrastructure is unavailable: %s", error)
    try:
        yield
    finally:
        await redis.disconnect()
        await mongodb.disconnect()


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
app.include_router(analytics_router, prefix="/api/v1")


