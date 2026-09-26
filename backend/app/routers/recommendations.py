import json
import os
import re

from collections import Counter
from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from openai import OpenAI

from app.core.dependencies import (
    require_admin,
)

from app.database import (
    get_database,
)

from app.schemas.recommendation import (
    AIInsightProduct,
    AIInsightRecentRequest,
    AIInsightsResponse,
    GiftRecommendationRequest,
    GiftRecommendationResponse,
    RecommendedProduct,
)


router = APIRouter(
    prefix="/api/recommendations",
    tags=[
        "AI Gift Recommendations"
    ],
)

db = get_database()

products_collection = db[
    "products"
]

categories_collection = db[
    "categories"
]

recommendations_collection = db[
    "ai_recommendations"
]


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "because",
    "but",
    "for",
    "from",
    "he",
    "her",
    "hers",
    "him",
    "his",
    "i",
    "in",
    "is",
    "it",
    "like",
    "likes",
    "love",
    "loves",
    "enjoy",
    "enjoys",
    "my",
    "of",
    "on",
    "or",
    "our",
    "she",
    "something",
    "that",
    "the",
    "their",
    "them",
    "they",
    "this",
    "to",
    "want",
    "wants",
    "with",
    "who",
    "really",
    "very",
    "gift",
    "gifts",
    "present",
    "presents",
    "looking",
    "need",
    "needs",
    "person",
    "someone",
}


CONTEXT_KEYWORDS = {
    "birthday": [
        "birthday",
        "celebration",
        "chocolate",
        "gift",
    ],

    "graduation": [
        "graduation",
        "graduate",
        "congratulations",
        "celebration",
    ],

    "anniversary": [
        "anniversary",
        "flowers",
        "romantic",
        "chocolate",
    ],

    "valentine": [
        "valentine",
        "flowers",
        "romantic",
        "chocolate",
    ],

    "mother": [
        "for-her",
        "flowers",
        "self-care",
    ],

    "mom": [
        "for-her",
        "flowers",
        "self-care",
    ],

    "sister": [
        "for-her",
        "self-care",
        "chocolate",
    ],

    "girlfriend": [
        "for-her",
        "flowers",
        "chocolate",
    ],

    "wife": [
        "for-her",
        "flowers",
        "self-care",
    ],

    "father": [
        "for-him",
        "chocolate",
    ],

    "dad": [
        "for-him",
        "chocolate",
    ],

    "brother": [
        "for-him",
    ],

    "boyfriend": [
        "for-him",
        "chocolate",
    ],

    "husband": [
        "for-him",
    ],

    "friend": [
        "birthday",
        "chocolate",
        "self-care",
    ],
}


def normalize(
    value: str,
) -> str:
    return (
        value
        .lower()
        .strip()
    )


def extract_keywords(
    text: str,
) -> list[str]:
    words = re.findall(
        r"[a-zA-Z][a-zA-Z\-']+",
        normalize(text),
    )

    keywords: list[str] = []

    for word in words:
        if len(word) < 3:
            continue

        if word in STOP_WORDS:
            continue

        if word not in keywords:
            keywords.append(
                word
            )

    return keywords[:30]


def get_category_slugs(
    category_ids: list[str],
) -> list[str]:
    slugs: list[str] = []

    for category_id in (
        category_ids
    ):
        if not ObjectId.is_valid(
            category_id
        ):
            continue

        category = (
            categories_collection
            .find_one(
                {
                    "_id":
                        ObjectId(
                            category_id
                        ),

                    "is_active":
                        True,
                }
            )
        )

        if category:
            slugs.append(
                normalize(
                    category.get(
                        "slug",
                        "",
                    )
                )
            )

    return slugs


def get_searchable_text(
    product: dict,
) -> str:
    category_slugs = (
        get_category_slugs(
            product.get(
                "category_ids",
                [],
            )
        )
    )

    return normalize(
        " ".join(
            [
                product.get(
                    "name",
                    "",
                ),

                product.get(
                    "description",
                    "",
                ),

                " ".join(
                    category_slugs
                ),
            ]
        )
    )


