import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class XIntegrationService:
    """
    X (formerly Twitter) Developer API v2 Service Boundary.
    
    Status: Read-only live public user lookup via App-Only Bearer Token.
    Uses environment variables:
      - X_BEARER_TOKEN (for real public profile & public_metrics lookup)
      - X_CLIENT_ID, X_CLIENT_SECRET, X_REDIRECT_URI (for OAuth 2.0 PKCE)
      - X_API_KEY, X_API_SECRET (for OAuth 1.0a)
    Never prints or exposes secret tokens.
    """

    def __init__(self):
        self.bearer_token: str = settings.X_BEARER_TOKEN
        self.client_id: str = settings.X_CLIENT_ID
        self.client_secret: str = settings.X_CLIENT_SECRET
        self.api_key: str = settings.X_API_KEY
        self.api_secret: str = settings.X_API_SECRET
        self.redirect_uri: str = settings.X_REDIRECT_URI
        self.account_handle: str = "rawtalks_vk"

    def has_bearer_token(self) -> bool:
        """Check if X Developer API v2 Bearer Token is provided."""
        return bool(self.bearer_token and self.bearer_token.strip())

    def is_configured(self) -> bool:
        """Check if production X credentials are configured in environment."""
        return self.has_bearer_token() or bool(
            (self.client_id and self.client_secret) or (self.api_key and self.api_secret)
        )

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        has_token = self.has_bearer_token()
        return {
            "platform": "x",
            "name": "X",
            "is_connected": False,
            "status": "Live API Configured" if has_token else "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "message": "Bearer Token configured. Ready for live public profile retrieval." if has_token else "Requires X Developer App credentials (X_BEARER_TOKEN) in backend/.env.",
            "api_configured": self.is_configured(),
            "account_handle": f"@{self.account_handle}",
            "required_env_vars": [
                "X_BEARER_TOKEN",
                "X_CLIENT_ID",
                "X_CLIENT_SECRET"
            ]
        }

    def get_authorization_url(self) -> str:
        """Generate X OAuth 2.0 authorization URL with PKCE."""
        if not self.client_id:
            return ""
        scopes = "tweet.read users.read offline.access"
        return (
            f"https://twitter.com/i/oauth2/authorize?"
            f"response_type=code&"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scopes}&"
            f"state=creatoriq_state&code_challenge=challenge&code_challenge_method=plain"
        )

    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for OAuth 2.0 access token."""
        if not (self.client_id and self.client_secret):
            raise NotImplementedError(
                "X Developer OAuth credentials not configured. Configure X_CLIENT_ID and X_CLIENT_SECRET in .env."
            )
        raise NotImplementedError("Live X OAuth token exchange pending developer credential configuration.")

    def get_account_metrics(self, username: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch public user metrics via official X API v2 User Lookup by username.
        Endpoint: GET https://api.twitter.com/2/users/by/username/{username}?user.fields=public_metrics,profile_image_url
        """
        target_handle = (username or self.account_handle).lstrip("@").strip()

        if not self.has_bearer_token():
            return {
                "configured": False,
                "is_live": False,
                "status": "Configuration Required / Not Connected",
                "message": "X Bearer Token not configured. Configure X_BEARER_TOKEN in backend/.env.",
                "provenance": "X Developer API v2",
                "account_handle": f"@{target_handle}",
                "user_id": None,
                "followers_count": 0,
                "following_count": 0,
                "tweet_count": 0,
                "unavailable_metrics": ["Private tweet analytics", "Impressions reach curves", "Profile visits"]
            }

        try:
            url = f"https://api.twitter.com/2/users/by/username/{target_handle}"
            params = {"user.fields": "public_metrics,profile_image_url,description"}
            headers = {"Authorization": f"Bearer {self.bearer_token}"}

            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, params=params, headers=headers)

                if res.status_code == 401 or res.status_code == 403:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "API Authentication Error",
                        "error_code": res.status_code,
                        "message": "Invalid X_BEARER_TOKEN or insufficient permissions on X Developer Portal.",
                        "provenance": "X Developer API v2"
                    }
                elif res.status_code == 429:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "Rate Limit Exceeded",
                        "error_code": 429,
                        "message": "X API v2 rate limit exceeded. Please try again later.",
                        "provenance": "X Developer API v2"
                    }
                elif res.status_code == 200:
                    json_data = res.json()
                    user_data = json_data.get("data", {})
                    if not user_data:
                        return {
                            "configured": True,
                            "is_live": False,
                            "status": "User Not Found",
                            "message": f"User @{target_handle} not found on X.",
                            "provenance": "X Developer API v2"
                        }

                    metrics = user_data.get("public_metrics", {})
                    followers_count = metrics.get("followers_count", 0)
                    following_count = metrics.get("following_count", 0)
                    tweet_count = metrics.get("tweet_count", 0)

                    return {
                        "configured": True,
                        "is_live": True,
                        "status": "Public Profile Retrieved",
                        "user_id": str(user_data.get("id", "")),
                        "name": user_data.get("name", "Raw Talks With VK"),
                        "username": user_data.get("username", target_handle),
                        "account_handle": f"@{user_data.get('username', target_handle)}",
                        "followers_count": int(followers_count),
                        "following_count": int(following_count),
                        "tweet_count": int(tweet_count),
                        "profile_image_url": user_data.get("profile_image_url"),
                        "provenance": "X Developer API v2 (Live Public Query)",
                        "unavailable_metrics": ["Private tweet analytics", "Impressions reach curves", "Profile visits"]
                    }
                else:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": f"API Error ({res.status_code})",
                        "message": f"X API v2 returned status {res.status_code}.",
                        "provenance": "X Developer API v2"
                    }

        except httpx.RequestError as e:
            logger.warning(f"X API v2 request network error: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Network Connection Error",
                "message": f"Network error connecting to X API v2: {str(e)}",
                "provenance": "X Developer API v2"
            }
        except Exception as e:
            logger.error(f"Unexpected error in X API v2 integration: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Query Error",
                "message": f"Error querying X API v2: {str(e)}",
                "provenance": "X Developer API v2"
            }

