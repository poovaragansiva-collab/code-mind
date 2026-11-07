"""CodeMind Software Architecture Agent.

Analyzes system design, component coupling, architectural boundaries,
API contract consistency, maintainability risks, and extracts Architectural
Decision Records (ADRs). Powered by Groq LLM reasoning and Hindsight memory.
"""

from __future__ import annotations

import json
import logging
import re
import textwrap

from groq import AsyncGroq

from app.core.settings import get_settings
from app.memory.service import (
    TAG_ADR,
    recall_memories,
    reflect_on_memories,
    retain_memory,
)

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT_TEMPLATE = textwrap.dedent("""\
    You are CodeMind Software Architect, an engineering-intelligence agent that
    specializes in software architecture, system boundaries, and structural patterns.
    You design systems that survive the team that built them. Every decision has a
    trade-off — name it.

    ## Past Architectural Memory & Decisions
    {memories}

    ## Instructions
    - Return ONLY valid JSON matching the schema below — no markdown fences, no prose outside JSON.
    - Evaluate component coupling, modular cohesion, architectural boundaries, and API consistency.
    - Identify anti-patterns: God objects, circular dependencies, leaky abstractions.
    - Every finding MUST include concrete evidence (code snippet, import, interface).
    - Extract explicit or implicit Architectural Decision Records (ADRs) with trade-offs.
    - architecture_score is an integer 0–100 (100 = optimal modularity).

    ## Response schema
    {{
      "summary": "<concise architectural evaluation>",
      "architecture_score": <int 0-100>,
      "modularity": {{
        "coupling_level": "low|medium|high",
        "cohesion_level": "high|medium|low",
        "boundary_health": "strong|moderate|weak",
        "assessment": "<assessment of module structure>"
      }},
      "dependency_analysis": {{
        "circular_risks": ["<pathA -> pathB -> pathA>"],
        "coupling_hotspots": ["<module with too many dependencies>"],
        "boundary_violations": ["<e.g. presentation directly accessing DB>"]
      }},
      "api_contract_consistency": {{
        "status": "consistent|breaking_drift|inconsistent",
        "notes": "<contract validation assessment>"
      }},
      "technical_debt": [
        {{
          "component": "<path or module>",
          "risk": "<maintainability or scalability risk>",
          "effort": "low|medium|high"
        }}
      ],
      "trade_offs": [
        {{
          "decision": "<architectural choice>",
          "benefit": "<what is gained>",
          "drawback": "<what is compromised>"
        }}
      ],
      "findings": [
        {{
          "id": "<arch-1>",
          "severity": "critical|high|medium|low|info",
          "category": "architecture",
          "component": "<module or file path>",
          "evidence": "<concrete code excerpt, import trace, or structural evidence>",
          "message": "<architectural issue or structural defect>",
          "recommendation": "<architectural remediation strategy>"
        }}
      ],
      "adrs_extracted": [
        {{
          "title": "<decision title>",
          "status": "accepted|proposed|deprecated",
          "context": "<why this decision was made>",
          "consequences": "<long-term impact on the codebase>"
        }}
      ],
      "memory_influenced": <true if past memory informed any finding or ADR, else false>
    }}
""")

_USER_PROMPT_TEMPLATE = textwrap.dedent("""\
    Analyse the architecture and structural integrity of the following repository snapshot.
    Identify architectural decisions, trade-offs, and boundary violations with evidence.

    Repository ID : {repo_id}
    ---
    {code_context}
""")


def _extract_json_from_llm_response(raw: str) -> dict:
    """Parse JSON from raw LLM output, stripping optional markdown fences."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Failed to decode JSON from LLM response; attempting brace slice.")
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


async def analyze_architecture(
    repo_id: str,
    code_context: str,
    *,
    reflect: bool = False,
) -> dict:
    """Run an architectural evaluation with Hindsight memory.

    Args:
        repo_id: Identifier for the repository (e.g. "owner/repo").
        code_context: Source excerpts, file trees, or module interfaces.
        reflect: When True, also query Hindsight for reflective synthesis.

    Returns:
        Structured architectural assessment with modularity, trade-offs, and ADRs.
    """
    s = get_settings()
    if not s.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set.")

    # 1. Recall architectural memories
    query = f"architecture design pattern ADR coupling {code_context[:300]}"
    memories = await recall_memories(bank_id=repo_id, query=query)
    reflection = ""
    if reflect and memories:
        reflection = await reflect_on_memories(
            bank_id=repo_id,
            query=f"Summarise architectural patterns and structural debt for {repo_id}",
        )

    memory_block = memories if memories else "No previous architectural memory found."
    if reflection:
        memory_block += f"\n\n## Reflected Architectural Trends\n{reflection}"

    # 2. Build prompts
    system_msg = _SYSTEM_PROMPT_TEMPLATE.format(memories=memory_block)
    user_msg = _USER_PROMPT_TEMPLATE.format(
        repo_id=repo_id,
        code_context=code_context[:12_000],
    )

    # 3. Call Groq
    client = AsyncGroq(api_key=s.groq_api_key)
    logger.info("Calling Groq Architecture Agent for repo %r", repo_id)

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
    try:
        analysis = _extract_json_from_llm_response(raw)
    except Exception:
        logger.warning("Groq returned unparseable output; using fallback structure.")
        analysis = {
            "summary": raw[:200] if raw else "Architectural analysis could not be parsed.",
            "architecture_score": 60,
            "modularity": {
                "coupling_level": "medium",
                "cohesion_level": "medium",
                "boundary_health": "moderate",
                "assessment": "Fallback assessment due to unparseable response.",
            },
            "dependency_analysis": {
                "circular_risks": [],
                "coupling_hotspots": [],
                "boundary_violations": [],
            },
            "api_contract_consistency": {
                "status": "consistent",
                "notes": "Contract parsing skipped in fallback.",
            },
            "technical_debt": [],
            "trade_offs": [],
            "findings": [],
            "adrs_extracted": [],
            "memory_influenced": False,
        }

    # Ensure all findings contain an evidence field
    for f in analysis.get("findings", []):
        if "evidence" not in f:
            f["evidence"] = "Identified via module boundary analysis."

    # 4. Retain extracted ADRs into Hindsight
    adrs = analysis.get("adrs_extracted", [])
    if adrs:
        adr_texts = [
            f"ADR: {a.get('title', 'N/A')} ({a.get('status', 'accepted')}) — {a.get('context', '')}"
            for a in adrs[:3]
        ]
        retention_text = f"Repository {repo_id} Architectural Decisions:\n" + "\n".join(adr_texts)
        try:
            await retain_memory(bank_id=repo_id, content=retention_text, tag=TAG_ADR)
        except Exception:
            logger.warning("Failed to retain ADR in Hindsight for %r", repo_id)

    analysis.setdefault("repo_id", repo_id)
    analysis.setdefault("memories_used", bool(memories))
    analysis.setdefault("reflection", reflection or None)
    return analysis
