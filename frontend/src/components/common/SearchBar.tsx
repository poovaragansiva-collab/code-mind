import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search across repository or findings...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 text-muted/70"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-line bg-canvas/70 pl-9 pr-4 text-xs text-ink placeholder:text-muted/60 transition-colors focus:border-accent/60 focus:bg-canvas focus:outline-none focus:ring-1 focus:ring-accent/40"
      />
    </div>
  );
}

