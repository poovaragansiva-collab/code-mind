"""Tests for CodeMind Multi-Agent Orchestrator and Domain Endpoints."""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.agents.orchestrator import AgentsOrchestrator, orchestrate_analysis
from app.main import app

MOCK_CODE_REVIEW_DATA = {
    "summary": "Code quality is generally high with one logic bug.",
    "quality_score": 85,
    "security_score": 80,
    "maintainability_score": 90,
    "findings": [
        {
            "id": "cr-1",
            "priority": "P1",
            "category": "quality",
            "severity": "high",
            "file": "app/services/user.py",
            "line": 42,
            "message": "Potential unhandled NoneType exception on user lookup.",
            "recommendation": "Add null check before accessing user.profile.",
        },
        {
            "id": "dup-1",
            "priority": "P2",
            "category": "security",
            "severity": "medium",
            "file": "app/db.py",
            "line": 15,
            "message": "Potential query injection risk detected.",
            "recommendation": "Use parameterized query.",
        },
    ],
    "patterns_detected": ["Missing null checks"],
    "memories_used": True,
    "memory_influenced": True,
    "reflection": "Historical pattern of unhandled None types.",
}

MOCK_ARCH_DATA = {
    "summary": "Architecture follows clean modular boundaries with low coupling.",
    "architecture_score": 88,
    "modularity": {
        "coupling_level": "low",
        "cohesion_level": "high",
        "boundary_health": "strong",
        "assessment": "Strict separation between API, agents, and storage.",
    },
    "dependency_analysis": {
        "circular_risks": [],
        "coupling_hotspots": ["app.core.settings"],
        "boundary_violations": [],
    },
    "trade_offs": [
        {
            "decision": "In-memory caching for analysis",
            "benefit": "Sub-millisecond read latency",
            "drawback": "Lost across container restarts",
        }
    ],
    "adrs_extracted": [
        {
            "title": "Use AsyncGroq for LLM calls",
            "status": "accepted",
            "context": "Async event loop concurrency",
            "consequences": "Non-blocking request handling",
        }
    ],
    "findings": [
        {
            "id": "arch-1",
            "priority": "P2",
            "category": "architecture",
            "severity": "medium",
            "component": "app/core/settings.py",
            "evidence": "Imported across all submodules.",
            "message": "Settings object is tightly coupled across layers.",
            "recommendation": "Use dependency injection for config access.",
        }
    ],
    "memories_used": False,
    "memory_influenced": False,
}

MOCK_SEC_DATA = {
    "threat_summary": "Low attack surface, one SQL injection vulnerability identified.",
    "security_score": 70,
    "risk_matrix": {"critical": 1, "high": 0, "medium": 0, "low": 0},
    "threat_model": [
        {
            "threat": "SQL Injection",
            "vector": "Unsanitized user ID in raw SQL query",
            "mitigation": "Use parameterized queries",
        }
    ],
    "ai_security_risks": [],
    "findings": [
        {
            "id": "dup-1",
            "priority": "P0",
            "category": "security",
            "severity": "critical",
            "cwe": "CWE-89",
            "owasp_category": "A03:2021-Injection",
            "file": "app/db.py",
            "line": 15,
            "evidence": "db.execute(f'SELECT * FROM users WHERE id = {user_id}')",
            "explanation": "Direct f-string SQL interpolation allows arbitrary SQL execution.",
            "remediation": "Use parameterized queries: db.execute(..., (user_id,))",
        }
    ],
    "memories_used": False,
    "memory_influenced": False,
}


