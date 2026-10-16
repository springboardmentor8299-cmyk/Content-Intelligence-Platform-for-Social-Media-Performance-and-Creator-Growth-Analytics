from datetime import datetime, timezone

from app.database import (
    youtube_channels,
    youtube_videos,
    youtube_syncs
)

from app.integrations.youtube import (
    get_channel,
    get_channel_videos
)


def sync_youtube_channel(channel_id: str):

    # Get channel information from YouTube
    channel = get_channel(channel_id)

    if not channel:
        return None

    # Get channel videos
    videos = get_channel_videos(
        channel_id,
        50
    )

    synced_at = datetime.now(timezone.utc)

    # Save / update channel
    youtube_channels.update_one(
        {
            "channel_id": channel_id
        },
        {
            "$set": {
                **channel,
                "synced_at": synced_at
            }
        },
        upsert=True
    )

    # Save / update videos
    for video in videos:

        youtube_videos.update_one(
            {
                "video_id": video["video_id"]
            },
            {
                "$set": {
                    **video,
                    "channel_id": channel_id,
                    "synced_at": synced_at
                }
            },
            upsert=True
        )

    # Save historical growth snapshot
    youtube_syncs.insert_one(
        {
            "channel_id": channel_id,
            "synced_at": synced_at,
            "videos_synced": len(videos),
            "subscribers": channel["subscribers"],
            "total_views": channel["total_views"],
            "video_count": channel["video_count"]
        }
    )

    return {
        "channel_id": channel_id,
        "channel": channel["title"],
        "videos_synced": len(videos),
        "subscribers": channel["subscribers"],
        "total_views": channel["total_views"],
        "video_count": channel["video_count"],
        "synced_at": synced_at.isoformat()
    }