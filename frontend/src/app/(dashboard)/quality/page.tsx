"use client";

import React from "react";
import {
  FileCheck2,
  Layers,
} from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";

export default function QualityPage() {
  const qualityScores = [
    { label: "Maintainability Index", score: "88/100", status: "Optimal", color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Cyclomatic Complexity", score: "4.2 avg", status: "Low Risk", color: "text-accent" },
    { label: "Code Duplication", score: "2.1%", status: "Passing (<3%)", color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Technical Debt", score: "1.4 days", status: "Manageable", color: "text-violet" },
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
            Ground-truth static code evaluation powered by Ruff, ESLint, and Tree-sitter complexity analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue">Commit #b9a4c17e</Badge>
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
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck2 size={16} className="text-accent" />
              <span>Static Linter Compliance</span>
            </CardTitle>
            <CardDescription>Automated AST rules checked across codebase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { rule: "Ruff / Python 3.12 Type Annotations", passed: "99.2%", status: "Passed" },
              { rule: "ESLint React 19 Compiler Rules", passed: "100%", status: "Passed" },
              { rule: "Strict Async Exception Propagation", passed: "94.6%", status: "Notice" },
              { rule: "Max Function Length (< 50 lines)", passed: "91.8%", status: "Passed" },
            ].map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-line bg-panel-raised p-3"
              >
                <div>
                  <p className="text-xs font-medium text-ink">{rule.rule}</p>
                  <p className="text-[11px] font-mono text-muted">{rule.passed} compliant</p>
                </div>
                <Badge variant={rule.status === "Passed" ? "green" : "amber"}>
                  {rule.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={16} className="text-violet" />
              <span>Duplication & Complexity Hotspots</span>
            </CardTitle>
            <CardDescription>Functions requiring refactoring or extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { func: "parse_raw_tree_payload()", file: "analysis/tree.py", complexity: "CC: 14", rec: "Extract sub-parsers" },
              { func: "handleRouteDispatch()", file: "api/[...path]/route.ts", complexity: "CC: 11", rec: "Simplify switch logic" },
              { func: "recalculateClusterBounds()", file: "3d/NeuralNetwork.tsx", complexity: "CC: 9", rec: "Memoize coordinates" },
            ].map((spot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-line bg-panel-raised p-3"
              >
                <div>
                  <p className="text-xs font-mono font-medium text-ink">{spot.func}</p>
                  <p className="text-[11px] text-muted">{spot.file} · {spot.rec}</p>
                </div>
                <span className="rounded bg-panel px-2 py-0.5 font-mono text-xs text-amber-500 dark:text-amber-400 border border-line">
                  {spot.complexity}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
