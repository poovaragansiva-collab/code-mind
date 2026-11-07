import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-2xl border border-line bg-panel shadow-panel", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("space-y-1.5 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="card-title" className={cn("text-sm font-semibold text-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm leading-6 text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-5 pb-5", className)} {...props} />;
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "border-line bg-panel-raised text-muted",
        blue: "border-accent/20 bg-accent/10 text-[#9bcaff]",
        violet: "border-violet/20 bg-violet/10 text-[#c7b4ff]",
        amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
        green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ className, variant }))}
      {...props}
    />
  );
}
