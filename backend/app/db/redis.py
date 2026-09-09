from redis.asyncio import Redis

from app.core.config import get_settings

redis_client: Redis | None = None


async def connect() -> None:
    global redis_client
    settings = get_settings()
    redis_client = Redis.from_url(settings.redis_url, decode_responses=True, socket_connect_timeout=1)
    if settings.environment != "development":
        await redis_client.ping()


async def disconnect() -> None:
    global redis_client
    if redis_client is not None:
        await redis_client.aclose()
    redis_client = None


def get_client() -> Redis:
    if redis_client is None:
        raise RuntimeError("Redis is not connected")
    return redis_client


async def cache_set(key: str, value: str, expires_seconds: int = 300) -> None:
    await get_client().set(key, value, ex=expires_seconds)


async def cache_get(key: str) -> str | None:
    return await get_client().get(key)


async def blacklist_token(token_id: str, expires_seconds: int) -> None:
    await cache_set(f"token:blacklist:{token_id}", "1", expires_seconds)


async def is_token_blacklisted(token_id: str) -> bool:
    return await cache_get(f"token:blacklist:{token_id}") is not None


async def rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    client = get_client()
    count = await client.incr(key)
    if count == 1:
        await client.expire(key, window_seconds)
    return count <= limit