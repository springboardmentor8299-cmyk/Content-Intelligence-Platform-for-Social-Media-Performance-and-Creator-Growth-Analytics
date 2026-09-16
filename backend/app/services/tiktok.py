from app.services.api_client import BaseSocialAPI
from app.config import settings

class TikTokAPI(BaseSocialAPI):
    def __init__(self):
        super().__init__(base_url="https://open.tiktokapis.com/v2")
        self.auth_base_url = "https://www.tiktok.com/v2"
        
    def get_auth_url(self) -> str:
        client_key = settings.TIKTOK_CLIENT_KEY
        redirect_uri = settings.TIKTOK_REDIRECT_URI
        scope = "user.info.basic,video.list"
        return f"{self.auth_base_url}/auth/authorize/?client_key={client_key}&response_type=code&scope={scope}&redirect_uri={redirect_uri}"

    async def exchange_code(self, code: str) -> dict:
        data = {
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.TIKTOK_REDIRECT_URI,
        }
        async with __import__('httpx').AsyncClient() as client:
            resp = await client.post("https://open.tiktokapis.com/v2/oauth/token/", data=data)
            resp.raise_for_status()
            return resp.json()

    async def get_user_profile(self, access_token: str) -> dict:
        headers = {"Authorization": f"Bearer {access_token}"}
        res = await self.get("/user/info/?fields=open_id,union_id,avatar_url,display_name", headers=headers)
        data = res.get("data", {}).get("user", {})
        return {
            "platform_user_id": data.get("open_id"),
            "username": data.get("display_name", "TikTok User"),
            "followers_count": 0,
            "profile_picture_url": data.get("avatar_url")
        }

tiktok_api = TikTokAPI()
