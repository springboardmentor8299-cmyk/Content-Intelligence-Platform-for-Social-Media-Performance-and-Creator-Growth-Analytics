from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect() -> None:
    global client, database
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=1500)
    database = client["creatoriq"]
    if settings.environment != "development":
        await client.admin.command("ping")


async def disconnect() -> None:
    global client, database
    if client is not None:
        client.close()
    client = None
    database = None


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("MongoDB is not connected")
    return database