def get_preference_keywords(
    payload:
        GiftRecommendationRequest,
) -> list[str]:
    return extract_keywords(
        payload.description
    )


def product_matches_preferences(
    product: dict,
    payload:
        GiftRecommendationRequest,
) -> bool:
    preference_keywords = (
        get_preference_keywords(
            payload
        )
    )

    if not preference_keywords:
        return True

    searchable_text = (
        get_searchable_text(
            product
        )
    )

    for keyword in (
        preference_keywords
    ):
        if keyword in searchable_text:
            return True

    return False


def calculate_match(
    product: dict,
    payload:
        GiftRecommendationRequest,
) -> tuple[
    int,
    str,
]:
    score = 0

    reasons: list[str] = []

    category_slugs = (
        get_category_slugs(
            product.get(
                "category_ids",
                [],
            )
        )
    )

    searchable_text = (
        get_searchable_text(
            product
        )
    )

    user_context = normalize(
        f"{payload.recipient} "
        f"{payload.description}"
    )

    user_keywords = (
        extract_keywords(
            user_context
        )
    )

    price = float(
        product.get(
            "price",
            0,
        )
    )

    stock_qty = int(
        product.get(
            "stock_qty",
            0,
        )
    )

    if (
        price
        <= payload.budget
    ):
        score += 35

        reasons.append(
            "fits within your budget"
        )

        budget_difference = (
            payload.budget
            - price
        )

        if (
            budget_difference
            <= payload.budget
            * 0.25
        ):
            score += 8

    else:
        score -= 60

    matched_keywords: list[
        str
    ] = []

    for keyword in (
        user_keywords
    ):
        if keyword in searchable_text:
            matched_keywords.append(
                keyword
            )

            score += 10

    if matched_keywords:
        reasons.append(
            "matches details you "
            "mentioned such as "
            + ", ".join(
                matched_keywords[:3]
            )
        )

    contextual_matches: list[
        str
    ] = []

    for (
        trigger,
        related_keywords,
    ) in (
        CONTEXT_KEYWORDS.items()
    ):
        if (
            trigger
            not in user_context
        ):
            continue

        for keyword in (
            related_keywords
        ):
            if (
                keyword
                in searchable_text
            ):
                contextual_matches.append(
                    trigger
                )

                score += 7

                break

    contextual_matches = list(
        dict.fromkeys(
            contextual_matches
        )
    )

    if contextual_matches:
        reasons.append(
            "matches the context of "
            + ", ".join(
                contextual_matches[:2]
            )
        )

    if stock_qty > 0:
        score += 5
    else:
        score -= 100

    score = max(
        0,
        min(
            score,
            100,
        ),
    )

    if not reasons:
        reasons.append(
            "is an available option "
            "from the GiftWise shop"
        )

    reason = (
        "Recommended because it "
        + ", ".join(
            reasons
        )
        + "."
    )

    return (
        score,
        reason,
    )


def create_product_response(
    product: dict,
    score: int,
    reason: str,
) -> RecommendedProduct:
    return RecommendedProduct(
        id=str(
            product["_id"]
        ),

        name=product[
            "name"
        ],

        description=product[
            "description"
        ],

        price=float(
            product["price"]
        ),

        stock_qty=int(
            product["stock_qty"]
        ),

        image_url=product.get(
            "image_url"
        ),

        match_score=score,

        reason=reason,
    )


