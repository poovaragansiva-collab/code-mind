"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BrainCircuit,
  Boxes,
  Code2,
  FileBarChart2,
  GitBranch,
  LayoutDashboard,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";

const navigation: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitBranch },
  { label: "Intelligence", href: "/intelligence", icon: Network },
  { label: "Code quality", href: "/quality", icon: Code2 },
  { label: "Security", href: "/security", icon: ShieldCheck },
  { label: "Architecture", href: "/architecture", icon: Boxes },
  { label: "Risk signals", href: "/predictions", icon: Activity },
  { label: "Engineering memory", href: "/memory", icon: BrainCircuit },
  { label: "Analysis reports", href: "/reports", icon: FileBarChart2 },
];

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.08] text-accent">
      <Network aria-hidden="true" size={18} strokeWidth={1.8} />
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={compact ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        active
          ? "bg-accent/[0.11] text-[#a8d2ff]"
          : "text-muted hover:bg-panel-raised hover:text-ink",
        compact && "shrink-0 px-3",
      )}
    >
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      <span className={compact ? "whitespace-nowrap" : "truncate"}>{label}</span>
      {active && !compact ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" /> : null}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = navigation.find((item) => item.href === pathname) ?? navigation[0];

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line/80 bg-canvas/90 px-4 py-5 backdrop-blur-xl lg:flex">
        <Link href="/" className="flex items-center gap-3 px-2" aria-label="CodeMind overview">
          <BrandMark />
          <span className="text-[15px] font-semibold tracking-tight text-ink">CodeMind</span>
          <span className="ml-auto font-mono text-[10px] text-muted/70">01</span>
        </Link>

        <div className="mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/60">
          Workspace
        </div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Primary navigation">
          {navigation.slice(0, 3).map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/60">
          Analysis
        </div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Analysis navigation">
          {navigation.slice(3, 7).map((item) => (
            <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/60">
          Context
        </div>
        <nav className="mt-3 flex flex-col gap-1" aria-label="Context navigation">
          {navigation.slice(7).map((item) => (
            <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-line bg-panel/70 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink">Repository context</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted">No repository connected</p>
          <div className="mt-3 border-t border-line pt-3">
            <Badge variant="amber">Foundation stage</Badge>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line/80 bg-canvas/85 backdrop-blur-xl">
          <div className="flex h-[66px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><BrandMark /></div>
              <div className="min-w-0">
                <div className="hidden text-[11px] text-muted sm:block">CodeMind / {current.label}</div>
                <div className="truncate text-sm font-medium text-ink">No repository selected</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="hidden sm:inline-flex">Milestone 01 · Foundation</Badge>
              <span className="rounded-lg border border-line bg-panel px-2.5 py-1.5 font-mono text-[10px] text-muted">
                local workspace
              </span>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line/70 px-3 py-2 lg:hidden" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                compact
                active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
              />
            ))}
          </nav>
        </header>
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
