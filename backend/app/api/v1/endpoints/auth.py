from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, CreatorProfile
from app.schemas.schemas import Token, UserCreate, UserLogin, UserResponse, CreatorProfileUpdate, AccountSettingsUpdate
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "creator",
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.email}",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create empty profile
    profile = CreatorProfile(
        user_id=user.id,
        bio=f"Content creator in {user_in.role} role",
        niche="General Content",
        total_reach=0,
        total_followers=0,
        avg_engagement_rate=0.0
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=str(user.id), expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/switch-role/{role}", response_model=Token)
def switch_demo_role(
    role: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_roles = ["creator", "agency", "marketing_team", "admin"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")
    
    user = db.query(User).filter(User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Demo user for role '{role}' not found.")
    
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: CreatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == current_user.id).first()
    if not profile:
        profile = CreatorProfile(user_id=current_user.id)
        db.add(profile)
        
    if profile_in.bio is not None:
        profile.bio = profile_in.bio
    if profile_in.niche is not None:
        profile.niche = profile_in.niche
    if profile_in.agency_name is not None:
        profile.agency_name = profile_in.agency_name
    if profile_in.website is not None:
        profile.website = profile_in.website
        
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/settings", response_model=UserResponse)
def update_account_settings(
    settings_in: AccountSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if settings_in.full_name:
        current_user.full_name = settings_in.full_name
    if settings_in.email:
        existing = db.query(User).filter(User.email == settings_in.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = settings_in.email
    if settings_in.new_password:
        current_user.hashed_password = get_password_hash(settings_in.new_password)
        
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == current_user.id).first()
    if profile:
        if settings_in.bio is not None:
            profile.bio = settings_in.bio
        if settings_in.niche is not None:
            profile.niche = settings_in.niche
        if settings_in.agency_name is not None:
            profile.agency_name = settings_in.agency_name
        if settings_in.website is not None:
            profile.website = settings_in.website

    db.commit()
    db.refresh(current_user)
    return current_user
