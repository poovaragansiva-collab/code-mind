from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.database import check_database
from app.core.settings import get_settings

router = APIRouter(tags=["health"])


class DatabaseHealthResponse(BaseModel):
    status: Literal["connected", "not_configured", "unavailable"]


class IntegrationHealthResponse(BaseModel):
    github_app: Literal["configured", "not_configured"]
    groq: Literal["configured", "not_configured"]
    hindsight: Literal["configured", "not_configured"]


class HealthResponse(BaseModel):
    service: str
    status: Literal["healthy", "degraded"]
    database: DatabaseHealthResponse
    integrations: IntegrationHealthResponse
    checked_at: datetime


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    database = await check_database()
    integrations = IntegrationHealthResponse(
        github_app=(
            "configured"
            if settings.github_app_id
            and settings.github_private_key
            and settings.github_webhook_secret
            else "not_configured"
        ),
        groq="configured" if settings.groq_api_key else "not_configured",
        hindsight=(
            "configured"
            if settings.hindsight_base_url and settings.hindsight_api_key
            else "not_configured"
        ),
    )
    return HealthResponse(
        service="codemind-api",
        status="healthy" if database.status == "connected" else "degraded",
        database=DatabaseHealthResponse(status=database.status),
        integrations=integrations,
        checked_at=datetime.now(UTC),
    )
