"use client";

import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Intensity presets by route to balance visual prominence and readability
export type IntensityMode = "overview" | "intelligence" | "architecture" | "subtle" | "minimal";

interface NeuralBackgroundProps {
  intensity?: IntensityMode;
  interactive?: boolean;
}

// Dynamically import Three Canvas scene to guarantee strictly client-side execution & no SSR hydration mismatch
const ThreeCanvasScene = dynamic(
  () => import("./ThreeCanvasScene").then((mod) => mod.ThreeCanvasScene),
  {
    ssr: false,
    loading: () => <BackgroundFallback />,
  }
);

function BackgroundFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#080B10]"
    >
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/[0.07] blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet/[0.06] blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-accent/[0.05] blur-3xl" />
    </div>
  );
}

export function NeuralBackground({ intensity, interactive = false }: NeuralBackgroundProps) {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Automatically adapt intensity according to requirement guidelines if not explicitly passed
  const activeIntensity: IntensityMode =
    intensity ??
    (pathname === "/"
      ? "overview"
      : pathname.startsWith("/intelligence")
      ? "intelligence"
      : pathname.startsWith("/architecture")
      ? "architecture"
      : pathname.startsWith("/reviews")
      ? "subtle"
      : pathname.startsWith("/repositories")
      ? "subtle"
      : pathname.startsWith("/security") || pathname.startsWith("/quality")
      ? "subtle"
      : "minimal");

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    // Check WebGL availability safely
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch {
      setWebGLSupported(false);
    }

    return () => {
      motionQuery.removeEventListener("change", motionHandler);
    };
  }, []);

  if (prefersReducedMotion || !webGLSupported) {
    return <BackgroundFallback />;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 -z-10 overflow-hidden transition-opacity duration-1000 ${
        interactive ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        opacity:
          activeIntensity === "overview"
            ? 0.95
            : activeIntensity === "intelligence" || activeIntensity === "architecture"
            ? 0.85
            : activeIntensity === "subtle"
            ? 0.55
            : 0.35,
      }}
    >
      <Suspense fallback={<BackgroundFallback />}>
        <ThreeCanvasScene mode={activeIntensity} />
      </Suspense>
    </div>
  );
}

