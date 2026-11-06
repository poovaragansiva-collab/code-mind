# CodeMind Implementation Plan

## Scope and delivery approach

Build CodeMind as an incremental monorepo and begin with Milestone 1 only. The complete product scope remains the attached CodeMind specification: a Next.js/TypeScript dashboard; Python/FastAPI APIs; PostgreSQL persistence; Redis/Celery background work; read-only GitHub App ingestion; evidence-based quality, security, architecture, and heuristic risk analysis; tenant-isolated Hindsight memory; Groq-based structured reasoning; developer feedback; tests, setup instructions, and documentation. Do not use UI fixtures as if they were live repository or analysis data. Fixtures, if needed for component work, will be conspicuously labelled and confined to frontend development.

The initialized project is an empty flexible Webdev workspace. Keep the requested stack instead of replacing it with the platform's default stack. The workspace is configured with a server and Preview on port 3000. Plan a Next.js frontend under `frontend/` and a FastAPI service under `backend/`, with a named Preview endpoint for the API if the runtime supports it. Use relative browser-facing URLs and avoid deriving public URLs from the internal request Host. For production, use a documented container entry point that serves the compiled frontend and FastAPI routes; confirm the exact build/deploy path before declaring deployment complete.

## Architecture and repository structure

- `frontend/`: Next.js App Router, TypeScript, Tailwind, shadcn/ui, Lucide, and Recharts. The first milestone establishes the shared layout, navigation, responsive dark theme, and empty states that report the actual unavailable state instead of fabricated metrics.
- `backend/app/api/`: versioned FastAPI routes, including `/api/health` in Milestone 1 and the repository, analysis, architecture, memory, feedback, and webhook routes in later milestones.
- `backend/app/core/`: settings, logging, error handling, resource limits, and security boundaries.
- `backend/app/models/`, `schemas/`, and migrations: SQLAlchemy persistence models, Pydantic request/response contracts, and additive PostgreSQL migrations. Persist analysis against immutable commit SHAs and enforce organization/repository ownership.
- `backend/app/services/`: authentication, GitHub, ingestion, parsing, quality/security/architecture analysis, prediction, report, and orchestration services.
- `backend/app/memory/`: an isolated Hindsight `MemoryService` interface and its official-client adapter.
- `backend/app/analysis/`, `github/`, and `workers/`: deterministic scanners/graph construction, GitHub API access, and asynchronous analysis jobs.
- `backend/tests/`: unit and API tests; later add integration and end-to-end scenarios where the required services are available.
- `docs/` and `scripts/`: setup, GitHub App configuration, service checks, reproducible memory demonstration, and operational guidance.
- Root files: `docker-compose.yml`, `.env.example`, pinned package metadata/lockfiles, `README.md`, and container build configuration when the deploy shape is ready.

The backend will be the authority for repository contents and findings. Static analyzers and dependency scanners provide verifiable evidence; the LLM may explain or prioritize those findings but cannot invent scanner evidence. Architecture findings will distinguish graph-derived facts from broader interpretation. Risk assessments will label heuristic levels and confidence as estimates, not validated probabilities. Repository text is untrusted input: it is size-limited, sanitized, never executed, and never treated as instructions.

## Milestones

1. **Scaffolding and health:** create the monorepo, initial dashboard shell, FastAPI application and `/api/health`, PostgreSQL settings/connection boundary and initial migration structure, `.env.example`, local service definitions, and starter tests. Show the database as unavailable until a real PostgreSQL connection is configured; do not show fabricated product metrics.
2. **GitHub and ingestion:** implement GitHub App installation authentication, read-only repository access, metadata/default branch/commit/tree retrieval, safe file filtering and bounded ingestion, language/framework/dependency discovery, and module inventory. Handle pagination, retries, API rate limits, timeouts, and incomplete recursive trees. Never execute repository code.
3. **Analysis engines:** integrate real Ruff, ESLint, Semgrep, and available dependency scanners; build an explainable import/dependency graph; report structured source evidence. Add bounded heuristic risks based on observable inputs only.
4. **Hindsight:** implement isolated repository/organization banks through the official Hindsight Python client, retrieve relevant memories before analysis, retain validated developer feedback afterward, and build a repeatable before/after memory scenario. Never retain whole repositories, secrets, unnecessary personal data, or unverified claims.
5. **AI and prediction:** implement a configurable provider boundary with Groq as requested, prompt templates separated from code, supported structured JSON output validated by Pydantic, and robust timeout/rate-limit/invalid-output handling. Combine only repository facts, scanner findings, graph evidence, and relevant memories.
6. **Dashboard integration and handoff:** connect pages to actual API results; complete feedback, report history, security/authentication and tenant isolation; add unit/API/ingestion/memory/engine/component/end-to-end tests; document setup, GitHub App permissions, missing external services, deployment, and the reproducible memory demonstration. After each milestone, run available tests, fix issues, update documentation, and report delivered functionality and remaining blockers.

