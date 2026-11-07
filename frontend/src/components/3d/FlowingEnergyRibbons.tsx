"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/lib/theme-context";

export function FlowingEnergyRibbons() {
  const { theme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const cyan = useMemo(() => new THREE.Color("#20D9FF"), []);
  const violet = useMemo(() => new THREE.Color(theme === "colorful" ? "#EC4899" : "#914BFF"), [theme]);
  const blue = useMemo(() => new THREE.Color(theme === "light" ? "#2878F0" : "#168BFF"), [theme]);
  const pink = useMemo(() => new THREE.Color("#F43F5E"), []);

  // 1. Generate multiple 3D CatmullRom splines that swoop from top-left/top-center around the right architecture
  const ribbonPaths = useMemo(() => {
    return [
      // Ribbon 1: Upper sweeping arc towards gateway
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, 7, -5),
        new THREE.Vector3(-2, 4.5, -3),
        new THREE.Vector3(3.5, 2.5, -1),
        new THREE.Vector3(5.5, 0.5, 0),
        new THREE.Vector3(6.5, -2.5, -2),
        new THREE.Vector3(4.5, -5.5, -4),
      ]),
      // Ribbon 2: Direct foreground cyber stream
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 6, -3),
        new THREE.Vector3(0, 3.2, -1.5),
        new THREE.Vector3(4.8, 1.2, 0.5),
        new THREE.Vector3(6.8, -0.8, -0.5),
        new THREE.Vector3(5.2, -4.0, -3),
      ]),
      // Ribbon 3: Deep spatial spiral weaving through the gateway
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, -6, -6),
        new THREE.Vector3(0, -3.5, -4),
        new THREE.Vector3(4.5, -1.0, -2.5),
        new THREE.Vector3(6.2, 2.0, -1.5),
        new THREE.Vector3(4.0, 5.0, -4),
      ]),
      // Ribbon 4: Ambient outer perimeter ribbon
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, 2, -6),
        new THREE.Vector3(-4, 0, -4),
        new THREE.Vector3(2, -1.5, -2),
        new THREE.Vector3(5.8, -0.2, 0.2),
        new THREE.Vector3(7.5, 2.5, -3),
      ]),
    ];
  }, []);

  // Pre-generate tube geometries from curves
  const ribbonGeometries = useMemo(() => {
    return ribbonPaths.map((curve) => new THREE.TubeGeometry(curve, 100, 0.05, 8, false));
  }, [ribbonPaths]);

  // 2. Data particles travelling continuously along the curves
  const particleCount = 120;
  const [particleProgress, particleCurveIndices] = useMemo(() => {
    const prog = new Float32Array(particleCount);
    const curveIdx = new Uint8Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      prog[i] = Math.random();
      curveIdx[i] = i % ribbonPaths.length;
    }
    return [prog, curveIdx];
  }, [ribbonPaths.length]);

  const [particlePositions, particleColors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const c = i % 3 === 0 ? cyan : i % 3 === 1 ? violet : pink;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [cyan, violet, pink]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15;
    }

    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        // Increment progress along assigned curve
        const speed = 0.12 + (i % 4) * 0.04;
        particleProgress[i] = (particleProgress[i] + delta * speed) % 1.0;

        const curve = ribbonPaths[particleCurveIndices[i]];
        const pt = curve.getPointAt(particleProgress[i]);

        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }

      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Curved Light Ribbon Meshes */}
      {ribbonGeometries.map((geom, idx) => {
        const matColor = idx % 2 === 0 ? cyan : idx === 1 ? violet : blue;
        return (
          <mesh key={idx} geometry={geom}>
            <meshBasicMaterial
              color={matColor}
              transparent
              opacity={theme === "light" ? 0.35 : 0.65}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}

      {/* Glowing Ribbon Outline Beams */}
      {ribbonGeometries.map((geom, idx) => (
        <lineSegments key={`wire-${idx}`}>
          <wireframeGeometry args={[geom]} />
          <lineBasicMaterial
            color={idx % 2 === 0 ? cyan : violet}
            transparent
            opacity={theme === "light" ? 0.15 : 0.3}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      ))}

      {/* Energy Pulses travelling along ribbons */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
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

