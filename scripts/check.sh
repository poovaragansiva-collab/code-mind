#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

pnpm typecheck
pnpm lint
pnpm build
(
  cd "$ROOT/backend"
  uv run --group dev pytest -q
  uv run --group dev ruff check app tests
)
