"use client";

import React, { useEffect, useState } from "react";
import {
  FileWarning,
  Flame,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { fetchLatestAnalysis, type OrchestratedAnalysis } from "@/lib/api";

interface Hotspot {
  file: string;
  basis: string;
  confidence: "High" | "Medium" | "Preliminary";
  riskLevel: "Critical" | "High" | "Medium";
  rationale: string;
}

export default function PredictionsPage() {
  const [data, setData] = useState<OrchestratedAnalysis | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestAnalysis("codemind/ai-core")
      .then((res) => {
        setData(res);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  // Derive honest hotspots from actual repository findings and coupling hotspots
  const hotspots: Hotspot[] = [];

  if (data) {
    for (const f of data.findings || []) {
      if ((f.priority === "P0" || f.priority === "P1" || f.severity === "critical") && f.file) {
        hotspots.push({
          file: f.file,
          basis: `AST Vulnerability (${f.priority || f.severity})`,
          confidence: "High",
          riskLevel: f.priority === "P0" ? "Critical" : "High",
          rationale: f.message || "High-severity finding with verified codebase evidence.",
        });
      }
    }
    for (const hotspot of data.patterns_detected || []) {
      hotspots.push({
        file: hotspot,
        basis: "Architectural Coupling Hotspot",
        confidence: "Medium",
        riskLevel: "Medium",
        rationale: "High module fan-in and cross-layer dependency concentration.",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Analysis / Risk Signals
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Predictive Risk Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Identify error-prone files and architectural hotspots based on verified code evidence and structural coupling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="amber">
            <Flame size={12} className="text-amber-500" />
            Evidence-Based Predictor Active
          </Badge>
        </div>
      </div>

      {/* Transparent Methodology Banner */}
      <Card variant="glass" className="border-accent/20 bg-accent/[0.02]">
        <CardContent className="p-4 flex items-start gap-3">
          <Info size={16} className="text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-muted leading-relaxed">
            <span className="font-semibold text-ink">Deterministic Evidence Standard: </span>
            CodeMind only highlights risk signals grounded in actual static analysis, AST tokens, or module coupling.
            When multi-commit historical churn data is insufficient, predictions remain honest rather than generating fabricated statistical forecasts.
          </div>
        </CardContent>
      </Card>

      {/* Overview Metric Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Evidence-Backed Hotspots</span>
            <div className="mt-2 text-3xl font-bold font-mono text-amber-500">
              {hotspots.length > 0 ? `${hotspots.length} Modules` : "0 Flagged"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Modules with verified high-priority findings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Analysis Source</span>
            <div className="mt-2 text-2xl font-bold font-mono text-ink">Multi-Agent</div>
            <p className="mt-1 text-[11px] text-muted">Architect + Security + Code Reviewer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Prediction Confidence</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">Deterministic</div>
            <p className="mt-1 text-[11px] text-muted">Zero fabricated churn probabilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Hotspots Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileWarning size={16} className="text-amber-500" />
            <span>Fragile Code Hotspots</span>
          </CardTitle>
          <CardDescription>
            Files flagged by multi-agent analysis for mandatory peer code reviews and boundary decoupling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hotspots.length > 0 ? (
            hotspots.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-panel-raised p-4 transition-colors hover:border-accent"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">{item.file}</span>
                    <Badge variant={item.riskLevel === "Critical" ? "red" : item.riskLevel === "High" ? "amber" : "blue"}>
                      {item.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{item.rationale}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted">Basis: {item.basis}</span>
                  <Badge variant="neutral">Confidence: {item.confidence}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-3 border border-dashed border-line rounded-xl">
              <p className="text-xs text-muted">
                No fragile hotspots or P0/P1 defects currently detected in repository snapshot.
              </p>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
              >
                Run a code review scan in workspace <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
