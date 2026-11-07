"use client";

import React, { useState } from "react";
import { Check, X, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/surfaces";
import { Button } from "@/components/ui/button";
import { SeverityBadge, type SeverityLevel } from "./SeverityBadge";
import { CodeSnippet } from "./CodeSnippet";

export interface ReviewFinding {
  id: string;
  title: string;
  fileName: string;
  lineNumber: number;
  severity: SeverityLevel;
  codeSnippet: string;
  problemExplanation: string;
  suggestedCorrection: string;
  conventionRule?: string;
}

interface ReviewFindingCardProps {
  finding: ReviewFinding;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onSubmitCorrection?: (id: string, customNote: string) => void;
}

export function ReviewFindingCard({
  finding,
  onAccept,
  onReject,
  onSubmitCorrection,
}: ReviewFindingCardProps) {
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [customNote, setCustomNote] = useState("");

  const handleAccept = () => {
    setStatus("accepted");
    onAccept?.(finding.id);
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.(finding.id);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;
    onSubmitCorrection?.(finding.id, customNote);
    setShowCorrectionInput(false);
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        status === "accepted"
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : status === "rejected"
          ? "border-line/40 opacity-60"
          : "hover:border-line"
      }`}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <span className="font-mono text-xs text-muted">
                {finding.fileName}:{finding.lineNumber}
              </span>
            </div>
            <h4 className="text-base font-semibold text-ink">{finding.title}</h4>
          </div>

          <div className="flex items-center gap-2">
            {status === "accepted" && (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400">
                <Check size={14} /> Accepted
              </span>
            )}
            {status === "rejected" && (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                <X size={14} /> Dismissed
              </span>
            )}
          </div>
        </div>

        {/* Problem Description */}
        <div className="rounded-xl border border-line/60 bg-canvas/60 p-3.5 text-xs leading-relaxed text-muted">
          <div className="flex items-center gap-1.5 font-medium text-ink/90 mb-1">
            <AlertCircle size={14} className="text-amber-400" />
            <span>Problem Explanation</span>
          </div>
          {finding.problemExplanation}
        </div>

        {/* Code Snippet */}
        <CodeSnippet
          code={finding.codeSnippet}
          fileName={finding.fileName}
          highlightLine={finding.lineNumber}
        />

        {/* Suggested AI Correction */}
        <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-3.5 text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 font-medium text-accent mb-1.5">
            <Sparkles size={14} />
            <span>AI Suggested Correction</span>
          </div>
          <div className="font-mono text-ink/90 whitespace-pre-wrap rounded-lg bg-[#06080C] p-3 border border-line-subtle">
            {finding.suggestedCorrection}
          </div>
        </div>

        {/* Team Convention / Memory context */}
        {finding.conventionRule && (
          <div className="flex items-center gap-2 rounded-lg border border-violet/20 bg-violet/[0.04] px-3 py-2 text-xs text-violet">
            <BookOpen size={13} />
            <span>Team Convention: <strong>{finding.conventionRule}</strong></span>
          </div>
        )}

        {/* Actions */}
        {status === "pending" && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line/70">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="success" onClick={handleAccept}>
                <Check size={14} />
                Accept Suggestion
              </Button>
              <Button size="sm" variant="danger" onClick={handleReject}>
                <X size={14} />
                Reject Suggestion
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCorrectionInput(!showCorrectionInput)}
            >
              Submit Feedback
            </Button>
          </div>
        )}

        {/* Custom Feedback Form */}
        {showCorrectionInput && (
          <form onSubmit={handleCustomSubmit} className="mt-3 space-y-2 pt-2 border-t border-line/50">
            <label className="text-[11px] font-medium text-muted block">
              Provide context to teach CodeMind engineering memory:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. In our services we use the custom result wrapper instead..."
                className="flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none"
              />
              <Button type="submit" size="sm">
                Save Memory
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

