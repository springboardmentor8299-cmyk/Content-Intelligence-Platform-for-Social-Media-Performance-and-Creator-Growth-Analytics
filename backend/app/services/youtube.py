import urllib.parse
import httpx
from typing import List, Dict, Any, Optional
from app.services.api_client import BaseSocialAPI
from app.config import settings
from app.database import SessionLocal
from app.models import ConnectedAccount

class YouTubeAPI(BaseSocialAPI):
    def __init__(self):
        super().__init__(base_url="https://www.googleapis.com/youtube/v3")
        
    def get_auth_url(self) -> str:
        client_id = settings.YOUTUBE_CLIENT_ID
        redirect_uri = settings.YOUTUBE_REDIRECT_URI
        scope = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile"
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": scope,
            "access_type": "offline",
            "prompt": "consent",
            "include_granted_scopes": "true"
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

    async def exchange_code(self, code: str) -> dict:
        data = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://oauth2.googleapis.com/token", data=data)
            resp.raise_for_status()
            return resp.json()

    async def refresh_token(self, refresh_token: str) -> Optional[str]:
        data = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "client_secret": settings.YOUTUBE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://oauth2.googleapis.com/token", data=data)
            if resp.status_code == 200:
                new_token = resp.json().get("access_token")
                # Save updated token to db
                db = SessionLocal()
                try:
                    acc = db.query(ConnectedAccount).filter(ConnectedAccount.platform == "youtube").first()
                    if acc:
                        acc.access_token = new_token
                        db.commit()
                finally:
                    db.close()
                return new_token
        return None

    async def get_valid_token(self, access_token: str) -> str:
        # Test token validity with lightweight call; refresh if expired
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            res = await client.get("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", headers=headers)
            if res.status_code == 401:
                db = SessionLocal()
                try:
                    acc = db.query(ConnectedAccount).filter(ConnectedAccount.platform == "youtube").first()
                    if acc and acc.refresh_token:
                        new_t = await self.refresh_token(acc.refresh_token)
                        if new_t:
                            return new_t
                finally:
                    db.close()
        return access_token

    async def get_user_profile(self, access_token: str) -> dict:
        token = await self.get_valid_token(access_token)
        headers = {"Authorization": f"Bearer {token}"}
        try:
            res = await self.get("/channels?part=statistics,snippet,contentDetails&mine=true", headers=headers)
            if "items" in res and len(res["items"]) > 0:
                channel = res["items"][0]
                stats = channel.get("statistics", {})
                snippet = channel.get("snippet", {})
                content_details = channel.get("contentDetails", {})
                uploads_playlist = content_details.get("relatedPlaylists", {}).get("uploads")
                
                return {
                    "platform_user_id": channel["id"],
                    "username": snippet.get("title", "YouTube Channel"),
                    "followers_count": int(stats.get("subscriberCount", 0)),
                    "total_views": int(stats.get("viewCount", 0)),
                    "video_count": int(stats.get("videoCount", 0)),
                    "uploads_playlist": uploads_playlist,
                    "profile_picture_url": snippet.get("thumbnails", {}).get("default", {}).get("url")
                }
        except Exception as e:
            print(f"Error fetching YouTube channel details: {e}")
            
        # Fallback to userinfo if no public channel created yet
        async with httpx.AsyncClient() as client:
            user_info_resp = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers=headers)
            if user_info_resp.status_code == 200:
                user_info = user_info_resp.json()
                return {
                    "platform_user_id": user_info.get("id"),
                    "username": user_info.get("name", "YouTube Creator"),
                    "followers_count": 0,
                    "total_views": 0,
                    "video_count": 0,
                    "uploads_playlist": None,
                    "profile_picture_url": user_info.get("picture")
                }
                
        return {
            "platform_user_id": "yt_connected",
            "username": "YouTube Creator",
            "followers_count": 0,
            "total_views": 0,
            "video_count": 0,
            "uploads_playlist": None,
            "profile_picture_url": None
        }

    async def get_recent_videos(self, access_token: str, max_results: int = 50) -> List[Dict[str, Any]]:
        token = await self.get_valid_token(access_token)
        headers = {"Authorization": f"Bearer {token}"}
        profile = await self.get_user_profile(token)
        uploads_playlist = profile.get("uploads_playlist")
        if not uploads_playlist:
            return []

        try:
            # 1. Fetch playlist items
            playlist_res = await self.get(
                f"/playlistItems?part=snippet,contentDetails&playlistId={uploads_playlist}&maxResults={max_results}",
                headers=headers
            )
            items = playlist_res.get("items", [])
            if not items:
                return []

            video_ids = [item["contentDetails"]["videoId"] for item in items if "contentDetails" in item]
            if not video_ids:
                return []

            # 2. Fetch video statistics, status and live stream details
            videos_res = await self.get(
                f"/videos?part=snippet,statistics,status,liveStreamingDetails,contentDetails&id={','.join(video_ids)}",
                headers=headers
            )

            result = []
            for v in videos_res.get("items", []):
                snippet = v.get("snippet", {})
                stats = v.get("statistics", {})
                status = v.get("status", {})
                privacy = status.get("privacyStatus", "public")
                
                raw_views = int(stats.get("viewCount", 0))
                raw_likes = int(stats.get("likeCount", 0))
                comments = int(stats.get("commentCount", 0))
                
                # Exclude unlisted draft/scheduled placeholder streams with 0 views & 0 likes
                if privacy == "unlisted" and raw_views == 0 and raw_likes == 0:
                    continue
                
                # Real view accuracy: If a live stream or video received likes, viewers were present (at least = likes)
                views = max(raw_views, raw_likes)
                likes = raw_likes
                
                er = round(((likes + comments) / views * 100), 2) if views > 0 else 0.0

                result.append({
                    "id": v["id"],
                    "title": snippet.get("title", "Untitled Video"),
                    "platform": "YouTube",
                    "url": f"https://www.youtube.com/watch?v={v['id']}",
                    "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url") or snippet.get("thumbnails", {}).get("default", {}).get("url"),
                    "published_at": snippet.get("publishedAt", "")[:10],
                    "views": views,
                    "likes": likes,
                    "comments": comments,
                    "shares": 0,
                    "engagement_rate": er,
                    "revenue": round(views * 0.003, 2),
                    "status": "published"
                })
            return result
        except Exception as e:
            print(f"Error fetching YouTube videos: {e}")
            return []

youtube_api = YouTubeAPI()
