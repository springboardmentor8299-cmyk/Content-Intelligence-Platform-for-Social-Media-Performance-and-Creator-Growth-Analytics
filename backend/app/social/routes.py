import os
import secrets
import hashlib
import base64

from urllib.parse import urlencode

import requests
from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from google_auth_oauthlib.flow import Flow

from app.auth.security import (
    create_provider_oauth_state,
    create_provider_owner_cookie,
    get_current_creator,
    get_provider_oauth_state_owner,
    require_provider_owner,
)
from app.models import User

load_dotenv()


router = APIRouter(
    prefix="/social",
    tags=["Social Media"]
)


# =====================================================
# GOOGLE / YOUTUBE SETTINGS
# =====================================================

SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]

GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

YOUTUBE_API_URL = (
    "https://www.googleapis.com/youtube/v3"
)

YOUTUBE_ANALYTICS_URL = (
    "https://youtubeanalytics.googleapis.com/v2/reports"
)


# =====================================================
# TWITTERAPIS SETTINGS
# =====================================================

TWITTERAPIS_BASE_URL = (
    "https://api.twitterapis.com/twitter"
)


# =====================================================
# SIMPLE SERVER-SIDE CACHE
# =====================================================

YOUTUBE_CHANNEL_CACHE = {}
X_ACCOUNT_CACHE = {}
X_SEARCH_CACHE = {}


# =====================================================
# HELPER - GOOGLE CONFIG
# =====================================================

def get_google_config():

    client_id = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    client_secret = os.getenv(
        "GOOGLE_CLIENT_SECRET"
    )

    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI"
    )

    if not client_id:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID is not configured"
        )

    if not client_secret:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_SECRET is not configured"
        )

    if not redirect_uri:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_REDIRECT_URI is not configured"
        )

    return client_id, client_secret, redirect_uri


# =====================================================
# CREATE GOOGLE FLOW
# =====================================================

def create_google_flow(state=None):

    client_id, client_secret, redirect_uri = (
        get_google_config()
    )

    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": GOOGLE_AUTH_URL,
            "token_uri": GOOGLE_TOKEN_URL,
            "redirect_uris": [redirect_uri],
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        state=state,
    )

    flow.redirect_uri = redirect_uri

    return flow


# =====================================================
# SOCIAL MEDIA STATUS
# =====================================================

@router.get("/status")
def social_media_status():

    return {
        "message": "Social media integration is ready",
        "platforms": [
            "YouTube",
            "X"
        ]
    }


# =====================================================
# X STATUS
# =====================================================

@router.get("/x/status")
def x_status(
    request: Request,
    current_user: User = Depends(get_current_creator),
):

    access_token = request.cookies.get(
        "x_access_token"
    )

    refresh_token = request.cookies.get(
        "x_refresh_token"
    )

    # -------------------------------------------------
    # TwitterAPIs key
    # -------------------------------------------------

    twitterapis_key = os.getenv(
        "TWITTERAPIS_API_KEY"
    )
    owner_id = get_provider_owner_id(
        request.cookies.get("x_owner", ""),
        "x",
    )
    connected_account_is_owned = owner_id == current_user.id

    connected = bool(
        (connected_account_is_owned and (access_token or refresh_token))
        or twitterapis_key
    )

    return {
        "platform": "X",

        "connected": connected,

        "status": (
            "Connected"
            if connected
            else "Disconnected"
        ),

        "message": (
            "X account is connected."
            if connected_account_is_owned and (access_token or refresh_token)
            else (
                "X data provider is configured."
                if twitterapis_key
                else "X account is not connected."
            )
        ),
    }


# =====================================================
# YOUTUBE OAUTH CONNECT
# =====================================================

@router.get("/youtube/connect")
def connect_youtube(
    current_user: User = Depends(get_current_creator),
):

    client_id, client_secret, redirect_uri = (
        get_google_config()
    )

    state = secrets.token_urlsafe(32)

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "consent",
        "state": state,
    }

    authorization_url = (
        GOOGLE_AUTH_URL
        + "?"
        + urlencode(params)
    )

    response = JSONResponse(
        content={
            "authorization_url": authorization_url
        }
    )

    response.set_cookie(
        key="oauth_state",
        value=create_provider_oauth_state(
            "youtube",
            current_user.id,
            state,
        ),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=600,
    )

    return response


# =====================================================
# YOUTUBE OAUTH CALLBACK
# =====================================================

@router.get("/youtube/callback")
def youtube_callback(
    request: Request,
    code: str,
    state: str,
):

    saved_state = request.cookies.get(
        "oauth_state"
    )

    if not saved_state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state cookie is missing"
        )

    owner_id = get_provider_oauth_state_owner(
        saved_state,
        "youtube",
        state,
    )
    if owner_id is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state"
        )

    try:

        flow = create_google_flow(
            state=state
        )

        flow.fetch_token(
            code=code
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "Google OAuth token exchange failed: "
                f"{str(e)}"
            )
        )

    credentials = flow.credentials

    response = JSONResponse(
        content={
            "message": "YouTube connected successfully",
            "has_access_token": (
                credentials.token is not None
            ),
            "has_refresh_token": (
                credentials.refresh_token is not None
            ),
            "scopes": credentials.scopes,
        }
    )

    response.delete_cookie(
        key="oauth_state"
    )
    response.set_cookie(
        key="youtube_owner",
        value=create_provider_owner_cookie("youtube", owner_id),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 30,
    )

    if credentials.token:

        response.set_cookie(
            key="youtube_access_token",
            value=credentials.token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=3600,
        )

    if credentials.refresh_token:

        response.set_cookie(
            key="youtube_refresh_token",
            value=credentials.refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=60 * 60 * 24 * 30,
        )

    return response


# =====================================================
# GET CONNECTED YOUTUBE CHANNEL
# =====================================================

@router.get(
    "/youtube/me",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_my_youtube_channel(
    request: Request,
):

    access_token = request.cookies.get(
        "youtube_access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=401,
            detail=(
                "YouTube is not connected. "
                "Please connect YouTube first."
            )
        )

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "part": "snippet,statistics",
        "mine": "true",
    }

    try:

        response = requests.get(
            f"{YOUTUBE_API_URL}/channels",
            headers=headers,
            params=params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube API connection failed: "
                f"{str(e)}"
            )
        )

    if response.status_code != 200:

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    data = response.json()

    if not data.get("items"):

        raise HTTPException(
            status_code=404,
            detail=(
                "No YouTube channel was found "
                "for this Google account."
            )
        )

    channel = data["items"][0]

    snippet = channel.get(
        "snippet",
        {}
    )

    statistics = channel.get(
        "statistics",
        {}
    )

    return {
        "channel_id": channel.get("id"),

        "channel_name": snippet.get(
            "title"
        ),

        "description": snippet.get(
            "description"
        ),

        "thumbnail": (
            snippet
            .get("thumbnails", {})
            .get("high", {})
            .get("url")
        ),

        "subscribers": int(
            statistics.get(
                "subscriberCount",
                0
            )
        ),

        "total_views": int(
            statistics.get(
                "viewCount",
                0
            )
        ),

        "video_count": int(
            statistics.get(
                "videoCount",
                0
            )
        ),
    }


