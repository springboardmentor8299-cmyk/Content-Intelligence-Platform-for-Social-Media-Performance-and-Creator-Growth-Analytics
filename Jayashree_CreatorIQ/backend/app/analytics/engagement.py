def calculate_engagement(likes: int, comments: int, shares: int, views: int):
    if views == 0:
        return {
            "engagement_rate": 0,
            "total_engagement": 0
        }

    total_engagement = likes + comments + shares
    engagement_rate = (total_engagement / views) * 100

    return {
        "total_engagement": total_engagement,
        "engagement_rate": round(engagement_rate, 2)
    }