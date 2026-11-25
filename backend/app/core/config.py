from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    APP_NAME: str = "ALLURE API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    MAX_UPLOAD_SIZE_MB: int = Field(default=10, ge=1, le=25)
    STORAGE_BUCKET: str = "skin-images"
    SIGNED_URL_TTL_SECONDS: int = Field(default=600, ge=60, le=3600)
    MIN_MODEL_CONFIDENCE: float = Field(default=0.65, ge=0.0, le=1.0)
    ALLURE_MODEL_PIPELINE: str = ""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL.strip() and self.SUPABASE_ANON_KEY.strip())

    @field_validator("SUPABASE_URL")
    @classmethod
    def strip_supabase_url(cls, value: str) -> str:
        return value.strip().rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
