"""CodeMind Security Engineer Agent.

Performs adversarial threat modeling, vulnerability detection (OWASP Top 10, CWE),
credential leak scanning, and generates actionable remediation diffs.
Powered by Groq LLM reasoning and Hindsight persistent memory.
"""

from __future__ import annotations

import json
import logging
import re
import textwrap

from groq import AsyncGroq

from app.core.settings import get_settings
from app.memory.service import (
    TAG_SECURITY_RULE,
    recall_memories,
    reflect_on_memories,
    retain_memory,
)

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT_TEMPLATE = textwrap.dedent("""\
    You are CodeMind Security Engineer, an adversarial security agent specializing
    in vulnerability hunting, threat modeling, and application security (AppSec).
    You examine code with an attacker's mindset to detect vulnerabilities before
    they reach production.

    ## Past Security Memory & Rules
    {memories}

    ## Instructions
    - Return ONLY valid JSON matching the schema below — no markdown fences, no prose outside JSON.
    - Check for OWASP Top 10 vulnerabilities (SQLi, XSS, SSRF, IDOR, Broken Auth, Crypto).
    - Detect exposed credentials, API keys, passwords, and tokens.
    - Inspect AI-specific attack vectors (prompt injection, insecure outputs, data poisoning).
    - Every finding MUST include: severity, affected file, evidence, explanation, and remediation.
    - Do NOT claim a vulnerability without sufficient evidence from the codebase.
    - security_score is an integer 0–100 (100 = completely secure).

    ## Response schema
    {{
      "threat_summary": "<high-level security posture summary>",
      "security_score": <int 0-100>,
      "risk_matrix": {{
        "critical": <int>,
        "high": <int>,
        "medium": <int>,
        "low": <int>
      }},
      "findings": [
        {{
          "id": "<sec-1>",
          "severity": "critical|high|medium|low|info",
          "cwe": "<e.g. CWE-89, CWE-798, CWE-259, CWE-943>",
          "owasp_category": "<e.g. A01:2021-Broken Access Control, A03:2021-Injection>",
          "file": "<file path or null>",
          "line": <int or null>,
          "evidence": "<exact code excerpt, hardcoded token, or vulnerable statement>",
          "explanation": "<technical explanation of the vulnerability and attack scenario>",
          "remediation": "<exact code or configuration fix to remediate the vulnerability>"
        }}
      ],
      "threat_model": [
        {{
          "threat": "<potential threat scenario>",
          "vector": "<attack path>",
          "mitigation": "<recommended defensive control>"
        }}
      ],
      "ai_security_risks": [
        {{
          "risk": "<e.g. prompt injection, unvalidated LLM output, secret leakage in prompt>",
          "severity": "high|medium|low",
          "remediation": "<defensive mitigation>"
        }}
      ],
      "compliance_flags": ["<e.g. Hardcoded secrets detected>", "<Missing CSRF protection>"],
      "memory_influenced": <true if past memory informed any detected rule, else false>
    }}
""")

_USER_PROMPT_TEMPLATE = textwrap.dedent("""\
    Perform an adversarial security review and threat model on the following repository snapshot.
    Identify hard vulnerabilities, secret exposures, and injection risks with concrete evidence.

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
        logger.warning("Failed to decode JSON from Security LLM response; trying brace slice.")
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


async def analyze_security(
    repo_id: str,
    code_context: str,
    *,
    reflect: bool = False,
) -> dict:
    """Run an adversarial security evaluation with Hindsight memory.

    Args:
        repo_id: Identifier for the repository (e.g. "owner/repo").
        code_context: Source excerpts, configuration files, or diffs.
        reflect: When True, also query Hindsight for reflective security trends.

    Returns:
        Structured security review with risk matrix, findings, and remediation.
    """
    s = get_settings()
    if not s.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set.")

    # 1. Recall past security memory
    query = f"security vulnerability cwe owasp injection credential {code_context[:300]}"
    memories = await recall_memories(bank_id=repo_id, query=query)
    reflection = ""
    if reflect and memories:
        reflection = await reflect_on_memories(
            bank_id=repo_id,
            query=f"Summarise historical security vulnerabilities and risk trends for {repo_id}",
        )

    memory_block = memories if memories else "No previous security rules recorded."
    if reflection:
        memory_block += f"\n\n## Reflected Security Incidents\n{reflection}"

    # 2. Build prompts
    system_msg = _SYSTEM_PROMPT_TEMPLATE.format(memories=memory_block)
    user_msg = _USER_PROMPT_TEMPLATE.format(
        repo_id=repo_id,
        code_context=code_context[:12_000],
    )

    # 3. Call Groq
    client = AsyncGroq(api_key=s.groq_api_key)
    logger.info("Calling Groq Security Agent for repo %r", repo_id)

    groq_response = await client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.15,
        max_tokens=2048,
        response_format={"type": "json_object"},
    )

    raw = groq_response.choices[0].message.content or "{}"
    try:
        analysis = _extract_json_from_llm_response(raw)
    except Exception:
        logger.warning("Groq returned non-JSON; wrapping raw output.")
        analysis = {
            "threat_summary": raw[:200] if raw else "Security analysis could not be parsed.",
            "security_score": 50,
            "risk_matrix": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "findings": [],
            "threat_model": [],
            "ai_security_risks": [],
            "compliance_flags": [],
            "memory_influenced": False,
        }

    # Ensure required finding fields exist for every finding
    for f in analysis.get("findings", []):
        f.setdefault("severity", "medium")
        f.setdefault("file", None)
        f.setdefault("evidence", "Identified through static security analysis.")
        f.setdefault("explanation", f.get("description", "Potential security weakness."))
        f.setdefault("remediation", f.get("remediation", "Apply defensive validation."))

    # 4. Retain detected high-priority security rules into Hindsight
    findings = analysis.get("findings", [])
    critical_or_high = [
        f for f in findings if str(f.get("severity", "")).lower() in ("critical", "high")
    ]
    if critical_or_high:
        sec_lines = [
            f"Rule: In {f.get('file', 'code')} avoid {f.get('cwe', 'vulnerability')} — "
            f"{f.get('explanation', '')[:100]}"
            for f in critical_or_high[:3]
        ]
        retention_text = f"Repository {repo_id} Security Rules:\n" + "\n".join(sec_lines)
        try:
            await retain_memory(bank_id=repo_id, content=retention_text, tag=TAG_SECURITY_RULE)
        except Exception:
            logger.warning("Failed to retain security rule in Hindsight for %r", repo_id)

    analysis.setdefault("repo_id", repo_id)
    analysis.setdefault("memories_used", bool(memories))
    analysis.setdefault("reflection", reflection or None)
    return analysis
