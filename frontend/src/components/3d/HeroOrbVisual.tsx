"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AIOrb } from "@/components/3d/AIOrb";

export function HeroOrbVisual() {
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center">
      {/* Ambient background glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="w-60 h-60 rounded-full bg-violet/20 blur-2xl" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <AIOrb scale={1.55} />
        </Suspense>
      </Canvas>
    </div>
  );
}
