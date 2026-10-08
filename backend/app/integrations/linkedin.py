import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class LinkedInIntegrationService:
    """
    LinkedIn Marketing & Community Management API Service Boundary.
    
    Status: Direct token authenticated verification or OAuth 2.0 configuration.
    Uses environment variables:
      - LINKEDIN_ACCESS_TOKEN (for real authenticated read queries)
      - LINKEDIN_CLIENT_ID
      - LINKEDIN_CLIENT_SECRET
      - LINKEDIN_REDIRECT_URI
    Never prints or logs access tokens.
    """

    def __init__(self):
        self.access_token: str = settings.LINKEDIN_ACCESS_TOKEN
        self.client_id: str = settings.LINKEDIN_CLIENT_ID
        self.client_secret: str = settings.LINKEDIN_CLIENT_SECRET
        self.redirect_uri: str = settings.LINKEDIN_REDIRECT_URI
        self.org_vanity_name: str = "raw-talks-with-vk"

    def has_access_token(self) -> bool:
        """Check if production LinkedIn access token is provided."""
        return bool(self.access_token and self.access_token.strip())

    def is_configured(self) -> bool:
        """Check if production LinkedIn App credentials or direct access token are configured."""
        return self.has_access_token() or bool(self.client_id and self.client_secret and self.redirect_uri)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        has_token = self.has_access_token()
        return {
            "platform": "linkedin",
            "name": "LinkedIn",
            "is_connected": False,
            "status": "Live API Configured" if has_token else "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "message": "Access Token configured. Ready for authenticated verification." if has_token else "Requires LinkedIn credentials (LINKEDIN_ACCESS_TOKEN or OAuth App) in backend/.env.",
            "api_configured": self.is_configured(),
            "org_vanity_name": self.org_vanity_name,
            "required_env_vars": [
                "LINKEDIN_ACCESS_TOKEN",
                "LINKEDIN_CLIENT_ID",
                "LINKEDIN_CLIENT_SECRET"
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
        if not (self.client_id and self.client_secret):
            raise NotImplementedError(
                "LinkedIn OAuth credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env."
            )
        raise NotImplementedError("Live LinkedIn OAuth token exchange pending post-presentation credential setup.")

    def get_organization_page_analytics(self, org_urn: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes real authenticated read-only LinkedIn request using LINKEDIN_ACCESS_TOKEN.
        Uses the official OpenID userinfo endpoint to verify token validity and identity.
        Does not fabricate follower or engagement numbers.
        """
        if not self.has_access_token():
            return {
                "configured": False,
                "is_live": False,
                "status": "Configuration Required / Not Connected",
                "message": "LinkedIn Access Token not configured. Configure LINKEDIN_ACCESS_TOKEN in backend/.env.",
                "provenance": "LinkedIn API",
                "org_vanity_name": self.org_vanity_name,
                "followers_count": 0,
                "unavailable_metrics": [
                    "Organization Page Impressions (Requires Community Management API approval)",
                    "Visitor Demographics (Requires Enterprise LinkedIn API)",
                    "Post Engagement Analytics (Requires Page Admin scope)"
                ]
            }

        try:
            url = "https://api.linkedin.com/v2/userinfo"
            headers = {"Authorization": f"Bearer {self.access_token}"}

            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=headers)

                if res.status_code == 401 or res.status_code == 403:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "API Authentication Error",
                        "error_code": res.status_code,
                        "message": "Invalid or expired LINKEDIN_ACCESS_TOKEN or insufficient permissions.",
                        "provenance": "LinkedIn API"
                    }
                elif res.status_code == 429:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": "Rate Limit Exceeded",
                        "error_code": 429,
                        "message": "LinkedIn API rate limit exceeded.",
                        "provenance": "LinkedIn API"
                    }
                elif res.status_code == 200:
                    info = res.json()
                    return {
                        "configured": True,
                        "is_live": True,
                        "status": "Authenticated Profile Connected",
                        "user_id": str(info.get("sub", "")),
                        "name": info.get("name", "Raw Talks Media"),
                        "org_vanity_name": self.org_vanity_name,
                        "followers_count": 0,  # Do not invent unverified counts
                        "provenance": "LinkedIn API (Authenticated Identity)",
                        "unavailable_metrics": [
                            "Organization Page Impressions (Requires Community Management API approval)",
                            "Visitor Demographics (Requires Enterprise LinkedIn API)",
                            "Post Engagement Analytics (Requires Page Admin scope)"
                        ]
                    }
                else:
                    return {
                        "configured": True,
                        "is_live": False,
                        "status": f"API Error ({res.status_code})",
                        "message": f"LinkedIn API returned status {res.status_code}.",
                        "provenance": "LinkedIn API"
                    }

        except httpx.RequestError as e:
            logger.warning(f"LinkedIn API request network error: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Network Connection Error",
                "message": f"Network error connecting to LinkedIn API: {str(e)}",
                "provenance": "LinkedIn API"
            }
        except Exception as e:
            logger.error(f"Unexpected error in LinkedIn API integration: {e}")
            return {
                "configured": True,
                "is_live": False,
                "status": "Query Error",
                "message": f"Error querying LinkedIn API: {str(e)}",
                "provenance": "LinkedIn API"
            }

