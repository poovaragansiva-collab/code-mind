"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransitionWrapper({
  children,
  className = "",
}: PageTransitionWrapperProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={`animate-page-enter w-full ${className}`}
      style={{
        transformOrigin: "top center",
      }}
    >
      {children}
    </div>
  );
}

