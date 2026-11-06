"use client";

import React from "react";

export function HeroOrbVisual() {
  // The persistent continuous 3D neural sphere lives directly inside the shared Canvas scene
  // This viewport provides glowing ambient focal rings that align with the persistent 3D orb
  return (
    <div className="relative w-full h-[320px] sm:h-[380px] lg:h-[420px] flex items-center justify-center pointer-events-none">
      {/* Ambient glowing holographic rings aligning with the 3D sphere */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="w-56 h-56 rounded-full bg-violet/20 blur-2xl" />
        <div className="w-40 h-40 rounded-full border border-accent/20 animate-spin" style={{ animationDuration: "12s" }} />
      </div>
    </div>
  );
}
