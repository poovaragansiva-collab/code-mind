"""CodeMind analysis orchestration agent.

Coordinates Groq LLM reasoning with Hindsight persistent memory to deliver
progressively smarter code-review and risk assessments.

Flow for every analysis request:
  1. Recall past memories for the repository from Hindsight.
  2. Send code context + memories to Groq (qwen/qwen3.8-27b).
  3. Parse the structured JSON response.
  4. Retain the new findings back into Hindsight for future analyses.
"""

from __future__ import annotations

import json
import logging
import textwrap

from groq import AsyncGroq

from app.core.settings import get_settings
from app.memory.service import recall_memories, reflect_on_memories, retain_memory

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT_TEMPLATE = textwrap.dedent("""\
    You are CodeMind, an engineering-intelligence agent that analyses source code
    repositories. You have access to persistent memory of past analyses and developer
    feedback for this repository so your recommendations improve over time.

    ## Memory from past analyses & developer feedback
    {memories}

    ## Instructions
    - Return ONLY valid JSON matching the schema below — no markdown fences, no prose outside JSON.
    - If past memory exists, use it directly to detect recurring bugs, honor accepted team conventions,
      and avoid re-flagging previously rejected suggestions.
    - If past memory is empty, provide thorough first-pass findings.
    - Every finding must have: id, category (quality|security|architecture|performance),
      severity (critical|high|medium|low|info), file, line (or null), message, recommendation.
    - Overall scores are integers 0–100 (100 = best).

    ## Response schema
    {{
      "summary": "<one-sentence overall assessment>",
      "quality_score": <int>,
      "security_score": <int>,
      "maintainability_score": <int>,
      "findings": [
        {{
          "id": "<unique string, e.g. finding-1>",
          "category": "quality|security|architecture|performance",
          "severity": "critical|high|medium|low|info",
          "file": "<file path or null>",
          "line": <int or null>,
          "message": "<what was found>",
          "recommendation": "<how to fix it>"
        }}
      ],
      "memory_influenced": <true if past memory directly influenced any score or finding, else false>,
      "patterns_detected": ["<pattern1>", "<pattern2>"]
    }}
""")

_USER_PROMPT_TEMPLATE = textwrap.dedent("""\
    Analyse the following repository snapshot. Apply all relevant past memory to
    make your assessment more accurate than a first-pass analysis.

    Repository ID : {repo_id}
    ---
    {code_context}
""")

# ---------------------------------------------------------------------------
# Main orchestration entry point
# ---------------------------------------------------------------------------


async def analyze_repository(
    repo_id: str,
    code_context: str,
    *,
    reflect: bool = False,
) -> dict:
    """Run a full CodeMind analysis with Hindsight memory.

    Args:
        repo_id:      Stable identifier for the repository (e.g. ``"owner/name"``).
        code_context: Repository content fed to the LLM — file listings, diffs,
                      or concatenated source excerpts.
        reflect:      When True, also ask Hindsight for a reflective synthesis of
                      the repository's history and append it to the response.

    Returns:
        Parsed analysis dict with findings, scores, and memory metadata.
    """
    s = get_settings()
    if not s.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set.")

    # 1. Recall relevant past memory -------------------------------------------
    memories = await recall_memories(bank_id=repo_id, query=code_context[:600])
    reflection = ""
    if reflect and memories:
        reflection = await reflect_on_memories(
            bank_id=repo_id,
            query=f"Summarise recurring issues, decisions, and patterns for {repo_id}",
        )

    memory_block = memories if memories else "No previous analyses found for this repository."
    if reflection:
        memory_block += f"\n\n## Reflected patterns\n{reflection}"

    # 2. Build prompts ---------------------------------------------------------
    system_msg = _SYSTEM_PROMPT_TEMPLATE.format(memories=memory_block)
    user_msg = _USER_PROMPT_TEMPLATE.format(
        repo_id=repo_id,
        code_context=code_context[:12_000],  # safety trim
    )

    # 3. Call Groq with fast high-accuracy Qwen model -------------------------
    client = AsyncGroq(api_key=s.groq_api_key)
    logger.info("Calling Groq for repo %r (memory chars: %d)", repo_id, len(memories))

    groq_response = await client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.2,
        max_tokens=2048,
        response_format={"type": "json_object"},
    )

    raw = groq_response.choices[0].message.content or "{}"

    # 4. Parse response --------------------------------------------------------
    try:
        analysis: dict = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("Groq returned non-JSON; wrapping raw text.")
        analysis = {"summary": raw, "findings": [], "memory_influenced": False}

    # 5. Retain findings into Hindsight for next time --------------------------
    findings_summary = _build_retention_text(repo_id, analysis)
    await retain_memory(bank_id=repo_id, content=findings_summary)

    # 6. Enrich response with meta-fields --------------------------------------
    analysis.setdefault("repo_id", repo_id)
    analysis.setdefault("memories_used", bool(memories))
    analysis.setdefault("reflection", reflection or None)

    logger.info(
        "Analysis complete for %r — %d findings, memory_influenced=%s",
        repo_id,
        len(analysis.get("findings", [])),
        analysis.get("memory_influenced"),
    )
    return analysis


# ---------------------------------------------------------------------------
# Helper: build a compact retention text from an analysis result
# ---------------------------------------------------------------------------


def _build_retention_text(repo_id: str, analysis: dict) -> str:
    """Format analysis findings for storage in Hindsight."""
    lines = [
        f"Repository: {repo_id}",
        f"Summary: {analysis.get('summary', 'N/A')}",
        f"Quality score: {analysis.get('quality_score', 'N/A')}",
        f"Security score: {analysis.get('security_score', 'N/A')}",
        f"Maintainability score: {analysis.get('maintainability_score', 'N/A')}",
    ]
    patterns = analysis.get("patterns_detected", [])
    if patterns:
        lines.append("Detected patterns: " + ", ".join(patterns))
    for f in analysis.get("findings", [])[:10]:
        lines.append(
            f"[{f.get('severity','?').upper()}] {f.get('category','?')} — "
            f"{f.get('file','?')}:{f.get('line','?')} — "
            f"{f.get('message','?')} | Fix: {f.get('recommendation','?')}"
        )
    return "\n".join(lines)
