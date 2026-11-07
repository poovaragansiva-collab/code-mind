"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

interface FlowingEnergyStreamsProps {
  streamCount?: number;
  speed?: number;
}

export function FlowingEnergyStreams({
  streamCount = 5,
  speed = 0.5,
}: FlowingEnergyStreamsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();

  // Pre-calculate line position points
  const [positions, colors] = useMemo(() => {
    const blue = new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF");
    const cyan = new THREE.Color("#20D9FF");
    const violet = new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF");
    const palette = [blue, cyan, violet];

    const allPositions: Float32Array[] = [];
    const allColors: THREE.Color[] = [];

    for (let i = 0; i < streamCount; i++) {
      const points: THREE.Vector3[] = [];
      const angleOffset = (i / streamCount) * Math.PI * 2;
      const radius = 6 + (i % 3) * 2;

      for (let j = 0; j < 6; j++) {
        const u = j / 5;
        const theta = angleOffset + u * Math.PI * 1.5;
        const x = Math.cos(theta) * radius + Math.sin(u * Math.PI * 4) * 1.5;
        const y = (u - 0.5) * 18 + Math.cos(theta * 2) * 1.5;
        const z = Math.sin(theta) * radius + Math.cos(u * Math.PI * 3) * 1.2;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const curvePts = curve.getPoints(80);
      const posArray = new Float32Array(curvePts.length * 3);

      curvePts.forEach((pt, pIdx) => {
        posArray[pIdx * 3] = pt.x;
        posArray[pIdx * 3 + 1] = pt.y;
        posArray[pIdx * 3 + 2] = pt.z;
      });

      allPositions.push(posArray);
      allColors.push(palette[i % palette.length]);
    }

    return [allPositions, allColors];
  }, [streamCount, theme]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y += delta * 0.05 * speed;
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, idx) => (
        <lineSegments key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[pos, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={colors[idx]}
            transparent
            opacity={theme === "light" ? 0.22 : 0.38}
            blending={theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </group>
  );
}
