"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import { GOLD, type Palette } from "../palette";

/**
 * A five-axis arm running a slow pick-and-place cycle.
 *
 * The cycle is driven straight off the clock rather than from a keyframe
 * track: three sine waves at 1x, 1x and 2x of a 9 second period, phase-shifted
 * so the shoulder leads, the elbow follows and the gripper closes at the
 * bottom of the reach. It never needs to be reset, it never drifts, and it
 * costs three trig calls a frame.
 *
 * `animate` is false under prefers-reduced-motion, which parks the arm at a
 * readable pose instead of stopping it mid-swing.
 */
const RobotArm = ({
  palette,
  position,
  animate,
}: {
  palette: Palette;
  position: [number, number, number];
  animate: boolean;
}) => {
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const wrist = useRef<Group>(null);
  const jawL = useRef<Group>(null);
  const jawR = useRef<Group>(null);
  const base = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = animate ? (clock.getElapsedTime() * Math.PI * 2) / 9 : Math.PI / 2;
    if (base.current) base.current.rotation.y = Math.sin(t) * 0.85;
    if (shoulder.current) shoulder.current.rotation.z = -0.5 + Math.sin(t + 0.6) * 0.36;
    if (elbow.current) elbow.current.rotation.z = 1.0 + Math.sin(t + 1.5) * 0.5;
    if (wrist.current) wrist.current.rotation.z = -0.5 - Math.sin(t + 1.5) * 0.3;
    const grip = 0.032 + Math.max(0, Math.sin(t * 2 + 0.4)) * 0.03;
    if (jawL.current) jawL.current.position.x = -grip;
    if (jawR.current) jawR.current.position.x = grip;
  });

  const metal = (
    <meshStandardMaterial
      color={palette.metal}
      roughness={palette.metalRoughness}
      metalness={0.92}
      envMapIntensity={palette.envIntensity}
    />
  );

  return (
    <group position={position}>
      {/* Bolted plate */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 20]} />
        <meshStandardMaterial color="#22252b" roughness={0.5} metalness={0.7} />
      </mesh>

      <group ref={base} position={[0, 0.05, 0]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.18, 18]} />
          {metal}
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <torusGeometry args={[0.095, 0.012, 8, 20]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={palette.goldIntensity * 0.7}
            toneMapped={false}
          />
        </mesh>

        <group ref={shoulder} position={[0, 0.2, 0]}>
          {/* Upper arm: pivot at the origin, mass offset along +Y. */}
          <mesh position={[0, 0.21, 0]} castShadow>
            <boxGeometry args={[0.09, 0.42, 0.11]} />
            {metal}
          </mesh>
          <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.13, 14]} />
            <meshStandardMaterial color="#2c3037" roughness={0.4} metalness={0.85} />
          </mesh>

          <group ref={elbow} position={[0, 0.42, 0]}>
            <mesh rotation-x={Math.PI / 2} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.11, 14]} />
              <meshStandardMaterial color="#2c3037" roughness={0.4} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.17, 0]} castShadow>
              <boxGeometry args={[0.07, 0.34, 0.085]} />
              {metal}
            </mesh>

            <group ref={wrist} position={[0, 0.34, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.09, 12]} />
                <meshStandardMaterial color="#2c3037" roughness={0.4} metalness={0.85} />
              </mesh>
              <mesh position={[0, 0.07, 0]} castShadow>
                <boxGeometry args={[0.1, 0.06, 0.07]} />
                {metal}
              </mesh>
              <group ref={jawL} position={[-0.04, 0.13, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.018, 0.09, 0.05]} />
                  <meshStandardMaterial color="#3a3f47" roughness={0.35} metalness={0.9} />
                </mesh>
              </group>
              <group ref={jawR} position={[0.04, 0.13, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.018, 0.09, 0.05]} />
                  <meshStandardMaterial color="#3a3f47" roughness={0.35} metalness={0.9} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export default RobotArm;
