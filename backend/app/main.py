from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.database import dispose_engines
from app.core.settings import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield
    await dispose_engines()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Repository engineering intelligence API.",
    lifespan=lifespan,
)
app.include_router(health_router, prefix="/api")
