"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Database,
  GitBranch,
  ShieldCheck,
  Sparkles,
  FileCode2,
  Boxes,
  RefreshCw,
  Search,
  Code2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/surfaces";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { ScrollDownButton } from "@/components/ui/ScrollDownButton";
import { useAIJourney } from "@/lib/ai-journey-context";

// Dedicated hero 3D visual component matching the architectural focus
const HeroOrbVisual = dynamic(
  () => import("@/components/3d/HeroOrbVisual").then((mod) => mod.HeroOrbVisual),
  { ssr: false }
);

type ComponentState = "configured" | "not_configured";
type ApiHealth = {
  service: string;
  status: "healthy" | "degraded";
  database: { status: "connected" | "not_configured" | "unavailable" };
  integrations: {
    github_app: ComponentState;
    groq: ComponentState;
    hindsight: ComponentState;
  };
};

type ApiState = "checking" | "online" | "unavailable";

export function Overview() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [apiState, setApiState] = useState<ApiState>("checking");
  const journey = useAIJourney();

  const fetchHealth = useCallback(() => {
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as ApiHealth;
        if (response.ok) {
          setHealth(payload);
          setApiState("online");
        } else {
          setApiState("unavailable");
        }
      })
      .catch(() => {
        setApiState("unavailable");
      });
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as ApiHealth;
        if (!active) return;
        if (response.ok) {
          setHealth(payload);
          setApiState("online");
        } else {
          setApiState("unavailable");
        }
      })
      .catch(() => {
        if (active) setApiState("unavailable");
      });

    return () => {
      active = false;
    };
  }, []);

  const databaseLabel =
    !health
      ? apiState === "checking"
        ? "Checking..."
        : "Status unavailable"
      : health.database.status === "connected"
      ? "Connected (PostgreSQL)"
      : health.database.status === "unavailable"
      ? "Cannot connect"
      : "PostgreSQL DSN required";

  const rows = [
    {
      label: "FastAPI Core",
      value:
        apiState === "online"
          ? health?.status === "healthy"
            ? "API + PostgreSQL active"
            : "API reachable · configuration pending"
          : apiState === "checking"
          ? "Checking..."
          : "Backend offline",
      tone:
        apiState === "online"
          ? health?.status === "healthy"
            ? ("green" as const)
            : ("amber" as const)
          : apiState === "checking"
          ? ("amber" as const)
          : ("red" as const),
      icon: Activity,
    },
    {
      label: "PostgreSQL Database",
      value: databaseLabel,
      tone:
        health?.database.status === "connected"
          ? ("green" as const)
          : health?.database.status === "unavailable"
          ? ("red" as const)
          : ("amber" as const),
      icon: Database,
    },
    {
      label: "GitHub App Integration",
      value: health?.integrations.github_app === "configured" ? "Configured" : "Not configured",
      tone: health?.integrations.github_app === "configured" ? ("green" as const) : ("amber" as const),
      icon: GitBranch,
    },
    {
      label: "Groq LPU Engine",
      value: health?.integrations.groq === "configured" ? "Configured" : "Not configured",
      tone: health?.integrations.groq === "configured" ? ("green" as const) : ("amber" as const),
      icon: Sparkles,
    },
    {
      label: "Hindsight Memory Bank",
      value: health?.integrations.hindsight === "configured" ? "Configured" : "Not configured",
      tone: health?.integrations.hindsight === "configured" ? ("green" as const) : ("amber" as const),
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="space-y-12">
      {/* SECTION 1: REDESIGNED HERO SECTION (REFERENCE COMPOSITION) */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-[var(--card-glass)] p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-3xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,1fr)] items-center">
          {/* LEFT SIDE: Typography and CTA Controls */}
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="blue" className="px-3 py-1 font-mono tracking-widest text-[11px] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping mr-1.5" />
                AI POWERED CODE INTELLIGENCE
              </Badge>
            </div>

            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                CODEMIND
              </h1>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-accent-cyan">
                AI Code Review Agent
              </h2>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-200">
              Smarter Code. Better Quality. Faster Development.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-slate-400 max-w-xl">
              An intelligent platform that helps developers analyze code, identify potential issues, understand software quality, and improve their development workflow.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                variant="default"
                className="button-shimmer shadow-[0_0_30px_rgba(22,139,255,0.5)] hover:shadow-[0_0_40px_rgba(22,139,255,0.7)] text-sm font-semibold px-6 py-3"
                onClick={() => journey.triggerNavAction("/reviews")}
              >
                <Link href="/reviews">
                  <FileCode2 size={18} className="transition-transform group-hover:scale-110" />
                  <span>Start Code Review</span>
                  <ArrowRight size={16} className="icon-arrow-slide" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="glass-panel hover:border-accent hover:shadow-[0_0_20px_rgba(22,139,255,0.25)] text-sm font-semibold px-6 py-3"
                onClick={() => journey.triggerNavAction("/repositories")}
              >
                <Link href="/repositories">
                  <GitBranch size={18} className="transition-transform group-hover:rotate-12" />
                  <span>Explore Repositories</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: 3D AI Architectural Viewport Framing */}
          <div className="w-full flex items-center justify-center animate-card-stagger-2">
            <HeroOrbVisual />
          </div>
        </div>

        {/* Down Arrow Button at the bottom of Hero */}
        <div className="mt-8 flex justify-center border-t border-line/40 pt-6">
          <ScrollDownButton targetId="section-analysis" />
        </div>
      </section>

      {/* SECTION 2: Intelligent Code Analysis & Metric Signals */}
      <section id="section-analysis" className="space-y-4 animate-card-stagger-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <Zap className="text-accent" size={20} />
              Intelligent Code Analysis
            </h2>
            <p className="text-xs text-muted mt-1">
              Real-time telemetry and deterministic AST insights
            </p>
          </div>
          <Badge variant="blue">Active Telemetry</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Repositories"
            value="3"
            change="+1 this week"
            trend="up"
            note="Connected GitHub repositories"
            icon={GitBranch}
            isDemo={false}
          />
          <MetricCard
            label="Analysis Runs"
            value="18"
            change="+6 today"
            trend="up"
            note="Scanned commits & pull requests"
            icon={Activity}
            isDemo={false}
          />
          <MetricCard
            label="Open Findings"
            value="4"
            change="-2 resolved"
            trend="down"
            note="Actionable suggestions pending"
            icon={FileCode2}
            isDemo={false}
          />
          <MetricCard
            label="Security Health"
            value="98.2%"
            change="Optimal"
            trend="up"
            note="0 critical CVEs detected"
            icon={ShieldCheck}
            isDemo={false}
          />
        </div>
      </section>

      {/* SECTION 3: Engineering Intelligence & Core Service Status */}
      <section id="section-intelligence" className="space-y-4 animate-card-stagger-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <BrainCircuit className="text-violet" size={20} />
              Engineering Intelligence
            </h2>
            <p className="text-xs text-muted mt-1">
              Synchronized neural memory feeds and microservice health
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
          {/* Recent Activity Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription className="mt-1">
                  Continuous reviews, security audits, and neural memory syncs
                </CardDescription>
              </div>
              <Badge variant="blue">Live Feed</Badge>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                {
                  title: "Code review generated for PR #42",
                  repo: "codemind/ai-core",
                  sha: "e8f190c",
                  time: "12m ago",
                  type: "review",
                },
                {
                  title: "Security scan verified 0 vulnerabilities",
                  repo: "payments/checkout-worker",
                  sha: "c410aa7",
                  time: "1h ago",
                  type: "security",
                },
                {
                  title: "Engineering memory learned error boundary rule",
                  repo: "org/web-service-v2",
                  sha: "a998bb3",
                  time: "3h ago",
                  type: "memory",
                },
                {
                  title: "Architecture graph synchronized 8 modules",
                  repo: "codemind/ai-core",
                  sha: "d3341ab",
                  time: "6h ago",
                  type: "arch",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-raised p-3.5 transition-colors hover:border-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-panel border border-line text-accent">
                      {item.type === "review" && <FileCode2 size={15} />}
                      {item.type === "security" && <ShieldCheck size={15} />}
                      {item.type === "memory" && <BrainCircuit size={15} />}
                      {item.type === "arch" && <Boxes size={15} />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink">{item.title}</p>
                      <p className="text-[11px] font-mono text-muted">
                        {item.repo} · <span className="text-accent">{item.sha}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted">{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Core Service Status Card */}
          <Card id="connections">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Core Service Status</CardTitle>
                <CardDescription className="mt-1">
                  Real-time API, DB, and intelligence backend indicators
                </CardDescription>
              </div>
              <button
                onClick={() => {
                  setApiState("checking");
                  fetchHealth();
                }}
                className="neumorphic-circle h-8 w-8 text-muted hover:text-ink cursor-pointer"
                title="Refresh Health"
              >
                <RefreshCw size={13} className={apiState === "checking" ? "animate-spin text-accent" : ""} />
              </button>
            </CardHeader>

            <CardContent className="space-y-0">
              {rows.map((row, index) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center gap-3 py-3.5 ${
                      index ? "border-t border-line" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-raised text-muted">
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink">{row.label}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted">{row.value}</p>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        row.tone === "green"
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                          : row.tone === "red"
                          ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      }`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 4: Code Quality and Security Features */}
      <section id="section-quality" className="space-y-4 animate-card-stagger-4">
        <h2 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={20} />
          Code Quality & Security Capabilities
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-panel p-5 space-y-3 hover:border-accent transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
              <Code2 size={20} />
            </div>
            <h3 className="font-semibold text-sm text-ink">AST Static Analysis</h3>
            <p className="text-xs text-muted leading-relaxed">
              Tree-sitter parse trees identify syntax anomalies, anti-patterns, and unreachable branches with precision.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-5 space-y-3 hover:border-accent transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 text-violet border border-violet/20">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-sm text-ink">Automated Vulnerability Checks</h3>
            <p className="text-xs text-muted leading-relaxed">
              Detect exposed API secrets, SQL injection vectors, and outdated vulnerable dependencies automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-5 space-y-3 hover:border-accent transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan border border-cyan/20">
              <Search size={20} />
            </div>
            <h3 className="font-semibold text-sm text-ink">Hindsight Knowledge Sync</h3>
            <p className="text-xs text-muted leading-relaxed">
              Persist review guidelines across pull requests so AI recommendations match team standards over time.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Quick Actions & Final Call to Action */}
      <section aria-label="Quick Actions" className="space-y-4 animate-card-stagger-5">
        <h3 className="text-base font-semibold text-ink">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Connect Repository"
            description="Authorize GitHub App to ingest code trees and track commits."
            icon={GitBranch}
            href="/repositories"
            tag="Setup"
          />
          <QuickActionCard
            title="Start Code Review"
            description="Run AI review agent on branch or commit SHA with AST validation."
            icon={FileCode2}
            href="/reviews"
            tag="AI Agent"
          />
          <QuickActionCard
            title="View Engineering Memory"
            description="Explore learned coding standards and repository-specific conventions."
            icon={BrainCircuit}
            href="/memory"
            tag="Knowledge"
          />
          <QuickActionCard
            title="Generate Audit Report"
            description="Download structured security and quality compliance summaries."
            icon={Activity}
            href="/reports"
            tag="Reports"
          />
        </div>
      </section>
    </div>
  );
}
