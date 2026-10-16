def get_social_media_data(platform: str = None):
    data = {
        "platforms": [
            {
                "platform": "Instagram",
                "followers": 1000,
                "likes": 250,
                "comments": 50,
                "shares": 25,
                "views": 5000
            },
            {
                "platform": "YouTube",
                "followers": 800,
                "likes": 180,
                "comments": 40,
                "shares": 15,
                "views": 3500
            },
            {
                "platform": "TikTok",
                "followers": 1500,
                "likes": 400,
                "comments": 80,
                "shares": 60,
                "views": 8000
            }
        ]
    }

    if platform:
        for item in data["platforms"]:
            if item["platform"].lower() == platform.lower():
                return item

        return {
            "error": "Platform not found",
            "platform": platform
        }

    return data