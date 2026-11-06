"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FloatingParticles } from "./FloatingParticles";
import { NeuralNetwork } from "./NeuralNetwork";
import { NeuralConnections } from "./NeuralConnections";
import { FlowingEnergyStreams } from "./FlowingEnergyStreams";
import { GeometricStructures } from "./GeometricStructures";
import { AIOrb } from "./AIOrb";
import type { IntensityMode } from "./NeuralBackground";

function CameraRig() {
  useFrame((state) => {
    const targetX = state.pointer.x * 1.2;
    const targetY = state.pointer.y * 0.7;

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

  const particleCount = isOverview ? 260 : isIntelligence || isArchitecture ? 180 : mode === "subtle" ? 110 : 60;
  const nodeCount = isOverview ? 65 : isIntelligence ? 70 : isArchitecture ? 50 : 28;

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
      <FloatingParticles count={particleCount} speed={isOverview ? 0.5 : 0.3} />

      {/* Neural Synapse Network Mesh */}
      <NeuralNetwork
        nodeCount={nodeCount}
        intensity={isOverview ? 1.2 : isIntelligence ? 1.3 : 0.8}
        maxDistance={isOverview ? 5.8 : 5.0}
      />

      {/* Specialized Neural Connections & Pulsing Nodes */}
      {(isOverview || isIntelligence) && (
        <NeuralConnections nodeCount={isOverview ? 38 : 45} />
      )}

      {/* Flowing Curved Energy Streams */}
      {(isOverview || isArchitecture) && (
        <FlowingEnergyStreams streamCount={isOverview ? 7 : 5} speed={0.45} />
      )}

      {/* Holographic Geometric Rings & Cubes */}
      {(isOverview || isIntelligence) && <GeometricStructures />}

      {/* Hero Central Orb for Overview Scene */}
      {isOverview && (
        <group position={[5.5, 0.2, -1]}>
          <AIOrb scale={1.4} />
        </group>
      )}
    </Canvas>
  );
}
