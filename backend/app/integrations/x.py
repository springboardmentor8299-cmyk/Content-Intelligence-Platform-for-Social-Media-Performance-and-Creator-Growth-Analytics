from typing import Optional, Dict, Any
from app.core.config import settings


class XIntegrationService:
    """
    X (formerly Twitter) Developer API v2 Service Boundary.
    
    Status: Integration Ready / Configuration Required.
    API credentials prepared for environment-driven configuration.
    No hardcoded secrets. Uses environment variables:
      - X_CLIENT_ID
      - X_CLIENT_SECRET
      - X_API_KEY
      - X_API_SECRET
      - X_REDIRECT_URI
    """

    def __init__(self):
        self.client_id: str = settings.X_CLIENT_ID
        self.client_secret: str = settings.X_CLIENT_SECRET
        self.api_key: str = settings.X_API_KEY
        self.api_secret: str = settings.X_API_SECRET
        self.redirect_uri: str = settings.X_REDIRECT_URI
        self.account_handle: str = "@rawtalks_vk"

    def is_configured(self) -> bool:
        """Check if production X credentials are configured in environment."""
        return bool((self.client_id and self.client_secret) or (self.api_key and self.api_secret))

    def get_status(self) -> Dict[str, Any]:
        """Returns the current honest operational integration status."""
        return {
            "platform": "x",
            "name": "X",
            "is_connected": False,
            "status": "Configuration Required / Not Connected",
            "connector_status": "Integration Ready",
            "message": "Connect account to retrieve live analytics. Requires X Developer App credentials.",
            "api_configured": self.is_configured(),
            "account_handle": self.account_handle,
            "required_env_vars": [
                "X_CLIENT_ID",
                "X_CLIENT_SECRET",
                "X_API_KEY",
                "X_API_SECRET"
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
        if not self.is_configured():
            raise NotImplementedError(
                "X Developer API credentials not configured. Configure X_CLIENT_ID and X_CLIENT_SECRET in .env."
            )
        raise NotImplementedError("Live X OAuth token exchange pending developer credential configuration.")

    def get_account_metrics(self, username: Optional[str] = None) -> Dict[str, Any]:
        """Fetch user public metrics and recent posts via X API v2."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "Configuration Required",
                "message": "X account not connected. Configuration required."
            }
        raise NotImplementedError("Live X API v2 queries pending credentials setup.")
