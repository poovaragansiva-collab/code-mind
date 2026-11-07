"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Search,
  GitPullRequest,
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";

export default function MemoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const memories = [
    {
      id: "mem-1",
      rule: "SEC-01: Parameterized DB Queries",
      convention: "Disallow f-string interpolation inside `db.execute()`. Always use SQLAlchemy `select()` or bound params.",
      origin: "Accepted PR #28 review by @lead-dev",
      appliedCount: 14,
      tag: "Security",
    },
    {
      id: "mem-2",
      rule: "PERF-04: Streaming Body Bounds",
      convention: "Enforce MAX_BODY_BYTES (1MiB) checks on all chunked proxy streams to prevent memory exhaustion.",
      origin: "Post-incident review #INC-092",
      appliedCount: 9,
      tag: "Performance",
    },
    {
      id: "mem-3",
      rule: "REACT-02: 3D Canvas Error Boundaries",
      convention: "All Three.js / WebGL canvas instances must be safely wrapped in error boundaries with SVG fallback.",
      origin: "Team Architecture RFC #12",
      appliedCount: 6,
      tag: "Frontend",
    },
    {
      id: "mem-4",
      rule: "API-07: Standardized Error Envelopes",
      convention: "All FastAPI responses returning error codes must format payloads as `{ 'detail': 'string', 'code': 'ENUM' }`.",
      origin: "Accepted review suggestion on PR #19",
      appliedCount: 22,
      tag: "API Design",
    },
  ];

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
            The core intelligence brain of CodeMind. Tracks accepted team suggestions, conventions, and architectural preferences to ensure AI reviews get smarter over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="violet">
            <BrainCircuit size={12} className="text-violet" />
            Hindsight Memory Synced
          </Badge>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Learned Conventions</span>
            <div className="mt-2 text-3xl font-bold font-mono text-ink">38 Rules</div>
            <p className="mt-1 text-[11px] text-muted">Active across 3 repositories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Automated Corrections</span>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-500 dark:text-emerald-400">114 times</div>
            <p className="mt-1 text-[11px] text-muted">Prevented human review ping-pong</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-muted">Team Agreement Rate</span>
            <div className="mt-2 text-3xl font-bold font-mono text-accent">96.8%</div>
            <p className="mt-1 text-[11px] text-muted">High confidence memory score</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tag Filters */}
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
          {["all", "Security", "Performance", "Frontend", "API Design"].map((tag) => (
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

      {/* Memory Bank Cards */}
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

              <p className="text-xs leading-relaxed text-muted bg-panel-raised p-3.5 rounded-xl border border-line">
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
    </div>
  );
}
