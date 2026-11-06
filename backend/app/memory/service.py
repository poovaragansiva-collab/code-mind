"""Hindsight memory service — retain, recall, and reflect for CodeMind.

Each repository gets its own memory bank keyed by a sanitized repo_id.
Memory banks hold engineering decisions, bug history, code-quality patterns,
and developer feedback so every future analysis is informed by the past.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from hindsight_client import Hindsight

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

# Cache of bank_ids confirmed to exist in Hindsight
_CONFIRMED_BANKS: set[str] = set()

# Reusable client singleton
_client_instance: Hindsight | None = None


def sanitize_bank_id(raw_id: str) -> str:
    """Normalize a repository identifier to a safe Hindsight bank_id.

    Replaces slashes, colons, dots, and invalid characters with underscores.
    Example: 'poovaragansiva-collab/code-mind' -> 'repo_poovaragansiva-collab_code-mind'
    """
    clean = re.sub(r"[^a-zA-Z0-9_\-]", "_", raw_id)
    if not clean.startswith("repo_"):
        clean = f"repo_{clean}"
    return clean[:64]


def get_hindsight_client() -> Hindsight:
    """Return a cached Hindsight client configured from application settings."""
    global _client_instance
    if _client_instance is None:
        s = get_settings()
        if not s.hindsight_base_url or not s.hindsight_api_key:
            raise RuntimeError(
                "Hindsight is not configured. "
                "Set HINDSIGHT_BASE_URL and HINDSIGHT_API_KEY in your .env file."
            )
        _client_instance = Hindsight(
            base_url=s.hindsight_base_url,
            api_key=s.hindsight_api_key,
        )
    return _client_instance


async def ensure_bank_exists(client: Hindsight, bank_id: str) -> None:
    """Idempotently ensure a memory bank exists before retaining or querying."""
    if bank_id in _CONFIRMED_BANKS:
        return
    try:
        await client.acreate_bank(bank_id=bank_id)
        _CONFIRMED_BANKS.add(bank_id)
        logger.info("Created Hindsight memory bank %r", bank_id)
    except Exception as exc:
        # Bank may already exist
        _CONFIRMED_BANKS.add(bank_id)
        logger.debug("Bank %r already exists or creation note: %s", bank_id, exc)


def _format_recall_result(res: Any) -> str:
    """Format Hindsight recall response into clean context for LLM prompt."""
    if not res:
        return ""
    if hasattr(res, "to_prompt_string"):
        prompt_str = res.to_prompt_string()
        if prompt_str and prompt_str.strip():
            return prompt_str.strip()
    if hasattr(res, "results") and res.results:
        items = []
        for r in res.results:
            text = getattr(r, "text", str(r))
            if text:
                items.append(f"- {text}")
        if items:
            return "\n".join(items)
    return str(res)


# ---------------------------------------------------------------------------
# Public memory operations
# ---------------------------------------------------------------------------


async def retain_memory(bank_id: str, content: str) -> None:
    """Store a piece of engineering knowledge in the given memory bank.

    Args:
        bank_id: Raw or clean repo identifier.
        content: Free-form text — findings, decisions, feedback, bug summaries.
    """
    safe_bank_id = sanitize_bank_id(bank_id)
    client = get_hindsight_client()
    await ensure_bank_exists(client, safe_bank_id)
    try:
        await client.aretain(bank_id=safe_bank_id, content=content)
        logger.info("Retained memory in bank %r (%d chars)", safe_bank_id, len(content))
    except Exception:
        logger.exception("Failed to retain memory in bank %r", safe_bank_id)
        raise


async def recall_memories(bank_id: str, query: str) -> str:
    """Retrieve raw memory snippets relevant to the query.

    Uses Hindsight's multi-strategy retrieval (semantic + BM25 + entity graph
    + temporal reasoning fused with RRF).

    Args:
        bank_id: Raw or clean repo identifier.
        query: What to look for — symptoms, file names, error messages, etc.

    Returns:
        Formatted memory prompt text, or empty string if none found.
    """
    safe_bank_id = sanitize_bank_id(bank_id)
    client = get_hindsight_client()
    await ensure_bank_exists(client, safe_bank_id)
    try:
        raw_res = await client.arecall(bank_id=safe_bank_id, query=query)
        memories = _format_recall_result(raw_res)
        logger.info(
            "Recalled %d chars from bank %r for query %r",
            len(memories),
            safe_bank_id,
            query[:60],
        )
        return memories
    except Exception:
        logger.exception("Failed to recall memories from bank %r", safe_bank_id)
        return ""


async def reflect_on_memories(bank_id: str, query: str) -> str:
    """Generate a synthesised insight from the memory bank.

    Unlike ``recall_memories``, this triggers Hindsight's deeper analytical
    reasoning layer and returns a coherent explanation.

    Args:
        bank_id: Raw or clean repo identifier.
        query: The analytical question, e.g. "What are our most common bugs?".

    Returns:
        Synthesised insight text, or an empty string on failure.
    """
    safe_bank_id = sanitize_bank_id(bank_id)
    client = get_hindsight_client()
    await ensure_bank_exists(client, safe_bank_id)
    try:
        result = await client.areflect(bank_id=safe_bank_id, query=query)
        insight: str = getattr(result, "text", str(result)) if not isinstance(result, str) else result
        logger.info("Reflected %d chars from bank %r", len(insight), safe_bank_id)
        return insight
    except Exception:
        logger.exception("Failed to reflect on memories in bank %r", safe_bank_id)
        return ""
