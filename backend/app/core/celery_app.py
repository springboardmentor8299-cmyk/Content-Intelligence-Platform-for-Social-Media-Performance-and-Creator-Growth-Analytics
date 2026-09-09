from uuid import uuid4

from app.core.config import get_settings

settings = get_settings()

try:
    from celery import Celery
except ModuleNotFoundError:
    class LocalResult:
        def __init__(self) -> None:
            self.id = str(uuid4())
            self.status = "PENDING"
            self.result = None

    class LocalTask:
        def __init__(self, function) -> None:
            self.function = function

        def delay(self, *args, **kwargs) -> LocalResult:
            return LocalResult()

    class LocalCelery:
        @staticmethod
        def task(function=None, **kwargs):
            if function is None:
                return lambda actual: LocalTask(actual)
            return LocalTask(function)

    celery_app = LocalCelery()
else:
    celery_app = Celery("creatoriq", broker=settings.redis_url, backend=settings.redis_url, include=["app.workers.sync_tasks", "app.workers.tasks"])
    celery_app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        enable_utc=True,
        timezone="UTC",
        beat_schedule={
            "sync-all-active-accounts-every-six-hours": {
                "task": "app.workers.sync_tasks.sync_all_active_accounts",
                "schedule": 6 * 60 * 60,
            }
        },
    )

__all__ = ["celery_app"]
