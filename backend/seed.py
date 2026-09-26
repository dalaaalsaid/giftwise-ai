from app.database import get_database


db = get_database()

categories_collection = db["categories"]
products_collection = db["products"]


def get_category_id(slug: str) -> str:
    category = categories_collection.find_one(
        {
            "slug": slug,
            "is_active": True,
        }
    )

    if not category:
        raise RuntimeError(
            f"Category '{slug}' was not found."
        )

    return str(category["_id"])


products = [
    {
        "name": "Blush Bloom Gift Box",
        "description": (
            "A soft and elegant gift box with chocolate, "
            "a scented candle, and thoughtful details."
        ),
        "price": 42.00,
        "stock_qty": 15,
        "category_slugs": [
            "birthday",
            "for-her",
            "chocolate",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Graduation Celebration Box",
        "description": (
            "A cheerful gift set designed to celebrate "
            "graduation and new beginnings."
        ),
        "price": 48.00,
        "stock_qty": 12,
        "category_slugs": [
            "graduation",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Rose & Chocolate Duo",
        "description": (
            "A classic combination of fresh-style flowers "
            "and premium chocolate for a meaningful gift."
        ),
        "price": 36.00,
        "stock_qty": 20,
        "category_slugs": [
            "flowers",
            "chocolate",
            "for-her",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Gentleman's Gift Set",
        "description": (
            "A modern gift set for him with practical "
            "and stylish gift items."
        ),
        "price": 45.00,
        "stock_qty": 10,
        "category_slugs": [
            "for-him",
            "birthday",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Self Care Retreat Box",
        "description": (
            "A relaxing self-care box with soothing "
            "items for a peaceful at-home experience."
        ),
        "price": 39.00,
        "stock_qty": 18,
        "category_slugs": [
            "self-care",
            "for-her",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Premium Chocolate Collection",
        "description": (
            "An elegant assortment of premium chocolates "
            "presented as a ready-to-gift collection."
        ),
        "price": 28.00,
        "stock_qty": 25,
        "category_slugs": [
            "chocolate",
            "birthday",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Celebration Flower Box",
        "description": (
            "A beautiful flower arrangement created for "
            "birthdays, graduations, and special celebrations."
        ),
        "price": 32.00,
        "stock_qty": 14,
        "category_slugs": [
            "flowers",
            "birthday",
            "graduation",
        ],
        "image_url": None,
        "is_active": True,
    },
    {
        "name": "Mini Congratulations Box",
        "description": (
            "A compact last-minute friendly gift box "
            "for congratulations and small celebrations."
        ),
        "price": 24.00,
        "stock_qty": 30,
        "category_slugs": [
            "graduation",
            "birthday",
        ],
        "image_url": None,
        "is_active": True,
    },
]


def seed_products():
    for product in products:
        category_ids = [
            get_category_id(slug)
            for slug in product["category_slugs"]
        ]

        document = {
            "name": product["name"],
            "description": product["description"],
            "price": product["price"],
            "stock_qty": product["stock_qty"],
            "category_ids": category_ids,
            "image_url": product["image_url"],
            "is_active": product["is_active"],
        }

        products_collection.update_one(
            {"name": product["name"]},
            {"$set": document},
            upsert=True,
        )

        print(f"Seeded: {product['name']}")

    print("\nGiftWise product seeding completed successfully.")


if __name__ == "__main__":
    seed_products()