"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

export function NeuralConnections({
  nodeCount = 28,
  glowColor = "#20D9FF",
}: {
  nodeCount?: number;
  glowColor?: string;
}) {
  const lineMeshRef = useRef<THREE.LineSegments>(null);
  const { theme } = useTheme();

  // Generate a network mesh with pulsing nodes
  const [nodes, connections] = useMemo(() => {
    const nodeArr: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 6.5 + (i % 4);
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      nodeArr.push(new THREE.Vector3(x, y, z));
    }

    const connArr: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodeArr[i].distanceTo(nodeArr[j]) < 5.8) {
          connArr.push(nodeArr[i].x, nodeArr[i].y, nodeArr[i].z);
          connArr.push(nodeArr[j].x, nodeArr[j].y, nodeArr[j].z);
        }
      }
    }

    return [nodeArr, new Float32Array(connArr)];
  }, [nodeCount]);

  useFrame((state) => {
    if (!lineMeshRef.current) return;
    const t = state.clock.getElapsedTime();
    lineMeshRef.current.rotation.y = t * 0.03;
    lineMeshRef.current.rotation.z = Math.sin(t * 0.05) * 0.1;
  });

  return (
    <group>
      <lineSegments ref={lineMeshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connections, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={theme === "colorful" ? "#C084FC" : glowColor}
          transparent
          opacity={theme === "light" ? 0.22 : 0.4}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Pulsing Synapse Nodes */}
      {nodes.map((pt, idx) => (
        <mesh key={idx} position={pt}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial
            color={idx % 2 === 0 ? "#168BFF" : "#20D9FF"}
            transparent
            opacity={theme === "light" ? 0.5 : 0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

