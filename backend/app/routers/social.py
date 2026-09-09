from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.db import get_db
from app.models import PlatformAccount, User
from app.services.connectors import CONNECTORS
from app.workers.tasks import sync_platform_task
from app.workers.sync_tasks import sync_platform_account

router = APIRouter(prefix="/social", tags=["social"])


def connector_for(platform: str):
    try:
        return CONNECTORS[platform](get_settings())
    except KeyError:
        raise HTTPException(status_code=404, detail="Unsupported platform") from None


def make_state(user: User, platform: str) -> str:
    settings = get_settings()
    return jwt.encode({"sub": user.id, "organization_id": user.organization_id, "platform": platform, "exp": datetime.now(timezone.utc) + timedelta(minutes=10)}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.get("/connect/{platform}")
def connect(platform: str, user: Annotated[User, Depends(get_current_user)], database: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    connector = connector_for(platform)
    settings = get_settings()
    if not connector.credentials_configured:
        if platform == "youtube":
            return create_mock_youtube_account(user, settings.frontend_url, database)
        return {"platform": platform, "authorization_url": f"{settings.frontend_url}/dashboard/platforms?connected={platform}&mode=mock", "synthetic": "true", "message": "Provider credentials are not configured; using local mock mode"}
    return {"platform": platform, "authorization_url": connector.authorization_url(make_state(user, platform)), "synthetic": "false"}


def create_mock_youtube_account(user: User, frontend_url: str, database: Session) -> dict[str, str]:
    account = database.scalar(select(PlatformAccount).where(PlatformAccount.user_id == user.id, PlatformAccount.platform_name == "youtube", PlatformAccount.platform_user_id == "demo-youtube"))
    if account is None:
        account = PlatformAccount(user_id=user.id, platform_name="youtube", platform_user_id="demo-youtube", access_token="synthetic-youtube-demo", refresh_token="synthetic-refresh-youtube", token_expires_at=datetime.utcnow() + timedelta(days=365), scopes="youtube.readonly")
        database.add(account)
    database.commit()
    return {"platform": "youtube", "authorization_url": f"{frontend_url}/dashboard/platforms?connected=youtube&mode=mock", "synthetic": "true", "message": "Connected to the local YouTube demo account"}


@router.get("/callback/{platform}")
async def callback(platform: str, code: str = Query(...), state: str = Query(...), database: Session = Depends(get_db)) -> RedirectResponse:
    connector = connector_for(platform)
    settings = get_settings()
    try:
        claims = jwt.decode(state, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if claims.get("platform") != platform:
            raise ValueError("platform mismatch")
        user_id = claims["sub"]
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state") from None
    token_data = await connector.exchange_code(code)
    platform_user_id = token_data.get("platform_user_id") or token_data.get("user_id") or f"{platform}-{user_id}"
    account = database.scalar(select(PlatformAccount).where(PlatformAccount.user_id == user_id, PlatformAccount.platform_name == platform, PlatformAccount.platform_user_id == platform_user_id))
    expires_in = token_data.get("expires_in")
    expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in)) if expires_in else None
    if account is None:
        account = PlatformAccount(user_id=user_id, platform_name=platform, platform_user_id=platform_user_id, access_token=token_data["access_token"], refresh_token=token_data.get("refresh_token"), token_expires_at=expires_at, scopes=token_data.get("scope", ""))
        database.add(account)
    else:
        account.access_token = token_data["access_token"]
        account.refresh_token = token_data.get("refresh_token") or account.refresh_token
        account.token_expires_at = expires_at
    database.commit()
    return RedirectResponse(f"{settings.frontend_url}/dashboard/platforms?connected={platform}")


@router.get("/accounts")
def accounts(user: Annotated[User, Depends(get_current_user)], database: Annotated[Session, Depends(get_db)]) -> dict[str, object]:
    linked = database.scalars(select(PlatformAccount).where(PlatformAccount.user_id == user.id).order_by(PlatformAccount.platform_name)).all()
    return {"accounts": [{"id": account.id, "platform": account.platform_name, "platform_user_id": account.platform_user_id, "status": "connected", "sync_status": "ready", "last_synced_at": account.updated_at} for account in linked], "supported_platforms": sorted(CONNECTORS)}


@router.post("/sync/{target}")
def sync(target: str, user: Annotated[User, Depends(get_current_user)], database: Annotated[Session, Depends(get_db)]) -> dict[str, object]:
    account = database.scalar(select(PlatformAccount).where(PlatformAccount.id == target, PlatformAccount.user_id == user.id))
    if account is not None:
        task = sync_platform_account.delay(account.id)
        return {"account_id": account.id, "status": "queued", "task_id": task.id}

    platform = target
    connector_for(platform)
    account = database.scalar(select(PlatformAccount).where(PlatformAccount.user_id == user.id, PlatformAccount.platform_name == platform))
    access_token = account.access_token if account else "synthetic"
    platform_user_id = account.platform_user_id if account else None
    try:
        task = sync_platform_task.delay(platform, access_token, platform_user_id)
        return {"platform": platform, "status": "queued", "task_id": task.id}
    except Exception:
        return {"platform": platform, "status": "completed", "data": {"message": "Synthetic sync available locally"}, "task_id": None}


@router.get("/sync/status/{task_id}")
def sync_status(task_id: str, user: Annotated[User, Depends(get_current_user)]) -> dict[str, object]:
    try:
        from celery.result import AsyncResult
        result = AsyncResult(task_id)
        response: dict[str, object] = {"task_id": task_id, "status": result.status}
        if result.status == "SUCCESS":
            response["result"] = result.result
        elif result.status == "FAILURE":
            response["error"] = str(result.result)
        return response
    except ModuleNotFoundError:
        return {"task_id": task_id, "status": "PENDING", "message": "Celery is not installed in this development environment"}
