"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface ScrollDownButtonProps {
  targetId?: string;
  onClick?: () => void;
  className?: string;
}

export function ScrollDownButton({
  targetId = "analysis-section",
  onClick,
  className = "",
}: ScrollDownButtonProps) {
  const handleScroll = () => {
    if (onClick) {
      onClick();
      return;
    }
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 500, behavior: "smooth" });
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 group ${className}`}>
      <button
        onClick={handleScroll}
        className="neumorphic-circle w-12 h-12 flex items-center justify-center text-accent hover:text-accent-cyan cursor-pointer transition-transform duration-300 group-hover:translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Scroll to explore"
        aria-label="Scroll to explore"
      >
        <ChevronDown size={22} className="animate-bounce" />
      </button>
      <span className="text-[11px] font-medium tracking-wide text-muted group-hover:text-ink transition-colors">
        Scroll to explore
      </span>
    </div>
  );
}

