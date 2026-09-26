import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "GiftWise AI"
    API_PREFIX = "/api"

    MONGODB_URL = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017",
    )

    DATABASE_NAME = os.getenv(
        "DATABASE_NAME",
        "giftwise_ai",
    )

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-key",
    )

    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60


settings = Settings()