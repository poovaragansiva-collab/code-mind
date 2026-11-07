"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { Layers, Cpu } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";

// Dynamic import for 3D architecture graph component
const Architecture3D = dynamic(
  () => import("@/components/3d/ArchitectureGraph").then((mod) => mod.ArchitectureGraph),
  { ssr: false }
);

export default function ArchitecturePage() {
  const modules = [
    { name: "FastAPI Core Gateway", deps: "alembic, pydantic, sqlalchemy", risk: "Low", status: "Healthy" },
    { name: "Code Review Agent", deps: "groq, ast-parser, tree-sitter", risk: "Low", status: "Optimized" },
    { name: "Hindsight Memory Engine", deps: "vector-store, hindsight-sdk", risk: "Medium", status: "Active" },
    { name: "Frontend Next.js App", deps: "react-19, three.js, tailwindcss", risk: "Low", status: "Active" },
  ];

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

        <div className="flex items-center gap-2">
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
          <span className="font-mono text-[10px] text-muted">8 Nodes · 9 Synaptic Edges</span>
        </div>

        <div className="h-[380px] w-full bg-[#06080C]/80 relative">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
            <Suspense fallback={null}>
              <Architecture3D />
            </Suspense>
          </Canvas>
        </div>
      </Card>

      {/* Module Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers size={16} className="text-accent" />
            <span>Ingested System Modules</span>
          </CardTitle>
          <CardDescription>
            Component coupling, cohesion metrics, and dependency relations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.map((m, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line-subtle bg-panel-raised/50 p-4 transition-colors hover:border-line"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <p className="font-mono text-[11px] text-muted mt-0.5">
                  Dependencies: <span className="text-ink/80">{m.deps}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted font-mono">Coupling: {m.risk}</span>
                <Badge variant={m.status === "Healthy" || m.status === "Optimized" ? "green" : "blue"}>
                  {m.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
