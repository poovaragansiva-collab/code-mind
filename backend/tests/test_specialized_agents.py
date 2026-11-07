"""Unit tests for CodeMind specialized agents (Architecture, Security, CodeReviewer).

Tests:
  - Valid LLM responses and schema parsing.
  - Markdown-fenced and malformed LLM output fallback.
  - Error handling when credentials are missing.
  - P0-P3 priority classification on code reviewer.
  - Hindsight memory retention tagging.
"""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.architecture import analyze_architecture
from app.agents.code_review import _normalize_finding_priority, analyze_repository
from app.agents.security import analyze_security
from app.memory.service import (
    TAG_ADR,
    TAG_SECURITY_RULE,
)

SAMPLE_CODE = """
def process_user_data(user_id, raw_query):
    import sqlite3
    db = sqlite3.connect("app.db")
    # Direct SQL injection vulnerability
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND {raw_query}"
    return db.execute(query).fetchall()
"""


# ---------------------------------------------------------------------------
# 1. Software Architect Agent Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_software_architect_valid_response():
    """Verify SoftwareArchitect parses valid responses and extracts ADRs."""
    mock_llm_json = json.dumps({
        "summary": "Clean layered design with potential presentation-layer coupling.",
        "architecture_score": 82,
        "modularity": {
            "coupling_level": "low",
            "cohesion_level": "high",
            "boundary_health": "strong",
            "assessment": "High modularity observed.",
        },
        "dependency_analysis": {
            "circular_risks": [],
            "coupling_hotspots": ["app.api.analysis"],
            "boundary_violations": [],
        },
        "api_contract_consistency": {
            "status": "consistent",
            "notes": "Pydantic request/response contracts match endpoint definitions.",
        },
        "technical_debt": [
            {"component": "app.core.database", "risk": "Connection pooling drift", "effort": "low"}
        ],
        "trade_offs": [
            {
                "decision": "Use asyncpg for PostgreSQL",
                "benefit": "High async throughput",
                "drawback": "Requires async session lifecycle discipline",
            }
        ],
        "findings": [
            {
                "id": "arch-1",
                "severity": "medium",
                "category": "architecture",
                "component": "app.api.analysis",
                "evidence": "from app.agents.code_review import analyze_repository",
                "message": "Controller imports agent orchestration directly.",
                "recommendation": "Decouple via orchestration interface.",
            }
        ],
        "adrs_extracted": [
            {
                "title": "Use asyncpg with SQLAlchemy 2.0",
                "status": "accepted",
                "context": "Need non-blocking DB access for FastAPI.",
                "consequences": "All query operations must be asynchronous.",
            }
        ],
        "memory_influenced": False,
    })

    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content=mock_llm_json))]

    retained_memories = []

    async def mock_retain(bank_id: str, content: str, *, tag: str | None = None) -> None:
        retained_memories.append({"bank_id": bank_id, "content": content, "tag": tag})

    with patch("app.agents.architecture.get_settings") as mock_settings, \
         patch("app.agents.architecture.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.architecture.recall_memories", return_value=""), \
         patch("app.agents.architecture.retain_memory", side_effect=mock_retain):

        mock_s = MagicMock(groq_api_key="mock-key")
        mock_settings.return_value = mock_s

        groq_inst = MagicMock()
        groq_inst.chat.completions.create = AsyncMock(return_value=mock_resp)
        mock_groq_cls.return_value = groq_inst

        result = await analyze_architecture("org/test-repo", SAMPLE_CODE)

        assert result["architecture_score"] == 82
        assert result["modularity"]["coupling_level"] == "low"
        assert len(result["findings"]) == 1
        assert "evidence" in result["findings"][0]
        assert len(result["adrs_extracted"]) == 1
        assert len(retained_memories) == 1
        assert retained_memories[0]["tag"] == TAG_ADR


