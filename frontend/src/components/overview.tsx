"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Database,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/surfaces";

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

const emptyMetrics = [
  { label: "Repositories", note: "Connect a GitHub repository" },
  { label: "Analysis runs", note: "No analysis history yet" },
  { label: "Open findings", note: "Requires an analyzed commit" },
  { label: "Security findings", note: "Requires a supported scan" },
];

function StatusDot({ tone = "amber" }: { tone?: "green" | "amber" | "red" }) {
  const styles = {
    green: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.35)]",
    amber: "bg-amber-300",
    red: "bg-rose-400",
  };
  return <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${styles[tone]}`} />;
}

function statusLabel(state: ComponentState | undefined) {
  return state === "configured" ? "Configured" : "Not configured";
}

export function Overview() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [apiState, setApiState] = useState<ApiState>("checking");

  useEffect(() => {
    let current = true;
    fetch("/api/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as ApiHealth;
        if (!current) return;
        if (response.ok) {
          setHealth(payload);
          setApiState("online");
        } else {
          setApiState("unavailable");
        }
      })
      .catch(() => {
        if (current) setApiState("unavailable");
      });
    return () => {
      current = false;
    };
  }, []);

  const databaseLabel =
    !health
      ? apiState === "checking" ? "Checking" : "Status unavailable"
      : health.database.status === "connected"
      ? "Connected"
      : health.database.status === "unavailable"
        ? "Cannot connect"
        : "PostgreSQL DSN required";

  const rows = [
    {
      label: "API service",
      value: apiState === "online" ? (health?.status === "healthy" ? "API + PostgreSQL healthy" : "API reachable · setup required") : apiState === "checking" ? "Checking" : "Unavailable",
      tone: apiState === "online" ? (health?.status === "healthy" ? "green" : "amber") : apiState === "checking" ? "amber" : "red",
      icon: Activity,
    },
    {
      label: "PostgreSQL",
      value: databaseLabel,
      tone: health?.database.status === "connected" ? "green" : health?.database.status === "unavailable" ? "red" : "amber",
      icon: Database,
    },
    {
      label: "GitHub App",
      value: statusLabel(health?.integrations.github_app),
      tone: health?.integrations.github_app === "configured" ? "green" : "amber",
      icon: GitBranch,
    },
    {
      label: "Groq",
      value: statusLabel(health?.integrations.groq),
      tone: health?.integrations.groq === "configured" ? "green" : "amber",
      icon: Sparkles,
    },
    {
      label: "Hindsight",
      value: statusLabel(health?.integrations.hindsight),
      tone: health?.integrations.hindsight === "configured" ? "green" : "amber",
      icon: BrainCircuit,
    },
  ] as const;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-panel px-5 py-7 shadow-panel sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border border-accent/[0.08]" />
        <div className="pointer-events-none absolute -right-2 -top-14 h-44 w-44 rounded-full border border-violet/[0.10]" />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Engineering intelligence</Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Evidence before inference</span>
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
            Review the commit, <span className="text-[#91c5ff]">not just the repository.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-[15px]">
            CodeMind connects static evidence with engineering memory, so every recommendation can be traced to code and team context.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/repositories">Repository setup <ArrowRight aria-hidden="true" size={16} /></Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/intelligence"><Waypoints aria-hidden="true" size={16} /> Explore intelligence</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Repository metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {emptyMetrics.map((metric, index) => {
          const Icon = [GitBranch, Activity, ShieldCheck, ShieldCheck][index];
          return (
            <Card key={metric.label} className="min-w-0">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{metric.label}</span>
                  <Icon aria-hidden="true" size={16} className="text-muted/75" />
                </div>
                <div className="mt-4 font-mono text-2xl tracking-tight text-ink">—</div>
                <p className="mt-1 text-[11px] leading-5 text-muted/75">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Analysis activity</CardTitle>
              <CardDescription className="mt-1">Reports are anchored to an immutable commit SHA.</CardDescription>
            </div>
            <Badge variant="neutral">No runs recorded</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[208px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas/40 px-5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel-raised text-muted">
                <Activity aria-hidden="true" size={18} />
              </div>
              <h2 className="mt-4 text-sm font-medium text-ink">No analysis history yet</h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
                Activity will appear after a repository is connected and a real analysis completes. No sample results are being shown.
              </p>
              <Link href="/repositories" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#9bcaff] hover:text-white">
                View repository setup <ArrowRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card id="connections">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Core service status</CardTitle>
              <Badge variant={apiState === "online" && health?.database.status === "connected" ? "green" : "amber"}>
                <StatusDot tone={apiState === "unavailable" ? "red" : apiState === "online" && health?.database.status === "connected" ? "green" : "amber"} />
                {apiState === "checking" ? "Checking" : apiState === "unavailable" ? "API unavailable" : health?.database.status === "connected" ? "Core healthy" : "Setup required"}
              </Badge>
            </div>
            <CardDescription>API/PostgreSQL health and provider configuration only; provider reachability is not implied. Credentials are never returned to the browser.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {rows.map((row, index) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className={`flex items-center gap-3 py-3 ${index ? "border-t border-line/70" : ""}`}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-panel-raised text-muted">
                    <Icon aria-hidden="true" size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink">{row.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted">{row.value}</p>
                  </div>
                  <StatusDot tone={row.tone} />
                </div>
              );
            })}
            <p className="border-t border-line/70 pt-3 text-[11px] leading-5 text-muted/80">
              Live GitHub, Groq, Hindsight, and PostgreSQL behavior will be reported only after configuration and a successful connection check.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Source-bound", copy: "Every finding is tied to repository evidence and a commit SHA.", icon: GitBranch, tone: "text-[#91c5ff]" },
          { label: "Scanner-backed", copy: "Security claims require actual scanner output, not model guesses.", icon: ShieldCheck, tone: "text-emerald-300" },
          { label: "Team-aware", copy: "Relevant engineering memories explain context behind recommendations.", icon: BrainCircuit, tone: "text-violet" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex gap-3 rounded-xl border border-line/80 bg-panel/50 p-4">
              <div className={`mt-0.5 ${item.tone}`}><Icon aria-hidden="true" size={17} /></div>
              <div>
                <p className="text-xs font-medium text-ink">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{item.copy}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
