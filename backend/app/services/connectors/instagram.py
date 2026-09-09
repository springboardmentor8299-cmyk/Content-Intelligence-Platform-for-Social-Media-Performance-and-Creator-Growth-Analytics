from typing import Any

import httpx

from app.services.connectors.base import SocialConnector


class InstagramConnector(SocialConnector):
    platform = "instagram"
    authorize_url = "https://www.facebook.com/v20.0/dialog/oauth"
    token_url = "https://graph.facebook.com/v20.0/oauth/access_token"

    @property
    def client_id(self) -> str:
        return self.settings.meta_app_id

    @property
    def client_secret(self) -> str:
        return self.settings.meta_app_secret

    @property
    def redirect_uri(self) -> str:
        return self.settings.meta_redirect_uri

    def authorization_params(self, state: str) -> dict[str, str]:
        return {"client_id": self.client_id, "redirect_uri": self.redirect_uri, "response_type": "code", "scope": "instagram_basic,instagram_manage_insights,pages_show_list", "state": state}

    def token_params(self, code: str) -> dict[str, str]:
        return {"code": code, "client_id": self.client_id, "client_secret": self.client_secret, "redirect_uri": self.redirect_uri}

    async def fetch_metrics(self, access_token: str, platform_user_id: str | None = None) -> dict[str, Any]:
        if not self.client_id or access_token.startswith("synthetic-"):
            return synthetic_instagram_metrics()
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get("https://graph.facebook.com/v20.0/me", params={"fields": "id,username,followers_count,media_count", "access_token": access_token})
            response.raise_for_status()
            return {"platform": self.platform, "profile": response.json()}


def synthetic_instagram_metrics() -> dict[str, Any]:
    return {"platform": "instagram", "profile": {"id": "demo-instagram", "username": "demo_creator", "followers_count": 12600, "media_count": 84}, "content": [{"id": "ig-demo-1", "title": "Three editing tips", "type": "Reel", "views": 27600, "likes": 2310, "comments": 190, "shares": 280, "reach": 27600}], "audience": {"age": [{"age": "18-24", "female": 31, "male": 18}, {"age": "25-34", "female": 22, "male": 12}], "countries": [{"country": "United States", "value": 41}, {"country": "Canada", "value": 17}]}}