## Design direction

**Design movement:** restrained terminal-inspired engineering console, using editorial hierarchy rather than a generic admin template.

**Core principles:** evidence before inference; dense information with clear breathing room; quiet, high-contrast surfaces; explicit state and uncertainty.

**Color philosophy:** charcoal surfaces signal a focused engineering workspace. Cool slate text maintains legibility; a precise electric-blue accent marks navigation and actionable evidence, with violet reserved for memory and cross-analysis context. Severity uses restrained semantic colors, never color alone.

**Layout paradigm:** a persistent narrow navigation rail, a compact repository/commit context strip, and wide report panes. Findings use a readable primary column with a supporting evidence/details rail on larger screens; smaller screens collapse that rail into a disclosure panel.

**Signature elements:** a small node-and-bracket CodeMind mark; commit-SHA chips that visually bind analysis to immutable source; subtle memory-reference markers linking a recommendation to the prior engineering decision that informed it.

**Interaction and motion:** keyboard-accessible controls, clear focus rings, explicit loading/empty/error states, and source-linked evidence. Use short opacity/position transitions only for panel changes; honor reduced-motion settings and avoid decorative animation.

**Typography:** Geist for interface text and Geist Mono for code, commit SHAs, paths, and compact technical metadata. Use a consistent scale with clear distinction between page title, section label, finding title, and evidence text.

**Brand essence:** “Repository intelligence grounded in code evidence and engineering memory.” Personality: rigorous, calm, contextual.

**Brand voice:** direct and evidence-led. Example lines: “Review the commit, not just the repository.” “This recommendation reflects a prior team decision.”

**Wordmark and mark:** a custom compact symbol combining two connected dependency nodes inside an open code-bracket silhouette, paired with a clean CodeMind wordmark; do not use a generic default-font title as the logo.

**Signature brand color:** electric blue (`#5AA9FF`), used sparingly for active navigation and primary actions.

## Current constraints and integration truth

Environment inspection found Python 3.12, Node.js 22, pnpm 11, and an OpenAI-compatible key, but no Docker, PostgreSQL/`psql`, Redis, Semgrep, or Ruff executable. Do not use the available OpenAI credential as a substitute for the requested Groq integration. `GROQ_API_KEY`, GitHub App credentials, Hindsight API credentials, and an external `DATABASE_URL` are absent. Accordingly, live GitHub, Groq, Hindsight, PostgreSQL, Redis, and Celery behavior must remain clearly unverified until configured and exercised.

The Webdev managed database is MySQL-compatible, while this specification requires PostgreSQL; therefore the project will not enable or present the managed MySQL service as PostgreSQL. PostgreSQL must be supplied through a real external DSN, with local Compose support documented. Docker is currently unavailable in the workspace, so the local multi-service stack cannot yet be claimed tested. The requested Redis/Celery setup will be represented as a configurable service boundary and local Compose configuration; managed Redis will not be enabled without explicit user approval because it has recurring and usage-based Cloud-balance charges, and its data can be deleted if the balance is exhausted.

Current integration references verified for the plan: [Hindsight Python client](https://hindsight.vectorize.io/sdks/python), [Groq structured outputs](https://console.groq.com/docs/structured-outputs), [GitHub App installation authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation), and [Git Trees API](https://docs.github.com/rest/git/trees). The Hindsight client documents `Hindsight(base_url=...)`, `retain`, `recall`, and `reflect`; GitHub installation tokens expire after one hour; recursive tree responses can be truncated and must be handled; Groq schema-constrained output is available only on selected models.

## Project completion policy

Start implementation only after the user reviews this plan. After approval, create `TODO.md` with the complete product outcomes and acceptance clauses from the supplied specification, then configure diagnostics and begin Milestone 1. Do not claim unconfigured integrations are live, do not turn on paid managed Redis without explicit approval, do not switch away from PostgreSQL, and do not publish unless separately authorized and successfully completed.