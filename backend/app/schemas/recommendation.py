from pydantic import BaseModel, Field


class GiftRecommendationRequest(BaseModel):
    recipient: str = Field(
        min_length=2,
        max_length=100,
    )

    description: str = Field(
        min_length=10,
        max_length=1000,
    )

    budget: float = Field(
        gt=0,
        le=5000,
    )


class RecommendedProduct(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock_qty: int
    image_url: str | None
    match_score: int
    reason: str


class GiftRecommendationResponse(BaseModel):
    recommendation_id: str
    recipient: str
    description: str
    budget: float

    match_found: bool
    message: str

    recommendations: list[
        RecommendedProduct
    ]

    alternatives: list[
        RecommendedProduct
    ]


class AIInsightProduct(BaseModel):
    product_id: str
    product_name: str
    recommendation_count: int


class AIInsightRecentRequest(BaseModel):
    id: str
    recipient: str
    description: str
    budget: float
    recommendation_count: int
    top_match_score: int
    created_at: str


class AIInsightsResponse(BaseModel):
    total_requests: int
    average_budget: float
    average_match_score: float

    most_common_recipient: (
        str | None
    )

    most_recommended_product: (
        str | None
    )

    top_products: list[
        AIInsightProduct
    ]

    recent_requests: list[
        AIInsightRecentRequest
    ]