from typing import Any


class ContentAnalyticsService:
    def engagement_rate(self, item: dict[str, Any]) -> float:
        denominator = item.get("reach") or item.get("views") or 0
        if not denominator:
            return 0.0
        interactions = sum(item.get(key, 0) or 0 for key in ("likes", "comments", "shares"))
        return round(interactions / denominator * 100, 2)

    def top_performing(self, items: list[dict[str, Any]], limit: int = 10) -> list[dict[str, Any]]:
        enriched = [{**item, "engagement_rate": self.engagement_rate(item)} for item in items]
        return sorted(enriched, key=lambda item: item["engagement_rate"], reverse=True)[:limit]

    def compare(self, first: dict[str, Any], second: dict[str, Any]) -> dict[str, Any]:
        first_rate = self.engagement_rate(first)
        second_rate = self.engagement_rate(second)
        return {"first": {**first, "engagement_rate": first_rate}, "second": {**second, "engagement_rate": second_rate}, "engagement_rate_delta": round(first_rate - second_rate, 2)}
