from app.services.api_client import BaseSocialAPI
from app.config import settings

class InstagramAPI(BaseSocialAPI):
    def __init__(self):
        super().__init__(base_url="https://graph.instagram.com")
        self.auth_base_url = "https://api.instagram.com"
        
    def get_auth_url(self) -> str:
        client_id = settings.INSTAGRAM_CLIENT_ID
        redirect_uri = settings.INSTAGRAM_REDIRECT_URI
        scope = "user_profile,user_media"
        return f"{self.auth_base_url}/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&response_type=code"

    async def exchange_code(self, code: str) -> dict:
        data = {
            "client_id": settings.INSTAGRAM_CLIENT_ID,
            "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "code": code,
        }
        async with __import__('httpx').AsyncClient() as client:
            resp = await client.post(f"{self.auth_base_url}/oauth/access_token", data=data)
            resp.raise_for_status()
            return resp.json()

    async def get_user_profile(self, access_token: str) -> dict:
        params = {
            "fields": "id,username,account_type,media_count",
            "access_token": access_token
        }
        res = await self.get("/me", params=params)
        # Note: Basic Display API does not return followers count. 
        # For actual followers, the Graph API with an Instagram Business account is required.
        # But this serves as the foundational integration.
        return {
            "platform_user_id": res.get("id"),
            "username": res.get("username"),
            "followers_count": 0, # Requires IG Business API for real count
            "profile_picture_url": None
        }

instagram_api = InstagramAPI()
