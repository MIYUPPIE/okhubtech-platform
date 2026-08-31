"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import { GOLD, type Palette } from "../palette";

/**
 * The obstacle-avoidance rover, doing laps of the open floor.
 *
 * It follows an ellipse centred on the clear span between the training desks,
 * the bench and the front counter - radii chosen so the hull never intersects
 * furniture at any phase, which is why the path is hard-coded rather than
 * driven by collision. Heading comes from the analytic tangent, so the rover
 * always faces where it is going without any state to keep.
 */
const CENTRE = { x: 1.0, z: 0.8 };
const RADIUS = { x: 2.6, z: 1.8 };
const PERIOD = 26;

const Rover = ({ palette, animate }: { palette: Palette; animate: boolean }) => {
  const body = useRef<Group>(null);
  const wheels = useRef<Group[]>([]);
  const mast = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = animate ? (clock.getElapsedTime() * Math.PI * 2) / PERIOD : 0.9;
    const x = CENTRE.x + Math.cos(t) * RADIUS.x;
    const z = CENTRE.z + Math.sin(t) * RADIUS.z;
    // d/dt of the position, which is the tangent; atan2 of (dx, dz) with the
    // model's +Z as forward.
    const dx = -Math.sin(t) * RADIUS.x;
    const dz = Math.cos(t) * RADIUS.z;

    if (body.current) {
      body.current.position.set(x, 0, z);
      body.current.rotation.y = Math.atan2(dx, dz);
    }
    if (animate) {
      wheels.current.forEach((wheel) => {
        if (wheel) wheel.rotation.x = clock.getElapsedTime() * 3.2;
      });
      if (mast.current) mast.current.rotation.y = Math.sin(clock.getElapsedTime() * 1.4) * 0.9;
    }
  });

  return (
    <group ref={body}>
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.08, 0.42]} />
        <meshStandardMaterial
          color={palette.metal}
          roughness={palette.metalRoughness}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.165, -0.04]} castShadow>
        <boxGeometry args={[0.22, 0.04, 0.26]} />
        <meshStandardMaterial color="#1d5c3a" roughness={0.7} />
      </mesh>
      <group ref={mast} position={[0, 0.2, 0.14]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          <meshStandardMaterial color="#2c3037" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.11, 0.015]}>
          <boxGeometry args={[0.07, 0.035, 0.02]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={palette.goldIntensity}
            toneMapped={false}
          />
        </mesh>
      </group>
      {[
        [-0.17, 0.06, 0.14],
        [0.17, 0.06, 0.14],
        [-0.17, 0.06, -0.14],
        [0.17, 0.06, -0.14],
      ].map((wheel, i) => (
        <group
          key={i}
          ref={(node) => {
            if (node) wheels.current[i] = node;
          }}
          position={wheel as [number, number, number]}
          rotation-z={Math.PI / 2}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
            <meshStandardMaterial color="#15171b" roughness={0.9} />
          </mesh>
          {/* A cylinder spinning about its own axis shows no motion, so the
              wheels carry a hub bar. Without it the rover appears to slide. */}
          <mesh position={[0, 0.021, 0]} rotation-x={Math.PI / 2}>
            <boxGeometry args={[0.085, 0.014, 0.004]} />
            <meshStandardMaterial color="#5b626d" roughness={0.5} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default Rover;
