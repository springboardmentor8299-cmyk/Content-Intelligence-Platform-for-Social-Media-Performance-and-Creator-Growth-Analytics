from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "creator_iq_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "sync-social-data-every-6-hours": {
            "task": "app.tasks.ingestion_tasks.fetch_social_media_metrics",
            "schedule": 21600.0,  # 6 hours in seconds
        },
    },
)