# =====================================================
# YOUTUBE AUDIENCE ANALYTICS
# =====================================================

@router.get(
    "/youtube/audience",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_youtube_audience(
    request: Request,
    start_date: str = "2026-01-01",
    end_date: str = "2026-09-14",
):

    access_token = request.cookies.get(
        "youtube_access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=401,
            detail=(
                "YouTube is not connected. "
                "Please connect YouTube first."
            )
        )

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": (
            "views,"
            "estimatedMinutesWatched,"
            "averageViewDuration,"
            "subscribersGained,"
            "subscribersLost"
        ),
    }

    try:

        response = requests.get(
            YOUTUBE_ANALYTICS_URL,
            headers=headers,
            params=params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube Analytics API connection failed: "
                f"{str(e)}"
            )
        )

    if response.status_code != 200:

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    data = response.json()

    rows = data.get(
        "rows",
        []
    )

    metrics = {}

    if rows:

        row = rows[0]

        headers_data = data.get(
            "columnHeaders",
            []
        )

        for index, header in enumerate(
            headers_data
        ):

            name = header.get(
                "name"
            )

            if index < len(row):

                metrics[name] = row[index]

    else:

        metrics = {
            "views": 0,
            "estimatedMinutesWatched": 0,
            "averageViewDuration": 0,
            "subscribersGained": 0,
            "subscribersLost": 0,
        }

    subscribers_gained = int(
        metrics.get(
            "subscribersGained",
            0
        )
    )

    subscribers_lost = int(
        metrics.get(
            "subscribersLost",
            0
        )
    )

    follower_growth = (
        subscribers_gained
        - subscribers_lost
    )

    return {

        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },

        "total_followers": None,

        "new_followers": subscribers_gained,

        "followers_lost": subscribers_lost,

        "follower_growth": follower_growth,

        "views": metrics.get(
            "views",
            0
        ),

        "watch_time_minutes": metrics.get(
            "estimatedMinutesWatched",
            0
        ),

        "average_view_duration": metrics.get(
            "averageViewDuration",
            0
        ),

        "message": (
            "Audience analytics loaded from "
            "YouTube Analytics API."
        ),
    }


# =====================================================
# REAL MONTHLY PERFORMANCE
# =====================================================

@router.get(
    "/youtube/monthly-performance",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_youtube_monthly_performance(
    request: Request,
    start_date: str = "2026-04-01",
    end_date: str = "2026-09-14",
):

    access_token = request.cookies.get(
        "youtube_access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=401,
            detail=(
                "YouTube is not connected. "
                "Please connect YouTube first."
            )
        )

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": "month",
        "metrics": (
            "views,"
            "likes,"
            "comments,"
            "subscribersGained,"
            "subscribersLost"
        ),
        "sort": "month",
    }

    try:

        response = requests.get(
            YOUTUBE_ANALYTICS_URL,
            headers=headers,
            params=params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube Analytics API connection failed: "
                f"{str(e)}"
            )
        )

    if response.status_code != 200:

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    data = response.json()

    column_headers = data.get(
        "columnHeaders",
        []
    )

    rows = data.get(
        "rows",
        []
    )

    months = []

    header_names = []

    for header in column_headers:

        header_names.append(
            header.get("name")
        )

    for row in rows:

        row_data = {}

        for index, value in enumerate(row):

            if index < len(header_names):

                row_data[
                    header_names[index]
                ] = value

        month = row_data.get(
            "month"
        )

        views = int(
            row_data.get(
                "views",
                0
            )
            or 0
        )

        likes = int(
            row_data.get(
                "likes",
                0
            )
            or 0
        )

        comments = int(
            row_data.get(
                "comments",
                0
            )
            or 0
        )

        subscribers_gained = int(
            row_data.get(
                "subscribersGained",
                0
            )
            or 0
        )

        subscribers_lost = int(
            row_data.get(
                "subscribersLost",
                0
            )
            or 0
        )

        net_subscribers = (
            subscribers_gained
            - subscribers_lost
        )

        if views > 0:

            engagement_rate = (
                (
                    likes
                    + comments
                )
                / views
            ) * 100

        else:

            engagement_rate = 0

        months.append({

            "month": month,

            "views": views,

            "likes": likes,

            "comments": comments,

            "subscribers_gained": (
                subscribers_gained
            ),

            "subscribers_lost": (
                subscribers_lost
            ),

            "net_subscribers": (
                net_subscribers
            ),

            "engagement_rate": round(
                engagement_rate,
                2
            ),

        })

    performance = []

    for index, current in enumerate(
        months
    ):

        previous = (
            months[index - 1]
            if index > 0
            else None
        )

        follower_growth = None

        if previous:

            previous_net = (
                previous[
                    "net_subscribers"
                ]
            )

            current_net = (
                current[
                    "net_subscribers"
                ]
            )

            if previous_net != 0:

                follower_growth = round(
                    (
                        (
                            current_net
                            - previous_net
                        )
                        / abs(previous_net)
                    )
                    * 100,
                    2
                )

        content_views_growth = None

        if previous:

            previous_views = (
                previous["views"]
            )

            current_views = (
                current["views"]
            )

            if previous_views > 0:

                content_views_growth = round(
                    (
                        (
                            current_views
                            - previous_views
                        )
                        / previous_views
                    )
                    * 100,
                    2
                )

        engagement_growth = None

        if previous:

            previous_engagement = (
                previous[
                    "engagement_rate"
                ]
            )

            current_engagement = (
                current[
                    "engagement_rate"
                ]
            )

            if previous_engagement != 0:

                engagement_growth = round(
                    (
                        (
                            current_engagement
                            - previous_engagement
                        )
                        / abs(
                            previous_engagement
                        )
                    )
                    * 100,
                    2
                )

        performance.append({

            "month": current[
                "month"
            ],

            "views": current[
                "views"
            ],

            "likes": current[
                "likes"
            ],

            "comments": current[
                "comments"
            ],

            "subscribers_gained": current[
                "subscribers_gained"
            ],

            "subscribers_lost": current[
                "subscribers_lost"
            ],

            "net_subscribers": current[
                "net_subscribers"
            ],

            "engagement_rate": current[
                "engagement_rate"
            ],

            "follower_growth": (
                follower_growth
            ),

            "engagement_growth": (
                engagement_growth
            ),

            "content_views_growth": (
                content_views_growth
            ),

        })

    return {

        "creator": "connected_youtube_channel",

        "period": {
            "start_date": start_date,
            "end_date": end_date,
        },

        "months": performance,

        "message": (
            "Monthly performance loaded from "
            "YouTube Analytics API for the "
            "connected YouTube channel."
        ),

    }


