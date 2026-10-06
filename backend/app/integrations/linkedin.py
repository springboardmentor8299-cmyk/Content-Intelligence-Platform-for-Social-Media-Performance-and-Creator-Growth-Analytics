from typing import Optional, Dict, Any
from app.core.config import settings


class LinkedInIntegrationService:
    """
    LinkedIn Marketing & Community Management API Service Boundary.
    
    Status: Integration Ready / Configuration Required.
    OAuth/API credentials prepared for future post-presentation configuration.
    No hardcoded secrets. Uses environment variables:
      - LINKEDIN_CLIENT_ID
      - LINKEDIN_CLIENT_SECRET
      - LINKEDIN_REDIRECT_URI
    """

    def __init__(self):
        self.client_id: str = settings.LINKEDIN_CLIENT_ID
        self.client_secret: str = settings.LINKEDIN_CLIENT_SECRET
        self.redirect_uri: str = settings.LINKEDIN_REDIRECT_URI
        self.org_vanity_name: str = "raw-talks-with-vk"

    def is_configured(self) -> bool:
        """Check if production LinkedIn App credentials are configured in environment."""
        return bool(self.client_id and self.client_secret and self.redirect_uri)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        return {
            "platform": "linkedin",
            "is_connected": False,
            "status": "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "message": "Connect account to retrieve live analytics. Requires LinkedIn App credentials.",
            "api_configured": self.is_configured(),
            "org_vanity_name": self.org_vanity_name,
            "required_env_vars": [
                "LINKEDIN_CLIENT_ID",
                "LINKEDIN_CLIENT_SECRET",
                "LINKEDIN_REDIRECT_URI"
            ]
        }

    def get_authorization_url(self) -> str:
        """Generate LinkedIn OAuth 2.0 authorization URL for Page Analytics."""
        if not self.client_id:
            return ""
        scopes = "r_organization_social,r_organization_admin,w_member_social"
        return (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scopes}"
        )

    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange LinkedIn authorization code for OAuth 2.0 access token."""
        if not self.is_configured():
            raise NotImplementedError(
                "LinkedIn OAuth credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env."
            )
        raise NotImplementedError("Live LinkedIn OAuth token exchange pending post-presentation credential setup.")

    def get_organization_page_analytics(self, org_urn: Optional[str] = None) -> Dict[str, Any]:
        """Fetch Page impressions, organic followers, visitor metrics, and engagement from LinkedIn API."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "Configuration Required",
                "message": "LinkedIn Organization account not connected. Configuration required."
            }
        raise NotImplementedError("Live LinkedIn Community API queries pending credentials setup.")
