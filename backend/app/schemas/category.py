from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=80,
    )

    slug: str = Field(
        min_length=2,
        max_length=100,
    )

    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=80,
    )

    slug: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool