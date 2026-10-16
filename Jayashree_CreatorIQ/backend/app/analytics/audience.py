def audience_report(
    followers: int,
    new_followers: int,
    returning_followers: int
):
    growth_rate = 0

    if followers > 0:
        growth_rate = (new_followers / followers) * 100

    return {
        "followers": followers,
        "new_followers": new_followers,
        "returning_followers": returning_followers,
        "growth_rate": round(growth_rate, 2)
    }