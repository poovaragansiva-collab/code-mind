"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { fetchLatestAnalysis, type OrchestratedAnalysis } from "@/lib/api";

export default function QualityPage() {
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

  const qualityScores = [
    {
      label: "Maintainability Index",
      score: data?.maintainability_score !== null && data?.maintainability_score !== undefined
        ? `${data.maintainability_score}/100`
        : "--",
      status: data?.maintainability_score ? "Calculated" : "Pending scan",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      label: "Quality Score",
      score: data?.quality_score !== null && data?.quality_score !== undefined
        ? `${data.quality_score}/100`
        : "--",
      status: data?.quality_score ? "Evaluated" : "Pending scan",
      color: "text-accent",
    },
    {
      label: "Actionable Findings",
      score: data?.findings ? `${data.findings.length}` : "--",
      status: data?.findings ? `${data.findings.length} detected` : "Pending scan",
      color: "text-violet",
    },
    {
      label: "Critical Risks",
      score: data?.critical_risks ? `${data.critical_risks.length}` : "--",
      status: data?.critical_risks?.length === 0 ? "Zero P0 Risks" : "Review needed",
      color: data?.critical_risks?.length === 0 ? "text-emerald-400" : "text-amber-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Analysis / Quality
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Code Quality & Maintainability
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Ground-truth code evaluation powered by multi-agent AST review and Hindsight engineering conventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data ? (
            <Badge variant="blue">Repo: {data.repo_id}</Badge>
          ) : (
            <Badge variant="neutral">No Active Analysis</Badge>
          )}
        </div>
      </div>

      {/* Quality Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {qualityScores.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <span className="text-xs font-medium text-muted">{item.label}</span>
              <div className={`mt-2 font-mono text-3xl font-bold tracking-tight ${item.color}`}>
                {item.score}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{item.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality Rules & Active Violations */}
      {data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck2 size={16} className="text-accent" />
                <span>Quality Findings & Actions</span>
              </CardTitle>
              <CardDescription>Actionable code quality findings from latest run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.findings && data.findings.length > 0 ? (
                data.findings
                  .filter((f) => f.category === "quality")
                  .slice(0, 5)
                  .map((finding, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-line bg-panel-raised p-3"
                    >
                      <div>
                        <p className="text-xs font-medium text-ink">{finding.message || finding.id}</p>
                        <p className="text-[11px] font-mono text-muted">{finding.file || "Workspace"}</p>
                      </div>
                      <Badge variant={finding.priority === "P0" ? "red" : "blue"}>
                        {finding.priority}
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="p-4 text-center text-xs text-muted">
                  No quality defects flagged in this repository snapshot.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers size={16} className="text-violet" />
                <span>Structural & Refactoring Hotspots</span>
              </CardTitle>
              <CardDescription>Coupling and modularity hotspots flagged by Architecture agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.patterns_detected && data.patterns_detected.length > 0 ? (
                data.patterns_detected.map((spot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-line bg-panel-raised p-3"
                  >
                    <div>
                      <p className="text-xs font-mono font-medium text-ink">{spot}</p>
                      <p className="text-[11px] text-muted">High fan-in structural coupling hotspot</p>
                    </div>
                    <span className="rounded bg-panel px-2 py-0.5 font-mono text-xs text-amber-500 border border-line">
                      Review Needed
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted">
                  No structural hotspots flagged across analyzed files.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : !loading ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3 border border-dashed border-line rounded-xl">
            <TrendingUp size={24} className="mx-auto text-muted" />
            <p className="text-xs text-muted">
              No quality analysis recorded yet for this repository. Run a code review to evaluate maintainability and complexity.
            </p>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
            >
              Start code review <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
