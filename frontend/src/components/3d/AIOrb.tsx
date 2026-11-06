"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

interface AIOrbProps {
  scale?: number;
  enableEntry?: boolean;
}

export function AIOrb({ scale = 1.0, enableEntry = true }: AIOrbProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerSphere = useRef<THREE.Mesh>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const coreGlow = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const orbitingParticlesRef = useRef<THREE.Points>(null);
  const { theme } = useTheme();

  // Fast, smooth cinematic page entry lerp (scale 0 -> 1 with glow rotation)
  const entryProgress = useRef(enableEntry ? 0 : 1);

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const pink = useMemo(() => new THREE.Color("#F43F5E"), []);

  // Orbiting micro-particles around the neural orb
  const [orbPositions, orbColors] = useMemo(() => {
    const pCount = 120;
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const radius = 2.2 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? cyan : i % 3 === 1 ? violet : pink;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }
    return [pos, col];
  }, [cyan, violet, pink]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Cinematic Entry Animation: Powering on effect (scales smoothly from 0 to 1 with slight bounce)
    if (entryProgress.current < 1) {
      entryProgress.current = Math.min(1, entryProgress.current + delta * 1.25);
    }
    const ep = entryProgress.current;

    // Group-level transform driven by entry animation
    if (groupRef.current) {
      const dynamicScale = scale * ep;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);

      // Continuous subtle multi-axis rotation and floating
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
      groupRef.current.rotation.z = Math.cos(t * 0.3) * 0.1;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.12;
    }

    if (outerSphere.current) {
      outerSphere.current.rotation.y += delta * 0.35;
      outerSphere.current.rotation.x = Math.sin(t * 0.45) * 0.25;
      outerSphere.current.rotation.z = Math.cos(t * 0.3) * 0.2;
    }

    if (innerSphere.current) {
      const pulse = (1 + Math.sin(t * 3.0) * 0.12) * ep;
      innerSphere.current.scale.set(pulse, pulse, pulse);
    }

    if (coreGlow.current) {
      const pulse = 1 + Math.sin(t * 4.5) * 0.18;
      coreGlow.current.scale.set(pulse, pulse, pulse);
    }

    // Holographic orbital rings spin at differentiated speeds
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
    <group ref={groupRef}>
      {/* Dynamic Point Light from Sphere Core */}
      <pointLight color={cyan} intensity={2.5} distance={12} decay={2} />
      <pointLight color={violet} intensity={2.0} distance={10} decay={2} />

      {/* Innermost Brilliant Core */}
      <mesh ref={coreGlow}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Central Pulsing Energy Sphere */}
      <mesh ref={innerSphere}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial
          color={blue}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Wireframe Outer Lattice Layer */}
      <mesh ref={outerSphere}>
        <icosahedronGeometry args={[1.85, 2]} />
        <meshBasicMaterial
          color={violet}
          wireframe
          transparent
          opacity={theme === "light" ? 0.4 : 0.7}
        />
      </mesh>

      {/* Second Concentric Hexagonal Geodesic Wireframe */}
      <mesh>
        <dodecahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial
          color={cyan}
          wireframe
          transparent
          opacity={theme === "light" ? 0.2 : 0.4}
        />
      </mesh>

      {/* Three Rotating Holographic Rings */}
      <mesh ref={ring1}>
        <torusGeometry args={[2.55, 0.028, 16, 90]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={theme === "light" ? 0.45 : 0.85}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring2}>
        <torusGeometry args={[3.05, 0.022, 16, 90]} />
        <meshBasicMaterial
          color={violet}
          transparent
          opacity={theme === "light" ? 0.35 : 0.75}
          blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ring3}>
        <torusGeometry args={[3.45, 0.018, 16, 90]} />
        <meshBasicMaterial
          color={blue}
          transparent
          opacity={theme === "light" ? 0.3 : 0.6}
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
          size={0.16}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
