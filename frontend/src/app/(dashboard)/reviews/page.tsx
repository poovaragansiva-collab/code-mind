"use client";

import React, { useState } from "react";
import {
  GitBranch,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";
import { ReviewFindingCard, type ReviewFinding } from "@/components/reviews/ReviewFindingCard";
import { SeverityBadge, type SeverityLevel } from "@/components/reviews/SeverityBadge";

const mockFindings: ReviewFinding[] = [
  {
    id: "f-1",
    title: "SQL Parameter Injection Vulnerability in Repository Query",
    fileName: "backend/app/services/repository.py",
    lineNumber: 47,
    severity: "critical",
    problemExplanation:
      "Raw string interpolation (`f\"SELECT * FROM repos WHERE name = '{repo_name}'\"`) is executed directly. This bypasses SQLAlchemy query parameters and leaves the endpoint susceptible to SQL injection.",
    codeSnippet: `def get_repo_by_name(db: Session, repo_name: str):\n    # Direct execution of unescaped user input\n    query = f"SELECT * FROM repositories WHERE name = '{repo_name}'"\n    return db.execute(text(query)).first()`,
    suggestedCorrection: `def get_repo_by_name(db: Session, repo_name: str):\n    # Parameterized query preventing injection\n    stmt = select(Repository).where(Repository.name == repo_name)\n    return db.scalars(stmt).first()`,
    conventionRule: "SEC-01: Parameterized queries must be used across all DB calls.",
  },
  {
    id: "f-2",
    title: "Unbounded In-Memory Body Buffer in Route Proxy",
    fileName: "frontend/src/app/api/[...path]/route.ts",
    lineNumber: 68,
    severity: "high",
    problemExplanation:
      "When proxying chunked multipart payloads without an explicit upstream timeout or content-length upper limit check, an attacker can exhaust worker memory via Slowloris or oversized buffers.",
    codeSnippet: `const chunks: Uint8Array[] = [];\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  chunks.push(value);\n}`,
    suggestedCorrection: `let totalBytes = 0;\nwhile (true) {\n  const { done, value } = await reader.read();\n  if (done) break;\n  totalBytes += value.byteLength;\n  if (totalBytes > MAX_BODY_BYTES) throw new PayloadTooLargeError();\n  chunks.push(value);\n}`,
    conventionRule: "PERF-04: Streaming proxies must enforce strict MAX_BODY_BYTES limits.",
  },
  {
    id: "f-3",
    title: "Missing Error Boundary Around Three.js Canvas Mount",
    fileName: "frontend/src/components/3d/NeuralBackground.tsx",
    lineNumber: 82,
    severity: "medium",
    problemExplanation:
      "On environments lacking WebGL2 acceleration or strict headless CI browsers, unhandled WebGL context loss will throw unhandled exceptions and blank out the entire dashboard.",
    codeSnippet: `<Suspense fallback={<BackgroundFallback />}>\n  <ThreeCanvasScene mode={activeIntensity} />\n</Suspense>`,
    suggestedCorrection: `<ErrorBoundary fallback={<BackgroundFallback />}>\n  <Suspense fallback={<BackgroundFallback />}>\n    <ThreeCanvasScene mode={activeIntensity} />\n  </Suspense>\n</ErrorBoundary>`,
    conventionRule: "REACT-02: 3D and Canvas viewports must be encapsulated in ErrorBoundaries.",
  },
  {
    id: "f-4",
    title: "Redundant Object Allocation Inside Animation Render Loop",
    fileName: "frontend/src/components/3d/FloatingParticles.tsx",
    lineNumber: 54,
    severity: "low",
    problemExplanation:
      "Creating new `THREE.Color` instances inside `useFrame` triggers garbage collection spikes and degrades FPS on mobile devices.",
    codeSnippet: `useFrame(() => {\n  const col = new THREE.Color("#168BFF");\n  pointsRef.current.material.color = col;\n});`,
    suggestedCorrection: `const colorRef = useRef(new THREE.Color("#168BFF"));\nuseFrame(() => {\n  pointsRef.current.material.color.copy(colorRef.current);\n});`,
    conventionRule: "PERF-08: Zero allocations inside 60fps render ticks.",
  },
];

export default function CodeReviewsPage() {
  const [selectedRepo, setSelectedRepo] = useState("codemind/ai-core");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("b9a4c17e");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | "all">("all");
  const [findings] = useState<ReviewFinding[]>(mockFindings);

  const startReview = () => {
    setIsReviewing(true);
    setReviewProgress(15);

    const step1 = setTimeout(() => setReviewProgress(45), 600);
    const step2 = setTimeout(() => setReviewProgress(80), 1200);
    const step3 = setTimeout(() => {
      setReviewProgress(100);
      setIsReviewing(false);
    }, 1800);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const filteredFindings = findings.filter((f) =>
    selectedSeverity === "all" ? true : f.severity === selectedSeverity
  );

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Workspace / AI Review Agent
            </span>
            <Badge variant="blue">Milestone 02 Engine</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            AI Code Review Workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Continuous static analysis, AST vulnerability detection, and team convention enforcement anchored to commit evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="green">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Groq LPU Acceleration
          </Badge>
        </div>
      </div>

      {/* Review Trigger Configuration Card */}
      <Card variant="glass">
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Target Repository
              </label>
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              >
                <option value="codemind/ai-core">codemind/ai-core</option>
                <option value="org/web-service-v2">org/web-service-v2</option>
                <option value="payments/checkout-worker">payments/checkout-worker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Target Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              >
                <option value="main">main (production)</option>
                <option value="develop">develop</option>
                <option value="feat/review-agent">feat/review-agent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Commit SHA (Anchored)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  placeholder="e.g. b9a4c17e"
                  className="w-full rounded-xl border border-line bg-panel px-3 py-2 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
                <GitBranch size={13} className="pointer-events-none absolute right-3 top-2.5 text-muted" />
              </div>
            </div>

            <div>
              <Button
                onClick={startReview}
                disabled={isReviewing}
                className="w-full"
                size="default"
              >
                {isReviewing ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    Analyzing AST & Memory...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Start Code Review
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Review Progress Bar */}
          {reviewProgress !== null && (
            <div className="mt-5 space-y-2 pt-4 border-t border-line">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-accent" />
                  {reviewProgress === 100
                    ? "Analysis Complete · 4 Findings identified"
                    : "Running Tree-Sitter & Hindsight checks..."}
                </span>
                <span className="font-mono text-muted">{reviewProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full bg-gradient-to-r from-accent to-violet transition-all duration-300"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Summary Metrics */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Critical", count: counts.critical, severity: "critical" as const },
          { label: "High", count: counts.high, severity: "high" as const },
          { label: "Medium", count: counts.medium, severity: "medium" as const },
          { label: "Low", count: counts.low, severity: "low" as const },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() =>
              setSelectedSeverity(
                selectedSeverity === item.severity ? "all" : item.severity
              )
            }
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 text-left ${
              selectedSeverity === item.severity
                ? "border-accent bg-panel-raised shadow-md"
                : "border-line bg-panel hover:border-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <SeverityBadge severity={item.severity} />
            </div>
            <span className="font-mono text-2xl font-bold text-ink">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-muted" />
          <span className="text-xs font-semibold text-ink">Findings Feed</span>
          <span className="rounded-full bg-panel-raised px-2 py-0.5 font-mono text-[11px] text-muted border border-line">
            {filteredFindings.length}
          </span>
        </div>

        <div className="flex gap-1">
          {(["all", "critical", "high", "medium", "low"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors capitalize ${
                selectedSeverity === sev
                  ? "bg-accent/20 text-accent font-semibold"
                  : "text-muted hover:text-ink"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <ReviewFindingCard
            key={finding.id}
            finding={finding}
            onAccept={(id) => console.log("Accepted finding:", id)}
            onReject={(id) => console.log("Rejected finding:", id)}
            onSubmitCorrection={(id, note) =>
              console.log("Memory context recorded for finding:", id, note)
            }
          />
        ))}
      </div>
    </div>
  );
}