@pytest.mark.asyncio
async def test_software_architect_malformed_json_fallback():
    """Verify SoftwareArchitect gracefully falls back on unparseable LLM output."""
    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content="Malformed plain text without JSON."))]

    with patch("app.agents.architecture.get_settings") as mock_settings, \
         patch("app.agents.architecture.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.architecture.recall_memories", return_value=""), \
         patch("app.agents.architecture.retain_memory", new_callable=AsyncMock):

        mock_settings.return_value = MagicMock(groq_api_key="mock-key")
        groq_inst = MagicMock()
        groq_inst.chat.completions.create = AsyncMock(return_value=mock_resp)
        mock_groq_cls.return_value = groq_inst

        result = await analyze_architecture("org/test-repo", SAMPLE_CODE)
        assert "architecture_score" in result
        assert "modularity" in result
        assert isinstance(result["findings"], list)


@pytest.mark.asyncio
async def test_software_architect_missing_api_key():
    """Verify SoftwareArchitect raises RuntimeError when GROQ_API_KEY is not set."""
    with patch("app.agents.architecture.get_settings") as mock_settings:
        mock_settings.return_value = MagicMock(groq_api_key=None)
        with pytest.raises(RuntimeError, match="GROQ_API_KEY is not set"):
            await analyze_architecture("org/test-repo", SAMPLE_CODE)


# ---------------------------------------------------------------------------
# 2. Security Engineer Agent Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_security_engineer_valid_response():
    """Verify SecurityEngineer parses vulnerabilities and retains security rules."""
    mock_llm_json = json.dumps({
        "threat_summary": "Critical SQL injection detected in process_user_data.",
        "security_score": 25,
        "risk_matrix": {"critical": 1, "high": 0, "medium": 0, "low": 0},
        "findings": [
            {
                "id": "sec-1",
                "severity": "critical",
                "cwe": "CWE-89",
                "owasp_category": "A03:2021-Injection",
                "file": "app/db.py",
                "line": 6,
                "evidence": "query = f\"SELECT * FROM users WHERE id = '{user_id}'\"",
                "explanation": "Direct f-string SQL interpolation enables command injection.",
                "remediation": "Use parameterized queries: db.execute(..., (user_id,))",
            }
        ],
        "threat_model": [
            {
                "threat": "SQL Data Exfiltration",
                "vector": "Unsanitized raw_query parameter",
                "mitigation": "Enforce strict ORM or parameterized driver queries",
            }
        ],
        "ai_security_risks": [],
        "compliance_flags": ["CWE-89 SQL Injection"],
        "memory_influenced": False,
    })

    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content=mock_llm_json))]

    retained_memories = []

    async def mock_retain(bank_id: str, content: str, *, tag: str | None = None) -> None:
        retained_memories.append({"bank_id": bank_id, "content": content, "tag": tag})

    with patch("app.agents.security.get_settings") as mock_settings, \
         patch("app.agents.security.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.security.recall_memories", return_value=""), \
         patch("app.agents.security.retain_memory", side_effect=mock_retain):

        mock_s = MagicMock(groq_api_key="mock-key")
        mock_settings.return_value = mock_s

        groq_inst = MagicMock()
        groq_inst.chat.completions.create = AsyncMock(return_value=mock_resp)
        mock_groq_cls.return_value = groq_inst

        result = await analyze_security("org/test-repo", SAMPLE_CODE)

        assert result["security_score"] == 25
        assert result["risk_matrix"]["critical"] == 1
        assert len(result["findings"]) == 1

        finding = result["findings"][0]
        assert finding["severity"] == "critical"
        assert finding["file"] == "app/db.py"
        assert "evidence" in finding
        assert "explanation" in finding
        assert "remediation" in finding

        assert len(retained_memories) == 1
        assert retained_memories[0]["tag"] == TAG_SECURITY_RULE


