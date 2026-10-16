import os
import urllib.request
import urllib.parse
import json

from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"
API_KEY = os.getenv("YOUTUBE_API_KEY")


def youtube_request(endpoint: str, params: dict):
    params["key"] = API_KEY

    url = f"{YOUTUBE_API_URL}/{endpoint}?" + urllib.parse.urlencode(params)

    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode())


def search_channels(query: str, max_results: int = 10):
    data = youtube_request(
        "search",
        {
            "part": "snippet",
            "q": query,
            "type": "channel",
            "maxResults": max_results
        }
    )

    results = []

    for item in data.get("items", []):
        snippet = item["snippet"]

        results.append({
            "channel_id": item["id"]["channelId"],
            "title": snippet["title"],
            "description": snippet.get("description", ""),
            "thumbnail": snippet.get("thumbnails", {})
                               .get("high", {})
                               .get("url")
        })

    return results


def get_channel(channel_id: str):
    data = youtube_request(
        "channels",
        {
            "part": "snippet,statistics,contentDetails",
            "id": channel_id
        }
    )

    items = data.get("items", [])

    if not items:
        return None

    item = items[0]

    snippet = item["snippet"]
    statistics = item["statistics"]
    content_details = item["contentDetails"]

    return {
        "channel_id": item["id"],
        "title": snippet["title"],
        "description": snippet.get("description", ""),
        "thumbnail": snippet.get("thumbnails", {})
                              .get("high", {})
                              .get("url"),
        "published_at": snippet.get("publishedAt"),
        "subscribers": int(statistics.get("subscriberCount", 0)),
        "total_views": int(statistics.get("viewCount", 0)),
        "video_count": int(statistics.get("videoCount", 0)),
        "uploads_playlist_id": content_details["relatedPlaylists"]["uploads"]
    }


def get_videos(video_ids: list):
    if not video_ids:
        return []

    data = youtube_request(
        "videos",
        {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(video_ids)
        }
    )

    videos = []

    for item in data.get("items", []):
        snippet = item["snippet"]
        statistics = item["statistics"]

        videos.append({
            "video_id": item["id"],
            "title": snippet["title"],
            "description": snippet.get("description", ""),
            "thumbnail": snippet.get("thumbnails", {})
                               .get("high", {})
                               .get("url"),
            "published_at": snippet.get("publishedAt"),
            "views": int(statistics.get("viewCount", 0)),
            "likes": int(statistics.get("likeCount", 0)),
            "comments": int(statistics.get("commentCount", 0))
        })

    return videos


def get_channel_videos(channel_id: str, max_results: int = 50):
    data = youtube_request(
        "search",
        {
            "part": "snippet",
            "channelId": channel_id,
            "type": "video",
            "order": "date",
            "maxResults": max_results
        }
    )

    video_ids = [
        item["id"]["videoId"]
        for item in data.get("items", [])
        if item["id"].get("videoId")
    ]

    return get_videos(video_ids)