def fallback_result(
    products: list[dict],
    payload:
        GiftRecommendationRequest,
) -> tuple[
    bool,
    str,
    list[RecommendedProduct],
    list[RecommendedProduct],
]:
    affordable_products = [
        product
        for product
        in products
        if (
            float(
                product.get(
                    "price",
                    0,
                )
            )
            <= payload.budget
        )
    ]

    if not affordable_products:
        return (
            False,

            (
                "We could not find any "
                "available gifts within "
                "your current budget."
            ),

            [],

            [],
        )

    preference_keywords = (
        get_preference_keywords(
            payload
        )
    )

    exact_products = [
        product
        for product
        in affordable_products
        if product_matches_preferences(
            product,
            payload,
        )
    ]

    if (
        exact_products
        and preference_keywords
    ):
        ranked_exact: list[
            tuple[
                dict,
                int,
                str,
            ]
        ] = []

        for product in (
            exact_products
        ):
            (
                score,
                reason,
            ) = calculate_match(
                product,
                payload,
            )

            ranked_exact.append(
                (
                    product,
                    score,
                    reason,
                )
            )

        ranked_exact.sort(
            key=lambda item: (
                item[1],
                -float(
                    item[0].get(
                        "price",
                        0,
                    )
                ),
            ),
            reverse=True,
        )

        recommendations = [
            create_product_response(
                product,
                score,
                reason,
            )
            for (
                product,
                score,
                reason,
            )
            in ranked_exact[:5]
        ]

        return (
            True,

            (
                "We found gifts that "
                "match the details you "
                "provided."
            ),

            recommendations,

            [],
        )

    if not preference_keywords:
        ranked_general: list[
            tuple[
                dict,
                int,
                str,
            ]
        ] = []

        for product in (
            affordable_products
        ):
            (
                score,
                reason,
            ) = calculate_match(
                product,
                payload,
            )

            ranked_general.append(
                (
                    product,
                    score,
                    reason,
                )
            )

        ranked_general.sort(
            key=lambda item: (
                item[1],
                -float(
                    item[0].get(
                        "price",
                        0,
                    )
                ),
            ),
            reverse=True,
        )

        recommendations = [
            create_product_response(
                product,
                score,
                reason,
            )
            for (
                product,
                score,
                reason,
            )
            in ranked_general[:5]
        ]

        return (
            True,

            (
                "Here are some suitable "
                "GiftWise options for "
                "your recipient and "
                "budget."
            ),

            recommendations,

            [],
        )

    ranked_alternatives: list[
        tuple[
            dict,
            int,
            str,
        ]
    ] = []

    for product in (
        affordable_products
    ):
        (
            score,
            reason,
        ) = calculate_match(
            product,
            payload,
        )

        alternative_score = min(
            score,
            69,
        )

        alternative_reason = (
            "Alternative option. "
            + reason
        )

        ranked_alternatives.append(
            (
                product,
                alternative_score,
                alternative_reason,
            )
        )

    ranked_alternatives.sort(
        key=lambda item: (
            item[1],
            -float(
                item[0].get(
                    "price",
                    0,
                )
            ),
        ),
        reverse=True,
    )

    alternatives = [
        create_product_response(
            product,
            score,
            reason,
        )
        for (
            product,
            score,
            reason,
        )
        in ranked_alternatives[:3]
    ]

    keyword_text = ", ".join(
        preference_keywords[:3]
    )

    message = (
        "We could not find an exact "
        "gift matching "
        f"{keyword_text} "
        "in the current GiftWise "
        "catalog. Here are some "
        "alternative options instead."
    )

    return (
        False,
        message,
        [],
        alternatives,
    )