@pytest.mark.asyncio
async def test_orchestrator_success_all_agents():
    """Verify orchestrator runs all 3 agents concurrently and aggregates intelligence."""
    with patch(
        "app.agents.orchestrator.analyze_repository",
        new=AsyncMock(return_value=MOCK_CODE_REVIEW_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_architecture",
        new=AsyncMock(return_value=MOCK_ARCH_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_security",
        new=AsyncMock(return_value=MOCK_SEC_DATA),
    ), patch(
        "app.agents.orchestrator.retain_memory",
        new=AsyncMock(),
    ):
        result = await orchestrate_analysis("test/repo", "code context")

        assert result["repo_id"] == "test/repo"
        assert result["overall_score"] is not None
        # Verify component scores
        assert result["quality_score"] == 85
        assert result["security_score"] == 70
        assert result["architecture_score"] == 88
        assert result["maintainability_score"] == 90

        # Overall: 70*0.35 + 85*0.25 + 88*0.25 + 90*0.15 = 24.5 + 21.25 + 22.0 + 13.5 = 81.25 -> 81
        assert result["overall_score"] == 81
        assert result["scoring"]["scoring_status"] == "complete"

        # Verify agent execution statuses
        assert result["agent_statuses"]["code_review"]["status"] == "success"
        assert result["agent_statuses"]["architecture"]["status"] == "success"
        assert result["agent_statuses"]["security"]["status"] == "success"

        # Verify finding deduplication: dup-1 appears in code_review (P2) and security (P0).
        # It must be merged into 1 finding with priority P0 and richer security evidence preserved.
        findings = result["findings"]
        dup_findings = [f for f in findings if f.get("file") == "app/db.py"]
        assert len(dup_findings) == 1
        assert dup_findings[0]["priority"] == "P0"
        assert "f'SELECT * FROM users" in dup_findings[0]["evidence"]

        # Verify critical risks extracted
        assert any("app/db.py" in r for r in result["critical_risks"])

        # Backward compatibility verification
        assert "summary" in result
        assert "findings" in result
        assert "patterns_detected" in result
        assert result["memories_used"] is True


@pytest.mark.asyncio
async def test_orchestrator_handles_individual_agent_failure():
    """Verify orchestrator degrades gracefully if one agent fails."""
    with patch(
        "app.agents.orchestrator.analyze_repository",
        new=AsyncMock(return_value=MOCK_CODE_REVIEW_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_architecture",
        new=AsyncMock(side_effect=RuntimeError("Architect LLM quota exceeded")),
    ), patch(
        "app.agents.orchestrator.analyze_security",
        new=AsyncMock(return_value=MOCK_SEC_DATA),
    ), patch(
        "app.agents.orchestrator.retain_memory",
        new=AsyncMock(),
    ):
        result = await orchestrate_analysis("test/repo-partial", "code context")

        # Architecture failed, others succeeded
        assert result["agent_statuses"]["architecture"]["status"] == "failed"
        assert "quota exceeded" in result["agent_statuses"]["architecture"]["error"]
        assert result["agent_statuses"]["code_review"]["status"] == "success"
        assert result["agent_statuses"]["security"]["status"] == "success"

        # Scores should be dynamically re-scaled without architecture
        assert result["architecture_score"] is None
        assert result["quality_score"] == 85
        assert result["security_score"] == 70
        assert result["scoring"]["scoring_status"] == "partial"
        assert result["overall_score"] is not None

        # Analysis still succeeds and returns findings
        assert len(result["findings"]) > 0


@pytest.mark.asyncio
async def test_orchestrator_handles_agent_timeout():
    """Verify orchestrator handles per-agent timeout safely."""
    async def _slow_agent(*args, **kwargs):
        await asyncio.sleep(2.0)
        return MOCK_ARCH_DATA

    orch = AgentsOrchestrator(agent_timeout=0.05)
    with patch(
        "app.agents.orchestrator.analyze_repository",
        new=AsyncMock(return_value=MOCK_CODE_REVIEW_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_architecture",
        side_effect=_slow_agent,
    ), patch(
        "app.agents.orchestrator.analyze_security",
        new=AsyncMock(return_value=MOCK_SEC_DATA),
    ), patch(
        "app.agents.orchestrator.retain_memory",
        new=AsyncMock(),
    ):
        result = await orch.orchestrate("test/repo-timeout", "code context")

        assert result["agent_statuses"]["architecture"]["status"] == "failed"
        assert "Timeout" in result["agent_statuses"]["architecture"]["error"]
        assert result["agent_statuses"]["code_review"]["status"] == "success"


@pytest.mark.asyncio
async def test_orchestrator_hindsight_resilience():
    """Verify Hindsight retention failure does not crash orchestrator."""
    with patch(
        "app.agents.orchestrator.analyze_repository",
        new=AsyncMock(return_value=MOCK_CODE_REVIEW_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_architecture",
        new=AsyncMock(return_value=MOCK_ARCH_DATA),
    ), patch(
        "app.agents.orchestrator.analyze_security",
        new=AsyncMock(return_value=MOCK_SEC_DATA),
    ), patch(
        "app.agents.orchestrator.retain_memory",
        side_effect=ConnectionError("Hindsight cloud cluster unreachable"),
    ):
        result = await orchestrate_analysis("test/repo-hindsight-down", "code context")
        # Analysis succeeds completely despite Hindsight error
        assert result["overall_score"] == 81
        assert len(result["findings"]) > 0


@pytest.mark.asyncio
async def test_analysis_api_endpoints_integration():
    """Test POST /api/repositories/{repo_id}/analyze and domain GET endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        with patch(
            "app.api.analysis.orchestrate_analysis",
            new=AsyncMock(return_value={
                "summary": "Unified intelligence summary.",
                "overall_score": 85,
                "quality_score": 80,
                "security_score": 90,
                "maintainability_score": 85,
                "architecture_score": 85,
                "findings": [
                    {
                        "id": "f1",
                        "category": "architecture",
                        "priority": "P2",
                        "message": "High coupling",
                    },
                    {"id": "f2", "category": "security", "priority": "P0", "cwe": "CWE-89"},
                ],
                "critical_risks": ["[ARCH] Boundary violation", "[P0] SQL injection"],
                "trade_offs": [
                    {"decision": "Microservices", "benefit": "Scale", "drawback": "Ops"}
                ],
                "adrs_extracted": [{"title": "FastAPI", "status": "accepted"}],
                "threat_model": [{"threat": "DDoS", "vector": "Volumetric"}],
                "ai_security_risks": [],
                "architecture": {
                    "modularity": {"coupling_level": "low", "cohesion_level": "high"},
                    "dependency_analysis": {"boundary_violations": ["API accessing raw DB"]},
                },
                "security": {
                    "threat_summary": "Robust perimeter.",
                    "risk_matrix": {"critical": 1, "high": 0, "medium": 0, "low": 0},
                },
                "memory_influenced": False,
                "patterns_detected": [],
                "repo_id": "org/sample-repo",
                "memories_used": False,
                "reflection": None,
                "analysis_duration_seconds": 1.45,
            }),
        ):
            # 1. Trigger analysis via POST
            res = await client.post(
                "/api/repositories/org/sample-repo/analyze",
                json={"code_context": "def main(): pass", "reflect": False},
            )
            assert res.status_code == 200
            data = res.json()
            assert data["overall_score"] == 85
            assert data["summary"] == "Unified intelligence summary."
            assert len(data["findings"]) == 2

            # 2. Query domain GET /architecture
            arch_res = await client.get("/api/repositories/org/sample-repo/architecture")
            assert arch_res.status_code == 200
            arch_data = arch_res.json()
            assert arch_data["architecture_score"] == 85
            assert arch_data["modularity"]["coupling_level"] == "low"
            assert len(arch_data["trade_offs"]) == 1

            # 3. Query domain GET /security
            sec_res = await client.get("/api/repositories/org/sample-repo/security")
            assert sec_res.status_code == 200
            sec_data = sec_res.json()
            assert sec_data["security_score"] == 90
            assert sec_data["risk_matrix"]["critical"] == 1
            assert len(sec_data["threat_model"]) == 1

            # 4. Query GET /latest
            latest_res = await client.get("/api/repositories/org/sample-repo/latest")
            assert latest_res.status_code == 200
            assert latest_res.json()["overall_score"] == 85

            # 5. Non-existent repo returns 404 on domain endpoints
            res_404 = await client.get("/api/repositories/unknown/unseen-repo/architecture")
            assert res_404.status_code == 404
