from app.services.api_client import BaseSocialAPI
from app.config import settings
import base64

class TwitterAPI(BaseSocialAPI):
    def __init__(self):
        super().__init__(base_url="https://api.twitter.com/2")
        self.auth_base_url = "https://twitter.com/i/oauth2"
        
    def get_auth_url(self) -> str:
        client_id = settings.TWITTER_CLIENT_ID
        redirect_uri = settings.TWITTER_REDIRECT_URI
        scope = "users.read tweet.read offline.access"
        # PKCE is required for Twitter OAuth 2.0, but keeping it simple for the skeleton
        return f"{self.auth_base_url}/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&state=state&code_challenge=challenge&code_challenge_method=plain"

    async def exchange_code(self, code: str) -> dict:
        auth_string = f"{settings.TWITTER_CLIENT_ID}:{settings.TWITTER_CLIENT_SECRET}"
        b64_auth = base64.b64encode(auth_string.encode()).decode()
        
        data = {
            "code": code,
            "grant_type": "authorization_code",
            "client_id": settings.TWITTER_CLIENT_ID,
            "redirect_uri": settings.TWITTER_REDIRECT_URI,
            "code_verifier": "challenge", # Should match code_challenge from get_auth_url
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {b64_auth}"
        }
        async with __import__('httpx').AsyncClient() as client:
            resp = await client.post("https://api.twitter.com/2/oauth2/token", data=data, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def get_user_profile(self, access_token: str) -> dict:
        headers = {"Authorization": f"Bearer {access_token}"}
        res = await self.get("/users/me?user.fields=public_metrics,profile_image_url", headers=headers)
        data = res.get("data", {})
        return {
            "platform_user_id": data.get("id"),
            "username": f"@{data.get('username')}",
            "followers_count": data.get("public_metrics", {}).get("followers_count", 0),
            "profile_picture_url": data.get("profile_image_url")
        }

twitter_api = TwitterAPI()