def ai_recommendations(
    products: list[dict],
    payload:
        GiftRecommendationRequest,
) -> tuple[
    bool,
    str,
    list[RecommendedProduct],
    list[RecommendedProduct],
]:
    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured."
        )

    client = OpenAI(
        api_key=api_key
    )

    model = os.getenv(
        "OPENAI_MODEL",
        "gpt-5.4-mini",
    )

    available_products = []

    product_lookup: dict[
        str,
        dict,
    ] = {}

    for product in products:
        price = float(
            product.get(
                "price",
                0,
            )
        )

        if (
            price
            > payload.budget
        ):
            continue

        product_id = str(
            product["_id"]
        )

        product_lookup[
            product_id
        ] = product

        available_products.append(
            {
                "id":
                    product_id,

                "name":
                    product.get(
                        "name",
                        "",
                    ),

                "description":
                    product.get(
                        "description",
                        "",
                    ),

                "price":
                    price,

                "categories":
                    get_category_slugs(
                        product.get(
                            "category_ids",
                            [],
                        )
                    ),
            }
        )

    if not available_products:
        return (
            False,

            (
                "We could not find any "
                "available gifts within "
                "your current budget."
            ),

            [],

            [],
        )

    prompt = {
        "recipient":
            payload
            .recipient
            .strip(),

        "gift_preferences":
            payload
            .description
            .strip(),

        "budget":
            payload.budget,

        "available_products":
            available_products,
    }

    instructions = """
You are the recommendation engine for GiftWise,
an online gift shop.

You may ONLY use products supplied in
available_products.

Never invent a product, product id, price,
feature, category, or availability.

Your first job is to decide whether the
catalog contains a meaningful match for the
specific preferences, interests, or occasion
the user described.

Important:
Recipient suitability alone is NOT enough to
claim an exact match when the user gives a
specific interest.

Example:
If the user says the recipient loves cars,
but no available product is related to cars,
match_found must be false.

If match_found is true:
- Return up to 5 genuinely relevant products
  in recommendations.
- alternatives must be empty.

If match_found is false:
- recommendations must be empty.
- Explain clearly that an exact match was not
  found in the current catalog.
- Return up to 3 reasonable general gift
  options in alternatives.
- Clearly describe those products as
  alternatives, not exact matches.

A user's budget must always be respected.

Return ONLY valid JSON using this exact shape:

{
  "match_found": true,
  "message": "Short user-friendly message",
  "recommendations": [
    {
      "product_id": "existing product id",
      "match_score": 0,
      "reason": "short personalized reason"
    }
  ],
  "alternatives": [
    {
      "product_id": "existing product id",
      "match_score": 0,
      "reason": "short alternative reason"
    }
  ]
}

Rules:
- match_score must be an integer from 0 to 100.
- Every product_id must come from
  available_products.
- Do not recommend a product above the budget.
- Do not repeat the same product.
- Do not return markdown.
- Do not pretend an unavailable interest is
  represented in the catalog.
"""

    response = (
        client.responses.create(
            model=model,

            instructions=(
                instructions
            ),

            input=json.dumps(
                prompt,
                ensure_ascii=False,
            ),
        )
    )

    raw_output = (
        response
        .output_text
        .strip()
    )

    parsed = json.loads(
        raw_output
    )

    match_found = bool(
        parsed.get(
            "match_found",
            False,
        )
    )

    message = str(
        parsed.get(
            "message",
            "",
        )
    ).strip()

    if not message:
        if match_found:
            message = (
                "We found gifts that "
                "match the details you "
                "provided."
            )
        else:
            message = (
                "We could not find an "
                "exact match in the "
                "current GiftWise "
                "catalog."
            )

    def parse_items(
        items: list,
        alternative: bool,
        limit: int,
    ) -> list[
        RecommendedProduct
    ]:
        parsed_products: list[
            RecommendedProduct
        ] = []

        used_ids: set[str] = set()

        for item in items:
            product_id = str(
                item.get(
                    "product_id",
                    "",
                )
            )

            if (
                not product_id
                or product_id
                in used_ids
            ):
                continue

            product = (
                product_lookup.get(
                    product_id
                )
            )

            if not product:
                continue

            score = item.get(
                "match_score",
                0,
            )

            try:
                score = int(
                    score
                )

            except (
                TypeError,
                ValueError,
            ):
                score = 0

            score = max(
                0,
                min(
                    score,
                    100,
                ),
            )

            if alternative:
                score = min(
                    score,
                    69,
                )

            reason = str(
                item.get(
                    "reason",
                    "",
                )
            ).strip()

            if not reason:
                if alternative:
                    reason = (
                        "A general "
                        "alternative that "
                        "fits the recipient "
                        "and budget."
                    )
                else:
                    reason = (
                        "Selected by "
                        "GiftWise AI based "
                        "on the recipient, "
                        "preferences, and "
                        "budget."
                    )

            parsed_products.append(
                create_product_response(
                    product,
                    score,
                    reason,
                )
            )

            used_ids.add(
                product_id
            )

            if (
                len(
                    parsed_products
                )
                >= limit
            ):
                break

        return parsed_products

    recommendations = (
        parse_items(
            parsed.get(
                "recommendations",
                [],
            ),
            alternative=False,
            limit=5,
        )
    )

    alternatives = (
        parse_items(
            parsed.get(
                "alternatives",
                [],
            ),
            alternative=True,
            limit=3,
        )
    )

    if match_found:
        alternatives = []

        if not recommendations:
            raise RuntimeError(
                "AI reported a match "
                "but returned no valid "
                "recommendations."
            )

    else:
        recommendations = []

    return (
        match_found,
        message,
        recommendations,
        alternatives,
    )


