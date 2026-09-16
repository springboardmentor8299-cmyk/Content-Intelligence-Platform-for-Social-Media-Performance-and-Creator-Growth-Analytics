import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.schemas import UserLogin, UserCreate, TokenResponse, UserResponse

router = APIRouter()

# In-memory mock user database initialized with standard portal roles
MOCK_USERS = {
    "creator@creatoriq.com": {
        "id": "usr-creator-001",
        "email": "creator@creatoriq.com",
        "password": "password123",
        "full_name": "Jane Doe",
        "role": "creator",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    "agency@creatoriq.com": {
        "id": "usr-agency-002",
        "email": "agency@creatoriq.com",
        "password": "password123",
        "full_name": "Apex Talent Agency",
        "role": "agency",
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    "marketing@creatoriq.com": {
        "id": "usr-marketing-003",
        "email": "marketing@creatoriq.com",
        "password": "password123",
        "full_name": "Brand Growth Team",
        "role": "marketing_team",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    "admin@creatoriq.com": {
        "id": "usr-admin-004",
        "email": "admin@creatoriq.com",
        "password": "password123",
        "full_name": "System Administrator",
        "role": "admin",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
}

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    email = credentials.email.lower().strip()
    user = MOCK_USERS.get(email)
    
    # Also support demo fallback
    if not user and "demo" in email:
        user = {
            "id": f"usr-demo-{uuid.uuid4().hex[:6]}",
            "email": email,
            "password": credentials.password,
            "full_name": "Demo User",
            "role": "creator",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    
    if not user or (credentials.password != user["password"] and credentials.password != "password123" and credentials.password != "demo1234"):
        # Allow any password in development mock mode for ease of access
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
            
    # Generate mock access token
    token = f"jwt_mock_token_{user['role']}_{uuid.uuid4().hex}"
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/signup", response_model=TokenResponse)
def signup(data: UserCreate):
    email = data.email.lower().strip()
    if email in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists"
        )
    
    new_user = {
        "id": f"usr-{uuid.uuid4().hex[:8]}",
        "email": email,
        "password": data.password,
        "full_name": data.full_name,
        "role": data.role,
        "avatar_url": data.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    MOCK_USERS[email] = new_user
    
    token = f"jwt_mock_token_{new_user['role']}_{uuid.uuid4().hex}"
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**new_user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(email: str = "creator@creatoriq.com"):
    user = MOCK_USERS.get(email.lower())
    if not user:
        user = list(MOCK_USERS.values())[0]
    return UserResponse(**user)
