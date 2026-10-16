from app.integrations.youtube import (
    search_channels,
    get_channel,
    get_channel_videos
)

print("\n===== CHANNEL SEARCH =====")

channels = search_channels("MrBeast", 5)

for channel in channels:
    print(channel)


print("\n===== CHANNEL DETAILS =====")

channel = get_channel("UCX6OQ3DkcsbYNE6H8uQQuVA")

print(channel)


print("\n===== RECENT VIDEOS =====")

videos = get_channel_videos(
    "UCX6OQ3DkcsbYNE6H8uQQuVA",
    5
)

for video in videos:
    print(video)