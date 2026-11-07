export interface Finding {
  id: string;
  priority: "P0" | "P1" | "P2" | "P3";
  category: "quality" | "security" | "architecture" | "performance";
  severity: "critical" | "high" | "medium" | "low" | "info";
  file?: string | null;
  component?: string | null;
  line?: number | null;
  message?: string;
  explanation?: string;
  recommendation?: string;
  evidence?: string;
  cwe?: string;
  owasp_category?: string;
  origin_agent?: string;
}

export interface ArchitectureAnalysis {
  repo_id: string;
  architecture_score: number | null;
  modularity: {
    coupling_level?: "low" | "medium" | "high";
    cohesion_level?: "high" | "medium" | "low";
    boundary_health?: "strong" | "moderate" | "weak";
    assessment?: string;
  };
  dependency_analysis: {
    circular_risks?: string[];
    coupling_hotspots?: string[];
    boundary_violations?: string[];
  };
  api_contract_consistency: {
    status?: string;
    notes?: string;
  };
  technical_debt: Array<{
    component: string;
    risk: string;
    effort: "low" | "medium" | "high";
  }>;
  trade_offs: Array<{
    decision: string;
    benefit: string;
    drawback: string;
  }>;
  adrs_extracted: Array<{
    title: string;
    status: string;
    context: string;
    consequences?: string;
  }>;
  critical_risks: string[];
  findings: Finding[];
}

export interface SecurityAnalysis {
  repo_id: string;
  security_score: number | null;
  threat_summary: string;
  risk_matrix: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Finding[];
  threat_model: Array<{
    threat: string;
    vector: string;
    mitigation: string;
  }>;
  ai_security_risks: Array<{
    risk: string;
    severity: string;
    remediation: string;
  }>;
  critical_risks: string[];
}

export interface OrchestratedAnalysis {
  summary: string;
  overall_score: number | null;
  quality_score: number | null;
  security_score: number | null;
  architecture_score: number | null;
  maintainability_score: number | null;
  findings: Finding[];
  critical_risks: string[];
  recommended_fixes: Array<{
    id: string;
    file: string;
    action: string;
    priority: string;
  }>;
  trade_offs: Array<{
    decision: string;
    benefit: string;
    drawback: string;
  }>;
  adrs_extracted: Array<{
    title: string;
    status: string;
    context: string;
  }>;
  threat_model: Array<{
    threat: string;
    vector: string;
    mitigation: string;
  }>;
  agent_statuses?: Record<string, { status: string; duration_seconds?: number; error?: string }>;
  repo_id: string;
  memory_influenced: boolean;
  memories_used: boolean;
  patterns_detected: string[];
  reflection?: string | null;
}

export async function triggerRepositoryAnalysis(
  repoId: string,
  codeContext: string,
  reflect = false
): Promise<OrchestratedAnalysis> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code_context: codeContext, reflect }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function fetchLatestAnalysis(repoId: string): Promise<OrchestratedAnalysis | null> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest analysis");
  return res.json();
}

export async function fetchArchitectureAnalysis(repoId: string): Promise<ArchitectureAnalysis | null> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/architecture`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch architecture analysis");
  return res.json();
}

export async function fetchSecurityAnalysis(repoId: string): Promise<SecurityAnalysis | null> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/security`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch security analysis");
  return res.json();
}

export async function fetchMemories(
  repoId: string,
  query = "engineering patterns bugs findings"
): Promise<{ memories: string; has_memory: boolean }> {
  const res = await fetch(
    `/api/repositories/${encodeURIComponent(repoId)}/memories?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to fetch memories");
  return res.json();
}

export async function submitFeedback(
  repoId: string,
  findingId: string,
  action: "accepted" | "rejected" | "corrected",
  comment = ""
): Promise<{ status: string }> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ finding_id: findingId, action, comment }),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

export async function triggerReflection(
  repoId: string,
  query = "Summarise recurring issues and engineering patterns."
): Promise<{ insight: string; has_insight: boolean }> {
  const res = await fetch(`/api/repositories/${encodeURIComponent(repoId)}/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to trigger reflection");
  return res.json();
}

export interface RepoItem {
  id: string;
  name: string;
  github_url: string;
  default_branch: string;
  status: "connected" | "syncing" | "pending";
  last_analysis: string;
  files_count: number;
  open_issues: number;
}

export async function fetchRepositories(): Promise<RepoItem[]> {
  const res = await fetch("/api/repositories");
  if (!res.ok) return [];
  return res.json();
}

export async function registerRepository(name: string, defaultBranch = "main"): Promise<RepoItem> {
  const res = await fetch("/api/repositories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, default_branch: defaultBranch }),
  });
  if (!res.ok) throw new Error("Failed to register repository");
  return res.json();
}
