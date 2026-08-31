"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, type ReactNode } from "react";
import type { Group } from "three";

const FloatRig = ({
  children,
  speed = 2,
  floatIntensity = 1,
  rotationIntensity = 1,
}: {
  children: ReactNode;
  speed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
}) => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = Math.sin(t * speed) * 0.2 * floatIntensity;
    ref.current.rotation.x = Math.sin(t * speed) * 0.1 * rotationIntensity;
    ref.current.rotation.y = t * 0.1 * rotationIntensity;
  });
  return <group ref={ref}>{children}</group>;
};

const Particles = () => {
  const count = 1500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 16;
      arr[i + 1] = (Math.random() - 0.5) * 8;
      arr[i + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F7B801"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.7}
      />
    </points>
  );
};

const FloatingCluster = () => {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() / 3) * 0.2;
      ref.current.rotation.y = clock.getElapsedTime() / 4;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[-1.5, 0, 0]}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#FFD700"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[1.6, 0.5, -0.4]}>
        <torusKnotGeometry args={[0.7, 0.22, 150, 32]} />
        <meshStandardMaterial
          color="#F7B801"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -0.8, 1]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#CC9900" transparent opacity={0.65} />
      </mesh>
    </group>
  );
};

const Scene3DAdvanced = () => (
  <div className="absolute inset-0">
    <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
      <color attach="background" args={["#020202"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 2]} intensity={1.2} />
      <Suspense fallback={null}>
        <Particles />
        <FloatRig floatIntensity={2} speed={2.2} rotationIntensity={0.6}>
          <FloatingCluster />
        </FloatRig>
      </Suspense>
    </Canvas>
  </div>
);

export default Scene3DAdvanced;
