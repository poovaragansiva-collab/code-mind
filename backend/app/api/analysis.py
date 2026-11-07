"""Analysis API endpoints.

POST /api/repositories/{repo_id}/analyze
  Triggers a full Groq + Hindsight-powered analysis for a repository.

GET  /api/repositories/{repo_id}/memories
  Returns the raw recalled memories for a repository (useful for the
  Hindsight Memory panel in the dashboard).

POST /api/repositories/{repo_id}/feedback
  Accepts developer feedback on a finding and retains it in Hindsight
  so future analyses reflect team standards.

POST /api/repositories/{repo_id}/reflect
  Returns a synthesised insight about the repository's history.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.orchestrator import orchestrate_analysis
from app.memory.service import (
    TAG_FEEDBACK_REJECTED,
    TAG_TEAM_CONVENTION,
    recall_memories,
    reflect_on_memories,
    retain_memory,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analysis"])

# In-memory cache of the latest analysis results per repository
_latest_analyses: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class AnalysisRequest(BaseModel):
    """Body for triggering a repository analysis."""

    code_context: str = Field(
        ...,
        description="Repository content to analyse — file listings, diffs, or source excerpts.",
        min_length=1,
        max_length=50_000,
    )
    reflect: bool = Field(
        default=False,
        description="When true, include a reflective Hindsight synthesis in the response.",
    )


class FeedbackRequest(BaseModel):
    """Developer feedback on a specific finding."""

    finding_id: str = Field(..., description="ID of the finding being reviewed.")
    action: str = Field(
        ...,
        description="One of: accepted, rejected, corrected.",
        pattern="^(accepted|rejected|corrected)$",
    )
    comment: str = Field(
        default="",
        description="Developer explanation or correction (retained in Hindsight).",
        max_length=2000,
    )


class ReflectRequest(BaseModel):
    """Body for requesting a reflective synthesis."""

    query: str = Field(
        default="Summarise recurring issues and engineering patterns.",
        max_length=500,
    )


class RegisterRepoRequest(BaseModel):
    """Body for registering or connecting a repository."""

    name: str = Field(..., min_length=1, max_length=200)
    default_branch: str = Field(default="main", max_length=100)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/repositories")
async def list_repositories() -> list[dict]:
    """Return all repositories that have been analyzed or registered."""
    repos = []
    for repo_id, analysis in _latest_analyses.items():
        findings = analysis.get("findings", [])
        critical_count = len([
            f for f in findings
            if f.get("priority") in ("P0", "P1") or f.get("severity") in ("critical", "high")
        ])
        repos.append({
            "id": repo_id,
            "name": repo_id,
            "github_url": f"https://github.com/{repo_id}",
            "default_branch": "main",
            "status": "connected",
            "last_analysis": "Recently analyzed",
            "files_count": len(findings),
            "open_issues": critical_count,
        })
    return repos


@router.post("/repositories")
async def register_repository(body: RegisterRepoRequest) -> dict:
    """Register or connect a repository in workspace."""
    repo_id = (
        body.name.strip()
        .removeprefix("https://github.com/")
        .removesuffix(".git")
    )
    if repo_id not in _latest_analyses:
        _latest_analyses[repo_id] = {
            "summary": f"Repository {repo_id} registered. Ready for code analysis.",
            "overall_score": None,
            "quality_score": None,
            "security_score": None,
            "architecture_score": None,
            "maintainability_score": None,
            "findings": [],
            "critical_risks": [],
            "recommended_fixes": [],
            "trade_offs": [],
            "adrs_extracted": [],
            "threat_model": [],
            "repo_id": repo_id,
            "memory_influenced": False,
            "memories_used": False,
            "patterns_detected": [],
        }
    return {
        "id": repo_id,
        "name": repo_id,
        "github_url": f"https://github.com/{repo_id}",
        "default_branch": body.default_branch,
        "status": "connected",
        "last_analysis": "Registered",
        "files_count": 0,
        "open_issues": 0,
    }


@router.post("/repositories/{repo_id:path}/analyze")
async def trigger_analysis(repo_id: str, body: AnalysisRequest) -> dict:
    """Analyse a repository using multi-agent orchestration (Quality, Architecture, Security).

    Orchestrates concurrent execution of specialized engineering agents with Hindsight
    persistent memory recall and retention. Stores the unified analysis for dashboard views.
    """
    try:
        result = await orchestrate_analysis(
            repo_id=repo_id,
            code_context=body.code_context,
            reflect=body.reflect,
        )
        _latest_analyses[repo_id] = result
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during multi-agent analysis of %r", repo_id)
        raise HTTPException(status_code=500, detail="Analysis failed.") from exc
    return result


@router.get("/repositories/{repo_id:path}/latest")
async def get_latest_analysis(repo_id: str) -> dict:
    """Return the most recent full multi-agent analysis for a repository."""
    result = _latest_analyses.get(repo_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No analysis recorded for repository '{repo_id}'. Trigger analysis first.",
        )
    return result


@router.get("/repositories/{repo_id:path}/architecture")
async def get_architecture_analysis(repo_id: str) -> dict:
    """Return the architectural assessment and ADRs for a repository."""
    result = _latest_analyses.get(repo_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No architecture analysis for '{repo_id}'. Trigger analysis first.",
        )
    arch = result.get("architecture") or {}
    return {
        "repo_id": repo_id,
        "architecture_score": result.get("architecture_score"),
        "modularity": arch.get("modularity", {}),
        "dependency_analysis": arch.get("dependency_analysis", {}),
        "api_contract_consistency": arch.get("api_contract_consistency", {}),
        "technical_debt": arch.get("technical_debt", []),
        "trade_offs": result.get("trade_offs", []),
        "adrs_extracted": result.get("adrs_extracted", []),
        "critical_risks": [r for r in result.get("critical_risks", []) if "[ARCH]" in r],
        "findings": [f for f in result.get("findings", []) if f.get("category") == "architecture"],
        "analyzed_at": result.get("analysis_duration_seconds"),
    }


@router.get("/repositories/{repo_id:path}/security")
async def get_security_analysis(repo_id: str) -> dict:
    """Return the security posture, vulnerability findings, and threat model for a repo."""
    result = _latest_analyses.get(repo_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"No security analysis for '{repo_id}'. Trigger analysis first.",
        )
    sec = result.get("security") or {}
    return {
        "repo_id": repo_id,
        "security_score": result.get("security_score"),
        "threat_summary": sec.get("threat_summary", ""),
        "risk_matrix": sec.get("risk_matrix", {"critical": 0, "high": 0, "medium": 0, "low": 0}),
        "findings": [
            f for f in result.get("findings", [])
            if f.get("category") == "security" or f.get("cwe")
        ],
        "threat_model": result.get("threat_model", []),
        "ai_security_risks": result.get("ai_security_risks", []),
        "critical_risks": [
            r for r in result.get("critical_risks", []) if "[P0]" in r or "[THREAT]" in r
        ],
    }


@router.get("/repositories/{repo_id:path}/memories")
async def get_memories(repo_id: str, q: str = "engineering patterns bugs findings") -> dict:
    """Return raw recalled memories for the Hindsight Memory dashboard panel."""
    bank_id = f"codemind/{repo_id}"
    memories = await recall_memories(bank_id=bank_id, query=q)
    return {
        "repo_id": repo_id,
        "bank_id": bank_id,
        "query": q,
        "memories": memories,
        "has_memory": bool(memories),
    }


@router.post("/repositories/{repo_id:path}/feedback")
async def submit_feedback(repo_id: str, body: FeedbackRequest) -> dict:
    """Retain validated developer feedback in Hindsight.

    Accepted/corrected feedback is stored so future analyses reflect the
    team's actual engineering standards.  Rejected findings are also stored
    so the agent stops repeating them.
    """
    bank_id = f"codemind/{repo_id}"
    retention_text = (
        f"Developer feedback on finding {body.finding_id}: "
        f"action={body.action}. "
        f"{('Comment: ' + body.comment) if body.comment else ''}"
    )
    feedback_tag = (
        TAG_FEEDBACK_REJECTED
        if body.action == "rejected"
        else TAG_TEAM_CONVENTION
    )
    try:
        await retain_memory(bank_id=bank_id, content=retention_text, tag=feedback_tag)
    except Exception as exc:
        logger.exception("Failed to retain feedback for %r", repo_id)
        raise HTTPException(status_code=503, detail="Memory service unavailable.") from exc
    return {"status": "retained", "repo_id": repo_id, "finding_id": body.finding_id}


@router.post("/repositories/{repo_id:path}/reflect")
async def reflect(repo_id: str, body: ReflectRequest) -> dict:
    """Return a Hindsight reflective synthesis for the repository history."""
    bank_id = f"codemind/{repo_id}"
    insight = await reflect_on_memories(bank_id=bank_id, query=body.query)
    return {
        "repo_id": repo_id,
        "query": body.query,
        "insight": insight,
        "has_insight": bool(insight),
    }
