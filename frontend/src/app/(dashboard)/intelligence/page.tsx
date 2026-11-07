"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<"patterns" | "mistakes">("patterns");

  const patterns = [
    {
      title: "Result Pattern vs Bare Exceptions",
      freq: "84% adherence",
      desc: "Services return a typed Result[T, E] union rather than raising uncaught domain exceptions.",
      impact: "High Maintainability",
    },
    {
      title: "Context Propagation in Async Workers",
      freq: "92% adherence",
      desc: "Correlation IDs and cancellation tokens are plumbed across celery and redis task queues.",
      impact: "Zero trace drops",
    },
    {
      title: "AST Semantic Linting",
      freq: "76% adherence",
      desc: "Tree-sitter queries validate that all exported controller methods have strict schema annotations.",
      impact: "API Contract Safety",
    },
  ];

  const repeatedMistakes = [
    {
      issue: "Missing Transaction Rollback on Failure",
      count: "7 instances flagged",
      files: "services/billing.py, workers/sync.py",
      mitigation: "CodeMind auto-suggests context manager `with db.begin():` block.",
    },
    {
      issue: "Unbounded Query Pagination",
      count: "5 instances flagged",
      files: "api/routes/users.py, api/routes/events.py",
      mitigation: "Strict `limit <= 100` enforcement added to engineering memory.",
    },
  ];

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
            Neural Pattern Model Active
          </Badge>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Learned Conventions</span>
              <BrainCircuit size={16} className="text-accent" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">42</div>
            <p className="mt-1 text-[11px] text-muted">Distilled from 120+ team code reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Defect Prevention Rate</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-400">89.4%</div>
            <p className="mt-1 text-[11px] text-muted">Repeat mistakes caught before staging</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>Feedback Alignment</span>
              <CheckCircle size={16} className="text-violet" />
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">95%</div>
            <p className="mt-1 text-[11px] text-muted">Recommendations accepted by senior reviewers</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line/70 pb-2">
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
          onClick={() => setActiveTab("mistakes")}
          className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "mistakes"
              ? "bg-accent/15 text-accent font-semibold border border-accent/25"
              : "text-muted hover:text-ink"
          }`}
        >
          Repeated Mistakes
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "patterns" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {patterns.map((pat, idx) => (
            <Card key={idx} variant="glass">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="blue">{pat.impact}</Badge>
                  <span className="font-mono text-xs text-accent font-semibold">{pat.freq}</span>
                </div>
                <h3 className="text-sm font-semibold text-ink">{pat.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{pat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {repeatedMistakes.map((mis, idx) => (
            <Card key={idx}>
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-ink">{mis.issue}</h3>
                  </div>
                  <Badge variant="amber">{mis.count}</Badge>
                </div>
                <p className="text-xs font-mono text-muted">Affected: {mis.files}</p>
                <div className="mt-2 rounded-lg bg-panel-raised p-3 text-xs text-ink/90 border border-line-subtle flex items-start gap-2">
                  <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>{mis.mitigation}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
