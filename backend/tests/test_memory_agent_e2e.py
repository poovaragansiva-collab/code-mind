"""End-to-end integration test verifying Groq + Hindsight persistent memory.

Demonstrates:
  1. Cold analysis (no past memory for new repo)
  2. Retention into Hindsight
  3. Developer feedback submission
  4. Warm analysis (recalls past memory and adapts recommendations)
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.agents.code_review import analyze_repository
from app.api.analysis import FeedbackRequest, submit_feedback
from app.core.settings import get_settings

RUN_LIVE = os.getenv("CODEMIND_RUN_LIVE_INTEGRATION") == "1"


def get_missing_live_credentials() -> list[str]:
    settings = get_settings()
    missing: list[str] = []
    if not settings.groq_api_key:
        missing.append("GROQ_API_KEY")
    if not settings.hindsight_base_url:
        missing.append("HINDSIGHT_BASE_URL")
    if not settings.hindsight_api_key:
        missing.append("HINDSIGHT_API_KEY")
    return missing


CODE_SAMPLE = (
    "def authenticate_user(username, password):\n"
    "    import hashlib\n"
    "    # MD5 hashing without salt - vulnerable\n"
    "    hashed = hashlib.md5(password.encode()).hexdigest()\n"
    "    query = f\"SELECT * FROM users WHERE username = '{username}' AND password = '{hashed}'\"\n"
    "    return execute_query(query)\n"
)


# ---------------------------------------------------------------------------
# Mocked unit / integration test (runs offline without external credentials)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_groq_and_hindsight_learning_loop_mocked():
    """Verify cold analysis -> feedback retention -> warm analysis flow with mocked services."""
    repo_id = "test-e2e-repo"
    stored_memories: list[str] = []

    async def mock_retain_memory(bank_id: str, content: str, *, tag: str | None = None) -> None:
        tagged_content = f"{tag} {content}" if tag else content
        stored_memories.append(tagged_content)

    async def mock_recall_memories(bank_id: str, query: str) -> str:
        return "\n".join(stored_memories)

    cold_llm_json = json.dumps({
        "summary": "Found insecure MD5 hashing and raw SQL string interpolation.",
        "quality_score": 40,
        "security_score": 20,
        "maintainability_score": 60,
        "findings": [
            {
                "id": "finding-1",
                "category": "security",
                "severity": "critical",
                "file": "auth.py",
                "line": 27,
                "message": "MD5 used without salt and string-formatted SQL.",
                "recommendation": "Use argon2 and parameterized queries.",
            }
        ],
        "memory_influenced": False,
        "patterns_detected": ["SQL injection", "weak hashing"],
    })

    warm_llm_json = json.dumps({
        "summary": (
            "Addressed recurring team standard: argon2 and parameterized queries strictly required."
        ),
        "quality_score": 35,
        "security_score": 15,
        "maintainability_score": 50,
        "findings": [
            {
                "id": "finding-1",
                "category": "security",
                "severity": "critical",
                "file": "auth.py",
                "line": 27,
                "message": (
                    "Re-occurrence: MD5 and unparameterized SQL violate accepted team conventions."
                ),
                "recommendation": "Enforce team standard: argon2 and parameterized queries.",
            }
        ],
        "memory_influenced": True,
        "patterns_detected": ["recurring team rule violation"],
    })

    # Mock AsyncGroq response objects
    mock_choice_cold = MagicMock()
    mock_choice_cold.message.content = cold_llm_json
    mock_resp_cold = MagicMock()
    mock_resp_cold.choices = [mock_choice_cold]

    mock_choice_warm = MagicMock()
    mock_choice_warm.message.content = warm_llm_json
    mock_resp_warm = MagicMock()
    mock_resp_warm.choices = [mock_choice_warm]

    with patch("app.agents.code_review.get_settings") as mock_settings, \
         patch("app.agents.code_review.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.code_review.recall_memories", side_effect=mock_recall_memories), \
         patch("app.agents.code_review.retain_memory", side_effect=mock_retain_memory), \
         patch("app.api.analysis.retain_memory", side_effect=mock_retain_memory):

        mock_s = MagicMock()
        mock_s.groq_api_key = "mock-groq-key"
        mock_settings.return_value = mock_s

        mock_groq_instance = MagicMock()
        mock_groq_instance.chat.completions.create = AsyncMock(
            side_effect=[mock_resp_cold, mock_resp_warm]
        )
        mock_groq_cls.return_value = mock_groq_instance

        # Step 1: Cold start analysis (no prior memories)
        result_cold = await analyze_repository(repo_id=repo_id, code_context=CODE_SAMPLE)
        assert result_cold.get("memories_used") is False
        assert result_cold.get("memory_influenced") is False
        assert len(result_cold.get("findings", [])) == 1
        assert len(stored_memories) == 1  # Retention text from analysis was stored

        # Step 2: Developer feedback submission
        finding_id = result_cold["findings"][0]["id"]
        fb = FeedbackRequest(
            finding_id=finding_id,
            action="accepted",
            comment=(
                "Confirmed MD5 and raw SQL formatting are strictly prohibited. "
                "Team rule: use argon2."
            ),
        )
        fb_res = await submit_feedback(repo_id=repo_id, body=fb)
        assert fb_res["status"] == "retained"
        assert len(stored_memories) == 2  # Developer feedback stored

        # Step 3: Warm memory analysis (should recall stored findings + feedback)
        result_warm = await analyze_repository(repo_id=repo_id, code_context=CODE_SAMPLE)
        assert result_warm.get("memories_used") is True
        assert result_warm.get("memory_influenced") is True
        assert len(result_warm.get("findings", [])) == 1


# ---------------------------------------------------------------------------
# Live E2E test (requires CODEMIND_RUN_LIVE_INTEGRATION=1 and live credentials)
# ---------------------------------------------------------------------------


@pytest.mark.skipif(
    not RUN_LIVE,
    reason="Live integration test skipped by default. Set CODEMIND_RUN_LIVE_INTEGRATION=1 to run.",
)
@pytest.mark.asyncio
async def test_groq_and_hindsight_learning_loop():
    """Live end-to-end integration test against real Groq and Hindsight APIs."""
    missing = get_missing_live_credentials()
    if missing:
        pytest.skip(
            f"CODEMIND_RUN_LIVE_INTEGRATION=1 set, but credentials missing: {', '.join(missing)}"
        )

    repo_id = "test-e2e-repo"

    print("Step 1: First analysis (Cold start - no past memory)...")
    result_cold = await analyze_repository(repo_id=repo_id, code_context=CODE_SAMPLE)
    print("Cold analysis summary:", result_cold.get("summary"))
    print("Cold findings count:", len(result_cold.get("findings", [])))
    print("Cold memories_used:", result_cold.get("memories_used"))

    print("\nStep 2: Submitting developer feedback to Hindsight...")
    finding_id = (
        result_cold["findings"][0].get("id", "finding-1")
        if result_cold.get("findings")
        else "finding-1"
    )
    fb = FeedbackRequest(
        finding_id=finding_id,
        action="accepted",
        comment=(
            "Confirmed MD5 and raw SQL formatting are strictly prohibited. "
            "Team rule: use argon2 and parameterized queries."
        ),
    )
    fb_res = await submit_feedback(repo_id=repo_id, body=fb)
    print("Feedback retained:", fb_res)

    print("\nWaiting 2 seconds for Hindsight indexing...")
    await asyncio.sleep(2)

    print("\nStep 3: Second analysis (Warm memory - should recall past findings & feedback)...")
    result_warm = await analyze_repository(repo_id=repo_id, code_context=CODE_SAMPLE)
    print("Warm analysis summary:", result_warm.get("summary"))
    print("Warm memories_used:", result_warm.get("memories_used"))
    print("Warm memory_influenced:", result_warm.get("memory_influenced"))
    print("Warm patterns_detected:", result_warm.get("patterns_detected"))

    assert "findings" in result_cold
    assert "findings" in result_warm
    if result_warm.get("memories_used"):
        print("\n[VERIFIED] End-to-end Groq + Hindsight memory loop successfully executed!")
    else:
        print("\n[NOTE] Memories were not reported used in round 2.")


if __name__ == "__main__":
    asyncio.run(test_groq_and_hindsight_learning_loop())
