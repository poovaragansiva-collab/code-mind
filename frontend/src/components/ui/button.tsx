import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "neumorphic-primary",
        secondary:
          "neumorphic-raised text-ink",
        neumorphic:
          "neumorphic-raised text-ink",
        outline:
          "border border-line bg-transparent text-ink hover:bg-panel hover:border-accent",
        ghost:
          "text-muted hover:bg-panel-raised hover:text-ink shadow-none",
        glow:
          "bg-gradient-to-r from-accent to-violet text-white shadow-[0_0_25px_rgba(145,75,255,0.4)] hover:shadow-[0_0_30px_rgba(145,75,255,0.6)] border border-white/20 active:scale-95",
        danger:
          "bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 active:scale-95",
        success:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-11 px-5 text-sm",
        icon: "h-9 w-9 p-0 neumorphic-circle",
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
