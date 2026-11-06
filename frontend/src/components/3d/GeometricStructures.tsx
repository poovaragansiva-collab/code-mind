"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

export function GeometricStructures() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const hexGroup = useRef<THREE.Group>(null);
  const { theme } = useTheme();

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);

  // Floating geometric nodes
  const cubes = useMemo(() => {
    return [
      { pos: [-6, 3, -4] as [number, number, number], rotSpeed: 0.4, size: 0.4 },
      { pos: [5, -4, -3] as [number, number, number], rotSpeed: -0.3, size: 0.35 },
      { pos: [-4, -3.5, -2] as [number, number, number], rotSpeed: 0.5, size: 0.3 },
      { pos: [7, 4, -5] as [number, number, number], rotSpeed: -0.4, size: 0.45 },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.15;
      ringRef.current.rotation.y = t * 0.25;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * 0.2;
      ringRef2.current.rotation.z = t * 0.18;
    }
    if (hexGroup.current) {
      hexGroup.current.rotation.y = t * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Holographic Energy Ring */}
      <mesh ref={ringRef} position={[0, 0, -2]}>
        <torusGeometry args={[9.5, 0.02, 16, 100]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={theme === "light" ? 0.2 : 0.35}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary Tilted Orbit Ring */}
      <mesh ref={ringRef2} position={[2, 0, -3]}>
        <torusGeometry args={[7.8, 0.015, 16, 100]} />
        <meshBasicMaterial
          color={violet}
          transparent
          opacity={theme === "light" ? 0.18 : 0.3}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating Holographic Wireframe Cubes */}
      <group ref={hexGroup}>
        {cubes.map((c, idx) => (
          <mesh key={idx} position={c.pos}>
            <boxGeometry args={[c.size, c.size, c.size]} />
            <meshBasicMaterial
              color={idx % 2 === 0 ? blue : cyan}
              wireframe
              transparent
              opacity={theme === "light" ? 0.25 : 0.45}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
