from typing import Any
from urllib.parse import urlencode

import httpx

from app.services.connectors.base import SocialConnector


class YouTubeConnector(SocialConnector):
    platform = "youtube"
    authorize_url = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url = "https://oauth2.googleapis.com/token"

    @property
    def client_id(self) -> str:
        return self.settings.google_client_id

    @property
    def client_secret(self) -> str:
        return self.settings.google_client_secret

    @property
    def redirect_uri(self) -> str:
        return self.settings.google_redirect_uri

    def authorization_params(self, state: str) -> dict[str, str]:
        return {"client_id": self.client_id, "redirect_uri": self.redirect_uri, "response_type": "code", "scope": "https://www.googleapis.com/auth/youtube.readonly", "access_type": "offline", "prompt": "consent", "state": state}

    def token_params(self, code: str) -> dict[str, str]:
        return {"code": code, "client_id": self.client_id, "client_secret": self.client_secret, "redirect_uri": self.redirect_uri, "grant_type": "authorization_code"}

    async def fetch_metrics(self, access_token: str, platform_user_id: str | None = None) -> dict[str, Any]:
        if not self.credentials_configured or access_token.startswith("synthetic-"):
            return synthetic_youtube_metrics()
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get("https://www.googleapis.com/youtube/v3/channels", params={"part": "statistics,snippet", "mine": "true", "access_token": access_token})
            response.raise_for_status()
            return {"platform": self.platform, "channel": response.json()}


def synthetic_youtube_metrics() -> dict[str, Any]:
    return {"platform": "youtube", "channel": {"id": "demo-youtube", "title": "Demo YouTube Channel", "subscribers": 18400, "views": 342000}, "content": [{"id": "yt-demo-1", "title": "Behind the scenes", "type": "Short", "views": 34000, "likes": 3020, "comments": 284, "shares": 410, "reach": 34000}, {"id": "yt-demo-2", "title": "Creator workflow", "type": "Video", "views": 27600, "likes": 2310, "comments": 190, "shares": 280, "reach": 27600}], "audience": {"age": [{"age": "18-24", "female": 28, "male": 22}, {"age": "25-34", "female": 19, "male": 11}], "countries": [{"country": "United States", "value": 38}, {"country": "United Kingdom", "value": 23}]}}
