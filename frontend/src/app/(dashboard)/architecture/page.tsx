"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Layers, Cpu, GitCommit, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { fetchArchitectureAnalysis, type ArchitectureAnalysis } from "@/lib/api";

// Dynamic import for 3D architecture graph component
const Architecture3D = dynamic(
  () => import("@/components/3d/ArchitectureGraph").then((mod) => mod.ArchitectureGraph),
  { ssr: false }
);

export default function ArchitecturePage() {
  const [data, setData] = useState<ArchitectureAnalysis | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchitectureAnalysis("codemind/ai-core")
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Analysis / Architecture
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Software Architecture & Dependency Graph
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Visualize module boundaries, topological import dependencies, and circular dependency risks in 3D space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data?.architecture_score !== undefined && data.architecture_score !== null ? (
            <Badge variant="blue" className="text-xs px-3 py-1">
              Architecture Score: {data.architecture_score}/100
            </Badge>
          ) : (
            <Badge variant="neutral">Score: Not Scanned</Badge>
          )}
          <Badge variant="blue">
            <Cpu size={12} className="text-accent" />
            Interactive 3D Topology
          </Badge>
        </div>
      </div>

      {/* 3D Interactive Architecture Graph Canvas */}
      <Card variant="glass" className="overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <Badge variant="neutral">Drag to rotate topology</Badge>
          <span className="font-mono text-[10px] text-muted">Multi-Agent Synaptic Nodes</span>
        </div>

        <div className="h-[380px] w-full bg-[#06080C]/80 relative">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
            <Suspense fallback={null}>
              <Architecture3D />
            </Suspense>
          </Canvas>
        </div>
      </Card>

      {/* When analysis data exists, render real metrics */}
      {data ? (
        <>
          {/* Architecture Modularity Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-medium text-muted">Coupling Level</span>
                <div className="mt-2 text-2xl font-bold font-mono capitalize text-accent">
                  {data.modularity?.coupling_level || "N/A"}
                </div>
                <p className="mt-1 text-[11px] text-muted">Inter-module dependency density</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-medium text-muted">Cohesion Level</span>
                <div className="mt-2 text-2xl font-bold font-mono capitalize text-emerald-400">
                  {data.modularity?.cohesion_level || "N/A"}
                </div>
                <p className="mt-1 text-[11px] text-muted">Functional responsibility grouping</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-medium text-muted">Boundary Health</span>
                <div className="mt-2 text-2xl font-bold font-mono capitalize text-ink">
                  {data.modularity?.boundary_health || "N/A"}
                </div>
                <p className="mt-1 text-[11px] text-muted">Layer separation integrity</p>
              </CardContent>
            </Card>
          </div>

          {/* Architectural Decision Records (ADRs) */}
          {data.adrs_extracted && data.adrs_extracted.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText size={16} className="text-accent" />
                  <span>Extracted Architectural Decision Records (ADRs)</span>
                </CardTitle>
                <CardDescription>
                  Architectural decisions inferred from the codebase and stored in Hindsight memory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.adrs_extracted.map((adr, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-line-subtle bg-panel-raised/50 p-4 transition-colors hover:border-line"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ink font-mono">{adr.title}</h4>
                      <Badge variant="blue" className="capitalize">{adr.status}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted leading-relaxed">{adr.context}</p>
                    {adr.consequences && (
                      <p className="mt-1 text-[11px] text-muted font-mono">Consequences: {adr.consequences}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Architectural Trade-offs */}
          {data.trade_offs && data.trade_offs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GitCommit size={16} className="text-accent" />
                  <span>Architectural Trade-offs Identified</span>
                </CardTitle>
                <CardDescription>
                  Explicit trade-off evaluations identified by the Software Architect agent
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {data.trade_offs.map((to, idx) => (
                  <div key={idx} className="rounded-xl border border-line bg-panel-raised p-4 space-y-2">
                    <p className="text-xs font-semibold text-ink">{to.decision}</p>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      + Gain: {to.benefit}
                    </div>
                    <div className="text-[11px] text-amber-400 font-mono">
                      - Cost: {to.drawback}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Architectural Findings & Boundary Violations */}
          {data.findings && data.findings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers size={16} className="text-accent" />
                  <span>Architectural Findings & Boundary Violations</span>
                </CardTitle>
                <CardDescription>
                  Concrete findings identified by the Software Architect agent with code evidence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.findings.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="rounded-xl border border-line bg-panel-raised p-4 space-y-2 transition-colors hover:border-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">{f.component || f.file}</span>
                      <Badge variant="blue">{f.priority || "P2"}</Badge>
                    </div>
                    <p className="text-xs text-muted">{f.message}</p>
                    {f.evidence && (
                      <p className="font-mono text-[11px] text-accent/80 bg-black/40 p-2 rounded">
                        Evidence: {f.evidence}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Honest empty state when no analysis has been performed yet */
        <Card variant="glass" className="border-dashed border-line">
          <CardContent className="p-10 text-center space-y-3">
            <Layers size={32} className="mx-auto text-muted/60" />
            <h3 className="text-base font-semibold text-ink">No Architecture Analysis Recorded</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              No architectural evaluation has been run yet for this repository. Trigger a multi-agent review in the workspace to analyze module coupling, boundary integrity, and ADRs.
            </p>
            <div className="pt-2">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline"
              >
                <span>Run Analysis in Code Reviews</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
