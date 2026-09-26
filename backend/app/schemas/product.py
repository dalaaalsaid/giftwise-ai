from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )

    description: str = Field(
        min_length=5,
        max_length=1500,
    )

    price: float = Field(
        gt=0,
    )

    stock_qty: int = Field(
        ge=0,
    )

    category_ids: list[str] = Field(
        default_factory=list,
    )

    image_url: str | None = None

    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        min_length=5,
        max_length=1500,
    )

    price: float | None = Field(
        default=None,
        gt=0,
    )

    stock_qty: int | None = Field(
        default=None,
        ge=0,
    )

    category_ids: list[str] | None = None

    image_url: str | None = None

    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock_qty: int
    category_ids: list[str]
    image_url: str | None
    is_active: bool