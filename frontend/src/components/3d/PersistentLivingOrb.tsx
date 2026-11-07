"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";
import { useAIJourney } from "@/lib/ai-journey-context";

export function PersistentLivingOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const outerSphere = useRef<THREE.Mesh>(null);
  const innerSphere = useRef<THREE.Mesh>(null);
  const coreGlow = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const orbitingParticlesRef = useRef<THREE.Points>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);

  const { theme } = useTheme();
  const journey = useAIJourney();

  // Persistent continuous rotation accumulators that NEVER reset
  const rotY = useRef(0);
  const rotX = useRef(0);
  const rotZ = useRef(0);

  // Smooth lerp state for position, scale, and lighting
  const currentPos = useRef(new THREE.Vector3(5.2, 0.4, 0));
  const currentScale = useRef(1.4);
  const introProgress = useRef(0);

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const scanCyan = useMemo(() => new THREE.Color("#38BDF8"), []);

  // Orbiting micro-particles around the neural sphere
  const [orbPositions, orbColors] = useMemo(() => {
    const pCount = 110;
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const radius = 2.0 + Math.random() * 1.8;
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

    // 1. Initial Intro Power-On: smooth scale & slide from right on first mount
    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + delta * 1.1);
    }
    const intro = introProgress.current;

    // 2. Continuous rotation accumulator (always increments smoothly without jumping)
    rotY.current += delta * (0.35 + (journey.route === "/" ? journey.scrollProgress * 0.4 : 0.1));
    rotX.current = Math.sin(t * 0.4) * 0.18;
    rotZ.current = Math.cos(t * 0.3) * 0.12;

    // 3. Compute Target Position & Scale based on Current Route and Scroll Progress
    const targetPos = new THREE.Vector3();
    let targetScale = 1.0;

    if (journey.route === "/") {
      // HOMEPAGE SCROLL JOURNEY:
      // Beginning: large sphere on right (x: 5.2, y: 0.4, scale: 1.45)
      // First scroll down: moves downward, drifts slightly towards center, shrinks to 1.15
      // Middle sections: y: -2.8, scale: 0.85
      // Final sections: compact glowing AI core near lower right (y: -4.8, x: 4.0, scale: 0.55)
      const p = journey.scrollProgress;
      const targetX = 5.2 - p * 1.6;
      const targetY = 0.4 - p * 5.4;
      const targetZ = -p * 2.0;
      targetPos.set(targetX, targetY, targetZ);
      targetScale = 1.45 - p * 0.88; // 1.45 down to 0.57
    } else if (journey.route.startsWith("/reviews")) {
      // Code Reviews: docked gracefully at top right workspace
      targetPos.set(5.8, 2.5, -2.5);
      targetScale = 0.65;
    } else if (journey.route.startsWith("/repositories")) {
      // Repositories: anchored as connected intelligence hub
      targetPos.set(-5.6, 1.8, -3.0);
      targetScale = 0.75;
    } else if (journey.route.startsWith("/intelligence")) {
      // Intelligence: central floating neural node
      targetPos.set(4.5, 0.0, -1.5);
      targetScale = 1.1;
    } else if (journey.route.startsWith("/architecture")) {
      // Architecture: background module topology anchor
      targetPos.set(6.2, -1.5, -4.0);
      targetScale = 0.8;
    } else if (journey.route.startsWith("/security")) {
      // Security: protective orbital shield position
      targetPos.set(-5.2, -1.0, -2.5);
      targetScale = 0.7;
    } else {
      // Other pages (quality, memory, reports, settings): subtle ambient companion
      targetPos.set(6.0, 2.0, -3.5);
      targetScale = 0.6;
    }

    // 4. Smooth interpolation (lerp) toward target transform (guarantees fluid continuity)
    currentPos.current.lerp(targetPos, 0.065);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.065);

    if (groupRef.current) {
      // Apply position + floating motion
      const floatY = Math.sin(t * 1.2) * 0.12;
      groupRef.current.position.set(
        currentPos.current.x,
        currentPos.current.y + floatY,
        currentPos.current.z
      );

      const dynamicScale = currentScale.current * intro;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);

      // Apply continuous multi-axis rotation
      groupRef.current.rotation.y = rotY.current;
      groupRef.current.rotation.x = rotX.current;
      groupRef.current.rotation.z = rotZ.current;
    }

    // 5. Internal Component Rotations
    if (outerSphere.current) {
      outerSphere.current.rotation.y += delta * 0.3;
      outerSphere.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }

    if (innerSphere.current) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.12;
      innerSphere.current.scale.set(pulse, pulse, pulse);
    }

    if (coreGlow.current) {
      const pulse = 1 + Math.sin(t * 5.0) * 0.18;
      coreGlow.current.scale.set(pulse, pulse, pulse);
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
      orbitingParticlesRef.current.rotation.y = t * 0.28;
      orbitingParticlesRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }

    // Interactive button scanning effect
    if (scanRingRef.current) {
      if (journey.triggerScan) {
        scanRingRef.current.visible = true;
        scanRingRef.current.scale.addScalar(delta * 4.0);
        if (scanRingRef.current.scale.x > 3.5) {
          scanRingRef.current.scale.set(1, 1, 1);
        }
      } else {
        scanRingRef.current.visible = false;
        scanRingRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic core lighting */}
      <pointLight color={cyan} intensity={2.8} distance={14} decay={2} />
      <pointLight color={violet} intensity={2.2} distance={12} decay={2} />

      {/* Button click scanning pulse wave */}
      <mesh ref={scanRingRef} visible={false}>
        <ringGeometry args={[1.5, 1.6, 32]} />
        <meshBasicMaterial
          color={scanCyan}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Innermost Core */}
      <mesh ref={coreGlow}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.95} />
      </mesh>

      {/* Central Pulsing Energy Sphere */}
      <mesh ref={innerSphere}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color={blue} transparent opacity={0.8} />
      </mesh>

      {/* Wireframe Outer Lattice */}
      <mesh ref={outerSphere}>
        <icosahedronGeometry args={[1.85, 2]} />
        <meshBasicMaterial
          color={violet}
          wireframe
          transparent
          opacity={theme === "light" ? 0.35 : 0.65}
        />
      </mesh>

      {/* Hexagonal Concentric Wireframe */}
      <mesh>
        <dodecahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial
          color={cyan}
          wireframe
          transparent
          opacity={theme === "light" ? 0.2 : 0.35}
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
          <bufferAttribute attach="attributes-position" args={[orbPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[orbColors, 3]} />
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

