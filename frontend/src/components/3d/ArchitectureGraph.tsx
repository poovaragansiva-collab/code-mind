"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ArchitectureNode {
  name: string;
  pos: [number, number, number];
  color: string;
  size: number;
}

export function ArchitectureGraph() {
  const groupRef = useRef<THREE.Group>(null);

  const modules: ArchitectureNode[] = useMemo(
    () => [
      { name: "API Gateway", pos: [0, 2.5, 0], color: "#5AA9FF", size: 0.35 },
      { name: "Auth Engine", pos: [-3, 1.2, 0.5], color: "#A78BFA", size: 0.28 },
      { name: "Review Agent", pos: [3, 1.2, -0.5], color: "#5AA9FF", size: 0.32 },
      { name: "Parser / AST", pos: [-2, -1.0, 1.2], color: "#67E8F9", size: 0.26 },
      { name: "Hindsight Memory", pos: [2, -0.8, 1.0], color: "#C084FC", size: 0.3 },
      { name: "Security Scanner", pos: [0, -2.2, -0.8], color: "#F43F5E", size: 0.28 },
      { name: "PostgreSQL DSN", pos: [-3.5, -1.8, -1.2], color: "#34D399", size: 0.25 },
      { name: "Event Bus", pos: [3.8, -1.6, -1.0], color: "#FBBF24", size: 0.25 },
    ],
    []
  );

  const links = useMemo(
    () => [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 6],
      [4, 7],
      [5, 7],
    ],
    []
  );

  const linePositions = useMemo(() => {
    const pos = new Float32Array(links.length * 6);
    links.forEach(([src, dst], idx) => {
      const p1 = modules[src].pos;
      const p2 = modules[dst].pos;
      pos[idx * 6] = p1[0];
      pos[idx * 6 + 1] = p1[1];
      pos[idx * 6 + 2] = p1[2];
      pos[idx * 6 + 3] = p2[0];
      pos[idx * 6 + 4] = p2[1];
      pos[idx * 6 + 5] = p2[2];
    });
    return pos;
  }, [links, modules]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.35;
    groupRef.current.rotation.x = Math.cos(t * 0.15) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* Structural Connection Links */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Module Nodes */}
      {modules.map((m, idx) => (
        <group key={idx} position={m.pos}>
          <mesh>
            <sphereGeometry args={[m.size, 16, 16]} />
            <meshBasicMaterial color={m.color} />
          </mesh>
          <mesh>
            <sphereGeometry args={[m.size * 1.35, 12, 12]} />
            <meshBasicMaterial
              color={m.color}
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