# =====================================================
# YOUTUBE AUDIENCE AGE
# =====================================================

@router.get(
    "/youtube/audience/age",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_youtube_audience_age(
    request: Request,
    start_date: str = "2026-01-01",
    end_date: str = "2026-09-14",
):

    return get_youtube_dimension_report(
        request=request,
        start_date=start_date,
        end_date=end_date,
        dimensions="ageGroup",
        metrics="viewerPercentage",
    )


# =====================================================
# YOUTUBE AUDIENCE GENDER
# =====================================================

@router.get(
    "/youtube/audience/gender",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_youtube_audience_gender(
    request: Request,
    start_date: str = "2026-01-01",
    end_date: str = "2026-09-14",
):

    return get_youtube_dimension_report(
        request=request,
        start_date=start_date,
        end_date=end_date,
        dimensions="gender",
        metrics="viewerPercentage",
    )


# =====================================================
# YOUTUBE AUDIENCE COUNTRY
# =====================================================

@router.get(
    "/youtube/audience/country",
    dependencies=[Depends(require_provider_owner("youtube"))],
)
def get_youtube_audience_country(
    request: Request,
    start_date: str = "2026-01-01",
    end_date: str = "2026-09-14",
):

    return get_youtube_dimension_report(
        request=request,
        start_date=start_date,
        end_date=end_date,
        dimensions="country",
        metrics="viewerPercentage",
    )


# =====================================================
# GENERIC YOUTUBE DIMENSION REPORT
# =====================================================

def get_youtube_dimension_report(
    request: Request,
    start_date: str,
    end_date: str,
    dimensions: str,
    metrics: str,
):

    access_token = request.cookies.get(
        "youtube_access_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=401,
            detail=(
                "YouTube is not connected. "
                "Please connect YouTube first."
            )
        )

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "metrics": metrics,
        "sort": f"-{metrics}",
    }

    try:

        response = requests.get(
            YOUTUBE_ANALYTICS_URL,
            headers=headers,
            params=params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube Analytics API connection failed: "
                f"{str(e)}"
            )
        )

    if response.status_code != 200:

        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )

    data = response.json()

    return {

        "dimension": dimensions,

        "metrics": metrics,

        "column_headers": data.get(
            "columnHeaders",
            []
        ),

        "rows": data.get(
            "rows",
            []
        ),
    }


# =====================================================
# ANALYZE PUBLIC YOUTUBE CHANNEL
# =====================================================

@router.get("/youtube/analyze")
def analyze_youtube_channel(
    channel_name: str
):

    api_key = os.getenv(
        "YOUTUBE_API_KEY"
    )

    if not api_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "YOUTUBE_API_KEY is not configured"
            )
        )

    search_name = channel_name.strip()

    if not search_name:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a YouTube channel name."
            )
        )

    cache_key = search_name.lower()

    if cache_key in YOUTUBE_CHANNEL_CACHE:

        print(
            f"Using cached YouTube data for: "
            f"{search_name}"
        )

        return YOUTUBE_CHANNEL_CACHE[
            cache_key
        ]

    search_params = {

        "part": "snippet",

        "q": search_name,

        "type": "channel",

        "maxResults": 1,

        "key": api_key,
    }

    try:

        search_response = requests.get(
            f"{YOUTUBE_API_URL}/search",
            params=search_params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube API connection failed: "
                f"{str(e)}"
            )
        )

    if search_response.status_code != 200:

        if search_response.status_code == 429:

            raise HTTPException(
                status_code=429,
                detail=(
                    "YouTube search quota has been "
                    "exceeded for today. Please try "
                    "again after the YouTube API quota "
                    "resets."
                )
            )

        raise HTTPException(
            status_code=search_response.status_code,
            detail=search_response.text
        )

    search_data = search_response.json()

    if not search_data.get("items"):

        raise HTTPException(
            status_code=404,
            detail=(
                f"No YouTube channel found "
                f"for '{search_name}'."
            )
        )

    channel_id = (
        search_data["items"][0]
        .get("id", {})
        .get("channelId")
    )

    if not channel_id:

        raise HTTPException(
            status_code=404,
            detail=(
                "YouTube channel ID could not "
                "be found."
            )
        )

    channel_params = {

        "part": "snippet,statistics,contentDetails",

        "id": channel_id,

        "key": api_key,
    }

    try:

        channel_response = requests.get(
            f"{YOUTUBE_API_URL}/channels",
            params=channel_params,
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "YouTube API connection failed: "
                f"{str(e)}"
            )
        )

    if channel_response.status_code != 200:

        raise HTTPException(
            status_code=channel_response.status_code,
            detail=channel_response.text
        )

    channel_data = channel_response.json()

    if not channel_data.get("items"):

        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found."
        )

    channel = channel_data["items"][0]

    snippet = channel.get(
        "snippet",
        {}
    )

    statistics = channel.get(
        "statistics",
        {}
    )

    content_details = channel.get(
        "contentDetails",
        {}
    )

    related_playlists = (
        content_details.get(
            "relatedPlaylists",
            {}
        )
    )

    uploads_playlist_id = (
        related_playlists.get(
            "uploads"
        )
    )

    video_ids = []

    if uploads_playlist_id:

        playlist_params = {

            "part": "snippet",

            "playlistId": uploads_playlist_id,

            "maxResults": 10,

            "key": api_key,
        }

        try:

            playlist_response = requests.get(
                f"{YOUTUBE_API_URL}/playlistItems",
                params=playlist_params,
                timeout=30,
            )

        except requests.RequestException as e:

            raise HTTPException(
                status_code=500,
                detail=(
                    "YouTube API connection failed: "
                    f"{str(e)}"
                )
            )

        if playlist_response.status_code != 200:

            raise HTTPException(
                status_code=(
                    playlist_response.status_code
                ),
                detail=playlist_response.text
            )

        playlist_data = (
            playlist_response.json()
        )

        for item in playlist_data.get(
            "items",
            []
        ):

            resource_id = (
                item
                .get("snippet", {})
                .get("resourceId", {})
            )

            video_id = resource_id.get(
                "videoId"
            )

            if video_id:

                video_ids.append(
                    video_id
                )

    videos = []

    if video_ids:

        videos_params = {

            "part": "snippet,statistics",

            "id": ",".join(video_ids),

            "key": api_key,
        }

        try:

            videos_response = requests.get(
                f"{YOUTUBE_API_URL}/videos",
                params=videos_params,
                timeout=30,
            )

        except requests.RequestException as e:

            raise HTTPException(
                status_code=500,
                detail=(
                    "YouTube API connection failed: "
                    f"{str(e)}"
                )
            )

        if videos_response.status_code != 200:

            raise HTTPException(
                status_code=(
                    videos_response.status_code
                ),
                detail=videos_response.text
            )

        videos_data = (
            videos_response.json()
        )

        for video in videos_data.get(
            "items",
            []
        ):

            video_snippet = video.get(
                "snippet",
                {}
            )

            video_statistics = video.get(
                "statistics",
                {}
            )

            videos.append({

                "video_id": video.get(
                    "id"
                ),

                "title": video_snippet.get(
                    "title"
                ),

                "published_at": (
                    video_snippet.get(
                        "publishedAt"
                    )
                ),

                "thumbnail": (
                    video_snippet
                    .get("thumbnails", {})
                    .get("high", {})
                    .get("url")
                ),

                "views": int(
                    video_statistics.get(
                        "viewCount",
                        0
                    )
                ),

                "likes": int(
                    video_statistics.get(
                        "likeCount",
                        0
                    )
                ),

                "comments": int(
                    video_statistics.get(
                        "commentCount",
                        0
                    )
                ),

            })

    total_video_views = sum(
        video["views"]
        for video in videos
    )

    total_likes = sum(
        video["likes"]
        for video in videos
    )

    total_comments = sum(
        video["comments"]
        for video in videos
    )

    if total_video_views > 0:

        engagement_rate = (
            (
                total_likes
                + total_comments
            )
            / total_video_views
        ) * 100

    else:

        engagement_rate = 0

    result = {

        "channel": {

            "channel_id": channel.get(
                "id"
            ),

            "channel_name": snippet.get(
                "title"
            ),

            "description": snippet.get(
                "description"
            ),

            "thumbnail": (
                snippet
                .get("thumbnails", {})
                .get("high", {})
                .get("url")
            ),

            "subscribers": int(
                statistics.get(
                    "subscriberCount",
                    0
                )
            ),

            "total_views": int(
                statistics.get(
                    "viewCount",
                    0
                )
            ),

            "video_count": int(
                statistics.get(
                    "videoCount",
                    0
                )
            ),

        },

        "analytics": {

            "recent_video_views": (
                total_video_views
            ),

            "recent_video_likes": (
                total_likes
            ),

            "recent_video_comments": (
                total_comments
            ),

            "engagement_rate": round(
                engagement_rate,
                2
            ),

        },

        "recent_videos": videos,

    }

    YOUTUBE_CHANNEL_CACHE[
        cache_key
    ] = result

    return result


