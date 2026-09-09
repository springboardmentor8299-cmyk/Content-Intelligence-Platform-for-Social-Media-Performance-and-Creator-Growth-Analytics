from abc import ABC, abstractmethod
from typing import Any
from urllib.parse import urlencode

import httpx


class SocialConnector(ABC):
    platform: str
    authorize_url: str
    token_url: str

    def __init__(self, settings: Any):
        self.settings = settings

    @property
    def credentials_configured(self) -> bool:
        values = (self.client_id.strip(), self.client_secret.strip())
        placeholders = {"local-development", "changeme", "replace-me", "placeholder"}
        return all(values) and not any(value.lower() in placeholders for value in values)

    @property
    @abstractmethod
    def client_id(self) -> str: ...

    @property
    @abstractmethod
    def client_secret(self) -> str: ...

    @property
    @abstractmethod
    def redirect_uri(self) -> str: ...

    def authorization_url(self, state: str) -> str:
        return f"{self.authorize_url}?{urlencode(self.authorization_params(state))}"

    @abstractmethod
    def authorization_params(self, state: str) -> dict[str, str]: ...

    async def exchange_code(self, code: str) -> dict[str, Any]:
        if not self.credentials_configured:
            return {"access_token": f"synthetic-{self.platform}-{code}", "refresh_token": f"synthetic-refresh-{self.platform}", "expires_in": 3600, "platform_user_id": f"demo-{self.platform}"}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(self.token_url, data=self.token_params(code))
            response.raise_for_status()
            return response.json()

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        if not self.credentials_configured:
            return {"access_token": f"synthetic-{self.platform}-refreshed", "expires_in": 3600}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(self.token_url, data={"client_id": self.client_id, "client_secret": self.client_secret, "refresh_token": refresh_token, "grant_type": "refresh_token"})
            response.raise_for_status()
            return response.json()

    @abstractmethod
    def token_params(self, code: str) -> dict[str, str]: ...

    @abstractmethod
    async def fetch_metrics(self, access_token: str, platform_user_id: str | None = None) -> dict[str, Any]: ...
