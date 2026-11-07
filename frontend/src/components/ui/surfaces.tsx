import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-line bg-panel shadow-sm hover:border-accent/40",
        glass:
          "border-line-subtle bg-[var(--card-glass)] backdrop-blur-2xl shadow-panel hover:border-accent/40",
        interactive:
          "border-line bg-panel shadow-sm hover:border-accent hover:shadow-[var(--glow-shadow)] cursor-pointer",
        glow:
          "border-accent/40 bg-panel shadow-[var(--glow-shadow)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Card({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>) {
  return (
    <div
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-ink", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs leading-5 text-muted", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)}
      {...props}
    />
  );
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors border",
  {
    variants: {
      variant: {
        neutral:
          "border-line bg-panel-raised text-muted",
        blue:
          "border-accent/30 bg-accent/15 text-accent shadow-sm",
        violet:
          "border-violet/30 bg-violet/15 text-violet shadow-sm",
        green:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm",
        amber:
          "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-300 shadow-sm",
        red:
          "border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-300 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
