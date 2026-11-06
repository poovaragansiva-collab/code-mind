"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  isDemo?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  change,
  trend = "neutral",
  isDemo = false,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden transition-all duration-300 hover:border-accent/40", className)}>
      {/* Background soft ambient gradient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/[0.04] blur-xl transition-all duration-500 group-hover:bg-accent/[0.1]" />

      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted tracking-wide">{label}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-subtle bg-panel-raised/80 text-muted transition-colors duration-200 group-hover:border-accent/30 group-hover:text-accent">
            <Icon size={16} />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="font-mono text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {value}
          </div>
          {change && (
            <span
              className={cn(
                "inline-flex items-center text-[11px] font-medium font-mono",
                trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-muted"
              )}
            >
              {trend === "up" && <ArrowUpRight size={12} className="mr-0.5" />}
              {trend === "down" && <ArrowDownRight size={12} className="mr-0.5" />}
              {change}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] leading-relaxed text-muted/80">{note}</p>
          {isDemo && (
            <span className="rounded bg-panel-raised px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400/80 border border-amber-500/20">
              Demo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

