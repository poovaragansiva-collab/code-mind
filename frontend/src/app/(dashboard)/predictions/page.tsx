"use client";

import React from "react";
import {
  FileWarning,
  Flame,
} from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";

export default function PredictionsPage() {
  const riskModules = [
    {
      file: "backend/app/services/repository.py",
      score: "82% Risk",
      churn: "14 edits / 7 days",
      reasons: "High code churn, multiple authors, frequent rollback history",
      level: "High",
    },
    {
      file: "frontend/src/app/api/[...path]/route.ts",
      score: "68% Risk",
      churn: "9 edits / 7 days",
      reasons: "Streaming protocol updates, edge runtime compatibility",
      level: "Medium",
    },
    {
      file: "backend/app/analysis/engine.py",
      score: "45% Risk",
      churn: "4 edits / 7 days",
      reasons: "AST grammar updates, deterministic parser validation",
      level: "Low",
    },
  ];

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
            Identify error-prone files, regression vulnerabilities, and high-churn code hotspots before merging changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="amber">
            <Flame size={12} className="text-amber-500" />
            Regression Predictor Active
          </Badge>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">High-Risk Code Churn</span>
            <div className="mt-2 text-3xl font-bold font-mono text-amber-500">2 Files</div>
            <p className="mt-1 text-[11px] text-muted">Surpass 70% regression probability</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Average Churn Rate</span>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">4.2 lines/commit</div>
            <p className="mt-1 text-[11px] text-muted">Normal velocity across team</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Flaky Defect Prediction</span>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-500 dark:text-emerald-400">0 Flaky</div>
            <p className="mt-1 text-[11px] text-muted">Zero test regressions observed</p>
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
            Files flagged for comprehensive unit testing and peer code reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {riskModules.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-panel-raised p-4 transition-colors hover:border-accent"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-ink">{item.file}</span>
                  <Badge variant={item.level === "High" ? "red" : item.level === "Medium" ? "amber" : "blue"}>
                    {item.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted leading-relaxed">{item.reasons}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">{item.churn}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
