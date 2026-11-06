"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  GitBranch,
  ChevronDown,
  User,
  Check,
  Shield,
  ExternalLink,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/surfaces";
import { useTheme, type Theme } from "@/lib/theme-context";

interface HeaderProps {
  onOpenMobile: () => void;
  selectedRepo: string;
  onSelectRepo: (repo: string) => void;
}

export function Header({
  onOpenMobile,
  selectedRepo,
  onSelectRepo,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchVal, setSearchVal] = useState("");
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const repositories = [
    { name: "codemind/ai-core", branch: "main", status: "Active" },
    { name: "org/web-service-v2", branch: "develop", status: "Ready" },
    { name: "payments/checkout-worker", branch: "main", status: "Active" },
  ];

  const themes: { id: Theme; label: string; icon: typeof Moon }[] = [
    { id: "dark", label: "Dark Navy", icon: Moon },
    { id: "light", label: "Light Clean", icon: Sun },
    { id: "colorful", label: "Vibrant AI", icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-line bg-[var(--header-bg)] px-4 backdrop-blur-xl sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-muted hover:text-ink transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu size={18} />
        </button>

        <SearchBar
          value={searchVal}
          onChange={setSearchVal}
          placeholder="Search repositories, commits, findings..."
          className="w-full max-w-sm hidden sm:flex"
        />
      </div>

      {/* Right: Theme Switcher, Repo Selector, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink hover:border-accent transition-colors shadow-sm"
            title="Switch theme"
          >
            {theme === "dark" && <Moon size={14} className="text-accent" />}
            {theme === "light" && <Sun size={14} className="text-amber-500" />}
            {theme === "colorful" && <Palette size={14} className="text-violet" />}
            <span className="capitalize hidden md:inline">{theme}</span>
            <ChevronDown size={11} className="text-muted ml-0.5" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-line bg-panel-raised p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Select Theme
              </div>
              {themes.map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-accent/15 text-accent font-semibold"
                        : "text-muted hover:bg-panel hover:text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} />
                      <span>{t.label}</span>
                    </div>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Repository Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 text-xs font-medium text-ink hover:border-accent transition-colors shadow-sm"
          >
            <GitBranch size={13} className="text-accent" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {selectedRepo}
            </span>
            <ChevronDown size={11} className="text-muted" />
          </button>

          {repoDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-line bg-panel-raised p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Switch Repository
              </div>
              {repositories.map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => {
                    onSelectRepo(repo.name);
                    setRepoDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    selectedRepo === repo.name
                      ? "bg-accent/15 text-accent font-medium"
                      : "text-muted hover:bg-panel hover:text-ink"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-ink font-mono text-[12px]">{repo.name}</span>
                    <span className="text-[10px] text-muted">{repo.branch}</span>
                  </div>
                  {selectedRepo === repo.name && <Check size={14} className="text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-panel text-muted hover:border-accent hover:text-ink transition-colors shadow-sm"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-line bg-panel-raised p-3 shadow-2xl backdrop-blur-2xl z-50">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                <span className="text-xs font-semibold text-ink">Notifications</span>
                <Badge variant="blue">New</Badge>
              </div>
              <div className="space-y-2 text-xs text-muted">
                <div className="rounded-lg bg-panel p-2.5">
                  <p className="text-ink font-medium">Neural Review Completed</p>
                  <p className="text-[11px] text-muted mt-0.5">3 security recommendations generated for commit #b9a4c1.</p>
                </div>
                <div className="rounded-lg bg-panel p-2.5">
                  <p className="text-ink font-medium">Engineering Memory Synced</p>
                  <p className="text-[11px] text-muted mt-0.5">Updated conventions from team PR feedback.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-line bg-panel p-1.5 hover:border-accent transition-colors shadow-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-accent to-violet text-white text-[11px] font-bold">
              AI
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-line bg-panel-raised p-2 shadow-2xl backdrop-blur-2xl z-50">
              <div className="px-3 py-2 border-b border-line">
                <p className="text-xs font-semibold text-ink">Nishanth (Frontend Lead)</p>
                <p className="text-[10px] text-muted font-mono truncate">engineer@codemind.io</p>
              </div>
              <div className="pt-2 space-y-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-panel hover:text-ink transition-colors"
                >
                  <Shield size={13} />
                  <span>Account & Keys</span>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-panel hover:text-ink transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <User size={13} />
                    <span>GitHub Profile</span>
                  </span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
