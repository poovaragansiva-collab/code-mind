"use client";

import React, { useState } from "react";
import {
  Shield,
  Bell,
  Cpu,
  Check,
  Save,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/surfaces";
import { useTheme, type Theme } from "@/lib/theme-context";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [groqKeySaved, setGroqKeySaved] = useState(false);
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGroqKeySaved(true);
    setTimeout(() => setGroqKeySaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Preferences / Configuration
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Platform Settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Configure theme styles, AI intelligence models, GitHub App credentials, team preferences, and notification rules.
        </p>
      </div>

      {/* Theme Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette size={16} className="text-violet" />
            <span>Theme & Visual Experience</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred interface theme with real-time 3D ambient adaptation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { id: "dark" as Theme, label: "Dark Navy", desc: "Futuristic dark AI command center", icon: Moon },
              { id: "light" as Theme, label: "Light Clean", desc: "Crisp white cards & soft accents", icon: Sun },
              { id: "colorful" as Theme, label: "Vibrant AI", desc: "Cyan, violet & pink gradient glow", icon: Palette },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-accent bg-panel-raised shadow-md"
                      : "border-line bg-panel hover:border-accent"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon size={16} className={isSelected ? "text-accent" : "text-muted"} />
                    {isSelected && <Badge variant="blue">Active</Badge>}
                  </div>
                  <span className="mt-3 text-sm font-semibold text-ink">{t.label}</span>
                  <p className="mt-1 text-xs text-muted leading-relaxed">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu size={16} className="text-accent" />
            <span>AI Reasoning & Model Configuration</span>
          </CardTitle>
          <CardDescription>
            CodeMind utilizes Groq LPU inference for high-speed deterministic code review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Groq API Key (Stored in Server Environment)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="gsk_****************************************"
                  className="flex-1 rounded-xl border border-line bg-panel px-4 py-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                />
                <Button type="submit" size="default">
                  {groqKeySaved ? (
                    <>
                      <Check size={14} className="text-emerald-400" /> Saved
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Update Key
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Default Inference Engine
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"
              >
                <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B Versatile (Fastest & Recommended)</option>
                <option value="deepseek-r1-distill-llama-70b">DeepSeek R1 Distill 70B (Complex Logic)</option>
                <option value="llama-3.1-8b-instant">LLaMA 3.1 8B Instant (Ultra low latency)</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* GitHub App Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} className="text-violet" />
            <span>GitHub App Integration</span>
          </CardTitle>
          <CardDescription>
            App credentials required for webhook delivery and repository synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Installation ID</span>
            <span className="font-mono text-ink">#4928172</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Webhook Event Listening</span>
            <Badge variant="green">pull_request, push</Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Permissions</span>
            <span className="text-muted">Contents: Read-only, Pull requests: Read & Write</span>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={16} className="text-accent" />
            <span>Notification Rules</span>
          </CardTitle>
          <CardDescription>
            Configure alerts for critical vulnerabilities and PR review completions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-line bg-panel text-accent focus:ring-accent"
            />
            <div>
              <p className="text-xs font-medium text-ink">Instant Critical Vulnerability Alerts</p>
              <p className="text-[11px] text-muted">Notify immediately when CVSS &gt;= 9.0 flaws are committed</p>
            </div>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
