from collections import Counter
from datetime import datetime, timezone
from uuid import uuid4

from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.dependencies import (
    get_current_user,
    require_admin,
)

from app.database import get_database

from app.schemas.order import (
    AdminOrderUpdate,
    CreateOrderRequest,
    DashboardStatsResponse,
    OrderItemResponse,
    OrderProductDetail,
    OrderResponse,
    OrderStatusUpdate,
    PaymentStatusUpdate,
)


router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)

db = get_database()

orders_collection = db["orders"]
products_collection = db["products"]


DELIVERY_FEE = 5.0


BOX_OPTIONS = {
    "classic": {
        "name": "Classic Gift Box",
        "price": 5.0,
    },
    "premium": {
        "name": "Premium Magnetic Box",
        "price": 9.0,
    },
    "mini": {
        "name": "Mini Gift Box",
        "price": 3.0,
    },
}


FLOWER_OPTIONS = {
    "none": {
        "name": "No flowers",
        "price": 0.0,
    },
    "mini-flowers": {
        "name": "Mini Flower Touch",
        "price": 6.0,
    },
    "rose-bundle": {
        "name": "Rose Bundle",
        "price": 12.0,
    },
}


READY_MADE_BOX_FEES = {
    "graduation-express": 4.0,
    "birthday-rescue": 4.0,
    "self-care-surprise": 5.0,
    "congratulations-mini": 3.0,
}


SANDBOX_SUCCESS_TOKEN = (
    "giftwise_test_payment_success"
)

SANDBOX_DECLINED_TOKEN = (
    "giftwise_test_payment_declined"
)


def serialize_order(
    order: dict,
) -> OrderResponse:
    return OrderResponse(
        id=str(
            order["_id"]
        ),

        order_number=order[
            "order_number"
        ],

        full_name=order[
            "full_name"
        ],

        phone=order[
            "phone"
        ],

        address=order[
            "address"
        ],

        city=order[
            "city"
        ],

        notes=order.get(
            "notes"
        ),

        items=[
            OrderItemResponse(
                item_type=item[
                    "item_type"
                ],

                name=item[
                    "name"
                ],

                quantity=item[
                    "quantity"
                ],

                unit_price=float(
                    item[
                        "unit_price"
                    ]
                ),

                line_total=float(
                    item[
                        "line_total"
                    ]
                ),

                product_ids=item.get(
                    "product_ids",
                    [],
                ),

                product_details=[
                    OrderProductDetail(
                        product_id=(
                            detail[
                                "product_id"
                            ]
                        ),

                        name=detail[
                            "name"
                        ],

                        unit_price=float(
                            detail[
                                "unit_price"
                            ]
                        ),

                        quantity=int(
                            detail[
                                "quantity"
                            ]
                        ),
                    )
                    for detail in item.get(
                        "product_details",
                        [],
                    )
                ],

                ready_made_box_id=item.get(
                    "ready_made_box_id"
                ),

                box_option_id=item.get(
                    "box_option_id"
                ),

                box_option_name=item.get(
                    "box_option_name"
                ),

                box_price=float(
                    item.get(
                        "box_price",
                        0,
                    )
                ),

                flower_option_id=item.get(
                    "flower_option_id"
                ),

                flower_option_name=item.get(
                    "flower_option_name"
                ),

                flower_price=float(
                    item.get(
                        "flower_price",
                        0,
                    )
                ),

                recipient_name=item.get(
                    "recipient_name"
                ),

                card_message=item.get(
                    "card_message"
                ),
            )
            for item in order[
                "items"
            ]
        ],

        subtotal=float(
            order["subtotal"]
        ),

        delivery_fee=float(
            order[
                "delivery_fee"
            ]
        ),

        total=float(
            order["total"]
        ),

        payment_status=order[
            "payment_status"
        ],

        order_status=order[
            "order_status"
        ],

        created_at=order[
            "created_at"
        ].isoformat(),
    )


def get_product(
    product_id: str,
) -> dict:
    if not ObjectId.is_valid(
        product_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid product ID: "
                f"{product_id}"
            ),
        )

    product = (
        products_collection
        .find_one(
            {
                "_id":
                    ObjectId(
                        product_id
                    ),

                "is_active":
                    True,
            }
        )
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail=(
                "One or more selected "
                "products are unavailable."
            ),
        )

    return product


