import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-accent via-[#38BDF8] to-violet text-white hover:opacity-95 shadow-[0_0_20px_rgba(22,139,255,0.35)] border border-white/20",
        secondary:
          "bg-panel-raised text-ink hover:bg-panel border border-line hover:border-accent shadow-sm",
        outline:
          "border border-line bg-transparent text-ink hover:bg-panel hover:border-accent",
        ghost:
          "text-muted hover:bg-panel-raised hover:text-ink shadow-none",
        glow:
          "bg-gradient-to-r from-accent to-violet text-white shadow-[0_0_25px_rgba(145,75,255,0.4)] hover:shadow-[0_0_30px_rgba(145,75,255,0.6)] border border-white/20",
        danger:
          "bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
        success:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 p-0",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
