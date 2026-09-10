from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "creator"


class UserLogin(BaseModel):
    email: EmailStr
    password: str