def get_item_extra_costs(
    item,
) -> tuple[
    float,
    str | None,
    float,
    str | None,
]:
    box_name = None
    box_price = 0.0

    flower_name = None
    flower_price = 0.0


    if (
        item.item_type
        == "ready-made-box"
    ):
        box_price = (
            READY_MADE_BOX_FEES.get(
                item.ready_made_box_id
                or "",
                4.0,
            )
        )


    if (
        item.item_type
        == "custom-box"
    ):
        if (
            not item.box_option_id
            or item.box_option_id
            not in BOX_OPTIONS
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid custom box "
                    "selection."
                ),
            )

        if (
            not item.flower_option_id
            or item.flower_option_id
            not in FLOWER_OPTIONS
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid flower "
                    "selection."
                ),
            )

        box_option = (
            BOX_OPTIONS[
                item.box_option_id
            ]
        )

        flower_option = (
            FLOWER_OPTIONS[
                item.flower_option_id
            ]
        )

        box_name = str(
            box_option[
                "name"
            ]
        )

        box_price = float(
            box_option[
                "price"
            ]
        )

        flower_name = str(
            flower_option[
                "name"
            ]
        )

        flower_price = float(
            flower_option[
                "price"
            ]
        )


    return (
        box_price,
        box_name,
        flower_price,
        flower_name,
    )


def calculate_item(
    item,
) -> tuple[
    float,
    list[dict],
    dict,
]:
    product_details: list[
        dict
    ] = []

    products_total = 0.0


    for selection in (
        item.product_selections
    ):
        product = get_product(
            selection.product_id
        )

        product_price = float(
            product[
                "price"
            ]
        )

        products_total += (
            product_price
            * selection.quantity
        )

        product_details.append(
            {
                "product_id":
                    str(
                        product[
                            "_id"
                        ]
                    ),

                "name":
                    product[
                        "name"
                    ],

                "unit_price":
                    product_price,

                "quantity":
                    selection.quantity,
            }
        )


    (
        box_price,
        box_name,
        flower_price,
        flower_name,
    ) = get_item_extra_costs(
        item
    )


    unit_price = (
        products_total
        + box_price
        + flower_price
    )


    metadata = {
        "ready_made_box_id":
            item.ready_made_box_id,

        "box_option_id":
            item.box_option_id,

        "box_option_name":
            box_name,

        "box_price":
            box_price,

        "flower_option_id":
            item.flower_option_id,

        "flower_option_name":
            flower_name,

        "flower_price":
            flower_price,
    }


    return (
        round(
            unit_price,
            2,
        ),

        product_details,

        metadata,
    )


def build_required_stock(
    payload: CreateOrderRequest,
) -> Counter[str]:
    required: Counter[
        str
    ] = Counter()


    for item in payload.items:
        for selection in (
            item.product_selections
        ):
            required[
                selection.product_id
            ] += (
                selection.quantity
                * item.quantity
            )


    return required


def validate_stock(
    required_stock:
        Counter[str],
):
    for (
        product_id,
        required_quantity,
    ) in required_stock.items():
        product = get_product(
            product_id
        )

        available_stock = int(
            product.get(
                "stock_qty",
                0,
            )
        )

        if (
            required_quantity
            > available_stock
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Not enough stock "
                    f"for {product['name']}."
                ),
            )


def decrease_product_stock(
    required_stock:
        Counter[str],
):
    for (
        product_id,
        quantity,
    ) in required_stock.items():
        result = (
            products_collection
            .update_one(
                {
                    "_id":
                        ObjectId(
                            product_id
                        ),

                    "stock_qty": {
                        "$gte":
                            quantity,
                    },
                },

                {
                    "$inc": {
                        "stock_qty":
                            -quantity,
                    }
                },
            )
        )

        if (
            result.modified_count
            == 0
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Stock changed while "
                    "processing the order. "
                    "Please review your cart."
                ),
            )


def validate_sandbox_payment(
    payment_method: str,
    payment_token: str,
):
    if (
        payment_method
        != "sandbox_card"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported payment "
                "method."
            ),
        )


    if (
        payment_token
        == SANDBOX_DECLINED_TOKEN
    ):
        raise HTTPException(
            status_code=402,
            detail=(
                "Sandbox payment "
                "was declined."
            ),
        )


    if (
        payment_token
        != SANDBOX_SUCCESS_TOKEN
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid sandbox "
                "payment token."
            ),
        )


