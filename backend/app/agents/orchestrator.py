"""CodeMind Multi-Agent Orchestrator.

Coordinates specialized engineering agents:
  1. Code Reviewer (code quality, style, bug detection, P0-P3 priority)
  2. Software Architect (coupling, cohesion, boundaries, trade-offs, ADRs)
  3. Security Engineer (adversarial threat modeling, OWASP, CWE, credentials)

Features:
  - Concurrent async execution with timeouts and isolation via asyncio.gather.
  - Transparent, deterministic scoring engine with documented weighting.
  - Cross-agent finding deduplication with priority and evidence preservation.
  - Safe memory synchronization with Hindsight using semantic tags.
  - Graceful degradation: individual agent failures do not crash the pipeline.
  - Full backward compatibility with existing analysis response schemas.
"""

from __future__ import annotations

import asyncio
import logging
import re
import time
from typing import Any

from app.agents.architecture import analyze_architecture
from app.agents.code_review import _normalize_finding_priority, analyze_repository
from app.agents.security import analyze_security
from app.memory.service import (
    TAG_FINDINGS,
    retain_memory,
)

logger = logging.getLogger(__name__)

# Default execution timeout per individual agent
DEFAULT_AGENT_TIMEOUT_SECONDS = 45.0

# In-flight analysis deduplication locks
_in_flight_locks: dict[str, asyncio.Lock] = {}


def _get_repo_lock(repo_id: str) -> asyncio.Lock:
    """Get or create an asyncio lock for the given repo to prevent duplicate runs."""
    if repo_id not in _in_flight_locks:
        _in_flight_locks[repo_id] = asyncio.Lock()
    return _in_flight_locks[repo_id]


def _sanitize_for_memory(text: str) -> str:
    """Redact apparent secrets, bearer tokens, and private keys before memory retention."""
    if not text:
        return ""
    # Redact common key patterns
    sanitized = re.sub(
        r"(?i)(api[_-]?key|secret|password|bearer|token)\s*[:=]\s*['\"]?[a-zA-Z0-9_\-\.]{8,}['\"]?",
        r"\1=[REDACTED]",
        text,
    )
    # Redact private key blocks
    sanitized = re.sub(
        r"-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----",
        "[REDACTED_PRIVATE_KEY]",
        sanitized,
    )
    return sanitized


