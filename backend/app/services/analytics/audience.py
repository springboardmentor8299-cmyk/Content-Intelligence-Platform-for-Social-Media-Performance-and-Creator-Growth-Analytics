from collections import defaultdict
from typing import Any


class AudienceAnalyticsService:
    def aggregate(self, audiences: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        age: dict[str, dict[str, float]] = defaultdict(lambda: {"female": 0, "male": 0})
        countries: dict[str, float] = defaultdict(float)
        active_hours: dict[str, float] = defaultdict(float)
        for audience in audiences:
            for row in audience.get("age", []):
                age[row["age"]]["female"] += row.get("female", 0)
                age[row["age"]]["male"] += row.get("male", 0)
            for row in audience.get("countries", []):
                countries[row["country"]] += row.get("value", 0)
            for row in audience.get("active_hours", []):
                active_hours[row["hour"]] += row.get("engagement", 0)
        return {"demographics": [{"age": key, **value} for key, value in age.items()], "countries": [{"country": key, "value": value} for key, value in sorted(countries.items(), key=lambda pair: pair[1], reverse=True)], "active_hours": [{"hour": key, "engagement": value} for key, value in sorted(active_hours.items())]}
