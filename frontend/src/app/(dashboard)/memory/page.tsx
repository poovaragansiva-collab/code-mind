"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Search,
  GitPullRequest,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";
import { fetchMemories, triggerReflection } from "@/lib/api";

interface MemoryItem {
  id: string;
  rule: string;
  convention: string;
  origin: string;
  appliedCount: number;
  tag: string;
}

export default function MemoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [_rawMemories, setRawMemories] = useState<string>("");
  const [reflection, setReflection] = useState<string | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [repoId, setRepoId] = useState("codemind/ai-core");

  useEffect(() => {
    fetchMemories(repoId)
      .then((res) => {
        if (res.has_memory && res.memories) {
          setRawMemories(res.memories);
          // Parse lines with tags like [ADR], [SECURITY_RULE], [TEAM_CONVENTION]
          const lines = res.memories.split("\n").filter((l) => l.trim().length > 0);
          const parsed: MemoryItem[] = lines.map((l, i) => {
            let tag = "General";
            if (l.includes("[ADR]")) tag = "Architecture";
            else if (l.includes("[SECURITY_RULE]")) tag = "Security";
            else if (l.includes("[TEAM_CONVENTION]")) tag = "Team Convention";
            else if (l.includes("[FEEDBACK:REJECTED]")) tag = "Rejected";

            return {
              id: `mem-live-${i}`,
              rule: l.slice(0, 50),
              convention: l,
              origin: `Hindsight Bank (${repoId})`,
              appliedCount: 1,
              tag,
            };
          });
          setMemories(parsed);
        } else {
          setMemories([]);
        }
      })
      .catch(() => setMemories([]));
  }, [repoId]);

  const handleReflect = async () => {
    setIsReflecting(true);
    try {
      const res = await triggerReflection(repoId, "Summarise recurring engineering patterns and key trade-offs.");
      setReflection(res.insight || "No historical trends recorded yet in memory bank.");
    } catch {
      setReflection("Hindsight reflection service temporarily unavailable or unconfigured.");
    } finally {
      setIsReflecting(false);
    }
  };

  const filtered = memories.filter((m) => {
    const matchesSearch =
      m.rule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.convention.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "all" ? true : m.tag.toLowerCase() === selectedTag.toLowerCase();
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Context / Hindsight
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Engineering Memory Bank
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            The core intelligence brain of CodeMind. Tracks accepted team suggestions, conventions, and architectural preferences so AI reviews get smarter over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleReflect}
            disabled={isReflecting}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {isReflecting ? (
              <>
                <RotateCcw size={13} className="animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-violet" />
                Reflect on Patterns
              </>
            )}
          </Button>

          <Badge variant="violet">
            <BrainCircuit size={12} className="text-violet" />
            Hindsight Synced
          </Badge>
        </div>
      </div>

      {/* Target Repo Input */}
      <Card variant="glass">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-medium text-muted shrink-0">Active Memory Bank:</span>
          <input
            type="text"
            value={repoId}
            onChange={(e) => setRepoId(e.target.value)}
            placeholder="owner/repo"
            className="w-full sm:w-72 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-ink font-mono focus:border-accent focus:outline-none"
          />
          <span className="text-[11px] font-mono text-muted">Bank ID: codemind/{repoId}</span>
        </CardContent>
      </Card>

      {/* Reflection Panel */}
      {reflection && (
        <Card variant="glass" className="border-violet/40 bg-violet/5">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-violet" />
              <span className="text-xs font-semibold text-ink font-mono">Hindsight Reflective Synthesis</span>
            </div>
            <p className="text-xs text-muted leading-relaxed font-mono">
              {reflection}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Memory Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Learned Conventions</span>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">{memories.length} Rules</div>
            <p className="mt-1 text-[11px] text-muted">Active across repository memory bank</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Bank Partitioning</span>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">Isolated</div>
            <p className="mt-1 text-[11px] text-muted">Zero cross-repo contamination</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Memory State</span>
            <div className="mt-2 text-2xl font-bold font-mono text-accent">
              {memories.length > 0 ? "Active" : "Empty"}
            </div>
            <p className="mt-1 text-[11px] text-muted">Pre-pass recall on review triggers</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tag Filters */}
      {memories.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="pointer-events-none absolute left-3.5 top-3 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search engineering conventions..."
              className="w-full rounded-xl border border-line bg-panel pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto self-start sm:self-auto">
            {["all", "Security", "Architecture", "Performance", "Team Convention"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  selectedTag === tag
                    ? "bg-accent/20 text-accent font-semibold border border-accent/30"
                    : "bg-panel text-muted hover:text-ink border border-line"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Memory Bank Cards or Honest Empty State */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card key={item.id} variant="glass" className="hover:border-accent">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">{item.tag}</Badge>
                    <h3 className="text-sm font-semibold text-ink font-mono">{item.rule}</h3>
                  </div>
                  <span className="font-mono text-xs text-accent">
                    Applied {item.appliedCount} times
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-muted bg-panel-raised p-3.5 rounded-xl border border-line font-mono">
                  {item.convention}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-muted pt-1">
                  <GitPullRequest size={13} className="text-violet" />
                  <span>Origin: {item.origin}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="glass" className="border-dashed border-line">
          <CardContent className="p-10 text-center space-y-3">
            <BrainCircuit size={32} className="mx-auto text-muted/60" />
            <h3 className="text-base font-semibold text-ink">No Engineering Memories Stored</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              No memories have been retained in Hindsight for this repository yet. Memories are automatically stored when you accept or reject code review findings, or when Architectural Decisions (ADRs) and Security Rules are flagged during analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
