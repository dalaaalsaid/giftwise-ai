from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import require_admin
from app.database import get_database
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)

db = get_database()

products_collection = db["products"]
categories_collection = db["categories"]


def serialize_product(product: dict) -> ProductResponse:
    return ProductResponse(
        id=str(product["_id"]),
        name=product["name"],
        description=product["description"],
        price=product["price"],
        stock_qty=product["stock_qty"],
        category_ids=product.get("category_ids", []),
        image_url=product.get("image_url"),
        is_active=product["is_active"],
    )


def validate_category_ids(
    category_ids: list[str],
):
    for category_id in category_ids:
        if not ObjectId.is_valid(category_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category id: {category_id}",
            )

        category = categories_collection.find_one(
            {
                "_id": ObjectId(category_id),
                "is_active": True,
            }
        )

        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category not found: {category_id}",
            )


@router.get(
    "",
    response_model=list[ProductResponse],
)
def get_products(
    search: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    category_id: str | None = Query(default=None),
):
    query: dict = {
        "is_active": True
    }

    if search:
        query["name"] = {
            "$regex": search,
            "$options": "i",
        }

    price_filter = {}

    if min_price is not None:
        price_filter["$gte"] = min_price

    if max_price is not None:
        price_filter["$lte"] = max_price

    if price_filter:
        query["price"] = price_filter

    if category_id:
        query["category_ids"] = category_id

    products = products_collection.find(query)

    return [
        serialize_product(product)
        for product in products
    ]


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product id.",
        )

    product = products_collection.find_one(
        {
            "_id": ObjectId(product_id),
            "is_active": True,
        }
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return serialize_product(product)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    payload: ProductCreate,
    current_admin: dict = Depends(require_admin),
):
    validate_category_ids(
        payload.category_ids
    )

    product_document = {
        "name": payload.name.strip(),
        "description": payload.description.strip(),
        "price": payload.price,
        "stock_qty": payload.stock_qty,
        "category_ids": payload.category_ids,
        "image_url": payload.image_url,
        "is_active": payload.is_active,
    }

    result = products_collection.insert_one(
        product_document
    )

    created_product = products_collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_product(created_product)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    current_admin: dict = Depends(require_admin),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product id.",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if "category_ids" in update_data:
        validate_category_ids(
            update_data["category_ids"]
        )

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    if "description" in update_data:
        update_data["description"] = (
            update_data["description"].strip()
        )

    result = products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    updated_product = products_collection.find_one(
        {"_id": ObjectId(product_id)}
    )

    return serialize_product(updated_product)


@router.delete(
    "/{product_id}",
)
def delete_product(
    product_id: str,
    current_admin: dict = Depends(require_admin),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product id.",
        )

    result = products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"is_active": False}},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return {
        "message": "Product deactivated successfully."
    }