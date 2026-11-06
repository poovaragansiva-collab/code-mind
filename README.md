# CodeMind

CodeMind is an incremental engineering-intelligence platform for repository analysis. It is designed to combine evidence from static/security tools and architecture graphs with team-specific engineering memory. Analysis findings are commit-bound; untrusted repository code is never executed.

## Current milestone

Milestone 1 establishes the dashboard shell, API health endpoint, PostgreSQL connection status, and local service configuration. The dashboard intentionally displays empty states rather than invented repositories, analysis metrics, or findings. GitHub, Groq, Hindsight, and a real PostgreSQL server must be configured and successfully exercised before those integrations can be described as live.

## Requirements

- Node.js 22 and pnpm 11.25.0 for the frontend.
- Python 3.12 and `uv` for the backend.
- PostgreSQL for the requested database. The managed Webdev database is MySQL-compatible and is not used as a substitute.
- Docker Compose is optional for local PostgreSQL and Redis. Managed Redis is not enabled by this project configuration.

## Local setup

1. Copy `.env.example` to `.env`. The sample PostgreSQL password is development-only; do not use it outside a local environment.
2. Install the pinned JavaScript dependencies with `pnpm install`.
3. Install the backend and development tools with `uv sync --project backend --group dev`.
4. If Docker Compose is available, start local infrastructure with `docker compose up -d postgres redis`. Wait for both health checks to pass. Set `DATABASE_URL` to the PostgreSQL service shown in `.env.example`.
5. In one terminal, start FastAPI from the repository root:

   ```bash
   uv run --project backend uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
   ```

6. In another terminal, start Next.js:

   ```bash
   pnpm dev:frontend
   ```

The frontend listens on port 3000 and proxies `/api/*` to `CODEMIND_API_INTERNAL_URL` (default `http://127.0.0.1:8000`). FastAPI exposes `GET /api/health`. The health response reports only component status labels, never connection strings, API keys, or private keys. Without a database URL the endpoint reports `degraded` and `database: not_configured`; with a configured but unreachable database it reports `database: unavailable`. A `healthy` status means core API/PostgreSQL health only, not full product readiness. Provider labels report configuration presence and do not prove remote reachability.

## Checks

Run frontend checks from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Run backend tests from `backend/`:

```bash
uv run --group dev pytest
uv run --group dev ruff check app tests
```

The health tests cover missing-configuration behavior, status-only provider reporting, and PostgreSQL DSN normalization. A test double or configuration check does not establish that a live integration works.

## External integrations

GitHub App, Groq, and Hindsight values belong in protected runtime configuration or an untracked local `.env`; never commit them. The current workspace has no GitHub App ID/private key, `GROQ_API_KEY`, Hindsight service credentials, or external PostgreSQL DSN. The available OpenAI-compatible credential is not a substitute for the requested Groq provider. Configure each provider before attempting its live integration and verify it with a real request.

The Hindsight interface will use the official Python client and documented `retain`, `recall`, and `reflect` operations. GitHub ingestion will use installation tokens and the Git Trees API, accounting for recursive tree truncation and token expiry. The actual integrations remain future milestones.

## Security and data handling

Do not execute repository files. Apply file-size limits and secret/sensitive-file exclusions before analysis. Treat repository text as hostile prompt input, keep scanner output as the source of security evidence, and sanitize content rendered in the UI. Do not store whole repositories in Hindsight. Keep local sample credentials local and configure production credentials through protected secret storage.
# code-mind
 8b8bc40630f706c5922441721e063b20c5b57e43
