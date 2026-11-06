"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

export function AIOrb({ scale = 1.0 }: { scale?: number }) {
  const outerSphere = useRef<THREE.Mesh>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const orbitingParticlesRef = useRef<THREE.Points>(null);
  const { theme } = useTheme();

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);

  // Orbiting micro-particles around the neural orb
  const [orbPositions, orbColors] = useMemo(() => {
    const pCount = 90;
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const chosenColor = i % 2 === 0 ? cyan : violet;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [cyan, violet]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerSphere.current) {
      outerSphere.current.rotation.y += delta * 0.35;
      outerSphere.current.rotation.x = Math.sin(t * 0.45) * 0.25;
      outerSphere.current.rotation.z = Math.cos(t * 0.3) * 0.2;
    }
    if (innerSphere.current) {
      const pulse = 1 + Math.sin(t * 3.0) * 0.12;
      innerSphere.current.scale.set(pulse, pulse, pulse);
    }
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.6;
      ring1.current.rotation.y = t * 0.45;
    }
    if (ring2.current) {
      ring2.current.rotation.y = -t * 0.55;
      ring2.current.rotation.z = t * 0.35;
    }
    if (ring3.current) {
      ring3.current.rotation.x = -t * 0.35;
      ring3.current.rotation.z = -t * 0.5;
    }
    if (orbitingParticlesRef.current) {
      orbitingParticlesRef.current.rotation.y = t * 0.25;
      orbitingParticlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
  });

  return (
    <group scale={scale}>
      {/* Central Pulsing Energy Core */}
      <mesh ref={innerSphere}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial
          color={blue}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Wireframe Outer Lattice */}
      <mesh ref={outerSphere}>
        <icosahedronGeometry args={[1.8, 2]} />
        <meshBasicMaterial
          color={violet}
          wireframe
          transparent
          opacity={theme === "light" ? 0.35 : 0.6}
        />
      </mesh>

      {/* Three Rotating Orbital Rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.5, 0.025, 16, 80]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={theme === "light" ? 0.35 : 0.75}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2}>
        <torusGeometry args={[3.0, 0.02, 16, 80]} />
        <meshBasicMaterial
          color={violet}
          transparent
          opacity={theme === "light" ? 0.3 : 0.65}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring3}>
        <torusGeometry args={[3.4, 0.015, 16, 80]} />
        <meshBasicMaterial
          color={blue}
          transparent
          opacity={theme === "light" ? 0.25 : 0.5}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Energy Particles */}
      <points ref={orbitingParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[orbPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[orbColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          vertexColors
          transparent
          opacity={theme === "light" ? 0.6 : 0.9}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}