# =====================================================
# X (TWITTER) OAUTH SETTINGS
# =====================================================

X_AUTH_URL = (
    "https://twitter.com/i/oauth2/authorize"
)

X_TOKEN_URL = (
    "https://api.x.com/2/oauth2/token"
)

X_ME_URL = (
    "https://api.x.com/2/users/me"
)

X_USERS_BY_USERNAME_URL = (
    "https://api.x.com/2/users/by/username"
)

X_SCOPES = [
    "tweet.read",
    "users.read",
    "offline.access",
]


# =====================================================
# X CONFIG
# =====================================================

def get_x_config():

    client_id = os.getenv(
        "X_CLIENT_ID"
    )

    client_secret = os.getenv(
        "X_CLIENT_SECRET"
    )

    redirect_uri = os.getenv(
        "X_REDIRECT_URI"
    )

    if not client_id:

        raise HTTPException(
            status_code=500,
            detail="X_CLIENT_ID is not configured"
        )

    if not client_secret:

        raise HTTPException(
            status_code=500,
            detail="X_CLIENT_SECRET is not configured"
        )

    if not redirect_uri:

        raise HTTPException(
            status_code=500,
            detail="X_REDIRECT_URI is not configured"
        )

    return (
        client_id,
        client_secret,
        redirect_uri
    )


# =====================================================
# TWITTERAPIS API KEY
# =====================================================

def get_twitterapis_api_key():

    api_key = os.getenv(
        "TWITTERAPIS_API_KEY"
    )

    if not api_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "TWITTERAPIS_API_KEY is not configured "
                "in the backend .env file."
            )
        )

    return api_key


# =====================================================
# TWITTERAPIS REQUEST HELPER
# =====================================================

def twitterapis_get(
    endpoint: str,
    params: dict,
):

    api_key = get_twitterapis_api_key()

    headers = {
        "Authorization":
            f"Bearer {api_key}"
    }

    try:

        response = requests.get(

            f"{TWITTERAPIS_BASE_URL}"
            f"{endpoint}",

            headers=headers,

            params=params,

            timeout=30,

        )

    except requests.RequestException as e:

        raise HTTPException(

            status_code=502,

            detail=(
                "TwitterAPIs connection failed: "
                f"{str(e)}"
            )

        )

    if response.status_code == 401:

        raise HTTPException(

            status_code=401,

            detail=(
                "TwitterAPIs API key is invalid "
                "or revoked."
            )

        )

    if response.status_code == 402:

        raise HTTPException(

            status_code=402,

            detail=(
                "TwitterAPIs credits are unavailable "
                "or depleted. Please check the credits "
                "in your TwitterAPIs account."
            )

        )

    if response.status_code == 403:

        raise HTTPException(

            status_code=403,

            detail=(
                "TwitterAPIs denied this request."
            )

        )

    if response.status_code == 404:

        raise HTTPException(

            status_code=404,

            detail=(
                "The requested X data was not found."
            )

        )

    if response.status_code == 429:

        raise HTTPException(

            status_code=429,

            detail=(
                "TwitterAPIs rate limit reached. "
                "Please try again later."
            )

        )

    if response.status_code != 200:

        raise HTTPException(

            status_code=response.status_code,

            detail=(
                f"TwitterAPIs request failed: "
                f"{response.text}"
            )

        )

    try:

        return response.json()

    except ValueError:

        raise HTTPException(

            status_code=502,

            detail=(
                "TwitterAPIs returned an invalid "
                "JSON response."
            )

        )


