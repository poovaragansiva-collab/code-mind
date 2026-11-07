"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";
import { useAIJourney } from "@/lib/ai-journey-context";

export function AIEnergyArchitecture() {
  const groupRef = useRef<THREE.Group>(null);
  const portalRingOuter = useRef<THREE.Mesh>(null);
  const portalRingMid = useRef<THREE.Mesh>(null);
  const portalRingInner = useRef<THREE.Mesh>(null);
  const coreProcessor = useRef<THREE.Mesh>(null);
  const crystalSpire = useRef<THREE.Mesh>(null);
  const circuitLattice = useRef<THREE.LineSegments>(null);
  const scanLightBeam = useRef<THREE.Mesh>(null);

  const { theme } = useTheme();
  const journey = useAIJourney();
  const { viewport } = useThree();

  const isMobile = viewport.width < 7.5;
  const isTablet = viewport.width >= 7.5 && viewport.width < 12.0;

  // Persistent continuous rotation accumulators that never reset across navigation
  const rotY = useRef(0);
  const currentPos = useRef(new THREE.Vector3(5.2, 0.4, 0));
  const currentScale = useRef(1.3);

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const brightPink = useMemo(() => new THREE.Color("#F43F5E"), []);

  // 1. Futuristic Architectural Circuit Lines & Gateway Nodes
  const [circuitPositions, circuitColors] = useMemo(() => {
    const coords: number[] = [];
    const cols: number[] = [];
    const ringRadius = 2.8;
    const segments = 32;

    // Concentric geometric spokes and architectural frames
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const nextAngle = ((i + 1) / segments) * Math.PI * 2;

      // Outer portal ring segments
      coords.push(
        Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0,
        Math.cos(nextAngle) * ringRadius, Math.sin(nextAngle) * ringRadius, 0
      );
      cols.push(cyan.r, cyan.g, cyan.b, violet.r, violet.g, violet.b);

      // Inner spoke connection to processor core
      if (i % 2 === 0) {
        coords.push(
          Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0,
          Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, -0.6
        );
        cols.push(violet.r, violet.g, violet.b, cyan.r, cyan.g, cyan.b);
      }

      // Architectural pillar foundation
      if (i % 4 === 0) {
        coords.push(
          Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0,
          Math.cos(angle) * (ringRadius + 0.9), Math.sin(angle) * (ringRadius + 0.9), -1.2
        );
        cols.push(cyan.r, cyan.g, cyan.b, blue.r, blue.g, blue.b);
      }
    }

    return [new Float32Array(coords), new Float32Array(cols)];
  }, [cyan, violet, blue]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Continuous slow rotation of portal rings
    rotY.current += delta * 0.2;

    if (portalRingOuter.current) {
      portalRingOuter.current.rotation.z = t * 0.15;
    }
    if (portalRingMid.current) {
      portalRingMid.current.rotation.z = -t * 0.22;
    }
    if (portalRingInner.current) {
      portalRingInner.current.rotation.z = t * 0.35;
    }

    if (coreProcessor.current) {
      coreProcessor.current.rotation.x = t * 0.4;
      coreProcessor.current.rotation.y = t * 0.5;
      const pulse = 1 + Math.sin(t * 3.5) * 0.08;
      coreProcessor.current.scale.set(pulse, pulse, pulse);
    }

    if (crystalSpire.current) {
      crystalSpire.current.rotation.y = -t * 0.3;
      crystalSpire.current.position.y = Math.sin(t * 1.2) * 0.1;
    }

    if (circuitLattice.current) {
      circuitLattice.current.rotation.z = t * 0.08;
    }

    // Scanning light cone beam sweep
    if (scanLightBeam.current) {
      scanLightBeam.current.rotation.z = Math.sin(t * 0.8) * 0.4;
    }

    // 2. Position and Scale Journey driven by Scroll & Routes
    const targetPos = new THREE.Vector3();
    let targetScale = 1.3;

    if (journey.route === "/") {
      const p = journey.scrollProgress;
      if (isMobile) {
        targetPos.set(0, 1.2 - p * 3.5, -2.5);
        targetScale = 0.8 - p * 0.35;
      } else if (isTablet) {
        targetPos.set(3.8 - p * 1.5, 0.2 - p * 4.5, -1.5);
        targetScale = 1.05 - p * 0.5;
      } else {
        // Desktop: High-impact right-side AI architectural gateway
        const targetX = 5.4 - p * 1.5;
        const targetY = 0.3 - p * 5.2;
        const targetZ = -p * 2.2;
        targetPos.set(targetX, targetY, targetZ);
        targetScale = 1.35 - p * 0.75;
      }
    } else if (journey.route.startsWith("/reviews")) {
      targetPos.set(isMobile ? 0 : 5.8, isMobile ? 2.8 : 2.5, isMobile ? -3.5 : -2.5);
      targetScale = isMobile ? 0.45 : 0.65;
    } else if (journey.route.startsWith("/repositories")) {
      targetPos.set(isMobile ? 0 : -5.4, isMobile ? 2.8 : 1.8, isMobile ? -3.5 : -3.0);
      targetScale = isMobile ? 0.5 : 0.75;
    } else if (journey.route.startsWith("/intelligence")) {
      targetPos.set(isMobile ? 0 : 4.5, 0.0, isMobile ? -2.5 : -1.5);
      targetScale = isMobile ? 0.7 : 1.1;
    } else if (journey.route.startsWith("/architecture")) {
      targetPos.set(isMobile ? 0 : 6.0, isMobile ? -2.0 : -1.5, -4.0);
      targetScale = isMobile ? 0.55 : 0.8;
    } else if (journey.route.startsWith("/security")) {
      targetPos.set(isMobile ? 0 : -5.0, isMobile ? -1.5 : -1.0, -2.5);
      targetScale = isMobile ? 0.5 : 0.7;
    } else {
      targetPos.set(isMobile ? 0 : 5.8, 2.0, -3.5);
      targetScale = isMobile ? 0.45 : 0.6;
    }

    // Smooth lerp without resets
    currentPos.current.lerp(targetPos, 0.07);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.07);

    if (groupRef.current) {
      const floatY = Math.sin(t * 1.1) * 0.12;
      groupRef.current.position.set(
        currentPos.current.x,
        currentPos.current.y + floatY,
        currentPos.current.z
      );
      groupRef.current.scale.set(currentScale.current, currentScale.current, currentScale.current);
      groupRef.current.rotation.y = rotY.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* High-intensity architectural gateway lights */}
      <pointLight color={cyan} intensity={3.5} distance={18} decay={2} />
      <pointLight color={violet} intensity={3.0} distance={16} decay={2} />

      {/* 1. Large Circular Gateway Architectural Outer Frame */}
      <mesh ref={portalRingOuter}>
        <torusGeometry args={[2.9, 0.05, 16, 80]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={theme === "light" ? 0.45 : 0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Middle Gateway Ring with Geodesic Hexagonal Facets */}
      <mesh ref={portalRingMid}>
        <torusGeometry args={[2.4, 0.035, 16, 60]} />
        <meshBasicMaterial
          color={violet}
          transparent
          opacity={theme === "light" ? 0.4 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Inner Gateway Accelerator Ring */}
      <mesh ref={portalRingInner}>
        <torusGeometry args={[1.8, 0.025, 16, 60]} />
        <meshBasicMaterial
          color={blue}
          transparent
          opacity={theme === "light" ? 0.35 : 0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Central Processor Core (Floating Octahedron Crystal Lattice) */}
      <mesh ref={coreProcessor}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial
          color={cyan}
          wireframe
          transparent
          opacity={theme === "light" ? 0.5 : 0.85}
        />
      </mesh>

      {/* 5. Glowing Processor Nucleus */}
      <mesh>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshBasicMaterial color={brightPink} transparent opacity={0.8} />
      </mesh>

      {/* 6. Vertical Architectural Crystal Spire Pillar */}
      <mesh ref={crystalSpire} position={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.1, 0.3, 4.8, 6]} />
        <meshBasicMaterial
          color={violet}
          wireframe
          transparent
          opacity={theme === "light" ? 0.25 : 0.45}
        />
      </mesh>

      {/* 7. Connected Circuit Lattice Network */}
      <lineSegments ref={circuitLattice}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[circuitPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[circuitColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={theme === "light" ? 0.35 : 0.7}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 8. Scanning Light Cone Fan */}
      <mesh ref={scanLightBeam} rotation={[0, 0, Math.PI / 4]} position={[0, 0, -0.2]}>
        <coneGeometry args={[1.8, 3.2, 16, 1, true]} />
        <meshBasicMaterial
          color={cyan}
          transparent
          opacity={theme === "light" ? 0.05 : 0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

