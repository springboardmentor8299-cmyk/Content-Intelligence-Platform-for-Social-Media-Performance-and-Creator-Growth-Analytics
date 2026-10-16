def calculate_growth(data: list[int]):
    if len(data) < 2:
        return {
            "growth": 0,
            "trend": "stable"
        }

    growth = data[-1] - data[0]

    if growth > 0:
        trend = "increasing"
    elif growth < 0:
        trend = "decreasing"
    else:
        trend = "stable"

    return {
        "growth": growth,
        "trend": trend
    }