"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/surfaces";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tag?: string;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  tag,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block group">
      <Card variant="interactive" className="h-full">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-subtle bg-panel-raised text-accent transition-transform duration-300 group-hover:scale-105">
                <Icon size={18} />
              </div>
              {tag && (
                <span className="rounded-full border border-line-subtle bg-canvas/60 px-2 py-0.5 font-mono text-[10px] text-muted">
                  {tag}
                </span>
              )}
            </div>

            <h4 className="mt-4 text-sm font-semibold text-ink group-hover:text-accent transition-colors">
              {title}
            </h4>
            <p className="mt-1 text-xs leading-5 text-muted line-clamp-2">
              {description}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent">
            <span>Open</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

