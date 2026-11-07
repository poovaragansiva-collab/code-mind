"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitBranch,
  Search,
  ExternalLink,
  Plus,
  Clock,
  AlertCircle,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";
import { EmptyState } from "@/components/common/EmptyState";
import { fetchRepositories, registerRepository, type RepoItem } from "@/lib/api";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isConnecting, setIsConnecting] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepositories()
      .then((data) => setRepos(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async () => {
    if (!repoInput.trim()) return;
    try {
      const created = await registerRepository(repoInput.trim());
      setRepos((prev) => [...prev.filter((r) => r.id !== created.id), created]);
      setRepoInput("");
      setIsConnecting(false);
    } catch {
      // Handled silently
    }
  };

  const filtered = repos.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ? true : r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Workspace / Sources
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Connected Repositories
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Manage your source code integrations. CodeMind utilizes read-only GitHub permissions to analyze trees, commits, and pull requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsConnecting(true)}
            size="default"
          >
            <Plus size={15} />
            Connect Repository
          </Button>
        </div>
      </div>

      {/* GitHub App Modal / Drawer simulation */}
      {isConnecting && (
        <Card variant="glass" className="border-accent/40 animate-in fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-ink">Connect GitHub Repository</h3>
                <p className="mt-1 text-xs text-muted">
                  Specify a repository (e.g. org/repo or full GitHub URL) to register for analysis.
                </p>
              </div>
              <button
                onClick={() => setIsConnecting(false)}
                className="text-muted hover:text-ink text-xs font-mono"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="github.com/organization/repository-name"
                className="flex-1 rounded-xl border border-line bg-panel px-4 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              />
              <Button onClick={handleConnect}>
                Authorize & Ingest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            className="w-full rounded-xl border border-line bg-panel pl-9 pr-4 py-2 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-line bg-panel px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="connected">Connected</option>
            <option value="syncing">Syncing</option>
          </select>
        </div>
      </div>

      {/* Repositories Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-muted">Loading connected repositories...</div>
      ) : repos.length === 0 ? (
        <EmptyState
          title="No repositories connected"
          description="Connect a GitHub repository or trigger a code review in the workspace to register a source."
          actionLabel="Connect Repository"
          onAction={() => setIsConnecting(true)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No repositories match filter"
          description="Try modifying your search term or filter selection."
          actionLabel="Clear Search"
          onAction={() => {
            setSearchTerm("");
            setFilterStatus("all");
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((repo) => (
            <Card key={repo.id} variant="interactive" className="group">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel-raised text-accent">
                        <GitBranch size={16} />
                      </div>
                      <Badge variant="green">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Connected
                      </Badge>
                    </div>

                    <a
                      href={repo.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted hover:text-ink transition-colors p-1"
                      title="View on GitHub"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-ink group-hover:text-accent transition-colors">
                    {repo.name}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    branch: <span className="text-ink">{repo.default_branch}</span>
                  </p>
                </div>

                <div className="border-t border-line pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <FileCode2 size={13} /> Ingested findings
                    </span>
                    <span className="font-mono text-ink">{repo.files_count}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle size={13} className="text-amber-400" /> Open Issues
                    </span>
                    <span className="font-mono font-medium text-ink">{repo.open_issues}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted pt-1">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock size={12} /> Last Analysis
                    </span>
                    <span className="text-[11px] font-mono text-muted">{repo.last_analysis}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/reviews">
                      Open in Code Review
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
