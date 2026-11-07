"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

interface FloatingParticlesProps {
  count?: number;
  speed?: number;
  colorScheme?: "blue" | "violet" | "mixed";
}

export function FloatingParticles({
  count = 120,
  speed = 0.3,
  colorScheme = "mixed",
}: FloatingParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { theme } = useTheme();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const blue = new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF");
    const cyan = new THREE.Color("#20D9FF");
    const violet = new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;

      let chosenColor = blue;
      if (colorScheme === "violet") {
        chosenColor = violet;
      } else if (colorScheme === "mixed") {
        const r = Math.random();
        if (r < 0.4) chosenColor = blue;
        else if (r < 0.75) chosenColor = cyan;
        else chosenColor = violet;
      }

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count, colorScheme, theme]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.03 * speed;
    pointsRef.current.rotation.x += delta * 0.015 * speed;

    const elapsed = state.clock.getElapsedTime();
    pointsRef.current.position.y = Math.sin(elapsed * 0.4 * speed) * 0.4;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={theme === "light" ? 0.45 : 0.7}
        blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