# =====================================================
# EXTRACT USER FROM RESPONSE
# =====================================================

def extract_x_user(
    data
):

    if not isinstance(
        data,
        dict
    ):

        return {}

    user = data.get(
        "user"
    )

    if isinstance(
        user,
        dict
    ):

        return user

    user = data.get(
        "data"
    )

    if isinstance(
        user,
        dict
    ):

        return user

    result = data.get(
        "result"
    )

    if isinstance(
        result,
        dict
    ):

        nested_user = result.get(
            "user"
        )

        if isinstance(
            nested_user,
            dict
        ):

            return nested_user

        return result

    return {}


# =====================================================
# EXTRACT USER SEARCH RESULTS
# =====================================================

def extract_x_search_users(
    data
):

    if not isinstance(
        data,
        dict
    ):

        return []

    possible_lists = [

        data.get(
            "users"
        ),

        data.get(
            "results"
        ),

        data.get(
            "items"
        ),

        data.get(
            "data"
        ),

    ]

    for value in possible_lists:

        if isinstance(
            value,
            list
        ):

            return [
                item
                for item in value
                if isinstance(
                    item,
                    dict
                )
            ]

    result = data.get(
        "result"
    )

    if isinstance(
        result,
        dict
    ):

        for key in [
            "users",
            "results",
            "items",
            "data",
        ]:

            value = result.get(
                key
            )

            if isinstance(
                value,
                list
            ):

                return [
                    item
                    for item in value
                    if isinstance(
                        item,
                        dict
                    )
                ]

    return []


# =====================================================
# EXTRACT X POSTS
# =====================================================

def extract_x_posts(
    data
):

    if not isinstance(
        data,
        dict
    ):

        return []

    possible_lists = [

        data.get(
            "tweets"
        ),

        data.get(
            "posts"
        ),

        data.get(
            "results"
        ),

        data.get(
            "items"
        ),

        data.get(
            "data"
        ),

    ]

    for value in possible_lists:

        if isinstance(
            value,
            list
        ):

            return [
                item
                for item in value
                if isinstance(
                    item,
                    dict
                )
            ]

    result = data.get(
        "result"
    )

    if isinstance(
        result,
        dict
    ):

        for key in [
            "tweets",
            "posts",
            "results",
            "items",
            "data",
        ]:

            value = result.get(
                key
            )

            if isinstance(
                value,
                list
            ):

                return [
                    item
                    for item in value
                    if isinstance(
                        item,
                        dict
                    )
                ]

    return []


# =====================================================
# EXTRACT X POST MEDIA / IMAGES
# =====================================================

def extract_x_media(post):

    media_urls = []

    # -------------------------------------------------
    # Add a URL safely
    # -------------------------------------------------

    def add_url(value):

        if isinstance(
            value,
            str
        ):

            value = value.strip()

            if value.startswith(
                "http://"
            ) or value.startswith(
                "https://"
            ):

                media_urls.append(
                    value
                )

        elif isinstance(
            value,
            dict
        ):

            possible_url = (

                value.get(
                    "media_url_https"
                )

                or value.get(
                    "media_url"
                )

                or value.get(
                    "image_url"
                )

                or value.get(
                    "thumbnail_url"
                )

                or value.get(
                    "preview_image_url"
                )

                or value.get(
                    "url"
                )

            )

            if isinstance(
                possible_url,
                str
            ):

                possible_url = (
                    possible_url.strip()
                )

                if possible_url.startswith(
                    "http://"
                ) or possible_url.startswith(
                    "https://"
                ):

                    media_urls.append(
                        possible_url
                    )

    # -------------------------------------------------
    # Direct media fields
    # -------------------------------------------------

    for key in [

        "media_url",
        "media_url_https",
        "image_url",
        "thumbnail_url",
        "preview_image_url",

    ]:

        add_url(
            post.get(key)
        )

    # -------------------------------------------------
    # media
    # -------------------------------------------------

    media = post.get(
        "media"
    )

    if isinstance(
        media,
        list
    ):

        for item in media:

            add_url(
                item
            )

    elif isinstance(
        media,
        dict
    ):

        add_url(
            media
        )

        nested_media = media.get(
            "media"
        )

        if isinstance(
            nested_media,
            list
        ):

            for item in nested_media:

                add_url(
                    item
                )

    # -------------------------------------------------
    # images
    # -------------------------------------------------

    images = post.get(
        "images"
    )

    if isinstance(
        images,
        list
    ):

        for item in images:

            add_url(
                item
            )

    elif isinstance(
        images,
        dict
    ):

        add_url(
            images
        )

    # -------------------------------------------------
    # attachments
    # -------------------------------------------------

    attachments = post.get(
        "attachments"
    )

    if isinstance(
        attachments,
        list
    ):

        for item in attachments:

            if isinstance(
                item,
                dict
            ):

                add_url(
                    item
                )

                nested_media = item.get(
                    "media"
                )

                if isinstance(
                    nested_media,
                    list
                ):

                    for media_item in nested_media:

                        add_url(
                            media_item
                        )

                nested_images = item.get(
                    "images"
                )

                if isinstance(
                    nested_images,
                    list
                ):

                    for image_item in nested_images:

                        add_url(
                            image_item
                        )

            else:

                add_url(
                    item
                )

    elif isinstance(
        attachments,
        dict
    ):

        add_url(
            attachments
        )

        nested_media = attachments.get(
            "media"
        )

        if isinstance(
            nested_media,
            list
        ):

            for item in nested_media:

                add_url(
                    item
                )

        nested_images = attachments.get(
            "images"
        )

        if isinstance(
            nested_images,
            list
        ):

            for item in nested_images:

                add_url(
                    item
                )

    # -------------------------------------------------
    # Twitter/X v1 style entities
    # -------------------------------------------------

    for container_key in [

        "extended_entities",
        "entities",

    ]:

        container = post.get(
            container_key
        )

        if isinstance(
            container,
            dict
        ):

            entity_media = container.get(
                "media"
            )

            if isinstance(
                entity_media,
                list
            ):

                for item in entity_media:

                    add_url(
                        item
                    )

    # -------------------------------------------------
    # Remove duplicate URLs
    # -------------------------------------------------

    unique_urls = []

    for url in media_urls:

        if url not in unique_urls:

            unique_urls.append(
                url
            )

    return unique_urls


# =====================================================
# FIND USERNAME FROM DISPLAY NAME
# =====================================================

