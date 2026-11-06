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

from app.agents.code_review import analyze_repository
from app.memory.service import recall_memories, reflect_on_memories, retain_memory

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analysis"])


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


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/repositories/{repo_id:path}/analyze")
async def trigger_analysis(repo_id: str, body: AnalysisRequest) -> dict:
    """Analyse a repository with Groq + Hindsight memory.

    The agent recalls past findings from Hindsight before calling Groq, so
    each successive analysis is more accurate than the last.  After analysis,
    new findings are automatically retained for future queries.
    """
    try:
        result = await analyze_repository(
            repo_id=repo_id,
            code_context=body.code_context,
            reflect=body.reflect,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected error during analysis of %r", repo_id)
        raise HTTPException(status_code=500, detail="Analysis failed.") from exc
    return result


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
    try:
        await retain_memory(bank_id=bank_id, content=retention_text)
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
