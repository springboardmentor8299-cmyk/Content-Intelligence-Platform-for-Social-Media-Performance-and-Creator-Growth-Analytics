from datetime import datetime, timezone
from typing import Any

from app.db import mongodb
from app.services.connectors import CONNECTORS
from app.workers.celery_app import celery_app


async def _sync(platform: str, access_token: str = "synthetic", platform_user_id: str | None = None) -> dict[str, Any]:
    connector = CONNECTORS[platform]
    metrics = await connector(__import__("app.core.config", fromlist=["get_settings"]).get_settings()).fetch_metrics(access_token, platform_user_id)
    payload = {"platform": platform, "collected_at": datetime.now(timezone.utc).isoformat(), "payload": metrics}
    if mongodb.database is not None:
        await mongodb.database["raw_social_feeds"].insert_one(payload)
    return payload


@celery_app.task(name="app.workers.tasks.sync_platform")
def sync_platform_task(platform: str, access_token: str = "synthetic", platform_user_id: str | None = None) -> dict[str, Any]:
    import asyncio
    return asyncio.run(_sync(platform, access_token, platform_user_id))


@celery_app.task(name="app.workers.tasks.sync_all_platforms")
def sync_all_platforms() -> list[dict[str, Any]]:
    import asyncio
    return [asyncio.run(_sync("youtube")), asyncio.run(_sync("instagram"))]
