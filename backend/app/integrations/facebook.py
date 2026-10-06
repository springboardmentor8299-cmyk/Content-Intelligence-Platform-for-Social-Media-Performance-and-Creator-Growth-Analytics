from typing import Optional, Dict, Any
from app.core.config import settings


class FacebookIntegrationService:
    """
    Facebook Graph API (Pages & Video Analytics) Service Boundary.
    
    Status: Integration Ready / Configuration Required.
    OAuth/API credentials prepared for future post-presentation configuration.
    No hardcoded secrets. Uses environment variables:
      - META_APP_ID
      - META_APP_SECRET
      - FACEBOOK_REDIRECT_URI
    """

    def __init__(self):
        self.app_id: str = settings.FACEBOOK_CLIENT_ID or settings.META_APP_ID
        self.app_secret: str = settings.FACEBOOK_CLIENT_SECRET or settings.META_APP_SECRET
        self.redirect_uri: str = settings.FACEBOOK_REDIRECT_URI
        self.page_handle: str = "rawtalkswithvk"

    def is_configured(self) -> bool:
        """Check if production Facebook / Meta App credentials are configured in environment."""
        return bool(self.app_id and self.app_secret)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        return {
            "platform": "facebook",
            "name": "Facebook",
            "is_connected": False,
            "status": "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "message": "Connect account to retrieve live analytics. Requires Facebook / Meta App credentials.",
            "api_configured": self.is_configured(),
            "page_handle": self.page_handle,
            "required_env_vars": [
                "FACEBOOK_CLIENT_ID",
                "FACEBOOK_CLIENT_SECRET",
                "FACEBOOK_REDIRECT_URI"
            ]
        }

    def get_authorization_url(self) -> str:
        """Generate Meta OAuth 2.0 authorization URL for Facebook Pages."""
        if not self.app_id:
            return ""
        scopes = "pages_show_list,pages_read_engagement,read_insights,pages_manage_posts"
        return (
            f"https://www.facebook.com/v19.0/dialog/oauth?"
            f"client_id={self.app_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scopes}&"
            f"response_type=code"
        )

    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange Meta OAuth code for Page access tokens."""
        if not self.is_configured():
            raise NotImplementedError(
                "Facebook Graph API credentials not configured. Set META_APP_ID and META_APP_SECRET in .env."
            )
        raise NotImplementedError("Live Meta OAuth token exchange pending post-presentation credential setup.")

    def get_page_insights(self, page_id: Optional[str] = None) -> Dict[str, Any]:
        """Fetch Page impressions, post reach, video watch minutes, and engagement from Graph API."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "Configuration Required",
                "message": "Facebook Page not connected. Configuration required."
            }
        raise NotImplementedError("Live Facebook Graph API queries pending credentials setup.")
