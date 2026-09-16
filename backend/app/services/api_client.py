import httpx
from typing import Optional, Dict, Any

class BaseSocialAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
        
    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}{endpoint}", params=params, headers=headers)
            response.raise_for_status()
            return response.json()

    async def post(self, endpoint: str, data: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{self.base_url}{endpoint}", data=data, headers=headers)
            response.raise_for_status()
            return response.json()
