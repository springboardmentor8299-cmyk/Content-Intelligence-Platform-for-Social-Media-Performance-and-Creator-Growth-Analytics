from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
router=APIRouter(prefix="/auth",tags=["Authentication"])
pwd_context=CryptContext(schemes=["pbkdf2_sha256"],deprecated="auto")
users={}
class UserCreate(BaseModel):
    username: str
    password: str
    role: str="creator"
class UserLogin(BaseModel):
    username: str
    password: str
@router.post("/register")
def register(user: UserCreate):
    if user.username in users:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )
    hashed_password=pwd_context.hash(user.password)
    users[user.username]={
        "password": hashed_password,
        "role":user.role
    }
    return {
        "message": "Registration successful",
        "username":user.username,
        "role":user.role
    }
@router.post("/login")
def login(user: UserLogin):
    if user.username not in users:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password")
    stored_user = users[user.username]
    if not pwd_context.verify(user.password,
    stored_user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )    
    return{
        "message": "Login successful",
        "username":user.username,
        "role": stored_user["role"]
   }                