@router.post(
    "",
    response_model=(
        OrderResponse
    ),
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def create_order(
    payload:
        CreateOrderRequest,

    current_user: dict = Depends(
        get_current_user
    ),
):
    required_stock = (
        build_required_stock(
            payload
        )
    )

    validate_stock(
        required_stock
    )


    order_items: list[
        dict
    ] = []

    subtotal = 0.0


    for item in payload.items:
        (
            unit_price,
            product_details,
            metadata,
        ) = calculate_item(
            item
        )


        line_total = (
            unit_price
            * item.quantity
        )


        subtotal += (
            line_total
        )


        order_items.append(
            {
                "item_type":
                    item.item_type,

                "name":
                    item.name
                    .strip(),

                "quantity":
                    item.quantity,

                "unit_price":
                    round(
                        unit_price,
                        2,
                    ),

                "line_total":
                    round(
                        line_total,
                        2,
                    ),

                "product_ids": [
                    detail[
                        "product_id"
                    ]
                    for detail
                    in product_details
                ],

                "product_details":
                    product_details,

                "ready_made_box_id":
                    metadata[
                        "ready_made_box_id"
                    ],

                "box_option_id":
                    metadata[
                        "box_option_id"
                    ],

                "box_option_name":
                    metadata[
                        "box_option_name"
                    ],

                "box_price":
                    metadata[
                        "box_price"
                    ],

                "flower_option_id":
                    metadata[
                        "flower_option_id"
                    ],

                "flower_option_name":
                    metadata[
                        "flower_option_name"
                    ],

                "flower_price":
                    metadata[
                        "flower_price"
                    ],

                "recipient_name":
                    item.recipient_name,

                "card_message":
                    item.card_message,
            }
        )


    subtotal = round(
        subtotal,
        2,
    )


    delivery_fee = (
        DELIVERY_FEE
        if subtotal > 0
        else 0.0
    )


    total = round(
        subtotal
        + delivery_fee,
        2,
    )


    validate_sandbox_payment(
        payload.payment_method,
        payload.payment_token,
    )


    decrease_product_stock(
        required_stock
    )


    now = datetime.now(
        timezone.utc
    )


    order_document = {
        "order_number":
            "GW-"
            + uuid4().hex[
                :8
            ].upper(),

        "user_id":
            str(
                current_user[
                    "_id"
                ]
            ),

        "full_name":
            payload.full_name
            .strip(),

        "phone":
            payload.phone
            .strip(),

        "address":
            payload.address
            .strip(),

        "city":
            payload.city
            .strip(),

        "notes":
            payload.notes.strip()
            if payload.notes
            else None,

        "items":
            order_items,

        "subtotal":
            subtotal,

        "delivery_fee":
            delivery_fee,

        "total":
            total,

        "payment_method":
            "sandbox_card",

        "payment_status":
            "paid",

        "order_status":
            "confirmed",

        "created_at":
            now,

        "updated_at":
            now,
    }


    result = (
        orders_collection
        .insert_one(
            order_document
        )
    )


    order_document[
        "_id"
    ] = result.inserted_id


    return serialize_order(
        order_document
    )


@router.get(
    "/me",
    response_model=list[
        OrderResponse
    ],
)
def get_my_orders(
    current_user: dict = Depends(
        get_current_user
    ),
):
    orders = list(
        orders_collection
        .find(
            {
                "user_id":
                    str(
                        current_user[
                            "_id"
                        ]
                    )
            }
        )
        .sort(
            "created_at",
            -1,
        )
    )

    return [
        serialize_order(
            order
        )
        for order
        in orders
    ]


@router.get(
    "/admin/all",
    response_model=list[
        OrderResponse
    ],
)
def get_all_orders(
    admin_user: dict = Depends(
        require_admin
    ),
):
    orders = list(
        orders_collection
        .find({})
        .sort(
            "created_at",
            -1,
        )
    )

    return [
        serialize_order(
            order
        )
        for order
        in orders
    ]


@router.get(
    "/admin/stats",
    response_model=(
        DashboardStatsResponse
    ),
)
def get_dashboard_stats(
    admin_user: dict = Depends(
        require_admin
    ),
):
    orders = list(
        orders_collection
        .find({})
    )


    total_orders = len(
        orders
    )


    total_sales = round(
        sum(
            float(
                order.get(
                    "total",
                    0,
                )
            )
            for order in orders
            if (
                order.get(
                    "order_status"
                )
                != "cancelled"
            )
            and (
                order.get(
                    "payment_status"
                )
                == "paid"
            )
        ),
        2,
    )


    pending_orders = sum(
        1
        for order in orders
        if (
            order.get(
                "order_status"
            )
            == "pending"
        )
    )


    delivered_orders = sum(
        1
        for order in orders
        if (
            order.get(
                "order_status"
            )
            == "delivered"
        )
    )


    total_products = (
        products_collection
        .count_documents(
            {
                "is_active":
                    True,
            }
        )
    )


    product_counter: Counter[str] = (
            Counter()
        )


    for order in orders:
        if (
            order.get(
                "order_status"
            )
            == "cancelled"
        ):
            continue

        if (
            order.get(
                "payment_status"
            )
            != "paid"
        ):
            continue


        for item in (
            order.get(
                "items",
                [],
            )
        ):
            item_quantity = int(
                item.get(
                    "quantity",
                    1,
                )
            )

            product_details = (
                item.get(
                    "product_details",
                    [],
                )
            )


            if product_details:
                for detail in (
                    product_details
                ):
                    product_id = str(
                        detail.get(
                            "product_id",
                            "",
                        )
                    )

                    internal_quantity = int(
                        detail.get(
                            "quantity",
                            1,
                        )
                    )

                    if product_id:
                        product_counter[
                            product_id
                        ] += (
                            internal_quantity
                            * item_quantity
                        )

            else:
                for product_id in (
                    item.get(
                        "product_ids",
                        [],
                    )
                ):
                    product_counter[
                        product_id
                    ] += (
                        item_quantity
                    )


    top_selling_product = None


    if product_counter:
        (
            top_product_id,
            _,
        ) = (
            product_counter
            .most_common(
                1
            )[0]
        )

        if ObjectId.is_valid(
            top_product_id
        ):
            product = (
                products_collection
                .find_one(
                    {
                        "_id":
                            ObjectId(
                                top_product_id
                            )
                    }
                )
            )

            if product:
                top_selling_product = (
                    product[
                        "name"
                    ]
                )


    return DashboardStatsResponse(
        total_orders=(
            total_orders
        ),

        total_sales=(
            total_sales
        ),

        pending_orders=(
            pending_orders
        ),

        delivered_orders=(
            delivered_orders
        ),

        total_products=(
            total_products
        ),

        top_selling_product=(
            top_selling_product
        ),
    )


@router.patch(
    "/admin/{order_id}/status",
    response_model=(
        OrderResponse
    ),
)
def update_order_status(
    order_id: str,
    payload:
        OrderStatusUpdate,

    admin_user: dict = Depends(
        require_admin
    ),
):
    if not ObjectId.is_valid(
        order_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid order ID."
            ),
        )


    result = (
        orders_collection
        .find_one_and_update(
            {
                "_id":
                    ObjectId(
                        order_id
                    )
            },

            {
                "$set": {
                    "order_status":
                        payload
                        .order_status,

                    "updated_at":
                        datetime.now(
                            timezone.utc
                        ),
                }
            },

            return_document=True,
        )
    )


    if not result:
        raise HTTPException(
            status_code=404,
            detail=(
                "Order not found."
            ),
        )


    return serialize_order(
        result
    )


