import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analysis import router as analysis_router
from app.api.health import router as health_router
from app.core.database import dispose_engines
from app.core.settings import get_settings

logger = logging.getLogger("codemind.startup")
settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Log provider configuration status at startup without exposing secret values
    groq_status = (
        "configured (model: qwen/qwen3.8-27b)"
        if settings.groq_api_key
        else "not configured (GROQ_API_KEY missing)"
    )
    hindsight_status = (
        "configured"
        if settings.hindsight_base_url and settings.hindsight_api_key
        else "not configured (HINDSIGHT_BASE_URL or HINDSIGHT_API_KEY missing)"
    )
    logger.info("CodeMind startup: Groq is %s", groq_status)
    logger.info("CodeMind startup: Hindsight is %s", hindsight_status)
    yield
    await dispose_engines()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Repository engineering intelligence API.",
    lifespan=lifespan,
)

# Allow the Next.js dev server (port 3000) to call the API during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
