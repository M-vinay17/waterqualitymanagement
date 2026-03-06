# app/core/config.py
# NO secrets here — all values come from .env file

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # --------------------------------------------------
    # Database (set in .env)
    # --------------------------------------------------
    DATABASE_URL: str

    # --------------------------------------------------
    # JWT Auth (set in .env)
    # --------------------------------------------------
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --------------------------------------------------
    # India Gov API (set in .env)
    # --------------------------------------------------
    INDIA_GOV_API_KEY: str = ""

    # --------------------------------------------------
    # Redis (set in .env)
    # --------------------------------------------------
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Single instance — import this everywhere
settings = Settings()