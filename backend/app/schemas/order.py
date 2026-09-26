from typing import Literal

from pydantic import BaseModel, Field


class CheckoutProductSelection(BaseModel):
    product_id: str

    quantity: int = Field(
        ge=1,
        le=20,
    )


class CheckoutItem(BaseModel):
    item_type: Literal[
        "product",
        "ready-made-box",
        "custom-box",
    ]

    name: str = Field(
        min_length=2,
        max_length=150,
    )

    quantity: int = Field(
        ge=1,
        le=20,
    )

    product_selections: list[
        CheckoutProductSelection
    ] = Field(
        min_length=1,
        max_length=20,
    )

    ready_made_box_id: str | None = None

    box_option_id: str | None = None

    flower_option_id: str | None = None

    recipient_name: str | None = Field(
        default=None,
        max_length=100,
    )

    card_message: str | None = Field(
        default=None,
        max_length=250,
    )


class CreateOrderRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        min_length=6,
        max_length=30,
    )

    address: str = Field(
        min_length=5,
        max_length=250,
    )

    city: str = Field(
        min_length=2,
        max_length=100,
    )

    notes: str | None = Field(
        default=None,
        max_length=500,
    )

    items: list[CheckoutItem] = Field(
        min_length=1,
        max_length=30,
    )

    payment_method: Literal[
        "sandbox_card",
    ] = "sandbox_card"

    payment_token: str = Field(
        min_length=5,
        max_length=100,
    )


class OrderStatusUpdate(BaseModel):
    order_status: Literal[
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
    ]


class PaymentStatusUpdate(BaseModel):
    payment_status: Literal[
        "pending",
        "paid",
        "failed",
        "refunded",
    ]


class AdminOrderUpdate(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        min_length=6,
        max_length=30,
    )

    address: str = Field(
        min_length=5,
        max_length=250,
    )

    city: str = Field(
        min_length=2,
        max_length=100,
    )

    notes: str | None = Field(
        default=None,
        max_length=500,
    )

    order_status: Literal[
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
    ]

    payment_status: Literal[
        "pending",
        "paid",
        "failed",
        "refunded",
    ]


class OrderProductDetail(BaseModel):
    product_id: str
    name: str
    unit_price: float
    quantity: int


class OrderItemResponse(BaseModel):
    item_type: str
    name: str
    quantity: int
    unit_price: float
    line_total: float

    product_ids: list[str]

    product_details: list[
        OrderProductDetail
    ] = []

    ready_made_box_id: str | None = None

    box_option_id: str | None = None
    box_option_name: str | None = None
    box_price: float = 0

    flower_option_id: str | None = None
    flower_option_name: str | None = None
    flower_price: float = 0

    recipient_name: str | None = None
    card_message: str | None = None


class OrderResponse(BaseModel):
    id: str
    order_number: str

    full_name: str
    phone: str
    address: str
    city: str

    notes: str | None

    items: list[
        OrderItemResponse
    ]

    subtotal: float
    delivery_fee: float
    total: float

    payment_status: str
    order_status: str

    created_at: str


class DashboardStatsResponse(BaseModel):
    total_orders: int
    total_sales: float
    pending_orders: int
    delivered_orders: int
    total_products: int
    top_selling_product: str | None