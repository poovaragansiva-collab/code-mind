"use client";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";
import { ReviewFindingCard, type ReviewFinding } from "@/components/reviews/ReviewFindingCard";
import { SeverityBadge, type SeverityLevel } from "@/components/reviews/SeverityBadge";
import {
  triggerRepositoryAnalysis,
  fetchLatestAnalysis,
  submitFeedback,
  type Finding,
} from "@/lib/api";

function mapFindingToReviewFinding(f: Finding, index: number): ReviewFinding {
  return {
    id: f.id || `finding-${index}`,
    title: f.message || f.explanation || "Code Finding",
    fileName: f.file || "unknown",
    lineNumber: f.line || 1,
    severity: (f.severity?.toLowerCase() as SeverityLevel) || "medium",
    problemExplanation: f.explanation || f.message || "Potential defect detected by analysis.",
    codeSnippet: f.evidence || `// Evidence flagged in ${f.file || "source file"}`,
    suggestedCorrection: f.recommendation || "Follow established codebase conventions.",
    conventionRule: `${f.priority || "P2"}: ${f.category || "quality"} enforcement`,
  };
}

export default function CodeReviewsPage() {
  const [selectedRepo, setSelectedRepo] = useState("codemind/ai-core");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("b9a4c17e");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewProgress, setReviewProgress] = useState<number | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [feedbackFeedback, setFeedbackFeedback] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Attempt to load existing real analysis for selectedRepo
  useEffect(() => {
    fetchLatestAnalysis(selectedRepo)
      .then((res) => {
        if (res && res.findings && res.findings.length > 0) {
          setFindings(res.findings.map(mapFindingToReviewFinding));
        } else {
          setFindings([]);
        }
      })
      .catch(() => setFindings([]));
  }, [selectedRepo]);

  const startReview = async () => {
    setIsReviewing(true);
    setReviewError(null);
    setReviewProgress(20);

    const timer = setInterval(() => {
      setReviewProgress((prev) => (prev && prev < 85 ? prev + 15 : prev));
    }, 800);

    try {
      const codeSample = `
// Target Repository: ${selectedRepo} (${selectedBranch} @ ${commitSha})
// Multi-Agent Analysis Context
import os, sys
def authenticate_user(username, password):
    import hashlib
    # MD5 without salt
    hashed = hashlib.md5(password.encode()).hexdigest()
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{hashed}'"
    return db.execute(query).fetchall()
`;
      const result = await triggerRepositoryAnalysis(selectedRepo, codeSample, true);
      clearInterval(timer);
      setReviewProgress(100);
      if (result.findings && result.findings.length > 0) {
        setFindings(result.findings.map(mapFindingToReviewFinding));
      } else {
        setFindings([]);
      }
    } catch (err: unknown) {
      clearInterval(timer);
      setReviewProgress(null);
      setReviewError(err instanceof Error ? err.message : "Analysis request failed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAcceptFinding = async (id: string) => {
    try {
      await submitFeedback(selectedRepo, id, "accepted", "Confirmed valid finding. Stored as team convention.");
      setFeedbackFeedback(`Finding ${id} accepted & stored into Hindsight memory as [TEAM_CONVENTION]`);
      setTimeout(() => setFeedbackFeedback(null), 4000);
    } catch {
      setFeedbackFeedback(`Failed to sync feedback for ${id} to Hindsight.`);
    }
  };

  const handleRejectFinding = async (id: string) => {
    try {
      await submitFeedback(selectedRepo, id, "rejected", "Rejected by reviewer: intentional trade-off.");
      setFeedbackFeedback(`Finding ${id} rejected & stored as [FEEDBACK:REJECTED] so it is not re-flagged.`);
      setTimeout(() => setFeedbackFeedback(null), 4000);
    } catch {
      setFeedbackFeedback(`Failed to sync rejection for ${id}.`);
    }
  };

  const handleCorrection = async (id: string, customNote: string) => {
    try {
      await submitFeedback(selectedRepo, id, "corrected", customNote);
      setFeedbackFeedback(`Custom convention rule retained for ${id} in Hindsight.`);
      setTimeout(() => setFeedbackFeedback(null), 4000);
    } catch {
      setFeedbackFeedback(`Failed to submit correction for ${id}.`);
    }
  };

  const filteredFindings = findings.filter((f) => {
    const matchesSev = selectedSeverity === "all" ? true : f.severity === selectedSeverity;
    const matchesPri = selectedPriority === "all" ? true : f.conventionRule?.startsWith(selectedPriority);
    return matchesSev && matchesPri;
  });

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
              Workspace / Multi-Agent Review
            </span>
            <Badge variant="blue">P0-P3 Classified</Badge>
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
              <input
                type="text"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                placeholder="owner/repo"
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Target Branch
              </label>
              <input
                type="text"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                placeholder="main"
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              />
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
                    Orchestrating 3 Agents...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Start Multi-Agent Review
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Banner */}
          {reviewError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-mono">
              {reviewError}
            </div>
          )}

          {/* Feedback Toast */}
          {feedbackFeedback && (
            <div className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-accent font-mono flex items-center gap-2">
              <CheckCircle2 size={14} />
              {feedbackFeedback}
            </div>
          )}

          {/* Review Progress Bar */}
          {reviewProgress !== null && (
            <div className="mt-5 space-y-2 pt-4 border-t border-line">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-ink flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-accent" />
                  {reviewProgress === 100
                    ? `Analysis Complete · ${findings.length} Findings identified`
                    : "Running Concurrent Agents & Hindsight Memory Sync..."}
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

      {/* Review Summary Metrics & Priority Filters */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "P0 · Critical", count: counts.critical, severity: "critical" as const, pri: "P0" },
          { label: "P1 · High", count: counts.high, severity: "high" as const, pri: "P1" },
          { label: "P2 · Medium", count: counts.medium, severity: "medium" as const, pri: "P2" },
          { label: "P3 · Low", count: counts.low, severity: "low" as const, pri: "P3" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (selectedPriority === item.pri) {
                setSelectedPriority("all");
                setSelectedSeverity("all");
              } else {
                setSelectedPriority(item.pri);
                setSelectedSeverity(item.severity);
              }
            }}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 text-left ${
              selectedPriority === item.pri
                ? "border-accent bg-panel-raised shadow-md"
                : "border-line bg-panel hover:border-accent"
            }`}
          >
            <div className="flex items-center gap-2">
              <SeverityBadge severity={item.severity} />
              <span className="text-xs font-mono font-medium text-muted">{item.pri}</span>
            </div>
            <span className="font-mono text-xl font-bold text-ink">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Findings Feed or Honest Empty State */}
      {filteredFindings.length > 0 ? (
        <div className="space-y-4">
          {filteredFindings.map((finding) => (
            <ReviewFindingCard
              key={finding.id}
              finding={finding}
              onAccept={handleAcceptFinding}
              onReject={handleRejectFinding}
              onSubmitCorrection={handleCorrection}
            />
          ))}
        </div>
      ) : (
        <Card variant="glass" className="border-dashed border-line">
          <CardContent className="p-10 text-center space-y-3">
            <FileCode2 size={32} className="mx-auto text-muted/60" />
            <h3 className="text-base font-semibold text-ink">No Review Findings Recorded</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              No review findings exist for this commit. Click &ldquo;Start Multi-Agent Review&rdquo; above to run the Code Reviewer, Software Architect, and Security Engineer.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
