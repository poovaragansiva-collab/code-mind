from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "CodeMind API"
    environment: str = "development"
    database_url: str | None = None
    database_connect_timeout_seconds: float = 2.0
    github_app_id: str | None = None
    github_private_key: str | None = None
    github_webhook_secret: str | None = None
    groq_api_key: str | None = None
    hindsight_base_url: str | None = None
    hindsight_api_key: str | None = None


def get_settings() -> Settings:
    return Settings()
