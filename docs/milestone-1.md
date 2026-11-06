# Milestone 1 — Foundation and health

**Status: in progress.** The Next.js dashboard shell and all nine product page routes are available. The FastAPI service exposes `GET /api/health`, and the Next.js server proxies `/api/*` to the separately configured API listener. The health response contains status labels only; it never returns a DSN, API key, or private key.

The health route executes `SELECT 1` with a bounded timeout when `DATABASE_URL` is present. It reports `database.status` as `connected`, `unavailable`, or `not_configured`; `status` is `healthy` only when PostgreSQL responds. This is core API/PostgreSQL health, not full product readiness or proof that any remote provider is reachable. Provider labels report configuration presence only. The endpoint itself returns HTTP 200 for diagnostics even when degraded, so its status field—not the HTTP code—is the database readiness signal. PostgreSQL URLs using `postgres://` or `postgresql://` are normalized to the asyncpg driver. Non-PostgreSQL DSNs are rejected.

The migration directory, async SQLAlchemy declarative base, and Alembic environment are ready for future schema changes. No application tables are created in this milestone. `docker-compose.yml` defines local development-only PostgreSQL and Redis services; it does not enable managed MySQL or managed Redis.

The initial dashboard uses explicit empty states rather than fabricated repositories, findings, risk scores, or activity. The current sandbox has no PostgreSQL service/DSN or GitHub App, Groq, or Hindsight credentials, so those live integrations are not claimed. The health API's provider configuration indicators report only whether the minimum configured values are present; they do not prove that a remote service is reachable.

## Local check commands

From the repository root, run `bash scripts/check.sh`. For local infrastructure, copy `.env.example` to `.env` and run `docker compose up -d postgres redis` when Docker Compose is available. The sample password is development-only.
