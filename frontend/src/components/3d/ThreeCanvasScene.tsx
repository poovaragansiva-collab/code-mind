"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { FlowingEnergyRibbons } from "./FlowingEnergyRibbons";
import { AIEnergyArchitecture } from "./AIEnergyArchitecture";
import { CodeUniverseElements } from "./CodeUniverseElements";
import type { IntensityMode } from "./NeuralBackground";

function CinematicCameraRig() {
  useFrame((state) => {
    // Cinematic camera parallax with smooth dampening
    const targetX = state.pointer.x * 1.4;
    const targetY = state.pointer.y * 0.8;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.035);
    state.camera.lookAt(1.5, 0, 0); // Subtle offset focus towards the right-side architecture
  });

  return null;
}

export function ThreeCanvasScene({ mode }: { mode: IntensityMode }) {
  const isOverview = mode === "overview";
  const isIntelligence = mode === "intelligence";
  const isArchitecture = mode === "architecture";

  const particleCount = isOverview ? 220 : isIntelligence || isArchitecture ? 160 : mode === "subtle" ? 100 : 60;

  return (
    <Canvas
      camera={{ position: [0, 0.2, 14], fov: 46 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      }}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <CinematicCameraRig />

      {/* 1. Ambient Digital Cybernetic Particles */}
      <FloatingParticles count={particleCount} speed={isOverview ? 0.4 : 0.25} />

      {/* 2. Flowing 3D Energy Ribbons swooping across the scene */}
      <FlowingEnergyRibbons />

      {/* 3. Floating 3D Programming Symbols & Holographic Code Panels */}
      <CodeUniverseElements />

      {/* 4. NEW MAIN 3D AI ENERGY ARCHITECTURE (Gateway, Crystal Spire, Processor Core) */}
      <AIEnergyArchitecture />
    </Canvas>
  );
}
