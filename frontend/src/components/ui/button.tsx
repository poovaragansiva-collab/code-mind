import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "neumorphic-primary hover:brightness-105 active:scale-[0.98]",
        primary:
          "neumorphic-primary hover:brightness-105 active:scale-[0.98]",
        secondary:
          "neumorphic-raised text-ink hover:text-accent active:scale-[0.98]",
        neumorphic:
          "neumorphic-raised text-ink hover:text-accent active:scale-[0.98]",
        outline:
          "border border-line bg-transparent text-ink hover:bg-panel hover:border-accent hover:shadow-sm active:scale-[0.98]",
        ghost:
          "text-muted hover:bg-panel-raised hover:text-ink shadow-none active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-accent via-[#20D9FF] to-violet text-white shadow-[0_0_25px_rgba(22,139,255,0.4)] hover:shadow-[0_0_30px_rgba(22,139,255,0.6)] border border-white/20 active:scale-[0.98]",
        glow:
          "bg-gradient-to-r from-accent to-violet text-white shadow-[0_0_25px_rgba(145,75,255,0.4)] hover:shadow-[0_0_30px_rgba(145,75,255,0.6)] border border-white/20 active:scale-[0.98]",
        danger:
          "bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]",
        destructive:
          "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-rose-600 active:scale-[0.98]",
        success:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-6 text-sm font-semibold",
        icon: "h-9 w-9 p-0 neumorphic-circle",
        "icon-sm": "h-8 w-8 p-0 neumorphic-circle text-xs",
        "icon-lg": "h-11 w-11 p-0 neumorphic-circle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      loadingText,
      disabled,
      children,
      asChild: _asChild = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
            {loadingText ? <span>{loadingText}</span> : children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
