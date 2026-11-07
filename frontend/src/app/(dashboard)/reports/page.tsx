"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Calendar,
  GitCommit,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";
import { fetchLatestAnalysis, type OrchestratedAnalysis } from "@/lib/api";

export default function ReportsPage() {
  const [data, setData] = useState<OrchestratedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchLatestAnalysis("codemind/ai-core")
      .then((res) => {
        if (res) setData(res);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    if (!data) return;
    setDownloading(true);
    setTimeout(() => {
      const findingsSummary = data.findings
        .map((f) => `  [${f.priority || f.severity}] ${f.file || "workspace"}: ${f.message || f.id}`)
        .join("\n");

      const tradeOffsSummary = (data.trade_offs || [])
        .map((t) => `  * ${t.decision} -> Benefit: ${t.benefit} | Drawback: ${t.drawback}`)
        .join("\n");

      const content = [
        "===========================================================",
        "                 CODEMIND AUDIT REPORT                     ",
        "===========================================================",
        `Repository:      ${data.repo_id}`,
        `Generated:       ${new Date().toISOString()}`,
        `Overall Score:   ${data.overall_score ?? "N/A"}/100`,
        `Security Score:  ${data.security_score ?? "N/A"}/100`,
        `Arch Score:      ${data.architecture_score ?? "N/A"}/100`,
        `Quality Score:   ${data.quality_score ?? "N/A"}/100`,
        "",
        "EXECUTIVE SUMMARY:",
        data.summary || "No executive summary available.",
        "",
        `ACTIONABLE FINDINGS (${data.findings.length}):`,
        findingsSummary || "  None detected.",
        "",
        "ARCHITECTURAL TRADE-OFFS:",
        tradeOffsSummary || "  None recorded.",
        "",
        "===========================================================",
        "Anchored to verified deterministic AST and multi-agent review.",
      ].join("\n");

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codemind-audit-${data.repo_id.replace(/\//g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Context / History
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Analysis & Compliance Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Export structured audits, vulnerability assessments, and engineering convention metrics anchored to verified repository evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue">
            <Calendar size={12} className="text-accent" />
            Audit Logging Active
          </Badge>
        </div>
      </div>

      {/* Reports Feed */}
      {data ? (
        <div className="space-y-4">
          <Card className="hover:border-accent">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="green">Verified Audit</Badge>
                  <span className="font-mono text-xs text-muted flex items-center gap-1">
                    <GitCommit size={13} /> latest
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink">
                  Multi-Agent Security & Architecture Audit Report
                </h3>
                <p className="font-mono text-[11px] text-muted">
                  Target: <span className="text-ink">{data.repo_id}</span> · Findings:{" "}
                  <span className="text-ink font-semibold">{data.findings.length}</span> · Overall Score:{" "}
                  <span className="text-accent font-semibold">{data.overall_score ?? "N/A"}/100</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  size="sm"
                  variant="outline"
                >
                  <Download size={14} className={downloading ? "animate-bounce" : ""} />
                  <span>{downloading ? "Exporting..." : "Download Report"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !loading ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3 border border-dashed border-line rounded-xl">
            <FileText size={24} className="mx-auto text-muted" />
            <p className="text-xs text-muted">
              No audit reports generated yet. Run an analysis scan on a repository to generate exportable compliance summaries.
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
