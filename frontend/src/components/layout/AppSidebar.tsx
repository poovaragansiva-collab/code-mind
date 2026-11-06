"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  FileCode2,
  Network,
  Code2,
  ShieldCheck,
  Boxes,
  Activity,
  BrainCircuit,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navigationItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitBranch },
  { label: "Code Reviews", href: "/reviews", icon: FileCode2, badge: "AI" },
  { label: "Intelligence", href: "/intelligence", icon: Network },
  { label: "Code Quality", href: "/quality", icon: Code2 },
  { label: "Security", href: "/security", icon: ShieldCheck },
  { label: "Architecture", href: "/architecture", icon: Boxes },
  { label: "Risk Signals", href: "/predictions", icon: Activity },
  { label: "Engineering Memory", href: "/memory", icon: BrainCircuit },
  { label: "Reports", href: "/reports", icon: FileBarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-[var(--sidebar-bg)] backdrop-blur-2xl transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[250px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent shadow-sm">
              <Network size={19} />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold tracking-tight text-ink">
                  CodeMind
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                  AI Review Agent
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-line text-muted hover:border-accent hover:text-ink transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Platform
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {navigationItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent/15 text-accent font-semibold shadow-sm border border-accent/30"
                        : "text-muted hover:bg-panel-raised hover:text-ink border border-transparent"
                    )}
                  >
                    <Icon size={17} className={cn("shrink-0", isActive ? "text-accent" : "text-muted group-hover:text-ink")} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="rounded bg-accent/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-accent">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Analysis Category */}
          <div>
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Code Analysis
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {navigationItems.slice(4, 8).map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent/15 text-accent font-semibold shadow-sm border border-accent/30"
                        : "text-muted hover:bg-panel-raised hover:text-ink border border-transparent"
                    )}
                  >
                    <Icon size={17} className={cn("shrink-0", isActive ? "text-accent" : "text-muted group-hover:text-ink")} />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Context & Settings */}
          <div>
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Context & Config
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {navigationItems.slice(8).map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-accent/15 text-accent font-semibold shadow-sm border border-accent/30"
                        : "text-muted hover:bg-panel-raised hover:text-ink border border-transparent"
                    )}
                  >
                    <Icon size={17} className={cn("shrink-0", isActive ? "text-accent" : "text-muted group-hover:text-ink")} />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info box */}
        {!collapsed && (
          <div className="p-4 border-t border-line">
            <div className="rounded-xl border border-line bg-panel p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
                  <Sparkles size={13} className="text-violet" />
                  <span>AI Engine</span>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="mt-1 text-[11px] text-muted">Ready for code review</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
