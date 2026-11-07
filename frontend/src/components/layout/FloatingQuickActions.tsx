"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileCode2,
  GitBranch,
  FileBarChart2,
  HelpCircle,
  X,
  ChevronUp,
} from "lucide-react";

export function FloatingQuickActions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      {/* Help Modal Dialog */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-panel-raised p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-ink font-semibold text-base">
                <HelpCircle size={18} className="text-accent" />
                <span>CodeMind Command Help</span>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-muted hover:text-ink transition-colors p-1"
                aria-label="Close help modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted">
              <p>
                <strong className="text-ink">CodeMind</strong> connects static AST evidence with engineering memory to provide context-aware code reviews.
              </p>
              <div className="rounded-xl border border-line bg-panel p-3 space-y-1.5 font-mono text-[11px]">
                <p className="text-ink font-semibold">Shortcuts & Workflows:</p>
                <p>• Start Review: Jump directly to commit analysis.</p>
                <p>• Repositories: Ingest code trees with read-only access.</p>
                <p>• Memory Bank: Teach AI team conventions through reviews.</p>
              </div>
              <p className="text-[11px]">
                Backend APIs, GitHub App webhooks, and PostgreSQL DSN are actively integrated by your teammate.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setHelpOpen(false)}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Expanded Quick Action Items */}
        {menuOpen && (
          <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3 duration-200">
            <Link
              href="/reviews"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel px-4 py-2.5 text-xs font-medium text-ink shadow-lg hover:border-accent hover:bg-panel-raised transition-all"
            >
              <FileCode2 size={15} className="text-accent" />
              <span>Start Code Review</span>
            </Link>

            <Link
              href="/repositories"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel px-4 py-2.5 text-xs font-medium text-ink shadow-lg hover:border-accent hover:bg-panel-raised transition-all"
            >
              <GitBranch size={15} className="text-emerald-500" />
              <span>Open Repositories</span>
            </Link>

            <Link
              href="/reports"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel px-4 py-2.5 text-xs font-medium text-ink shadow-lg hover:border-accent hover:bg-panel-raised transition-all"
            >
              <FileBarChart2 size={15} className="text-violet" />
              <span>Export Reports</span>
            </Link>

            <button
              onClick={() => {
                setMenuOpen(false);
                setHelpOpen(true);
              }}
              className="flex items-center gap-2.5 rounded-2xl border border-line bg-panel px-4 py-2.5 text-xs font-medium text-ink shadow-lg hover:border-accent hover:bg-panel-raised transition-all"
            >
              <HelpCircle size={15} className="text-amber-500" />
              <span>System Documentation</span>
            </button>
          </div>
        )}

        {/* Floating Trigger Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Help Button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex h-11 w-11 items-center justify-center neumorphic-circle text-muted hover:text-ink cursor-pointer"
            title="Help & documentation"
          >
            <HelpCircle size={18} />
          </button>

          {/* Primary Floating Action Button with Neumorphic Gradient Glow */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-12 items-center gap-2 rounded-2xl neumorphic-primary px-4 font-semibold text-xs cursor-pointer"
            aria-label="Toggle quick actions"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">Actions</span>
            <ChevronUp size={14} className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </>
  );
}
