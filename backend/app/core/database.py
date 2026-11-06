import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.settings import get_settings

_engines: dict[str, AsyncEngine] = {}


class DatabaseHealth:
    def __init__(self, status: str) -> None:
        self.status = status


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return "postgresql+asyncpg://" + database_url.removeprefix("postgres://")
    if database_url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + database_url.removeprefix("postgresql://")
    if database_url.startswith("postgresql+asyncpg://"):
        return database_url
    raise ValueError("DATABASE_URL must use PostgreSQL.")


def _engine_for(database_url: str) -> AsyncEngine:
    engine = _engines.get(database_url)
    if engine is None:
        timeout = get_settings().database_connect_timeout_seconds
        engine = create_async_engine(
            normalize_database_url(database_url),
            pool_pre_ping=True,
            pool_timeout=timeout,
            connect_args={"timeout": timeout},
        )
        _engines[database_url] = engine
    return engine


async def check_database() -> DatabaseHealth:
    database_url = get_settings().database_url
    if not database_url:
        return DatabaseHealth(status="not_configured")

    try:
        engine = _engine_for(database_url)
        async with asyncio.timeout(get_settings().database_connect_timeout_seconds):
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
        return DatabaseHealth(status="connected")
    except Exception:
        return DatabaseHealth(status="unavailable")


async def dispose_engines() -> None:
    engines = list(_engines.values())
    _engines.clear()
    for engine in engines:
        await engine.dispose()
