"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

interface CodeSymbolItem {
  text: string;
  pos: [number, number, number];
  rotSpeed: [number, number, number];
  scale: number;
}

interface CodePanelItem {
  title: string;
  snippet: string[];
  pos: [number, number, number];
  rot: [number, number, number];
}

export function CodeUniverseElements() {
  const { theme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);
  const streamParticlesRef = useRef<THREE.Points>(null);

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const white = useMemo(() => new THREE.Color("#FFFFFF"), []);

  // 1. Floating Programming Symbols in 3D Space
  const symbols: CodeSymbolItem[] = useMemo(() => [
    { text: "</>", pos: [-4.2, 2.8, -1.5], rotSpeed: [0.2, 0.4, 0.1], scale: 0.5 },
    { text: "{ }", pos: [4.8, 3.2, -2.0], rotSpeed: [0.1, -0.3, 0.2], scale: 0.55 },
    { text: "( )", pos: [-5.0, -1.8, -2.5], rotSpeed: [-0.2, 0.2, 0.1], scale: 0.45 },
    { text: "=>", pos: [3.8, -2.6, -1.8], rotSpeed: [0.3, 0.2, -0.1], scale: 0.5 },
    { text: "git checkout -b", pos: [-6.5, 0.8, -4.0], rotSpeed: [0.05, 0.15, 0.0], scale: 0.35 },
    { text: "async function*", pos: [6.2, 1.2, -3.5], rotSpeed: [0.0, -0.2, 0.1], scale: 0.35 },
    { text: ";", pos: [-2.5, 4.0, -2.2], rotSpeed: [0.4, 0.1, 0.2], scale: 0.6 },
    { text: "#!/usr/bin/env", pos: [-3.8, -3.8, -3.0], rotSpeed: [0.1, 0.2, 0.0], scale: 0.3 },
    { text: "SELECT * FROM memory", pos: [5.0, -4.2, -3.2], rotSpeed: [0.15, -0.1, 0.05], scale: 0.32 },
  ], []);

  // 2. Holographic Code Panels surrounding space
  const panels: CodePanelItem[] = useMemo(() => [
    {
      title: "AST::ReviewAgent",
      snippet: ["const tree = parse(source);", "if (!tree.hasErrors()) {", "  validateContracts(tree);", "}"],
      pos: [-6.2, 2.2, -3.5],
      rot: [0.1, 0.35, -0.05],
    },
    {
      title: "Hindsight::Memory",
      snippet: ["export async function sync() {", "  const vector = await embed();", "  return memory.upsert(vector);", "}"],
      pos: [6.8, -1.8, -4.0],
      rot: [-0.1, -0.4, 0.05],
    },
  ], []);

  // 3. Streams of Programming Particles travelling towards AI Core
  const streamCount = 90;
  const [streamPositions, streamColors, streamVelocities] = useMemo(() => {
    const pos = new Float32Array(streamCount * 3);
    const col = new Float32Array(streamCount * 3);
    const vel = new Float32Array(streamCount * 3);

    for (let i = 0; i < streamCount; i++) {
      // Spawn at outer perimeter
      const radius = 6.0 + Math.random() * 4.0;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 6.0;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius - 2.0;

      // Inward velocity towards AI Core origin
      vel[i * 3] = -pos[i * 3] * (0.008 + Math.random() * 0.008);
      vel[i * 3 + 1] = -pos[i * 3 + 1] * (0.008 + Math.random() * 0.008);
      vel[i * 3 + 2] = -pos[i * 3 + 2] * (0.008 + Math.random() * 0.008);

      const color = i % 3 === 0 ? cyan : i % 3 === 1 ? violet : white;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col, vel];
  }, [cyan, violet, white]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Floating orbital tilt of code universe
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04;
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.15;
    }

    // Animate streaming particles towards AI Core
    if (streamParticlesRef.current) {
      const positions = streamParticlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < streamCount; i++) {
        positions[i * 3] += streamVelocities[i * 3];
        positions[i * 3 + 1] += streamVelocities[i * 3 + 1];
        positions[i * 3 + 2] += streamVelocities[i * 3 + 2];

        // When reaching near core, reset back to outer bounds
        const distToCenter = Math.hypot(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        if (distToCenter < 1.8) {
          const radius = 7.0 + Math.random() * 3.5;
          const angle = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 6.0;
          positions[i * 3 + 2] = Math.sin(angle) * radius - 2.0;
        }
      }

      streamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Floating Programming Symbols */}
      {symbols.map((item, idx) => (
        <group key={idx} position={item.pos}>
          <Text
            fontSize={item.scale}
            color={theme === "light" ? "#1E293B" : "#E2E8F0"}
            anchorX="center"
            anchorY="middle"
            font={undefined}
            fillOpacity={theme === "light" ? 0.65 : 0.85}
          >
            {item.text}
          </Text>
        </group>
      ))}

      {/* 2. Holographic Code Panels */}
      {panels.map((p, idx) => (
        <group key={idx} position={p.pos} rotation={p.rot}>
          {/* Translucent Panel Backplane */}
          <mesh>
            <planeGeometry args={[3.2, 2.0]} />
            <meshBasicMaterial
              color={blue}
              transparent
              opacity={theme === "light" ? 0.08 : 0.15}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Panel Border Wireframe */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(3.2, 2.0)]} />
            <lineBasicMaterial color={cyan} transparent opacity={0.4} />
          </lineSegments>

          {/* Header Title */}
          <Text
            position={[-1.4, 0.75, 0.02]}
            fontSize={0.16}
            color={cyan}
            anchorX="left"
            anchorY="middle"
          >
            {p.title}
          </Text>

          {/* Code Snippet Lines */}
          {p.snippet.map((line, lIdx) => (
            <Text
              key={lIdx}
              position={[-1.4, 0.45 - lIdx * 0.28, 0.02]}
              fontSize={0.12}
              color={theme === "light" ? "#334155" : "#94A3B8"}
              anchorX="left"
              anchorY="middle"
            >
              {line}
            </Text>
          ))}
        </group>
      ))}

      {/* 3. Inward Streaming Data Particles towards Core */}
      <points ref={streamParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[streamPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[streamColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
