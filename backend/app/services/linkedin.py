import urllib.parse
import httpx
import datetime
from typing import List, Dict, Any
from app.services.api_client import BaseSocialAPI
from app.config import settings

class LinkedInAPI(BaseSocialAPI):
    def __init__(self):
        super().__init__(base_url="https://api.linkedin.com/v2")
        self.auth_base_url = "https://www.linkedin.com/oauth/v2"
        
    def get_auth_url(self) -> str:
        client_id = settings.LINKEDIN_CLIENT_ID
        redirect_uri = settings.LINKEDIN_REDIRECT_URI
        # Modern LinkedIn OAuth uses openid profile email (or r_liteprofile w_member_social)
        scope = "openid profile email"
        params = {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": scope,
            "state": "linkedin_auth_state"
        }
        return f"{self.auth_base_url}/authorization?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str) -> dict:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.auth_base_url}/accessToken", data=data, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def get_user_profile(self, access_token: str) -> dict:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # 1. Try OpenID userinfo endpoint (Standard LinkedIn OAuth v2)
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get("https://api.linkedin.com/v2/userinfo", headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "platform_user_id": data.get("sub"),
                        "username": data.get("name", "LinkedIn Member"),
                        "followers_count": 0,
                        "total_views": 0,
                        "video_count": 0,
                        "profile_picture_url": data.get("picture")
                    }
        except Exception as e:
            print(f"Error fetching LinkedIn userinfo: {e}")

        # 2. Fallback to /v2/me endpoint
        try:
            res = await self.get("/me", headers=headers)
            first_name = res.get("localizedFirstName", "")
            last_name = res.get("localizedLastName", "")
            return {
                "platform_user_id": res.get("id"),
                "username": f"{first_name} {last_name}".strip() or "LinkedIn Member",
                "followers_count": 0,
                "total_views": 0,
                "video_count": 0,
                "profile_picture_url": None
            }
        except Exception as e:
            print(f"Error fetching LinkedIn /me: {e}")

        return {
            "platform_user_id": "li_connected",
            "username": "LinkedIn Member",
            "followers_count": 0,
            "total_views": 0,
            "video_count": 0,
            "profile_picture_url": None
        }

    async def get_recent_posts(self, access_token: str, max_results: int = 10) -> List[Dict[str, Any]]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        profile = await self.get_user_profile(access_token)
        author_id = profile.get("platform_user_id")
        if not author_id:
            return []

        posts = []
        try:
            author_urn = f"urn:li:person:{author_id}"
            encoded_author = urllib.parse.quote(author_urn)
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List({encoded_author})&count={max_results}",
                    headers=headers
                )
                if res.status_code == 200:
                    data = res.json()
                    for item in data.get("elements", []):
                        specific_content = item.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {})
                        text = specific_content.get("shareCommentary", {}).get("text", "LinkedIn Post")
                        created_time = item.get("created", {}).get("time", 0)
                        date_str = ""
                        if created_time:
                            date_str = datetime.datetime.fromtimestamp(created_time / 1000).strftime("%Y-%m-%d")
                        
                        posts.append({
                            "id": item.get("id", ""),
                            "title": text[:80] + ("..." if len(text) > 80 else ""),
                            "platform": "LinkedIn",
                            "url": f"https://www.linkedin.com/feed/update/{item.get('id', '')}" if item.get("id") else "https://www.linkedin.com/feed/",
                            "thumbnail": None,
                            "published_at": date_str,
                            "views": 0,
                            "likes": 0,
                            "comments": 0,
                            "shares": 0,
                            "engagement_rate": 0.0,
                            "revenue": 0.0,
                            "status": "published"
                        })
        except Exception as e:
            print(f"Error fetching LinkedIn posts: {e}")
            
        return posts

linkedin_api = LinkedInAPI()
