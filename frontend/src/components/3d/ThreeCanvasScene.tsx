"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { NeuralNetwork } from "./NeuralNetwork";
import { NeuralConnections } from "./NeuralConnections";
import { FlowingEnergyStreams } from "./FlowingEnergyStreams";
import { GeometricStructures } from "./GeometricStructures";
import { PersistentLivingOrb } from "./PersistentLivingOrb";
import type { IntensityMode } from "./NeuralBackground";

function CameraRig() {
  useFrame((state) => {
    const targetX = state.pointer.x * 1.0;
    const targetY = state.pointer.y * 0.6;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export function ThreeCanvasScene({ mode }: { mode: IntensityMode }) {
  const isOverview = mode === "overview";
  const isIntelligence = mode === "intelligence";
  const isArchitecture = mode === "architecture";

  const particleCount = isOverview ? 240 : isIntelligence || isArchitecture ? 180 : mode === "subtle" ? 110 : 70;
  const nodeCount = isOverview ? 60 : isIntelligence ? 65 : isArchitecture ? 45 : 25;

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 48 }}
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
      <CameraRig />

      {/* Floating Synaptic Particles in Deep Space */}
      <FloatingParticles count={particleCount} speed={isOverview ? 0.45 : 0.28} />

      {/* Neural Synapse Network Mesh */}
      <NeuralNetwork
        nodeCount={nodeCount}
        intensity={isOverview ? 1.1 : isIntelligence ? 1.2 : 0.75}
        maxDistance={isOverview ? 5.6 : 4.8}
      />

      {/* Specialized Neural Connections & Pulsing Nodes */}
      {(isOverview || isIntelligence) && (
        <NeuralConnections nodeCount={isOverview ? 36 : 42} />
      )}

      {/* Flowing Curved Energy Streams */}
      {(isOverview || isArchitecture) && (
        <FlowingEnergyStreams streamCount={isOverview ? 6 : 4} speed={0.4} />
      )}

      {/* Holographic Geometric Rings & Cubes */}
      {(isOverview || isIntelligence) && <GeometricStructures />}

      {/* ONE CONTINUOUS PERSISTENT LIVING NEURAL SPHERE */}
      <PersistentLivingOrb />
    </Canvas>
  );
}
