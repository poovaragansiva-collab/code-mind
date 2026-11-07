"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  ShieldX,
} from "lucide-react";
import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";
import { fetchSecurityAnalysis, type SecurityAnalysis } from "@/lib/api";

export default function SecurityPage() {
  const [data, setData] = useState<SecurityAnalysis | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityAnalysis("codemind/ai-core")
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const matrix = data?.risk_matrix || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const findings = data?.findings || [];

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
            Adversarial security scanning. Detect OWASP Top 10 vulnerabilities, secrets leakage, and unsafe injection vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data?.security_score !== undefined && data.security_score !== null ? (
            <Badge variant="blue" className="text-xs px-3 py-1">
              Security Score: {data.security_score}/100
            </Badge>
          ) : (
            <Badge variant="neutral">Score: Not Scanned</Badge>
          )}
          <Badge variant="green">
            <ShieldCheck size={12} className="text-emerald-500" />
            Adversarial Engine Active
          </Badge>
        </div>
      </div>

      {/* Security Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Critical (P0)</span>
            <div className={`mt-2 text-3xl font-bold font-mono ${matrix.critical > 0 ? "text-rose-500" : "text-emerald-500"}`}>
              {data ? matrix.critical : "—"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Immediate exploitability</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">High Severity (P1)</span>
            <div className={`mt-2 text-3xl font-bold font-mono ${matrix.high > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {data ? matrix.high : "—"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Severe application impact</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Medium Severity (P2)</span>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">
              {data ? matrix.medium : "—"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Moderate defense-in-depth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Low / Info (P3)</span>
            <div className="mt-2 text-3xl font-bold font-mono text-muted">
              {data ? matrix.low : "—"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Hardening recommendations</p>
          </CardContent>
        </Card>
      </div>

      {data ? (
        <>
          {/* Threat Model Section */}
          {data.threat_model && data.threat_model.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock size={16} className="text-amber-500" />
                  <span>Adversarial Threat Model</span>
                </CardTitle>
                <CardDescription>
                  Threat scenarios and attack vectors mapped to recommended defensive controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.threat_model.map((tm, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-panel-raised p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-rose-400 font-mono">{tm.threat}</h4>
                      <Badge variant="amber">Active Threat Vector</Badge>
                    </div>
                    <p className="text-xs text-muted font-mono">Vector: {tm.vector}</p>
                    <p className="text-xs text-emerald-400 font-mono">Mitigation: {tm.mitigation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Findings Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-500" />
                <span>Verified Vulnerabilities & Findings ({findings.length})</span>
              </CardTitle>
              <CardDescription>
                Findings backed by concrete repository evidence, CWE classification, and exact remediation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {findings.length > 0 ? (
                findings.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="rounded-xl border border-line bg-panel-raised p-4 sm:p-5 space-y-3 transition-colors hover:border-accent"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={f.severity || "medium"} />
                        {f.cwe && <Badge variant="neutral">{f.cwe}</Badge>}
                        {f.priority && <Badge variant="blue">{f.priority}</Badge>}
                      </div>
                      <span className="font-mono text-xs text-muted">
                        {f.file ? `${f.file}${f.line ? `:${f.line}` : ""}` : "Global context"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-ink">
                        {f.message || f.explanation || "Security finding"}
                      </h4>
                      {f.owasp_category && (
                        <p className="text-[11px] text-muted font-mono mt-0.5">
                          Category: {f.owasp_category}
                        </p>
                      )}
                    </div>

                    {f.evidence && (
                      <div className="rounded-lg bg-black/40 border border-line-subtle p-3 font-mono text-xs text-rose-300 overflow-x-auto">
                        <div className="text-[10px] uppercase text-muted mb-1 font-sans">Evidence:</div>
                        <code>{f.evidence}</code>
                      </div>
                    )}

                    {f.recommendation && (
                      <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 font-mono text-xs text-emerald-300">
                        <div className="text-[10px] uppercase text-emerald-400 mb-1 font-sans">Remediation:</div>
                        {f.recommendation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-muted font-mono">
                  No security vulnerabilities detected. Codebase matches secure coding baseline.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Honest empty state when no analysis has been run yet */
        <Card variant="glass" className="border-dashed border-line">
          <CardContent className="p-10 text-center space-y-3">
            <ShieldX size={32} className="mx-auto text-muted/60" />
            <h3 className="text-base font-semibold text-ink">No Security Scan Recorded</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Adversarial vulnerability detection and threat modeling run during repository analysis. Trigger a scan from the workspace to inspect OWASP Top 10 risks and credential exposures.
            </p>
            <div className="pt-2">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline"
              >
                <span>Trigger Security Scan in Reviews</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