def find_x_username(
    search_name: str
):

    search_name = search_name.strip()

    if not search_name:

        raise HTTPException(

            status_code=400,

            detail=(
                "Please enter an X account name."
            )

        )

    search_data = twitterapis_get(

        "/user/search",

        {
            "query":
                search_name
        }

    )

    raw_results = extract_x_search_users(
        search_data
    )

    if not raw_results:

        raise HTTPException(

            status_code=404,

            detail=(
                f"No X accounts found for "
                f"'{search_name}'."
            )

        )

    candidates = []

    for user in raw_results:

        username = (

            user.get(
                "username"
            )

            or user.get(
                "screen_name"
            )

            or user.get(
                "handle"
            )

        )

        name = (

            user.get(
                "name"
            )

            or user.get(
                "display_name"
            )

        )

        if not username:

            continue

        candidates.append({

            "username":
                str(username)
                .strip()
                .lstrip("@"),

            "name":
                name,

            "user":
                user,

        })

    if not candidates:

        raise HTTPException(

            status_code=404,

            detail=(
                f"No usable X account was found "
                f"for '{search_name}'."
            )

        )

    search_lower = (
        search_name
        .strip()
        .lower()
    )

    for candidate in candidates:

        candidate_name = str(
            candidate.get(
                "name"
            )
            or ""
        ).strip().lower()

        if candidate_name == search_lower:

            return candidate[
                "username"
            ]

    search_without_at = (
        search_name
        .strip()
        .lstrip("@")
        .lower()
    )

    for candidate in candidates:

        if (
            candidate["username"]
            .lower()
            ==
            search_without_at
        ):

            return candidate[
                "username"
            ]

    return candidates[0][
        "username"
    ]


# =====================================================
# X CONNECT
# =====================================================

@router.get("/x/connect")
def connect_x(
    current_user: User = Depends(get_current_creator),
):

    client_id, client_secret, redirect_uri = (
        get_x_config()
    )

    state = secrets.token_urlsafe(32)

    code_verifier = secrets.token_urlsafe(64)

    code_challenge = (
        base64.urlsafe_b64encode(
            hashlib.sha256(
                code_verifier.encode("utf-8")
            ).digest()
        )
        .decode("utf-8")
        .rstrip("=")
    )

    params = {

        "response_type": "code",

        "client_id": client_id,

        "redirect_uri": redirect_uri,

        "scope": " ".join(X_SCOPES),

        "state": state,

        "code_challenge": code_challenge,

        "code_challenge_method": "S256",

    }

    authorization_url = (
        X_AUTH_URL
        + "?"
        + urlencode(params)
    )

    response = JSONResponse(
        content={
            "authorization_url": authorization_url
        }
    )

    response.set_cookie(
        key="x_oauth_state",
        value=create_provider_oauth_state(
            "x",
            current_user.id,
            state,
        ),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=600,
    )

    response.set_cookie(
        key="x_code_verifier",
        value=code_verifier,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=600,
    )

    return response


# =====================================================
# X OAUTH CALLBACK
# =====================================================

@router.get("/x/callback")
def x_callback(
    request: Request,
    code: str,
    state: str,
):

    saved_state = request.cookies.get(
        "x_oauth_state"
    )

    code_verifier = request.cookies.get(
        "x_code_verifier"
    )

    if not saved_state:

        raise HTTPException(
            status_code=400,
            detail="X OAuth state cookie is missing"
        )

    owner_id = get_provider_oauth_state_owner(
        saved_state,
        "x",
        state,
    )
    if owner_id is None:

        raise HTTPException(
            status_code=400,
            detail="Invalid X OAuth state"
        )

    if not code_verifier:

        raise HTTPException(
            status_code=400,
            detail="X PKCE code verifier is missing"
        )

    client_id, client_secret, redirect_uri = (
        get_x_config()
    )

    token_data = {

        "code": code,

        "grant_type": "authorization_code",

        "redirect_uri": redirect_uri,

        "code_verifier": code_verifier,

    }

    try:

        token_response = requests.post(
            X_TOKEN_URL,
            data=token_data,
            auth=(
                client_id,
                client_secret
            ),
            headers={
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },
            timeout=30,
        )

    except requests.RequestException as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "X token request failed: "
                f"{str(e)}"
            )
        )

    if token_response.status_code != 200:

        raise HTTPException(
            status_code=token_response.status_code,
            detail=token_response.text
        )

    token_data = token_response.json()

    access_token = token_data.get(
        "access_token"
    )

    refresh_token = token_data.get(
        "refresh_token"
    )

    if not access_token:

        raise HTTPException(
            status_code=400,
            detail="X access token was not received"
        )

    response = JSONResponse(
        content={
            "message": "X connected successfully",

            "has_access_token": True,

            "has_refresh_token": (
                refresh_token is not None
            ),

            "scope": token_data.get(
                "scope"
            ),
        }
    )

    response.delete_cookie(
        key="x_oauth_state"
    )

    response.delete_cookie(
        key="x_code_verifier"
    )

    response.set_cookie(
        key="x_access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=3600,
    )
    response.set_cookie(
        key="x_owner",
        value=create_provider_owner_cookie("x", owner_id),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 30,
    )

    if refresh_token:

        response.set_cookie(
            key="x_refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=60 * 60 * 24 * 30,
        )

    return response


# =====================================================
# X SEARCH BY NAME
# =====================================================

@router.get("/x/search")
def search_x_accounts(
    query: str,
):

    search_query = query.strip()

    if not search_query:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter an X account name."
            )
        )

    cache_key = search_query.lower()

    if cache_key in X_SEARCH_CACHE:

        print(
            f"Using cached X search results for: "
            f"{search_query}"
        )

        return X_SEARCH_CACHE[
            cache_key
        ]

    data = twitterapis_get(

        "/user/search",

        {
            "query":
                search_query
        }

    )

    raw_results = extract_x_search_users(
        data
    )

    results = []

    for user in raw_results:

        username = (

            user.get(
                "username"
            )

            or user.get(
                "screen_name"
            )

            or user.get(
                "handle"
            )

        )

        name = (

            user.get(
                "name"
            )

            or user.get(
                "display_name"
            )

        )

        if not username:

            continue

        followers = int(
            user.get(
                "followers_count",
                user.get(
                    "followers",
                    0
                )
            )
            or 0
        )

        following = int(
            user.get(
                "following_count",
                user.get(
                    "following",
                    0
                )
            )
            or 0
        )

        tweet_count = int(
            user.get(
                "tweet_count",
                user.get(
                    "statuses_count",
                    user.get(
                        "posts",
                        0
                    )
                )
            )
            or 0
        )

        results.append({

            "user_id": user.get(
                "id"
            ),

            "name": name,

            "username": (
                str(username)
                .strip()
                .lstrip("@")
            ),

            "description": user.get(
                "description"
            ),

            "profile_image": (
                user.get(
                    "profile_image_url"
                )
                or user.get(
                    "profile_image"
                )
                or user.get(
                    "profile_image_url_https"
                )
            ),

            "followers": followers,

            "following": following,

            "posts": tweet_count,

        })

    result = {

        "query":
            search_query,

        "results":
            results,

        "message": (
            "X accounts found successfully "
            "using TwitterAPIs."
            if results
            else (
                f"No X accounts found "
                f"for '{search_query}'."
            )
        ),

    }

    X_SEARCH_CACHE[
        cache_key
    ] = result

    return result


