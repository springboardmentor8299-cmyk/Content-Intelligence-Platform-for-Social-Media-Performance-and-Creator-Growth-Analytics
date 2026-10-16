from fastapi import APIRouter, HTTPException

from app.integrations.youtube import (
    search_channels,
    get_channel,
    get_channel_videos
)

from app.services.youtube import sync_youtube_channel

from app.database import (
    youtube_channels,
    youtube_videos,
    youtube_syncs
)

router = APIRouter(
    prefix="/youtube",
    tags=["YouTube"]
)


@router.get("/search")
def search_youtube_channels(query: str):
    if not query.strip():
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty"
        )

    return {
        "query": query,
        "results": search_channels(query, 10)
    }


@router.get("/channel/{channel_id}")
def youtube_channel(channel_id: str):
    channel = get_channel(channel_id)

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    return channel


@router.get("/channel/{channel_id}/videos")
def youtube_channel_videos(
    channel_id: str,
    limit: int = 10
):
    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 50"
        )

    channel = get_channel(channel_id)

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    videos = get_channel_videos(
        channel_id,
        limit
    )

    return {
        "channel_id": channel_id,
        "count": len(videos),
        "videos": videos
    }


@router.get("/channel/{channel_id}/top-videos")
def youtube_top_videos(channel_id: str):
    channel = get_channel(channel_id)

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    videos = get_channel_videos(
        channel_id,
        50
    )

    videos.sort(
        key=lambda video: video["views"],
        reverse=True
    )

    return {
        "channel_id": channel_id,
        "count": min(len(videos), 5),
        "videos": videos[:5]
    }


@router.get("/channel/{channel_id}/overview")
def youtube_overview(channel_id: str):
    channel = get_channel(channel_id)

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    return {
        "channel_id": channel["channel_id"],
        "title": channel["title"],
        "thumbnail": channel["thumbnail"],
        "subscribers": channel["subscribers"],
        "total_views": channel["total_views"],
        "video_count": channel["video_count"],
        "published_at": channel["published_at"]
    }


@router.post("/channel/{channel_id}/sync")
def sync_channel(channel_id: str):
    result = sync_youtube_channel(channel_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    return result


@router.get("/stored/{channel_id}")
def stored_channel(channel_id: str):
    channel = youtube_channels.find_one(
        {"channel_id": channel_id},
        {"_id": 0}
    )

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="Channel not found in MongoDB"
        )

    return channel


@router.get("/stored/{channel_id}/videos")
def stored_videos(channel_id: str):
    channel = youtube_channels.find_one(
        {"channel_id": channel_id}
    )

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="Channel not found in MongoDB"
        )

    videos = list(
        youtube_videos.find(
            {"channel_id": channel_id},
            {"_id": 0}
        ).sort(
            "views",
            -1
        )
    )

    return {
        "channel_id": channel_id,
        "count": len(videos),
        "videos": videos
    }


@router.get("/stored/{channel_id}/growth")
def youtube_growth_history(channel_id: str):
    channel = youtube_channels.find_one(
        {"channel_id": channel_id}
    )

    if not channel:
        raise HTTPException(
            status_code=404,
            detail="Channel not found in MongoDB"
        )

    history = list(
        youtube_syncs.find(
            {"channel_id": channel_id},
            {
                "_id": 0,
                "channel_id": 1,
                "synced_at": 1,
                "subscribers": 1,
                "total_views": 1,
                "video_count": 1
            }
        ).sort(
            "synced_at",
            1
        )
    )

    for item in history:
        item["synced_at"] = item["synced_at"].isoformat()

    return {
        "channel_id": channel_id,
        "count": len(history),
        "history": history
    }
