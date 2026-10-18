import os
import re

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException

from app.auth.security import get_current_user


load_dotenv()

router = APIRouter(
    prefix="/instagram",
    tags=["Instagram Analytics"],
    dependencies=[Depends(get_current_user)],
)

SERPAPI_URL = "https://serpapi.com/search"
USERNAME_PATTERN = re.compile(r"^(?!\.)(?!.*\.\.)[A-Za-z0-9._]{1,30}(?<!\.)$")
PROFILE_FIELDS = (
    "username",
    "full_name",
    "biography",
    "profile_pic_url",
    "followers",
    "following",
    "posts_count",
    "is_verified",
    "is_professional_account",
    "category_name",
    "external_url",
)
POST_FIELDS = (
    "id",
    "shortcode",
    "date",
    "likes",
    "comments",
    "video_view_count",
    "video_play_count",
    "url",
)


def _scalar(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return None


def _normalize_post(post):
    captions = post.get("media_captions")
    caption = captions[0] if isinstance(captions, list) and captions else post.get("caption")
    media_url = (
        post.get("display_url")
        or post.get("thumbnail_src")
        or post.get("thumbnail_tall_src")
    )

    result = {field: _scalar(post.get(field)) for field in POST_FIELDS}
    result["caption"] = _scalar(caption)
    result["media_url"] = _scalar(media_url)
    result["is_video"] = _scalar(post.get("is_video"))
    return result


def _profile_category(profile):
    category = profile.get("category_name") or profile.get("category")
    return _scalar(category)


@router.get("/profile/{username}")
def get_instagram_profile(username: str):
    normalized_username = username.strip()
    if normalized_username.startswith("@"):
        normalized_username = normalized_username[1:]

    if not USERNAME_PATTERN.fullmatch(normalized_username):
        raise HTTPException(
            status_code=422,
            detail="Enter a valid Instagram username using letters, numbers, dots, or underscores.",
        )

    normalized_username = normalized_username.lower()
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Instagram profile lookup is not configured. Set SERPAPI_API_KEY in the backend environment.",
        )

    try:
        response = requests.get(
            SERPAPI_URL,
            params={
                "engine": "instagram_profile",
                "profile_id": normalized_username,
                "api_key": api_key,
            },
            timeout=20,
        )
    except requests.Timeout as error:
        raise HTTPException(
            status_code=504,
            detail="Instagram profile lookup timed out. Please try again.",
        ) from error
    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="Could not connect to the Instagram profile data service.",
        ) from error

    if response.status_code == 429:
        raise HTTPException(
            status_code=429,
            detail="The Instagram profile data service rate limit was reached. Please try again later.",
        )
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Instagram profile was not found.")
    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=502,
            detail="The Instagram profile data service rejected its API configuration.",
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="The Instagram profile data service could not complete the request.",
        )

    try:
        payload = response.json()
    except ValueError as error:
        raise HTTPException(
            status_code=502,
            detail="The Instagram profile data service returned an invalid response.",
        ) from error

    provider_error = payload.get("error") if isinstance(payload, dict) else None
    if provider_error:
        error_message = str(provider_error).lower()
        if any(term in error_message for term in ("rate limit", "limit reached", "quota")):
            raise HTTPException(
                status_code=429,
                detail="The Instagram profile data service rate limit was reached. Please try again later.",
            )
        if any(term in error_message for term in ("not found", "no results", "invalid profile")):
            raise HTTPException(status_code=404, detail="Instagram profile was not found.")
        raise HTTPException(
            status_code=502,
            detail="The Instagram profile data service could not complete the request.",
        )

    profile_results = payload.get("profile_results") if isinstance(payload, dict) else None
    if not isinstance(profile_results, dict):
        raise HTTPException(status_code=404, detail="Instagram profile was not found.")

    posts = profile_results.get("posts")
    if not any(
        profile_results.get(field) is not None
        for field in PROFILE_FIELDS
    ) and not (
        isinstance(posts, list)
        and any(isinstance(post, dict) for post in posts)
    ):
        raise HTTPException(status_code=404, detail="Instagram profile was not found.")

    normalized_posts = [
        _normalize_post(post)
        for post in posts
        if isinstance(post, dict)
    ] if isinstance(posts, list) else []

    return {
        "profile": {
            field: (
                _profile_category(profile_results)
                if field == "category_name"
                else _scalar(profile_results.get(field))
            )
            for field in PROFILE_FIELDS
        },
        "posts": normalized_posts,
    }