# =====================================================
# GET X ACCOUNT
# =====================================================

@router.get(
    "/x/me",
    dependencies=[Depends(get_current_creator)],
)
def get_my_x_account(
    request: Request,
):

    username = request.cookies.get(
        "x_username"
    )

    if not username:

        raise HTTPException(
            status_code=401,
            detail=(
                "X username is not available. "
                "Please search an X account first."
            )
        )

    username = (
        username
        .strip()
        .lstrip("@")
    )

    if not username:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please provide a valid X username."
            )
        )

    data = twitterapis_get(

        "/user/info",

        {
            "username":
                username
        }

    )

    user = extract_x_user(
        data
    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail=(
                f"No X account found for "
                f"'@{username}'."
            )

        )

    followers = int(
        user.get(
            "followers_count",
            user.get(
                "followers",
                0
            )
        )
        or 0
    )

    following = int(
        user.get(
            "following_count",
            user.get(
                "following",
                0
            )
        )
        or 0
    )

    posts_count = int(
        user.get(
            "tweet_count",
            user.get(
                "statuses_count",
                user.get(
                    "posts",
                    0
                )
            )
        )
        or 0
    )

    return {

        "platform": "X",

        "user_id": user.get(
            "id"
        ),

        "name": (
            user.get(
                "name"
            )
            or user.get(
                "display_name"
            )
        ),

        "username": user.get(
            "username",
            username
        ),

        "description": user.get(
            "description"
        ),

        "profile_image": (
            user.get(
                "profile_image_url"
            )
            or user.get(
                "profile_image"
            )
            or user.get(
                "profile_image_url_https"
            )
        ),

        "followers": followers,

        "following": following,

        "posts": posts_count,

        "public_metrics": {

            "followers_count":
                followers,

            "following_count":
                following,

            "tweet_count":
                posts_count,

        },

        "message": (
            "X account loaded successfully "
            "using TwitterAPIs."
        ),
    }


# =====================================================
# ANALYZE X ACCOUNT USING TWITTERAPIS
# =====================================================

