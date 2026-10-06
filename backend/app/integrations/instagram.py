import logging
from typing import Optional, Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class InstagramIntegrationService:
    """
    Instagram Public Data Service Boundary using Glavier Instagram API on RapidAPI.
    
    Flow:
      1. Resolve Instagram username
      2. Obtain actual Instagram user ID (no default/hardcoded user ID)
      3. Retrieve public profile information
      4. Retrieve public posts for obtained user ID
      5. Normalize real response into CreatorIQ schema
      6. Return clean honest results without fabricating private metrics
    
    Environment variables:
      - RAPIDAPI_KEY
      - RAPIDAPI_HOST
    """

    def __init__(self):
        self.rapidapi_key: str = settings.RAPIDAPI_KEY
        self.rapidapi_host: str = settings.RAPIDAPI_HOST or "instagram-bulk-profile-scrapper.p.rapidapi.com"
        self.account_handle: str = "rawtalkswithvk"

    def is_configured(self) -> bool:
        """Check if production RapidAPI credentials are configured in environment."""
        return bool(self.rapidapi_key and self.rapidapi_key.strip())

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        configured = self.is_configured()
        return {
            "platform": "instagram",
            "name": "Instagram",
            "is_connected": False,
            "status": "Live RapidAPI Configured" if configured else "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "provider": "Glavier — Instagram API on RapidAPI",
            "provenance": "Instagram public data — RapidAPI",
            "api_configured": configured,
            "account_handle": f"@{self.account_handle}",
            "message": "RapidAPI credentials active. Ready for live public profile retrieval." if configured else "Requires RapidAPI credentials (RAPIDAPI_KEY, RAPIDAPI_HOST) in backend/.env.",
            "private_metrics_status": "Creator access required (Private Instagram Insights require Meta Business OAuth)",
            "required_env_vars": [
                "RAPIDAPI_KEY",
                "RAPIDAPI_HOST"
            ]
        }

    def fetch_profile_and_posts(self, username: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes real public Instagram query via Glavier on RapidAPI.
        Resolves username -> actual user ID -> profile & posts -> normalized response.
        Handles missing keys, invalid IDs, rate limits, and network errors gracefully.
        """
        target_username = (username or self.account_handle).lstrip("@").strip()

        if not self.is_configured():
            return {
                "configured": False,
                "is_live": False,
                "status": "Configuration Required / Not Connected",
                "message": "RapidAPI credentials not configured. Configure RAPIDAPI_KEY and RAPIDAPI_HOST in .env.",
                "provenance": "Instagram public data — RapidAPI",
                "account_handle": f"@{target_username}",
                "user_id": None,
                "followers_count": 0,
                "posts": [],
                "reach": None,
                "impressions": None,
                "demographics": None,
                "saves": None,
                "watch_time": None,
                "disclaimer": "Public data requires RapidAPI key. Private creator insights require official Meta Business API."
            }

        headers = {
            "x-rapidapi-key": self.rapidapi_key,
            "x-rapidapi-host": self.rapidapi_host
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                # Step 1 & 2: Resolve username and user ID
                # Try primary user profile endpoint
                profile_data = {}
                user_id = None
                profile_url = f"https://{self.rapidapi_host}/user/{target_username}"
                res = client.get(profile_url, headers=headers)

                if res.status_code == 401 or res.status_code == 403:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "API Authentication Error",
                        "error_code": res.status_code,
                        "message": "Invalid RAPIDAPI_KEY or subscription inactive for Glavier Instagram API on RapidAPI.",
                        "provenance": "Instagram public data — RapidAPI"
                    }
                elif res.status_code == 429:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "Rate Limit Exceeded",
                        "error_code": 429,
                        "message": "RapidAPI rate limit exceeded. Please try again later.",
                        "provenance": "Instagram public data — RapidAPI"
                    }
                elif res.status_code == 200:
                    profile_data = res.json()
                    # Resolve user ID from various Glavier schema shapes
                    user_id = (
                        profile_data.get("id") or 
                        profile_data.get("pk") or 
                        profile_data.get("user_id") or
                        profile_data.get("data", {}).get("id") or
                        profile_data.get("user", {}).get("pk") or
                        profile_data.get("user", {}).get("id")
                    )

                # Fallback to user_id endpoint if not extracted
                if not user_id:
                    id_url = f"https://{self.rapidapi_host}/user_id"
                    id_res = client.get(id_url, params={"username": target_username}, headers=headers)
                    if id_res.status_code == 200:
                        id_json = id_res.json()
                        user_id = id_json.get("user_id") or id_json.get("id") or id_json.get("pk")
                        if not profile_data and user_id:
                            # Re-fetch profile with user_id
                            info_res = client.get(f"https://{self.rapidapi_host}/user/{user_id}/info", headers=headers)
                            if info_res.status_code == 200:
                                profile_data = info_res.json()

                if not user_id and not profile_data:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "User Not Found",
                        "message": f"Could not find or resolve Instagram account @{target_username}.",
                        "provenance": "Instagram public data — RapidAPI"
                    }

                # Extract profile fields
                user_obj = profile_data.get("user") or profile_data.get("data") or profile_data
                followers_count = (
                    user_obj.get("follower_count") or 
                    user_obj.get("followers") or 
                    user_obj.get("edge_followed_by", {}).get("count") or 0
                )
                posts_count = (
                    user_obj.get("media_count") or 
                    user_obj.get("posts_count") or 
                    user_obj.get("edge_owner_to_timeline_media", {}).get("count") or 0
                )
                account_name = user_obj.get("full_name") or target_username

                # Step 4: Retrieve public posts for the obtained user ID
                posts_list: List[Dict[str, Any]] = []
                if user_id:
                    posts_url = f"https://{self.rapidapi_host}/user/{user_id}/posts"
                    posts_res = client.get(posts_url, headers=headers)
                    if posts_res.status_code == 200:
                        posts_data = posts_res.json()
                        raw_items = (
                            posts_data.get("items") or 
                            posts_data.get("posts") or 
                            posts_data.get("data", {}).get("items") or []
                        )
                        for item in raw_items[:12]:
                            caption = ""
                            if item.get("caption"):
                                caption = item["caption"].get("text", "") if isinstance(item["caption"], dict) else str(item["caption"])
                            
                            posts_list.append({
                                "id": str(item.get("id") or item.get("pk", "")),
                                "caption": caption[:120] if caption else "Instagram Post",
                                "likes": item.get("like_count") or item.get("likes", 0),
                                "comments": item.get("comment_count") or item.get("comments", 0),
                                "views": item.get("view_count") or item.get("play_count"),
                                "saves": None,  # Private metric (not fabricated)
                                "reach": None,  # Private metric (not fabricated)
                                "impressions": None,  # Private metric (not fabricated)
                                "url": f"https://www.instagram.com/p/{item.get('code', '')}/" if item.get("code") else None
                            })

                # Step 5: Return normalized honest payload
                return {
                    "configured": True,
                    "is_live": True,
                    "status": "Public Profile Retrieved",
                    "user_id": str(user_id) if user_id else None,
                    "account_handle": f"@{target_username}",
                    "account_name": account_name,
                    "followers_count": int(followers_count),
                    "posts_count": int(posts_count),
                    "posts": posts_list,
                    "provenance": "Instagram public data — RapidAPI",
                    "unavailable_metrics": [
                        "Reach (Requires Meta Business OAuth)",
                        "Impressions (Requires Meta Business OAuth)",
                        "Saves (Private Creator Metric)",
                        "Watch Time (Private Video Metric)",
                        "Audience Demographics (Private Studio Telemetry)"
                    ]
                }

        except httpx.RequestError as e:
            logger.warning(f"RapidAPI Instagram request network error: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Network Connection Error",
                "message": f"Network error connecting to RapidAPI host {self.rapidapi_host}: {str(e)}",
                "provenance": "Instagram public data — RapidAPI"
            }
        except Exception as e:
            logger.error(f"Unexpected error in Instagram RapidAPI integration: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Query Error",
                "message": f"Error parsing Instagram API response: {str(e)}",
                "provenance": "Instagram public data — RapidAPI"
            }
