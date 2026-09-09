from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, oauth2_scheme, require_roles
from app.core.config import get_settings
from app.db import get_db
from app.db import redis
from app.models import Organization, User
from app.schemas import AuthResponse, UserCreate, UserResponse, Token
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "creatoriq-api"}


@router.get("/ready")
def ready(database: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    database.execute(select(1))
    return {"status": "ready"}


@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, database: Annotated[Session, Depends(get_db)]) -> AuthResponse:
    email = payload.email.strip().lower()
    existing = database.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
    organization = Organization(name=f"{payload.display_name}'s workspace")
    user = User(
        organization=organization,
        email=email,
        display_name=payload.display_name.strip(),
        password_hash=hash_password(payload.password),
    )
    database.add(user)
    database.commit()
    database.refresh(user)
    return AuthResponse(
        access_token=create_access_token(user.id, user.organization_id, user.role),
        user=user,
    )


@router.post("/auth/login", response_model=Token)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    database: Annotated[Session, Depends(get_db)],
) -> Token:
    user = database.scalar(select(User).where(User.email == form.username.strip().lower()))
    if user is None or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return Token(access_token=create_access_token(user.id, user.organization_id, user.role))


@router.post("/auth/logout")
async def logout(token: Annotated[str, Depends(oauth2_scheme)]) -> dict[str, str]:
    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm], options={"verify_exp": False})
    token_id = payload.get("jti")
    expires_at = payload.get("exp")
    if token_id and expires_at and redis.redis_client is not None:
        ttl = max(1, int(expires_at - datetime.now(timezone.utc).timestamp()))
        try:
            await redis.blacklist_token(token_id, ttl)
        except Exception:
            if settings.environment != "development":
                raise HTTPException(status_code=503, detail="Session service unavailable") from None
    return {"message": "Signed out"}


@router.get("/auth/me", response_model=UserResponse)
def me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user


@router.get("/admin/ping")
def admin_ping(user: Annotated[User, Depends(require_roles("administrator"))]) -> dict[str, str]:
    return {"message": f"Administrator access confirmed for {user.display_name}"}