class AgentsOrchestrator:
    """Orchestrates multi-agent engineering analysis across CodeMind specialized agents."""

    def __init__(self, agent_timeout: float = DEFAULT_AGENT_TIMEOUT_SECONDS) -> None:
        self.agent_timeout = agent_timeout

    async def _run_agent_safely(
        self,
        name: str,
        coro: Any,
    ) -> tuple[str, bool, dict[str, Any] | None, str | None, float]:
        """Execute a single agent coroutine with a timeout and exception containment."""
        start_time = time.monotonic()
        try:
            result = await asyncio.wait_for(coro, timeout=self.agent_timeout)
            duration = round(time.monotonic() - start_time, 2)
            logger.info("Agent %s completed successfully in %.2fs", name, duration)
            return name, True, result, None, duration
        except TimeoutError:
            duration = round(time.monotonic() - start_time, 2)
            logger.warning("Agent %s timed out after %.2fs", name, duration)
            return name, False, None, f"Timeout after {self.agent_timeout}s", duration
        except Exception as exc:
            duration = round(time.monotonic() - start_time, 2)
            logger.exception("Agent %s failed with exception: %s", name, exc)
            return name, False, None, str(exc), duration

    @staticmethod
    def calculate_scores(
        code_review: dict[str, Any] | None,
        architecture: dict[str, Any] | None,
        security: dict[str, Any] | None,
    ) -> dict[str, Any]:
        """Compute transparent, deterministic scores based on available agent outputs.

        Weights when all data is present:
          - Security: 35%
          - Quality: 25%
          - Architecture: 25%
          - Maintainability: 15%

        If any component is missing or failed, the weights of available scores
        are dynamically re-scaled so no score is fabricated.
        """
        weights: dict[str, float] = {
            "security": 0.35,
            "quality": 0.25,
            "architecture": 0.25,
            "maintainability": 0.15,
        }

        # Extract available component scores
        scores: dict[str, int | None] = {
            "quality": None,
            "security": None,
            "architecture": None,
            "maintainability": None,
        }

        if code_review:
            if isinstance(code_review.get("quality_score"), (int, float)):
                scores["quality"] = int(code_review["quality_score"])
            if isinstance(code_review.get("maintainability_score"), (int, float)):
                scores["maintainability"] = int(code_review["maintainability_score"])
            # Fallback security score from code review if security agent did not provide one
            if isinstance(code_review.get("security_score"), (int, float)):
                scores["security"] = int(code_review["security_score"])

        if security and isinstance(security.get("security_score"), (int, float)):
            # Security agent score takes precedence as it performs dedicated threat modeling
            scores["security"] = int(security["security_score"])

        if architecture and isinstance(architecture.get("architecture_score"), (int, float)):
            scores["architecture"] = int(architecture["architecture_score"])

        # Determine weighted overall score from available components
        active_weights = {k: w for k, w in weights.items() if scores[k] is not None}
        total_active_weight = sum(active_weights.values())

        if total_active_weight > 0:
            weighted_sum = sum(
                scores[k] * (active_weights[k] / total_active_weight) for k in active_weights
            )
            overall_score: int | None = int(round(weighted_sum))
            status = "complete" if total_active_weight == 1.0 else "partial"
        else:
            overall_score = None
            status = "insufficient_data"

        return {
            "overall_score": overall_score,
            "quality_score": scores["quality"],
            "security_score": scores["security"],
            "architecture_score": scores["architecture"],
            "maintainability_score": scores["maintainability"],
            "scoring_status": status,
            "scoring_weights_used": active_weights,
            "scoring_methodology": (
                "Deterministic weighted blend: Security (35%), Quality (25%), "
                "Architecture (25%), Maintainability (15%). Missing values are "
                "re-normalized without fabrication."
            ),
        }

    @staticmethod
    def deduplicate_and_merge_findings(
        code_findings: list[dict[str, Any]],
        sec_findings: list[dict[str, Any]],
        arch_findings: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Merge findings from all agents, avoiding duplicates while preserving details."""
        priority_rank = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}
        merged_map: dict[str, dict[str, Any]] = {}

        def _make_key(f: dict[str, Any]) -> str:
            file_ref = str(f.get("file") or f.get("component") or "").strip().lower()
            line_ref = str(f.get("line") or "").strip()
            fid = str(f.get("id") or "").strip().lower()
            # If explicit ID exists, use it
            if fid and not fid.startswith("finding-") and not fid.startswith("sec-"):
                return f"id:{fid}"
            # If both file and line are present, deduplicate on file+line
            if file_ref and line_ref and line_ref not in ("None", "null", "0"):
                return f"loc:{file_ref}:{line_ref}"
            msg = str(f.get("message") or f.get("explanation") or "")[:40].strip().lower()
            return f"msg:{file_ref}:{msg}"

        all_findings: list[tuple[str, dict[str, Any]]] = []
        for f in sec_findings:
            all_findings.append(("security", dict(f)))
        for f in code_findings:
            all_findings.append(("code_review", dict(f)))
        for f in arch_findings:
            all_findings.append(("architecture", dict(f)))

        for origin, f in all_findings:
            # Ensure priority is normalized
            p = _normalize_finding_priority(f)
            f["priority"] = p
            f.setdefault("origin_agent", origin)

            key = _make_key(f)
            if key not in merged_map:
                merged_map[key] = f
            else:
                existing = merged_map[key]
                # Keep highest priority (P0 beats P1, etc.)
                existing_p = existing.get("priority", "P3")
                if priority_rank.get(p, 3) < priority_rank.get(existing_p, 3):
                    existing["priority"] = p

                # Prefer richer evidence and recommendations
                if not existing.get("evidence") and f.get("evidence"):
                    existing["evidence"] = f["evidence"]
                if not existing.get("recommendation") and f.get("recommendation"):
                    existing["recommendation"] = f["recommendation"]
                if not existing.get("cwe") and f.get("cwe"):
                    existing["cwe"] = f["cwe"]
                if not existing.get("owasp_category") and f.get("owasp_category"):
                    existing["owasp_category"] = f["owasp_category"]

        # Sort by priority P0 -> P1 -> P2 -> P3
        sorted_findings = sorted(
            merged_map.values(),
            key=lambda item: priority_rank.get(item.get("priority", "P3"), 3),
        )
        return sorted_findings

    async def orchestrate(
        self,
        repo_id: str,
        code_context: str,
        *,
        reflect: bool = False,
    ) -> dict[str, Any]:
        """Execute concurrent multi-agent analysis and aggregate intelligence."""
        lock = _get_repo_lock(repo_id)
        async with lock:
            return await self._execute_orchestration(repo_id, code_context, reflect=reflect)

    async def _execute_orchestration(
        self,
        repo_id: str,
        code_context: str,
        *,
        reflect: bool = False,
    ) -> dict[str, Any]:
        logger.info("Starting multi-agent orchestration for repository: %s", repo_id)
        start_wall = time.monotonic()

        # 1. Dispatch independent agents concurrently
        task_code = self._run_agent_safely(
            "code_review",
            analyze_repository(repo_id, code_context, reflect=reflect),
        )
        task_arch = self._run_agent_safely(
            "architecture",
            analyze_architecture(repo_id, code_context, reflect=reflect),
        )
        task_sec = self._run_agent_safely(
            "security",
            analyze_security(repo_id, code_context, reflect=reflect),
        )

        results = await asyncio.gather(task_code, task_arch, task_sec, return_exceptions=True)

        agent_data: dict[str, dict[str, Any] | None] = {
            "code_review": None,
            "architecture": None,
            "security": None,
        }
        agent_statuses: dict[str, dict[str, Any]] = {}

        for res in results:
            if isinstance(res, Exception):
                logger.error("Unhandled gather exception: %s", res)
                continue
            name, ok, data, err, dur = res
            agent_statuses[name] = {
                "status": "success" if ok else "failed",
                "duration_seconds": dur,
                "error": err,
            }
            if ok and data:
                agent_data[name] = data

        cr_data = agent_data["code_review"]
        arch_data = agent_data["architecture"]
        sec_data = agent_data["security"]

        # 2. Compute deterministic scores
        scoring = self.calculate_scores(cr_data, arch_data, sec_data)

        # 3. Aggregate and deduplicate findings
        cr_findings = cr_data.get("findings", []) if cr_data else []
        sec_findings = sec_data.get("findings", []) if sec_data else []
        arch_findings = arch_data.get("findings", []) if arch_data else []
        all_findings = self.deduplicate_and_merge_findings(
            cr_findings, sec_findings, arch_findings
        )

        # 4. Extract critical risks and actionable fixes
        critical_risks: list[str] = []
        for f in all_findings:
            if f.get("priority") == "P0" or str(f.get("severity", "")).lower() == "critical":
                msg = f.get("message") or f.get("explanation") or "Critical security flaw"
                loc = f"{f.get('file', 'general')}:{f.get('line', '')}".rstrip(":")
                critical_risks.append(f"[{f.get('priority')}] {loc} — {msg}")

        if arch_data:
            for violation in (
                arch_data.get("dependency_analysis", {}).get("boundary_violations", [])
            ):
                critical_risks.append(f"[ARCH] Boundary violation: {violation}")

        if sec_data:
            for threat in sec_data.get("threat_model", []):
                critical_risks.append(
                    f"[THREAT] {threat.get('threat', 'Threat')}: {threat.get('vector', '')}"
                )

        recommended_fixes: list[dict[str, str]] = []
        for f in all_findings[:8]:
            fix = f.get("recommendation") or f.get("remediation")
            if fix:
                recommended_fixes.append({
                    "id": str(f.get("id", "")),
                    "file": str(f.get("file") or f.get("component") or "global"),
                    "action": str(fix),
                    "priority": str(f.get("priority", "P2")),
                })

        # 5. Synthesize unified executive summary
        summaries: list[str] = []
        if cr_data and cr_data.get("summary"):
            summaries.append(f"Quality & Code: {cr_data['summary']}")
        if arch_data and arch_data.get("summary"):
            summaries.append(f"Architecture: {arch_data['summary']}")
        if sec_data and sec_data.get("threat_summary"):
            summaries.append(f"Security: {sec_data['threat_summary']}")

        unified_summary = " | ".join(summaries) if summaries else (
            "Multi-agent analysis completed with partial or limited findings."
        )

        # 6. Aggregate patterns and memory metadata
        patterns = list(
            set(
                (cr_data.get("patterns_detected", []) if cr_data else [])
                + (arch_data.get("dependency_analysis", {}).get("coupling_hotspots", [])
                   if arch_data else [])
            )
        )
        memories_used = any([
            bool(cr_data and cr_data.get("memories_used")),
            bool(arch_data and arch_data.get("memories_used")),
            bool(sec_data and sec_data.get("memories_used")),
        ])
        memory_influenced = any([
            bool(cr_data and cr_data.get("memory_influenced")),
            bool(arch_data and arch_data.get("memory_influenced")),
            bool(sec_data and sec_data.get("memory_influenced")),
        ])
        reflection = (
            (cr_data.get("reflection") if cr_data else None)
            or (arch_data.get("reflection") if arch_data else None)
            or (sec_data.get("reflection") if sec_data else None)
        )

        total_duration = round(time.monotonic() - start_wall, 2)

        # 7. Retain unified intelligence summary in Hindsight safely
        if all_findings:
            retention_text = (
                f"Repository {repo_id} Analysis Summary:\n"
                f"Score: {scoring['overall_score']}/100. "
                f"Findings: {len(all_findings)} items. "
                f"Critical risks: {len(critical_risks)}. "
                f"Summary: {unified_summary[:200]}"
            )
            safe_retention = _sanitize_for_memory(retention_text)
            try:
                await retain_memory(bank_id=repo_id, content=safe_retention, tag=TAG_FINDINGS)
            except Exception:
                logger.warning("Failed to store orchestrated summary in Hindsight for %s", repo_id)

        # 8. Assemble complete backward-compatible result envelope
        return {
            # Top-level backward compatible fields
            "summary": unified_summary,
            "quality_score": scoring["quality_score"],
            "security_score": scoring["security_score"],
            "maintainability_score": scoring["maintainability_score"],
            "findings": all_findings,
            "memory_influenced": memory_influenced,
            "patterns_detected": patterns,
            "repo_id": repo_id,
            "memories_used": memories_used,
            "reflection": reflection,
            # Multi-agent intelligence fields
            "overall_score": scoring["overall_score"],
            "architecture_score": scoring["architecture_score"],
            "scoring": scoring,
            "agent_statuses": agent_statuses,
            "analysis_duration_seconds": total_duration,
            "critical_risks": critical_risks[:10],
            "recommended_fixes": recommended_fixes,
            "trade_offs": arch_data.get("trade_offs", []) if arch_data else [],
            "adrs_extracted": arch_data.get("adrs_extracted", []) if arch_data else [],
            "threat_model": sec_data.get("threat_model", []) if sec_data else [],
            "ai_security_risks": sec_data.get("ai_security_risks", []) if sec_data else [],
            # Sub-agent full sections for detailed dashboard pages
            "code_review": cr_data,
            "architecture": arch_data,
            "security": sec_data,
        }


# Global singleton instance for convenient imports
orchestrator = AgentsOrchestrator()


async def orchestrate_analysis(
    repo_id: str,
    code_context: str,
    *,
    reflect: bool = False,
    timeout: float = DEFAULT_AGENT_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """Helper entry point for multi-agent repository orchestration."""
    orch = AgentsOrchestrator(agent_timeout=timeout)
    return await orch.orchestrate(repo_id=repo_id, code_context=code_context, reflect=reflect)