@router.post(
    "",
    response_model=(
        GiftRecommendationResponse
    ),
    status_code=(
        status.HTTP_200_OK
    ),
)
def recommend_gifts(
    payload:
        GiftRecommendationRequest,
):
    products = list(
        products_collection.find(
            {
                "is_active":
                    True,

                "stock_qty": {
                    "$gt": 0,
                },
            }
        )
    )

    if not products:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),

            detail=(
                "No available "
                "products found."
            ),
        )

    recommendation_source = (
        "ai"
    )

    try:
        (
            match_found,
            message,
            recommendations,
            alternatives,
        ) = ai_recommendations(
            products,
            payload,
        )

    except Exception:
        recommendation_source = (
            "fallback"
        )

        (
            match_found,
            message,
            recommendations,
            alternatives,
        ) = fallback_result(
            products,
            payload,
        )

    stored_results = []

    for item in recommendations:
        stored_results.append(
            {
                "product_id":
                    item.id,

                "match_score":
                    item
                    .match_score,

                "reason":
                    item.reason,

                "result_type":
                    "recommendation",
            }
        )

    for item in alternatives:
        stored_results.append(
            {
                "product_id":
                    item.id,

                "match_score":
                    item
                    .match_score,

                "reason":
                    item.reason,

                "result_type":
                    "alternative",
            }
        )

    recommendation_document = {
        "recipient":
            payload
            .recipient
            .strip(),

        "description":
            payload
            .description
            .strip(),

        "budget":
            payload.budget,

        "status":
            "completed",

        "source":
            recommendation_source,

        "match_found":
            match_found,

        "message":
            message,

        "results":
            stored_results,

        "created_at":
            datetime.now(
                timezone.utc
            ),
    }

    result = (
        recommendations_collection
        .insert_one(
            recommendation_document
        )
    )

    return (
        GiftRecommendationResponse(
            recommendation_id=(
                str(
                    result
                    .inserted_id
                )
            ),

            recipient=(
                payload.recipient
            ),

            description=(
                payload.description
            ),

            budget=(
                payload.budget
            ),

            match_found=(
                match_found
            ),

            message=(
                message
            ),

            recommendations=(
                recommendations
            ),

            alternatives=(
                alternatives
            ),
        )
    )


