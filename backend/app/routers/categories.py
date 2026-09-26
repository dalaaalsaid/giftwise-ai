from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import require_admin
from app.database import get_database
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)

db = get_database()
categories_collection = db["categories"]


def serialize_category(category: dict) -> CategoryResponse:
    return CategoryResponse(
        id=str(category["_id"]),
        name=category["name"],
        slug=category["slug"],
        is_active=category["is_active"],
    )


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def get_categories():
    categories = categories_collection.find(
        {"is_active": True}
    )

    return [
        serialize_category(category)
        for category in categories
    ]


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    payload: CategoryCreate,
    current_admin: dict = Depends(require_admin),
):
    existing_category = categories_collection.find_one(
        {"slug": payload.slug.lower().strip()}
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists.",
        )

    category_document = {
        "name": payload.name.strip(),
        "slug": payload.slug.lower().strip(),
        "is_active": payload.is_active,
    }

    result = categories_collection.insert_one(
        category_document
    )

    created_category = categories_collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_category(created_category)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    current_admin: dict = Depends(require_admin),
):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category id.",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    if "slug" in update_data:
        update_data["slug"] = update_data["slug"].lower().strip()

    result = categories_collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    updated_category = categories_collection.find_one(
        {"_id": ObjectId(category_id)}
    )

    return serialize_category(updated_category)


@router.delete(
    "/{category_id}",
)
def delete_category(
    category_id: str,
    current_admin: dict = Depends(require_admin),
):
    if not ObjectId.is_valid(category_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category id.",
        )

    result = categories_collection.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": {"is_active": False}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return {
        "message": "Category deactivated successfully."
    }