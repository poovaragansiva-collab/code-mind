import Link from "next/link";
import {
  Activity,
  Boxes,
  BrainCircuit,
  Code2,
  FileBarChart2,
  GitBranch,
  Network,
  ShieldCheck,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";

type SectionId =
  | "repositories"
  | "intelligence"
  | "quality"
  | "security"
  | "architecture"
  | "predictions"
  | "memory"
  | "reports";

type SectionContent = {
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  note: string;
};

const sections: Record<SectionId, SectionContent> = {
  repositories: {
    title: "Repositories",
    eyebrow: "Workspace / Sources",
    description: "Connect a read-only GitHub App installation to begin reviewing repositories.",
    icon: GitBranch,
    emptyTitle: "GitHub App setup is required",
    emptyDescription: "No repository data is available yet. Configure the GitHub App credentials and read-only installation permissions before connecting a repository.",
    note: "CodeMind will fetch repository metadata, the default-branch commit, the tree, and eligible source files. Repository code is never executed.",
  },
  intelligence: {
    title: "Repository intelligence",
    eyebrow: "Workspace / Structure",
    description: "Understand languages, frameworks, modules, dependencies, and repository structure.",
    icon: Network,
    emptyTitle: "No repository has been ingested",
    emptyDescription: "Structure and dependency maps appear only after CodeMind retrieves a real repository tree and source files.",
    note: "The import graph will be presented as evidence, not as a complete description of software architecture.",
  },
  quality: {
    title: "Code quality",
    eyebrow: "Analysis / Quality",
    description: "Review maintainability signals grounded in actual static-analysis output.",
    icon: Code2,
    emptyTitle: "No quality scan has run",
    emptyDescription: "Ruff and ESLint findings, supported complexity checks, and feasible duplication signals will appear after a repository is connected and scanned.",
    note: "Any quality score will show its calculation. Findings will include severity and source location where available.",
  },
  security: {
    title: "Security analysis",
    eyebrow: "Analysis / Security",
    description: "Inspect supported vulnerabilities using scanner evidence and source references.",
    icon: ShieldCheck,
    emptyTitle: "No security scan has run",
    emptyDescription: "Semgrep and dependency-check results are not inferred or fabricated. Configure the supported scanners before this page can show findings.",
    note: "An empty scan result will not be presented as proof that a repository is completely secure.",
  },
  architecture: {
    title: "Architecture intelligence",
    eyebrow: "Analysis / Architecture",
    description: "Explore module dependencies, coupling, and detectable architectural risks.",
    icon: Boxes,
    emptyTitle: "No dependency graph is available",
    emptyDescription: "A graph and architecture findings require ingested modules and imports from a real commit.",
    note: "Cycles and layering issues will be reported only when supported by the graph or explicitly defined rules.",
  },
  predictions: {
    title: "Predictive intelligence",
    eyebrow: "Analysis / Risk signals",
    description: "Surface evidence-based regression, degradation, maintainability, and performance risks.",
    icon: Activity,
    emptyTitle: "No supported risk signals yet",
    emptyDescription: "Risk levels require observable commit changes, scanner results, dependency signals, or relevant history.",
    note: "Initial risk assessments are transparent heuristics, not scientifically validated probabilities.",
  },
  memory: {
    title: "Engineering memory",
    eyebrow: "Context / Hindsight",
    description: "Use repository-specific decisions and feedback to make later reviews more contextual.",
    icon: BrainCircuit,
    emptyTitle: "No engineering memories are available",
    emptyDescription: "Memory banks are created per repository or organization after Hindsight is configured. Source code and full analysis reports are not stored in Hindsight.",
    note: "Relevant memories will include an explanation of how they influenced a recommendation.",
  },
  reports: {
    title: "Analysis reports",
    eyebrow: "Context / History",
    description: "Browse commit-bound findings, risk summaries, and historical comparisons.",
    icon: FileBarChart2,
    emptyTitle: "No analysis reports yet",
    emptyDescription: "A report becomes available after a real repository analysis has completed and its results have been stored.",
    note: "Each report will include its timestamp, repository, immutable commit SHA, findings, and risk summary.",
  },
};

export function SectionPage({ section }: { section: SectionId }) {
  const content = sections[section];
  const Icon = content.icon;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">{content.eyebrow}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">{content.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{content.description}</p>
          </div>
          <Badge variant="neutral">No repository selected</Badge>
        </div>
      </div>

      {section === "repositories" ? (
        <Card>
          <CardContent className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-panel-raised text-[#9bcaff]">
                <Icon aria-hidden="true" size={19} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">{content.emptyTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{content.emptyDescription}</p>
                <p className="mt-3 max-w-2xl text-xs leading-5 text-muted/80">{content.note}</p>
              </div>
            </div>
            <div id="github-app-setup" className="rounded-xl border border-line bg-canvas/50 p-4">
              <p className="text-xs font-medium text-ink">Connection status</p>
              <p className="mt-1.5 text-xs leading-5 text-muted">GitHub App credentials are not configured in this workspace. The connection action is unavailable until the App is set up.</p>
              <Button asChild variant="secondary" size="sm" className="mt-4">
                <Link href="/#connections">Review service readiness <Waypoints aria-hidden="true" size={14} /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-panel-raised text-muted">
              <Icon aria-hidden="true" size={20} />
            </div>
            <h2 className="mt-5 text-base font-medium text-ink">{content.emptyTitle}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{content.emptyDescription}</p>
            <div className="mt-5 max-w-2xl rounded-lg border border-line/70 bg-canvas/40 px-4 py-3 text-left text-xs leading-5 text-muted/85">
              {content.note}
            </div>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link href="/repositories">Go to repository setup <GitBranch aria-hidden="true" size={14} /></Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