@router.get(
    "/admin/insights",
    response_model=(
        AIInsightsResponse
    ),
)
def get_ai_insights(
    admin_user: dict = Depends(
        require_admin
    ),
):
    recommendation_documents = list(
        recommendations_collection
        .find({})
        .sort(
            "created_at",
            -1,
        )
    )

    total_requests = len(
        recommendation_documents
    )

    if total_requests == 0:
        return AIInsightsResponse(
            total_requests=0,
            average_budget=0,
            average_match_score=0,
            most_common_recipient=None,
            most_recommended_product=None,
            top_products=[],
            recent_requests=[],
        )

    budgets: list[float] = []

    match_scores: list[int] = []

    recipients: Counter[
        str
    ] = Counter()

    product_counter: Counter[
        str
    ] = Counter()

    for document in (
        recommendation_documents
    ):
        budget = float(
            document.get(
                "budget",
                0,
            )
        )

        budgets.append(
            budget
        )

        recipient = (
            str(
                document.get(
                    "recipient",
                    "",
                )
            )
            .strip()
        )

        if recipient:
            recipients[
                recipient.lower()
            ] += 1

        for result in (
            document.get(
                "results",
                [],
            )
        ):
            score = int(
                result.get(
                    "match_score",
                    0,
                )
            )

            match_scores.append(
                score
            )

            product_id = str(
                result.get(
                    "product_id",
                    "",
                )
            )

            if product_id:
                product_counter[
                    product_id
                ] += 1

    average_budget = round(
        sum(
            budgets
        )
        / len(
            budgets
        ),
        2,
    )

    average_match_score = (
        round(
            sum(
                match_scores
            )
            / len(
                match_scores
            ),
            1,
        )
        if match_scores
        else 0
    )

    most_common_recipient = (
        None
    )

    if recipients:
        (
            recipient_key,
            _,
        ) = recipients.most_common(
            1
        )[0]

        most_common_recipient = (
            recipient_key.title()
        )

    top_products: list[
        AIInsightProduct
    ] = []

    for (
        product_id,
        count,
    ) in (
        product_counter
        .most_common(5)
    ):
        product_name = (
            "Unknown Product"
        )

        if ObjectId.is_valid(
            product_id
        ):
            product = (
                products_collection
                .find_one(
                    {
                        "_id":
                            ObjectId(
                                product_id
                            )
                    }
                )
            )

            if product:
                product_name = (
                    product.get(
                        "name",
                        "Unknown Product",
                    )
                )

        top_products.append(
            AIInsightProduct(
                product_id=(
                    product_id
                ),

                product_name=(
                    product_name
                ),

                recommendation_count=(
                    count
                ),
            )
        )

    most_recommended_product = (
        top_products[0]
        .product_name
        if top_products
        else None
    )

    recent_requests: list[
        AIInsightRecentRequest
    ] = []

    for document in (
        recommendation_documents[:8]
    ):
        results = (
            document.get(
                "results",
                [],
            )
        )

        scores = [
            int(
                result.get(
                    "match_score",
                    0,
                )
            )
            for result
            in results
        ]

        created_at = (
            document.get(
                "created_at"
            )
        )

        if not created_at:
            created_at = (
                datetime.now(
                    timezone.utc
                )
            )

        recent_requests.append(
            AIInsightRecentRequest(
                id=str(
                    document[
                        "_id"
                    ]
                ),

                recipient=str(
                    document.get(
                        "recipient",
                        "Unknown",
                    )
                ),

                description=str(
                    document.get(
                        "description",
                        "",
                    )
                ),

                budget=float(
                    document.get(
                        "budget",
                        0,
                    )
                ),

                recommendation_count=(
                    len(
                        results
                    )
                ),

                top_match_score=(
                    max(
                        scores
                    )
                    if scores
                    else 0
                ),

                created_at=(
                    created_at
                    .isoformat()
                ),
            )
        )

    return AIInsightsResponse(
        total_requests=(
            total_requests
        ),

        average_budget=(
            average_budget
        ),

        average_match_score=(
            average_match_score
        ),

        most_common_recipient=(
            most_common_recipient
        ),

        most_recommended_product=(
            most_recommended_product
        ),

        top_products=(
            top_products
        ),

        recent_requests=(
            recent_requests
        ),
    )