import asyncio

import httpx

from app.core.database import normalize_database_url
from app.main import app


def request_health() -> httpx.Response:
    async def send_request() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            return await client.get("/api/health")

    return asyncio.run(send_request())


def test_health_is_explicit_when_database_is_not_configured(monkeypatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("GITHUB_APP_ID", raising=False)
    monkeypatch.delenv("GITHUB_PRIVATE_KEY", raising=False)
    monkeypatch.delenv("GITHUB_WEBHOOK_SECRET", raising=False)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("HINDSIGHT_BASE_URL", raising=False)
    monkeypatch.delenv("HINDSIGHT_API_KEY", raising=False)

    response = request_health()

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "degraded"
    assert payload["database"]["status"] == "not_configured"
    assert payload["integrations"] == {
        "github_app": "not_configured",
        "groq": "not_configured",
        "hindsight": "not_configured",
    }
    assert "database_url" not in response.text


def test_health_only_reports_provider_configuration_state(monkeypatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("GITHUB_APP_ID", "example-app-id")
    monkeypatch.setenv("GITHUB_PRIVATE_KEY", "never-return-this-value")
    monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", "never-return-this-value")
    monkeypatch.setenv("GROQ_API_KEY", "never-return-this-value")
    monkeypatch.setenv("HINDSIGHT_BASE_URL", "https://memory.invalid")
    monkeypatch.setenv("HINDSIGHT_API_KEY", "never-return-this-value")

    response = request_health()

    assert response.status_code == 200
    payload = response.json()
    assert payload["integrations"] == {
        "github_app": "configured",
        "groq": "configured",
        "hindsight": "configured",
    }
    assert "never-return-this-value" not in response.text


def test_normalize_database_url_requires_postgresql() -> None:
    assert normalize_database_url("postgres://user:pass@host/db") == (
        "postgresql+asyncpg://user:pass@host/db"
    )
    assert normalize_database_url("postgresql://user:pass@host/db") == (
        "postgresql+asyncpg://user:pass@host/db"
    )
    try:
        normalize_database_url("mysql://user:pass@host/db")
    except ValueError as exc:
        assert "PostgreSQL" in str(exc)
    else:
        raise AssertionError("Non-PostgreSQL DSNs must not be accepted.")