@pytest.mark.asyncio
async def test_security_engineer_markdown_fences():
    """Verify SecurityEngineer handles LLM outputs wrapped in ```json fences."""
    raw_wrapped = (
        "```json\n"
        "{\"threat_summary\": \"Clean\", \"security_score\": 95, \"findings\": []}\n"
        "```"
    )
    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content=raw_wrapped))]

    with patch("app.agents.security.get_settings") as mock_settings, \
         patch("app.agents.security.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.security.recall_memories", return_value=""), \
         patch("app.agents.security.retain_memory", new_callable=AsyncMock):

        mock_settings.return_value = MagicMock(groq_api_key="mock-key")
        groq_inst = MagicMock()
        groq_inst.chat.completions.create = AsyncMock(return_value=mock_resp)
        mock_groq_cls.return_value = groq_inst

        result = await analyze_security("org/test-repo", SAMPLE_CODE)
        assert result["security_score"] == 95
        assert result["threat_summary"] == "Clean"


@pytest.mark.asyncio
async def test_security_engineer_missing_api_key():
    """Verify SecurityEngineer raises RuntimeError when GROQ_API_KEY is not set."""
    with patch("app.agents.security.get_settings") as mock_settings:
        mock_settings.return_value = MagicMock(groq_api_key=None)
        with pytest.raises(RuntimeError, match="GROQ_API_KEY is not set"):
            await analyze_security("org/test-repo", SAMPLE_CODE)


# ---------------------------------------------------------------------------
# 3. Code Reviewer Priority Classification Tests
# ---------------------------------------------------------------------------


def test_normalize_finding_priority():
    """Verify P0-P3 priority classification and fallback inference."""
    # Explicit priorities preserved
    assert _normalize_finding_priority({"priority": "P0"}) == "P0"
    assert _normalize_finding_priority({"priority": "P1"}) == "P1"
    assert _normalize_finding_priority({"priority": "P2"}) == "P2"
    assert _normalize_finding_priority({"priority": "P3"}) == "P3"

    # Fallback inferences from severity and category
    assert _normalize_finding_priority({"severity": "critical"}) == "P0"
    assert _normalize_finding_priority({"category": "security"}) == "P0"
    assert _normalize_finding_priority({"severity": "high", "category": "quality"}) == "P1"
    assert _normalize_finding_priority({"severity": "medium", "category": "performance"}) == "P2"
    assert _normalize_finding_priority({"severity": "low", "category": "style"}) == "P3"
    assert _normalize_finding_priority({}) == "P3"


@pytest.mark.asyncio
async def test_code_reviewer_normalizes_priority():
    """Verify analyze_repository outputs findings with priority set."""
    mock_llm_json = json.dumps({
        "summary": "Review complete.",
        "quality_score": 80,
        "security_score": 90,
        "maintainability_score": 85,
        "findings": [
            {
                "id": "find-1",
                "category": "security",
                "severity": "critical",
                "file": "auth.py",
                "line": 10,
                "message": "Weak key",
                "recommendation": "Use 256-bit key",
            },
            {
                "id": "find-2",
                "priority": "P2",
                "category": "performance",
                "severity": "medium",
                "file": "data.py",
                "line": 42,
                "message": "N+1 query",
                "recommendation": "Use joinedload",
            },
        ],
        "memory_influenced": False,
        "patterns_detected": [],
    })

    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock(message=MagicMock(content=mock_llm_json))]

    with patch("app.agents.code_review.get_settings") as mock_settings, \
         patch("app.agents.code_review.AsyncGroq") as mock_groq_cls, \
         patch("app.agents.code_review.recall_memories", return_value=""), \
         patch("app.agents.code_review.retain_memory", new_callable=AsyncMock):

        mock_settings.return_value = MagicMock(groq_api_key="mock-key")
        groq_inst = MagicMock()
        groq_inst.chat.completions.create = AsyncMock(return_value=mock_resp)
        mock_groq_cls.return_value = groq_inst

        result = await analyze_repository("org/test-repo", SAMPLE_CODE)

        assert len(result["findings"]) == 2
        assert result["findings"][0]["priority"] == "P0"  # Inferred from critical/security
        assert result["findings"][1]["priority"] == "P2"  # Explicitly passed

