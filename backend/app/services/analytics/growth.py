from typing import Any


class GrowthTrendService:
    def follower_growth_velocity(self, points: list[dict[str, Any]]) -> float:
        if len(points) < 2:
            return 0.0
        return round((points[-1].get("followers", 0) - points[0].get("followers", 0)) / (len(points) - 1), 2)

    def trends(self, points: list[dict[str, Any]]) -> dict[str, Any]:
        return {"points": points, "follower_growth_velocity": self.follower_growth_velocity(points), "reach_change": (points[-1].get("reach", 0) - points[0].get("reach", 0)) if points else 0, "hashtags": [{"hashtag": "#creatorlife", "performance": 78}, {"hashtag": "#behindthescenes", "performance": 64}]}
