import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

export function SeverityBadge({
  severity,
  className,
  showIcon = true,
}: SeverityBadgeProps) {
  const config = {
    critical: {
      label: "Critical",
      icon: ShieldAlert,
      styles: "border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    },
    high: {
      label: "High",
      icon: AlertCircle,
      styles: "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]",
    },
    medium: {
      label: "Medium",
      icon: AlertTriangle,
      styles: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.15)]",
    },
    low: {
      label: "Low",
      icon: Info,
      styles: "border-accent/30 bg-accent/10 text-[#9bcaff] shadow-[0_0_12px_rgba(90,169,255,0.15)]",
    },
    info: {
      label: "Info",
      icon: Info,
      styles: "border-line bg-panel-raised text-muted",
    },
  }[severity];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium border",
        config.styles,
        className
      )}
    >
      {showIcon && <Icon size={12} />}
      {config.label}
    </span>
  );
}

