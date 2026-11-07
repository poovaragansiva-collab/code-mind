"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

interface NeuralNetworkProps {
  nodeCount?: number;
  maxDistance?: number;
  intensity?: number;
  glowColor?: string;
  wireColor?: string;
}

export function NeuralNetwork({
  nodeCount = 42,
  maxDistance = 5.2,
  intensity = 1.0,
  glowColor = "#168BFF",
  wireColor = "#20D9FF",
}: NeuralNetworkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { theme } = useTheme();

  // Initialize node points with positions and random velocities
  const [nodes, originalPos] = useMemo(() => {
    const arr = [];
    const orig = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 11;
      const z = (Math.random() - 0.5) * 12;
      arr.push({
        pos: new THREE.Vector3(x, y, z),
        orig: new THREE.Vector3(x, y, z),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        scale: 0.8 + Math.random() * 0.7,
      });
      orig.push(new THREE.Vector3(x, y, z));
    }
    return [arr, orig];
  }, [nodeCount]);

  // Pre-calculate line connections buffer
  const maxLines = Math.floor((nodeCount * (nodeCount - 1)) / 2);
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Gentle global rotation
    groupRef.current.rotation.y = time * 0.04;
    groupRef.current.rotation.x = Math.sin(time * 0.03) * 0.12;

    // Subtle node drifting around their origin
    nodes.forEach((node, i) => {
      const seed = i * 1.35;
      node.pos.x = originalPos[i].x + Math.sin(time * 0.6 + seed) * 0.8;
      node.pos.y = originalPos[i].y + Math.cos(time * 0.5 + seed * 1.2) * 0.7;
      node.pos.z = originalPos[i].z + Math.sin(time * 0.4 + seed * 0.8) * 0.6;
    });

    // Compute active connections
    let lineIndex = 0;
    const distSqLimit = maxDistance * maxDistance;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const p1 = nodes[i].pos;
        const p2 = nodes[j].pos;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < distSqLimit && lineIndex < maxLines * 6) {
          linePositions[lineIndex++] = p1.x;
          linePositions[lineIndex++] = p1.y;
          linePositions[lineIndex++] = p1.z;
          linePositions[lineIndex++] = p2.x;
          linePositions[lineIndex++] = p2.y;
          linePositions[lineIndex++] = p2.z;
        }
      }
    }

    if (linesRef.current) {
      linesRef.current.geometry.setDrawRange(0, lineIndex / 3);
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const activeLineColor = theme === "light" ? "#2878F0" : theme === "colorful" ? "#C084FC" : wireColor;

  return (
    <group ref={groupRef}>
      {/* Dynamic Synaptic Line Segments */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={activeLineColor}
          transparent
          opacity={(theme === "light" ? 0.25 : 0.4) * intensity}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Neural Node Spheres */}
      {nodes.map((node, idx) => (
        <mesh key={idx} position={node.pos}>
          <sphereGeometry args={[0.09 * node.scale, 12, 12]} />
          <meshBasicMaterial
            color={
              idx % 3 === 0
                ? theme === "colorful"
                  ? "#EC4899"
                  : "#914BFF"
                : idx % 5 === 0
                ? "#20D9FF"
                : glowColor
            }
            transparent
            opacity={0.85 * intensity}
          />
        </mesh>
      ))}
    </group>
  );
}