@router.get("/x/analyze")
def analyze_x_account(
    request: Request,
    name: str = "",
):

    # =================================================
    # CLEAN DISPLAY NAME
    # =================================================

    search_name = name.strip()

    if not search_name:

        raise HTTPException(

            status_code=400,

            detail=(
                "Please enter an X account name."
            )

        )

    # =================================================
    # FIND REAL X USERNAME FROM DISPLAY NAME
    # =================================================

    search_key = search_name.lower()

    if search_key in X_SEARCH_CACHE:

        search_result = X_SEARCH_CACHE[
            search_key
        ]

        search_results = search_result.get(
            "results",
            []
        )

        if not search_results:

            raise HTTPException(

                status_code=404,

                detail=(
                    f"No X accounts found for "
                    f"'{search_name}'."
                )

            )

        # ---------------------------------------------
        # Exact display name first
        # ---------------------------------------------

        selected_username = None

        for result in search_results:

            result_name = str(
                result.get(
                    "name"
                )
                or ""
            ).strip().lower()

            if result_name == search_key:

                selected_username = (
                    result.get(
                        "username"
                    )
                )

                break

        # ---------------------------------------------
        # Otherwise first search result
        # ---------------------------------------------

        if not selected_username:

            selected_username = (
                search_results[0]
                .get(
                    "username"
                )
            )

    else:

        selected_username = find_x_username(
            search_name
        )

    if not selected_username:

        raise HTTPException(

            status_code=404,

            detail=(
                f"Could not determine the X "
                f"username for '{search_name}'."
            )

        )

    selected_username = (
        str(selected_username)
        .strip()
        .lstrip("@")
    )

    # =================================================
    # CACHE BY REAL USERNAME
    # =================================================

    cache_key = (
        selected_username.lower()
    )

    if cache_key in X_ACCOUNT_CACHE:

        print(
            f"Using cached X data for: "
            f"{selected_username}"
        )

        cached_result = X_ACCOUNT_CACHE[
            cache_key
        ]

        response = JSONResponse(
            content=cached_result
        )

        response.set_cookie(
            key="x_username",
            value=selected_username,
            httponly=True,
            samesite="lax",
            secure=False,
            max_age=60 * 60 * 24 * 30,
        )

        return response

    # =================================================
    # GET REAL X USER PROFILE
    # =================================================

    user_data = twitterapis_get(

        "/user/info",

        {
            "username":
                selected_username
        }

    )

    user = extract_x_user(
        user_data
    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail=(
                f"No X account found for "
                f"'@{selected_username}'."
            )

        )

    # =================================================
    # USER DATA
    # =================================================

    user_id = user.get(
        "id"
    )

    user_name = (

        user.get(
            "name"
        )

        or user.get(
            "display_name"
        )

    )

    username = (

        user.get(
            "username"
        )

        or user.get(
            "screen_name"
        )

        or selected_username

    )

    followers = int(
        user.get(
            "followers_count",
            user.get(
                "followers",
                0
            )
        )
        or 0
    )

    following = int(
        user.get(
            "following_count",
            user.get(
                "following",
                0
            )
        )
        or 0
    )

    tweet_count = int(
        user.get(
            "tweet_count",
            user.get(
                "statuses_count",
                user.get(
                    "posts",
                    0
                )
            )
        )
        or 0
    )

    listed_count = int(
        user.get(
            "listed_count",
            0
        )
        or 0
    )

    # =================================================
    # GET REAL RECENT X POSTS
    # =================================================

    posts_data = twitterapis_get(

        "/user/tweets",

        {
            "username":
                selected_username,

            "count":
                20,

        }

    )

    raw_posts = extract_x_posts(
        posts_data
    )

    # =================================================
    # GET REAL X MEDIA / IMAGES
    #
    # TwitterAPIs provides media through the
    # /user/media endpoint. We fetch it separately
    # and match media with the tweet ID.
    # =================================================

    media_data = twitterapis_get(

        "/user/media",

        {
            "username":
                selected_username,

            "count":
                20,

        }

    )

    # =================================================
    # DEBUG - SHOW ACTUAL MEDIA API RESPONSE
    # =================================================

    print("========== X MEDIA API RESPONSE ==========")
    print(media_data)
    print("==========================================")

    raw_media_posts = extract_x_posts(
        media_data
    )

    # =================================================
    # CREATE TWEET ID -> MEDIA URL MAP
    # =================================================

    media_by_tweet = {}

    for media_post in raw_media_posts:

        media_tweet_id = (
            media_post.get(
                "id"
            )
        )

        if not media_tweet_id:
            continue

        media_urls = extract_x_media(
            media_post
        )

        if media_urls:

            media_by_tweet[
                str(media_tweet_id)
            ] = media_urls

    # =================================================
    # BUILD NORMALIZED POSTS
    # =================================================

    posts = []

    for post in raw_posts:

        # ---------------------------------------------
        # Metrics
        # ---------------------------------------------

        public_metrics = post.get(
            "public_metrics",
            {}
        )

        if not isinstance(
            public_metrics,
            dict
        ):

            public_metrics = {}

        impression_count = int(

            post.get(
                "view_count",
                post.get(
                    "impression_count",
                    public_metrics.get(
                        "impression_count",
                        public_metrics.get(
                            "impressions",
                            0
                        )
                    )
                )
            )

            or 0

        )

        like_count = int(

            post.get(
                "favorite_count",
                post.get(
                    "like_count",
                    public_metrics.get(
                        "like_count",
                        public_metrics.get(
                            "likes",
                            0
                        )
                    )
                )
            )

            or 0

        )

        reply_count = int(

            post.get(
                "reply_count",
                public_metrics.get(
                    "reply_count",
                    public_metrics.get(
                        "replies",
                        0
                    )
                )
            )

            or 0

        )

        retweet_count = int(

            post.get(
                "retweet_count",
                public_metrics.get(
                    "retweet_count",
                    public_metrics.get(
                        "retweets",
                        0
                    )
                )
            )

            or 0

        )

        quote_count = int(

            post.get(
                "quote_count",
                public_metrics.get(
                    "quote_count",
                    public_metrics.get(
                        "quotes",
                        0
                    )
                )
            )

            or 0

        )

        bookmark_count = int(

            post.get(
                "bookmark_count",
                public_metrics.get(
                    "bookmark_count",
                    public_metrics.get(
                        "bookmarks",
                        0
                    )
                )
            )

            or 0

        )

        # ---------------------------------------------
        # GET MEDIA DIRECTLY FROM POST FIRST
        # ---------------------------------------------

        media_urls = extract_x_media(
            post
        )

        # ---------------------------------------------
        # IF DIRECT MEDIA IS NOT PRESENT,
        # USE /user/media RESULT
        # ---------------------------------------------

        post_id = post.get(
            "id"
        )

        if not media_urls and post_id:

            media_urls = media_by_tweet.get(
                str(post_id),
                []
            )

        # ---------------------------------------------
        # Add normalized post
        # ---------------------------------------------

        posts.append({

            "id": post_id,

            "text": post.get(
                "text"
            ),

            "created_at": post.get(
                "created_at"
            ),

            # -----------------------------------------
            # ACTUAL IMAGE URLS
            # -----------------------------------------

            "media": media_urls,

            "media_url": (
                media_urls[0]
                if media_urls
                else None
            ),

            # -----------------------------------------
            # THUMBNAIL FOR DASHBOARD
            # -----------------------------------------

            "thumbnail": (
                media_urls[0]
                if media_urls
                else None
            ),

            "public_metrics": {

                "impression_count":
                    impression_count,

                "like_count":
                    like_count,

                "reply_count":
                    reply_count,

                "retweet_count":
                    retweet_count,

                "quote_count":
                    quote_count,

                "bookmark_count":
                    bookmark_count,

            },

        })

    # =================================================
    # CALCULATE X ANALYTICS
    # =================================================

    total_impressions = sum(

        post[
            "public_metrics"
        ].get(
            "impression_count",
            0
        )

        for post in posts

    )

    total_likes = sum(

        post[
            "public_metrics"
        ].get(
            "like_count",
            0
        )

        for post in posts

    )

    total_replies = sum(

        post[
            "public_metrics"
        ].get(
            "reply_count",
            0
        )

        for post in posts

    )

    total_retweets = sum(

        post[
            "public_metrics"
        ].get(
            "retweet_count",
            0
        )

        for post in posts

    )

    total_quotes = sum(

        post[
            "public_metrics"
        ].get(
            "quote_count",
            0
        )

        for post in posts

    )

    total_bookmarks = sum(

        post[
            "public_metrics"
        ].get(
            "bookmark_count",
            0
        )

        for post in posts

    )

    total_engagement = (

        total_likes

        + total_replies

        + total_retweets

        + total_quotes

    )

    if total_impressions > 0:

        engagement_rate = (

            total_engagement
            / total_impressions

        ) * 100

    else:

        engagement_rate = 0

    # =================================================
    # RETURN RESULT
    # =================================================

    result = {

        "platform": "X",

        "search_name":
            search_name,

        "account": {

            "user_id":
                user_id,

            "name":
                user_name,

            "username":
                username,

            "description":
                user.get(
                    "description"
                ),

            # -----------------------------------------
            # PROFILE IMAGE
            # -----------------------------------------

            "profile_image":
                (
                    user.get(
                        "profile_image_url"
                    )
                    or user.get(
                        "profile_image"
                    )
                    or user.get(
                        "profile_image_url_https"
                    )
                ),

            "followers":
                followers,

            "following":
                following,

            "posts":
                tweet_count,

            "listed_count":
                listed_count,

        },

        "analytics": {

            "recent_post_impressions":
                total_impressions,

            "recent_post_likes":
                total_likes,

            "recent_post_replies":
                total_replies,

            "recent_post_retweets":
                total_retweets,

            "recent_post_quotes":
                total_quotes,

            "recent_post_bookmarks":
                total_bookmarks,

            "engagement_rate":
                round(
                    engagement_rate,
                    2
                ),

        },

        "recent_posts":
            posts,

    }

    # =================================================
    # SAVE CACHE
    # =================================================

    X_ACCOUNT_CACHE[
        cache_key
    ] = result

    # =================================================
    # SAVE SELECTED USERNAME IN COOKIE
    # =================================================

    response = JSONResponse(
        content=result
    )

    response.set_cookie(
        key="x_username",
        value=username,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 30,
    )

    return response