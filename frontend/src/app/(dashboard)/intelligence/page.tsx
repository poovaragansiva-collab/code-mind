"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { fetchLatestAnalysis, type OrchestratedAnalysis } from "@/lib/api";

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "patterns" | "risks">("overview");
  const [data, setData] = useState<OrchestratedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAnalysis("codemind/ai-core")
      .then((res) => {
        if (res) setData(res);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Analysis / Intelligence
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Team Coding Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            CodeMind learns from your engineers’ reviews, PR merges, and feedback cycles to uncover team habits and prevent repetitive oversights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="violet">
            <Sparkles size={12} className="text-violet" />
            Neural Multi-Agent Active
          </Badge>
        </div>
      </div>

      {/* Unified Executive Summary if real analysis exists */}
      {data?.summary ? (
        <Card variant="glass" className="border-accent/30 bg-accent/[0.03]">
          <CardContent className="p-5 sm:p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-accent font-mono uppercase tracking-wider">
                Multi-Agent Executive Synthesis
              </span>
              {data.overall_score !== null && (
                <Badge variant="blue">Overall Score: {data.overall_score}/100</Badge>
              )}
            </div>
            <p className="text-sm text-ink leading-relaxed font-mono">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      ) : !loading ? (
        <Card variant="glass" className="border-accent/20 bg-accent/[0.02]">
          <CardContent className="p-5 flex items-center justify-between">
            <span className="text-xs text-muted">
              No analysis data recorded yet for codemind/ai-core. Run a multi-agent review to generate team intelligence.
            </span>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
            >
              Start review <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Overall Health</span>
              <BrainCircuit size={16} className="text-accent" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">
              {data?.overall_score !== null && data?.overall_score !== undefined
                ? `${data.overall_score}%`
                : "--"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Weighted cross-domain index</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Security Posture</span>
              <Shield size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-400">
              {data?.security_score !== null && data?.security_score !== undefined
                ? `${data.security_score}%`
                : "--"}
            </div>
            <p className="mt-1 text-[11px] text-muted">OWASP & CWE defense score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Architecture Health</span>
              <Layers size={16} className="text-accent" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-accent">
              {data?.architecture_score !== null && data?.architecture_score !== undefined
                ? `${data.architecture_score}%`
                : "--"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Modularity & boundary integrity</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Maintainability</span>
              <TrendingUp size={16} className="text-violet" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">
              {data?.maintainability_score !== null && data?.maintainability_score !== undefined
                ? `${data.maintainability_score}%`
                : "--"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Refactoring complexity index</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line/70 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-accent/15 text-accent font-semibold border border-accent/25"
              : "text-muted hover:text-ink"
          }`}
        >
          Executive Actions & Risks
        </button>
        <button
          onClick={() => setActiveTab("patterns")}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "patterns"
              ? "bg-accent/15 text-accent font-semibold border border-accent/25"
              : "text-muted hover:text-ink"
          }`}
        >
          Coding Patterns
        </button>
        <button
          onClick={() => setActiveTab("risks")}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "risks"
              ? "bg-accent/15 text-accent font-semibold border border-accent/25"
              : "text-muted hover:text-ink"
          }`}
        >
          Critical Risks ({data?.critical_risks?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recommended Next Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb size={16} className="text-accent" />
                <span>Recommended Engineering Fixes</span>
              </CardTitle>
              <CardDescription>
                High-priority remediations compiled across all specialized agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.recommended_fixes && data.recommended_fixes.length > 0 ? (
                data.recommended_fixes.map((fix, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-line bg-panel-raised space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-ink">{fix.file}</span>
                      <Badge variant="blue">{fix.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted">{fix.action}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted border border-dashed border-line rounded-xl">
                  No pending engineering fixes recorded. Run a code review to generate action items.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trade-offs & Decision Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span>Architectural Trade-offs</span>
              </CardTitle>
              <CardDescription>
                System trade-offs identified and stored in Hindsight memory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.trade_offs && data.trade_offs.length > 0 ? (
                data.trade_offs.map((to, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-line bg-panel-raised space-y-1">
                    <h4 className="text-xs font-semibold text-ink">{to.decision}</h4>
                    <p className="text-[11px] text-emerald-400 font-mono">+ {to.benefit}</p>
                    <p className="text-[11px] text-amber-400 font-mono">- {to.drawback}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted border border-dashed border-line rounded-xl">
                  No architectural trade-offs recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "patterns" && (
        <div className="space-y-4">
          {data?.patterns_detected && data.patterns_detected.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.patterns_detected.map((pattern, idx) => (
                <Card key={idx} variant="glass">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="blue">Detected Pattern</Badge>
                      <span className="font-mono text-xs text-accent">Active Signal</span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{pattern}</h3>
                    <p className="text-xs leading-relaxed text-muted">
                      Synthesized from repository code structure and multi-agent AST evaluation.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center space-y-3 border border-dashed border-line rounded-xl">
                <p className="text-xs text-muted">
                  No recurring code patterns or architectural hotspots detected yet in repository history.
                </p>
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
                >
                  Run analysis scan <ArrowRight size={12} />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "risks" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400" />
              <span>Critical Engineering Risks</span>
            </CardTitle>
            <CardDescription>
              Aggregated critical boundary violations and P0 security vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.critical_risks && data.critical_risks.length > 0 ? (
              data.critical_risks.map((risk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] text-xs font-mono text-rose-300">
                  {risk}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-muted border border-dashed border-line rounded-xl">
                Zero critical engineering risks detected across active modules.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
