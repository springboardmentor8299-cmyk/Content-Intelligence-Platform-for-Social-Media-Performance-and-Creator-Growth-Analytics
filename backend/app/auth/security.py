from datetime import datetime, timedelta, timezone
import os

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
VALID_USER_ROLES = frozenset({
    "Creator",
    "Marketing Team",
    "Agency",
    "Administrator",
})

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


def _get_secret_key():
    if not SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY must be set in the backend environment"
        )

    return SECRET_KEY


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        _get_secret_key(),
        algorithm=ALGORITHM
    )


def decode_access_token(token: str):
    try:
        return jwt.decode(
            token,
            _get_secret_key(),
            algorithms=[ALGORITHM]
        )
    except JWTError:
        return None

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.models import User
from sqlalchemy.orm import Session


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        ) from error

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if user.role not in VALID_USER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="This account has an unsupported role",
        )

    return user

def require_role(required_role: str):
    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role != required_role:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


def get_current_creator(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "Creator":
        raise HTTPException(
            status_code=403,
            detail="This feature is available to Creator accounts only",
        )

    return current_user


def create_provider_oauth_state(
    provider: str,
    user_id: int,
    state: str,
):
    return jwt.encode(
        {
            "provider": provider,
            "purpose": "oauth_state",
            "state": state,
            "sub": str(user_id),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=10),
        },
        _get_secret_key(),
        algorithm=ALGORITHM,
    )


def get_provider_oauth_state_owner(
    signed_state: str,
    provider: str,
    state: str,
):
    try:
        payload = jwt.decode(
            signed_state,
            _get_secret_key(),
            algorithms=[ALGORITHM],
        )
        if (
            payload.get("provider") != provider
            or payload.get("purpose") != "oauth_state"
            or payload.get("state") != state
        ):
            return None
        return int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError):
        return None


def create_provider_owner_cookie(provider: str, user_id: int):
    return jwt.encode(
        {
            "provider": provider,
            "purpose": "provider_owner",
            "sub": str(user_id),
            "exp": datetime.now(timezone.utc) + timedelta(days=30),
        },
        _get_secret_key(),
        algorithm=ALGORITHM,
    )


def get_provider_owner_id(signed_owner: str, provider: str):
    try:
        payload = jwt.decode(
            signed_owner,
            _get_secret_key(),
            algorithms=[ALGORITHM],
        )
        if (
            payload.get("provider") != provider
            or payload.get("purpose") != "provider_owner"
        ):
            return None
        return int(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError):
        return None


def require_provider_owner(provider: str):
    def owner_checker(
        request: Request,
        current_user: User = Depends(get_current_creator),
    ):
        signed_owner = request.cookies.get(f"{provider}_owner")
        if (
            not signed_owner
            or get_provider_owner_id(signed_owner, provider) != current_user.id
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    f"The connected {provider} account is not linked "
                    "to the signed-in Creator"
                ),
            )

        return current_user

    return owner_checker