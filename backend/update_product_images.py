from app.database import get_database


db = get_database()

products_collection = db["products"]


PRODUCT_IMAGES = {
    "Blush Bloom Gift Box":
        "/products/blush-bloom-gift-box.jpeg",

    "Graduation Celebration Box":
        "/products/graduation-celebration-box.jpeg",

    "Rose & Chocolate Duo":
        "/products/rose-chocolate-duo.jpeg",

    "Gentleman's Gift Set":
        "/products/gentlemans-gift-set.jpeg",

    "Self Care Retreat Box":
        "/products/self-care-retreat-box.jpeg",

    "Premium Chocolate Collection":
        "/products/premium-chocolate-collection.jpeg",

    "Celebration Flower Box":
        "/products/celebration-flower-box.jpeg",

    "Mini Congratulations Box":
        "/products/mini-congratulations-box.jpeg",
}


def update_product_images():
    print("Updating GiftWise product images...\n")

    updated_count = 0

    for product_name, image_url in PRODUCT_IMAGES.items():
        result = products_collection.update_one(
            {
                "name": product_name
            },
            {
                "$set": {
                    "image_url": image_url
                }
            },
        )

        if result.matched_count == 0:
            print(
                f"NOT FOUND: {product_name}"
            )
            continue

        print(
            f"UPDATED: {product_name}"
            f" -> {image_url}"
        )

        updated_count += 1

    print(
        f"\nFinished. "
        f"{updated_count}/"
        f"{len(PRODUCT_IMAGES)} "
        f"products updated."
    )


if __name__ == "__main__":
    update_product_images()