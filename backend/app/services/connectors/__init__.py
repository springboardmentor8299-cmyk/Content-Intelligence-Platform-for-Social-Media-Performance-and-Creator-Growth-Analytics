from app.services.connectors.instagram import InstagramConnector
from app.services.connectors.youtube import YouTubeConnector

CONNECTORS = {
    "youtube": YouTubeConnector,
    "instagram": InstagramConnector,
}

__all__ = ["CONNECTORS", "InstagramConnector", "YouTubeConnector"]
