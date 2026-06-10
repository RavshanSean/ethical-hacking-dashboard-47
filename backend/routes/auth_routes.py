from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from db.database import SessionLocal
from db.models import User
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
def register_user(payload: RegisterRequest):
    db = SessionLocal()

    existing_user = (
        db.query(User)
        .filter(
            (User.username == payload.username)
            | (User.email == payload.email)
        )
        .first()
    )

    if existing_user:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Username or email already exists",
        )

    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        {"sub": new_user.username}
    )

    db.close()

    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
        },
    }


@router.post("/login")
def login_user(payload: LoginRequest):
    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.username == payload.username)
        .first()
    )

    if not user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    password_is_valid = verify_password(
        payload.password,
        user.hashed_password,
    )

    if not password_is_valid:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = create_access_token(
        {"sub": user.username}
    )

    db.close()

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    }