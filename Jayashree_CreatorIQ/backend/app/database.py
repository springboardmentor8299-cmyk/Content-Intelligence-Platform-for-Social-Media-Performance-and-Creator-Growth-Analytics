import os

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017"
)

client = MongoClient(MONGO_URI)

db = client["creatoriq"]

youtube_channels = db["youtube_channels"]
youtube_videos = db["youtube_videos"]
youtube_syncs = db["youtube_syncs"]