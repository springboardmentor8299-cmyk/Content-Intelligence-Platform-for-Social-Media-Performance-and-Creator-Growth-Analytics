from pydantic import BaseModel


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Creator"


class LoginRequest(BaseModel):
    email: str
    password: str