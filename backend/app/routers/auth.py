from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database import get_database
from app.schemas.user import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

db = get_database()
users_collection = db["users"]


def serialize_user(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(payload: UserRegister):
    normalized_email = payload.email.lower().strip()

    existing_user = users_collection.find_one(
        {"email": normalized_email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_document = {
        "full_name": payload.full_name.strip(),
        "email": normalized_email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = users_collection.insert_one(user_document)

    created_user = users_collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_user(created_user)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_user(payload: UserLogin):
    normalized_email = payload.email.lower().strip()

    user = users_collection.find_one(
        {"email": normalized_email}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        payload.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        subject=str(user["_id"]),
        role=user["role"],
    )

    return TokenResponse(
        access_token=access_token,
        user=serialize_user(user),
    )