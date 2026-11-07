"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";

export default function SecurityPage() {
  const securityFindings = [
    {
      id: "sec-1",
      title: "Hardcoded API secret token in staging config",
      severity: "critical" as const,
      scanner: "TruffleHog / Git Leaks",
      file: "backend/alembic/env.py.sample:12",
      status: "Remediated",
    },
    {
      id: "sec-2",
      title: "Cross-Site Scripting (XSS) via Unsanitized Markdown Render",
      severity: "high" as const,
      scanner: "Semgrep SAST",
      file: "frontend/src/components/reviews/CodeSnippet.tsx:28",
      status: "Open",
    },
    {
      id: "sec-3",
      title: "Insecure Deserialization in Redis Cache Worker",
      severity: "medium" as const,
      scanner: "Bandit / Python AST",
      file: "backend/app/core/database.py:91",
      status: "In Review",
    },
    {
      id: "sec-4",
      title: "Permissive CORS Wildcard on Localhost API Proxy",
      severity: "low" as const,
      scanner: "Semgrep SAST",
      file: "frontend/src/app/api/[...path]/route.ts:55",
      status: "Open",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Analysis / Security
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Vulnerability & Security Posture
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Evidence-backed security scanning. Detect OWASP Top 10 vulnerabilities, secrets leakage, and unsafe dependency packages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="green">
            <ShieldCheck size={12} className="text-emerald-500" />
            Scanner Engine Active
          </Badge>
        </div>
      </div>

      {/* Security Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Critical CVEs</span>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-500">0</div>
            <p className="mt-1 text-[11px] text-muted">Zero exploitable unpatched flaws</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Dependency Security</span>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">100%</div>
            <p className="mt-1 text-[11px] text-muted">All npm & uv packages verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Secrets Detected</span>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-500">0</div>
            <p className="mt-1 text-[11px] text-muted">Commit history clean</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Scan Coverage</span>
            <div className="mt-2 text-3xl font-bold font-mono text-accent">100%</div>
            <p className="mt-1 text-[11px] text-muted">Full repository tree analyzed</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Findings Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            <span>Active Security Audit Log</span>
          </CardTitle>
          <CardDescription>
            Scanner findings verified against source code files and AST tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {securityFindings.map((finding) => (
            <div
              key={finding.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-panel-raised p-4 transition-colors hover:border-accent"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={finding.severity} />
                  <span className="font-mono text-xs text-muted">{finding.scanner}</span>
                </div>
                <h4 className="text-sm font-semibold text-ink">{finding.title}</h4>
                <p className="font-mono text-[11px] text-muted">{finding.file}</p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    finding.status === "Remediated"
                      ? "green"
                      : finding.status === "In Review"
                      ? "blue"
                      : "amber"
                  }
                >
                  {finding.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
