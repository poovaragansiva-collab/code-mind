"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export interface AIJourneyState {
  scrollY: number;
  scrollProgress: number; // 0.0 to 1.0 on overview page
  route: string;
  isNavigating: boolean;
  navTarget: string | null;
  triggerScan: boolean;
  setTriggerScan: (val: boolean) => void;
  triggerNavAction: (targetRoute: string) => void;
}

const AIJourneyContext = createContext<AIJourneyState | null>(null);

export function AIJourneyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navTarget, setNavTarget] = useState<string | null>(null);
  const [triggerScan, setTriggerScan] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || document.documentElement.scrollTop;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const progress = Math.min(1, Math.max(0, y / maxScroll));
          setScrollY(y);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const triggerNavAction = (targetRoute: string) => {
    setIsNavigating(true);
    setNavTarget(targetRoute);
    if (targetRoute === "/reviews") {
      setTriggerScan(true);
      setTimeout(() => setTriggerScan(false), 2000);
    }
    setTimeout(() => {
      setIsNavigating(false);
      setNavTarget(null);
    }, 1200);
  };

  return (
    <AIJourneyContext.Provider
      value={{
        scrollY,
        scrollProgress,
        route: pathname,
        isNavigating,
        navTarget,
        triggerScan,
        setTriggerScan,
        triggerNavAction,
      }}
    >
      {children}
    </AIJourneyContext.Provider>
  );
}

export function useAIJourney() {
  const ctx = useContext(AIJourneyContext);
  if (!ctx) {
    return {
      scrollY: 0,
      scrollProgress: 0,
      route: "/",
      isNavigating: false,
      navTarget: null,
      triggerScan: false,
      setTriggerScan: () => {},
      triggerNavAction: () => {},
    };
  }
  return ctx;
}

