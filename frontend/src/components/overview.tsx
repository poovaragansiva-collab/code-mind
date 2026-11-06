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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/surfaces";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";

// Dynamically import dedicated hero 3D visual component
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
    <div className="space-y-8">
      {/* Hero Welcome Banner with Large 3D Neural Visual on the Right */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-[var(--card-glass)] p-6 sm:p-8 lg:p-10 shadow-panel backdrop-blur-2xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)] items-center">
          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="blue">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                AI Code Review Agent
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                Deterministic Evidence + Neural Intelligence
              </span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              Welcome to <span className="bg-gradient-to-r from-accent via-accent-cyan to-violet bg-clip-text text-transparent">CodeMind</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted">
              Your intelligent code review workspace. Understand your codebase, learn team standards, and improve software quality with AI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button asChild size="lg">
                <Link href="/reviews">
                  <FileCode2 size={16} />
                  Start Code Review
                  <ArrowRight size={15} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/repositories">
                  <GitBranch size={16} />
                  Explore Repositories
                </Link>
              </Button>
            </div>
          </div>

          {/* Prominent 3D Neural Orb Section */}
          <div className="w-full flex items-center justify-center">
            <HeroOrbVisual />
          </div>
        </div>
      </section>

      {/* Metric Cards Section */}
      <section aria-label="Platform metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

      {/* Middle Grid: Analysis Activity & Core Service Status */}
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
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted hover:text-ink hover:border-accent"
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

      {/* Quick Actions Grid */}
      <section aria-label="Quick Actions">
        <h3 className="text-base font-semibold text-ink mb-4">Quick Actions</h3>
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