@router.patch(
    "/admin/{order_id}/payment",
    response_model=(
        OrderResponse
    ),
)
def update_payment_status(
    order_id: str,
    payload:
        PaymentStatusUpdate,

    admin_user: dict = Depends(
        require_admin
    ),
):
    if not ObjectId.is_valid(
        order_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid order ID."
            ),
        )


    result = (
        orders_collection
        .find_one_and_update(
            {
                "_id":
                    ObjectId(
                        order_id
                    )
            },

            {
                "$set": {
                    "payment_status":
                        payload
                        .payment_status,

                    "updated_at":
                        datetime.now(
                            timezone.utc
                        ),
                }
            },

            return_document=True,
        )
    )


    if not result:
        raise HTTPException(
            status_code=404,
            detail=(
                "Order not found."
            ),
        )


    return serialize_order(
        result
    )


@router.patch(
    "/admin/{order_id}",
    response_model=(
        OrderResponse
    ),
)
def admin_update_order(
    order_id: str,
    payload:
        AdminOrderUpdate,

    admin_user: dict = Depends(
        require_admin
    ),
):
    if not ObjectId.is_valid(
        order_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid order ID."
            ),
        )


    update_data = {
        "full_name":
            payload.full_name
            .strip(),

        "phone":
            payload.phone
            .strip(),

        "address":
            payload.address
            .strip(),

        "city":
            payload.city
            .strip(),

        "notes":
            payload.notes.strip()
            if payload.notes
            else None,

        "order_status":
            payload
            .order_status,

        "payment_status":
            payload
            .payment_status,

        "updated_at":
            datetime.now(
                timezone.utc
            ),
    }


    order = (
        orders_collection
        .find_one_and_update(
            {
                "_id":
                    ObjectId(
                        order_id
                    )
            },

            {
                "$set":
                    update_data
            },

            return_document=True,
        )
    )


    if not order:
        raise HTTPException(
            status_code=404,
            detail=(
                "Order not found."
            ),
        )


    return serialize_order(
        order
    )


@router.get(
    "/{order_id}",
    response_model=(
        OrderResponse
    ),
)
def get_order(
    order_id: str,

    current_user: dict = Depends(
        get_current_user
    ),
):
    if not ObjectId.is_valid(
        order_id
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid order ID."
            ),
        )


    order = (
        orders_collection
        .find_one(
            {
                "_id":
                    ObjectId(
                        order_id
                    )
            }
        )
    )


    if not order:
        raise HTTPException(
            status_code=404,
            detail=(
                "Order not found."
            ),
        )


    is_admin = (
        current_user.get(
            "role"
        )
        == "admin"
    )


    owns_order = (
        order[
            "user_id"
        ]
        == str(
            current_user[
                "_id"
            ]
        )
    )


    if (
        not is_admin
        and not owns_order
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You cannot access "
                "this order."
            ),
        )


    return serialize_order(
        order
    )