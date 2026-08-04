from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr
from starlette.concurrency import run_in_threadpool

from db.database import SessionLocal
from db.models import User
from utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    password_context,
)
from utils.rate_limit import auth_rate_limiter, client_key


router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register_user(payload: RegisterRequest, request: Request):
    auth_rate_limiter.check(client_key(request, "auth"))

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters",
        )

    db = SessionLocal()

    try:
        existing_user = await run_in_threadpool(
            lambda: db.query(User)
            .filter(
                (User.username == payload.username)
                | (User.email == payload.email)
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username or email already exists",
            )

        hashed = await run_in_threadpool(hash_password, payload.password)

        new_user = User(
            username=payload.username,
            email=payload.email,
            hashed_password=hashed,
        )

        def _persist_user():
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user

        new_user = await run_in_threadpool(_persist_user)
        token = create_access_token({"sub": new_user.username})

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
    finally:
        db.close()


@router.post("/login")
async def login_user(payload: LoginRequest, request: Request):
    auth_rate_limiter.check(client_key(request, "auth"))

    db = SessionLocal()

    try:
        user = await run_in_threadpool(
            lambda: db.query(User)
            .filter(User.username == payload.username)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        password_is_valid = await run_in_threadpool(
            verify_password,
            payload.password,
            user.hashed_password,
        )

        if not password_is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )

        if password_context.needs_update(user.hashed_password):
            upgraded_hash = await run_in_threadpool(
                hash_password,
                payload.password,
            )

            def _persist_upgraded_hash():
                user.hashed_password = upgraded_hash
                db.commit()

            await run_in_threadpool(_persist_upgraded_hash)

        token = create_access_token({"sub": user.username})

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
    finally:
        db.close()
