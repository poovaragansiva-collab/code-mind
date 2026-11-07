"use client";

import React, { useState } from "react";
import {
  Download,
  Calendar,
  GitCommit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent } from "@/components/ui/surfaces";

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const reports = [
    {
      id: "rep-01",
      title: "Comprehensive Security & Quality Audit",
      date: "Nov 6, 2026",
      commit: "b9a4c17e",
      repo: "codemind/ai-core",
      findingsCount: 4,
      status: "Verified",
    },
    {
      id: "rep-02",
      title: "Microservices Architecture Coupling Report",
      date: "Nov 4, 2026",
      commit: "a811d04f",
      repo: "payments/checkout-worker",
      findingsCount: 1,
      status: "Verified",
    },
    {
      id: "rep-03",
      title: "Tree-Sitter AST Linter Compliance Summary",
      date: "Oct 30, 2026",
      commit: "f42199b0",
      repo: "org/web-service-v2",
      findingsCount: 8,
      status: "Archived",
    },
  ];

  const handleDownload = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      const content = `CodeMind Engineering Report\nReport: ${title}\nGenerated: ${new Date().toISOString()}\nStatus: Verified\nAnchored to immutable commit evidence.`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadingId(null);
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            Context / History
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Analysis & Compliance Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Export structured audits, vulnerability assessments, and engineering convention metrics anchored to immutable commits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue">
            <Calendar size={12} className="text-accent" />
            Audit Logging Active
          </Badge>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {reports.map((rep) => (
          <Card key={rep.id} className="hover:border-accent">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={rep.status === "Verified" ? "green" : "neutral"}>
                    {rep.status}
                  </Badge>
                  <span className="font-mono text-xs text-muted flex items-center gap-1">
                    <GitCommit size={13} /> {rep.commit}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink">{rep.title}</h3>
                <p className="font-mono text-[11px] text-muted">
                  Target: <span className="text-ink">{rep.repo}</span> · Date: {rep.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted">
                  {rep.findingsCount} findings logged
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={downloadingId === rep.id}
                  onClick={() => handleDownload(rep.id, rep.title)}
                >
                  <Download size={14} className={downloadingId === rep.id ? "animate-bounce" : ""} />
                  <span>{downloadingId === rep.id ? "Exporting..." : "Download"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
