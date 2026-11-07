"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  const neuralLinesRef = useRef<THREE.LineSegments>(null);
  const neuralNodesRef = useRef<THREE.Points>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);

  const { theme } = useTheme();
  const journey = useAIJourney();
  const { viewport } = useThree();

  // Responsive device check based on viewport width (Three.js units in perspective)
  const isMobile = viewport.width < 7.5;
  const isTablet = viewport.width >= 7.5 && viewport.width < 12.0;

  // Persistent continuous rotation accumulators that NEVER reset
  const rotY = useRef(0);
  const rotX = useRef(0);
  const rotZ = useRef(0);

  // Smooth lerp state for position and scale
  const currentPos = useRef(new THREE.Vector3(5.0, 0.4, 0));
  const currentScale = useRef(1.4);
  const introProgress = useRef(0);

  // Theme-aware dynamic palette
  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const scanCyan = useMemo(() => new THREE.Color("#38BDF8"), []);
  const pink = useMemo(() => new THREE.Color("#F43F5E"), []);

  // 1. Interconnected Neural Network Nodes & Synaptic Lines on the Sphere Surface
  const [nodePositions, nodeColors, linePositions, lineColors] = useMemo(() => {
    const nodeCount = 54;
    const nPos = new Float32Array(nodeCount * 3);
    const nCol = new Float32Array(nodeCount * 3);
    const sphereRadius = 1.6;

    // Distribute nodes evenly on spherical Fibonacci lattice
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < nodeCount; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);

      nPos[i * 3] = sphereRadius * Math.sin(phi) * Math.cos(theta);
      nPos[i * 3 + 1] = sphereRadius * Math.sin(phi) * Math.sin(theta);
      nPos[i * 3 + 2] = sphereRadius * Math.cos(phi);

      const color = i % 3 === 0 ? cyan : i % 3 === 1 ? violet : pink;
      nCol[i * 3] = color.r;
      nCol[i * 3 + 1] = color.g;
      nCol[i * 3 + 2] = color.b;
    }

    // Connect nearby nodes within distance threshold
    const lineCoords: number[] = [];
    const lineColArray: number[] = [];
    const maxDist = 1.35;

    for (let i = 0; i < nodeCount; i++) {
      const x1 = nPos[i * 3];
      const y1 = nPos[i * 3 + 1];
      const z1 = nPos[i * 3 + 2];

      for (let j = i + 1; j < nodeCount; j++) {
        const x2 = nPos[j * 3];
        const y2 = nPos[j * 3 + 1];
        const z2 = nPos[j * 3 + 2];

        const dist = Math.hypot(x2 - x1, y2 - y1, z2 - z1);
        if (dist < maxDist) {
          lineCoords.push(x1, y1, z1, x2, y2, z2);
          const c1 = i % 2 === 0 ? cyan : violet;
          const c2 = j % 2 === 0 ? cyan : violet;
          lineColArray.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
        }
      }
    }

    return [
      nPos,
      nCol,
      new Float32Array(lineCoords),
      new Float32Array(lineColArray),
    ];
  }, [cyan, violet, pink]);

  // 2. Orbiting Micro-Particles surrounding the neural core
  const [orbPositions, orbColors] = useMemo(() => {
    const pCount = 120;
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const radius = 2.1 + Math.random() * 2.0;
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

    // 1. Initial Intro Power-On: Smooth scale & subtle slide-in on initial load
    if (introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + delta * 1.2);
    }
    const intro = introProgress.current;

    // 2. Continuous rotation accumulator (ALWAYS increments smoothly without ever resetting)
    rotY.current += delta * (0.35 + (journey.route === "/" ? journey.scrollProgress * 0.4 : 0.12));
    rotX.current = Math.sin(t * 0.4) * 0.18;
    rotZ.current = Math.cos(t * 0.3) * 0.12;

    // 3. Compute Target Position & Scale based on Screen Size, Route, and Scroll Progress
    const targetPos = new THREE.Vector3();
    let targetScale = 1.0;

    if (journey.route === "/") {
      const p = journey.scrollProgress;
      if (isMobile) {
        // Mobile view: Keep orb centered and unobtrusive behind headers
        targetPos.set(0, 1.2 - p * 3.5, -2.5);
        targetScale = 0.85 - p * 0.4;
      } else if (isTablet) {
        // Tablet view: Balanced right offset
        targetPos.set(3.6 - p * 1.5, 0.2 - p * 4.8, -1.5);
        targetScale = 1.15 - p * 0.6;
      } else {
        // Desktop view: Full-size 3D neural sphere journey
        const targetX = 5.2 - p * 1.6;
        const targetY = 0.4 - p * 5.4;
        const targetZ = -p * 2.0;
        targetPos.set(targetX, targetY, targetZ);
        targetScale = 1.45 - p * 0.88; // 1.45 down to 0.57
      }
    } else if (journey.route.startsWith("/reviews")) {
      // Code Reviews workspace: Docked gracefully at top-right
      targetPos.set(isMobile ? 0 : 5.8, isMobile ? 2.8 : 2.5, isMobile ? -3.5 : -2.5);
      targetScale = isMobile ? 0.45 : 0.65;
    } else if (journey.route.startsWith("/repositories")) {
      // Repositories hub: Anchored left-top
      targetPos.set(isMobile ? 0 : -5.4, isMobile ? 2.8 : 1.8, isMobile ? -3.5 : -3.0);
      targetScale = isMobile ? 0.5 : 0.75;
    } else if (journey.route.startsWith("/intelligence")) {
      // Intelligence: Prominent central floating neural core
      targetPos.set(isMobile ? 0 : 4.5, 0.0, isMobile ? -2.5 : -1.5);
      targetScale = isMobile ? 0.7 : 1.1;
    } else if (journey.route.startsWith("/architecture")) {
      // Architecture: Topology backdrop anchor
      targetPos.set(isMobile ? 0 : 6.0, isMobile ? -2.0 : -1.5, -4.0);
      targetScale = isMobile ? 0.55 : 0.8;
    } else if (journey.route.startsWith("/security")) {
      // Security: Protective orbital shield position
      targetPos.set(isMobile ? 0 : -5.0, isMobile ? -1.5 : -1.0, -2.5);
      targetScale = isMobile ? 0.5 : 0.7;
    } else {
      // Quality, memory, reports, settings: subtle ambient companion
      targetPos.set(isMobile ? 0 : 5.8, 2.0, -3.5);
      targetScale = isMobile ? 0.45 : 0.6;
    }

    // 4. Smooth interpolation (lerp) toward target transform (guarantees silky continuity)
    currentPos.current.lerp(targetPos, 0.07);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.07);

    if (groupRef.current) {
      // Position with natural atmospheric floating
      const floatY = Math.sin(t * 1.2) * 0.12;
      groupRef.current.position.set(
        currentPos.current.x,
        currentPos.current.y + floatY,
        currentPos.current.z
      );

      const dynamicScale = currentScale.current * intro;
      groupRef.current.scale.set(dynamicScale, dynamicScale, dynamicScale);

      // Continuous multi-axis rotation
      groupRef.current.rotation.y = rotY.current;
      groupRef.current.rotation.x = rotX.current;
      groupRef.current.rotation.z = rotZ.current;
    }

    // 5. Internal Component Micro-Rotations & Energy Pulses
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

    if (neuralNodesRef.current) {
      neuralNodesRef.current.rotation.y = t * 0.18;
    }

    if (neuralLinesRef.current) {
      neuralLinesRef.current.rotation.y = t * 0.18;
    }

    // Interactive button scanning pulse wave
    if (scanRingRef.current) {
      if (journey.triggerScan) {
        scanRingRef.current.visible = true;
        scanRingRef.current.scale.addScalar(delta * 4.0);
        if (scanRingRef.current.scale.x > 3.8) {
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
      <pointLight color={cyan} intensity={3.0} distance={15} decay={2} />
      <pointLight color={violet} intensity={2.4} distance={13} decay={2} />

      {/* Button click scanning pulse wave */}
      <mesh ref={scanRingRef} visible={false}>
        <ringGeometry args={[1.5, 1.65, 36]} />
        <meshBasicMaterial
          color={scanCyan}
          transparent
          opacity={0.85}
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

      {/* Concentric Geodesic Wireframe */}
      <mesh>
        <dodecahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial
          color={cyan}
          wireframe
          transparent
          opacity={theme === "light" ? 0.2 : 0.35}
        />
      </mesh>

      {/* Interconnected Neural Synaptic Nodes on Sphere Surface */}
      <points ref={neuralNodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Interconnecting Synaptic Neural Connection Lines */}
      <lineSegments ref={neuralLinesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={theme === "light" ? 0.4 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

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
