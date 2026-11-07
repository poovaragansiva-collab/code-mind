import React from "react";
import Link from "next/link";
import { LucideIcon, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  note?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FolderGit2,
  actionLabel,
  actionHref,
  onAction,
  note,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-12 text-center backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line-subtle bg-panel-raised text-muted shadow-sm">
        <Icon size={22} className="text-accent" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-muted">{description}</p>

      {note && (
        <div className="mt-4 max-w-lg rounded-lg border border-line/70 bg-canvas/60 px-4 py-2.5 text-xs text-muted/90">
          {note}
        </div>
      )}

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild size="sm">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

