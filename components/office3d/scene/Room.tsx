"use client";

import { useMemo } from "react";
import { DoubleSide } from "three";

import { GOLD, type Palette } from "../palette";
import { floorGridTexture, skyTexture } from "../textures";

/**
 * The shell: floor, three walls, ceiling, the window band, and the open front
 * edge.
 *
 * There is deliberately no fourth wall. The establishing shot sits at z = 13.6,
 * outside the room looking in, and a front wall would put a slab of plaster
 * between the visitor and everything worth seeing. A glass balustrade along
 * z = 5.5 reads as a mezzanine edge instead, which explains the missing wall
 * rather than leaving a hole.
 *
 * Room space: x -9..9, z -5.5..5.5, floor y = 0, ceiling y = 3.4.
 */

export const ROOM = {
  width: 18,
  depth: 11,
  height: 3.4,
  halfW: 9,
  halfD: 5.5,
} as const;

type Props = { palette: Palette; night: boolean };

const Room = ({ palette, night }: Props) => {
  const grid = useMemo(() => floorGridTexture(night), [night]);
  const sky = useMemo(
    () => skyTexture(palette.skyTop, palette.skyBottom, night),
    [palette.skyTop, palette.skyBottom, night],
  );

  /** Ceiling cove strips, and the gold datum line that wraps the back wall. */
  const coves = [-3.4, -0.6, 2.2];

  return (
    <group>
      {/* Floor. Two layers: a solid slab, and a faint grid decal above it so
          the surface has scale without a 4k texture. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial
          color={palette.floor}
          roughness={palette.floorRoughness}
          metalness={0.08}
          envMapIntensity={palette.envIntensity}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshBasicMaterial map={grid} transparent opacity={0.7} depthWrite={false} />
      </mesh>

      {/* Landing beyond the open front edge. Without it the camera in the
          establishing shot hangs over flat clear colour, and the balustrade
          reads as the edge of the render rather than the edge of a floor. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, ROOM.halfD + 6]}>
        <planeGeometry args={[ROOM.width + 10, 12]} />
        <meshStandardMaterial
          color={palette.rug}
          roughness={0.95}
          metalness={0}
          envMapIntensity={palette.envIntensity * 0.4}
        />
      </mesh>

      {/* Rug under the training floor, so that half of the room reads warmer. */}
      <mesh rotation-x={-Math.PI / 2} position={[-5.2, 0.004, -1.4]} receiveShadow>
        <planeGeometry args={[7.2, 6.4]} />
        <meshStandardMaterial color={palette.rug} roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM.height / 2, -ROOM.halfD]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.height]} />
        <meshStandardMaterial
          color={palette.wall}
          roughness={0.9}
          envMapIntensity={palette.envIntensity * 0.4}
        />
      </mesh>

      {/* Left wall - the project wall hangs on this one */}
      <mesh
        position={[-ROOM.halfW, ROOM.height / 2, 0]}
        rotation-y={Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[ROOM.depth, ROOM.height]} />
        <meshStandardMaterial
          color={palette.wall}
          roughness={0.9}
          envMapIntensity={palette.envIntensity * 0.4}
        />
      </mesh>

      {/* Right wall, built in pieces so the glazing band is a real gap rather
          than a texture pretending to be one. */}
      <group position={[ROOM.halfW, 0, 0]} rotation-y={-Math.PI / 2}>
        {/* sill */}
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <planeGeometry args={[ROOM.depth, 0.56]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        {/* header */}
        <mesh position={[0, 3.05, 0]} receiveShadow>
          <planeGeometry args={[ROOM.depth, 0.7]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        {/* glazing */}
        <mesh position={[0, 1.63, 0.01]}>
          <planeGeometry args={[ROOM.depth, 2.14]} />
          <meshPhysicalMaterial
            color={palette.glass}
            transparent
            opacity={palette.glassOpacity}
            roughness={0.08}
            metalness={0}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Mullions, and what the window looks out on. */}
      {[-4.2, -1.4, 1.4, 4.2].map((z) => (
        <mesh key={z} position={[ROOM.halfW - 0.03, 1.63, z]} castShadow>
          <boxGeometry args={[0.06, 2.14, 0.09]} />
          <meshStandardMaterial color={palette.trim} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[ROOM.halfW + 2.4, 1.75, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[13, 6]} />
        {/* fog={false} because the window is 12m away and the room fog
            would grey out the one thing that says "outside". */}
        <meshBasicMaterial map={sky} toneMapped={false} fog={false} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ROOM.height, 0]} rotation-x={Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={palette.ceiling} roughness={1} />
      </mesh>

      {/* Recessed light coves. Emissive planes carry the look; four unshadowed
          point lights carry the actual illumination, which is far cheaper than
          area lights and indistinguishable at this scale. */}
      {coves.map((z) => (
        <group key={z}>
          {/* Tone mapped, unlike the gold accents. A cove is a big surface;
              feeding three of them to the bloom pass unmapped is what turned
              the night render into a white field. */}
          <mesh position={[0, ROOM.height - 0.04, z]} rotation-x={Math.PI / 2}>
            <planeGeometry args={[14.5, 0.26]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#fff4d6"
              emissiveIntensity={palette.coveIntensity}
            />
          </mesh>
          <pointLight
            position={[-3.6, ROOM.height - 0.35, z]}
            color="#fff1d0"
            intensity={palette.coveIntensity * 5}
            distance={11}
            decay={2}
          />
          <pointLight
            position={[3.6, ROOM.height - 0.35, z]}
            color="#fff1d0"
            intensity={palette.coveIntensity * 5}
            distance={11}
            decay={2}
          />
        </group>
      ))}

      {/* Gold datum line. The one saturated colour in the shell. */}
      <mesh position={[0, 2.36, -ROOM.halfD + 0.02]}>
        <planeGeometry args={[ROOM.width - 0.6, 0.035]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={palette.goldIntensity}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-ROOM.halfW + 0.02, 2.36, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[ROOM.depth - 0.6, 0.035]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={palette.goldIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Skirting, so the wall/floor junction is not a razor edge. */}
      <mesh position={[0, 0.05, -ROOM.halfD + 0.03]}>
        <boxGeometry args={[ROOM.width, 0.1, 0.06]} />
        <meshStandardMaterial color={palette.trim} roughness={0.8} />
      </mesh>
      <mesh position={[-ROOM.halfW + 0.03, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.1, ROOM.depth]} />
        <meshStandardMaterial color={palette.trim} roughness={0.8} />
      </mesh>

      {/* Balustrade along the open front edge. */}
      <mesh position={[0, 0.55, ROOM.halfD]}>
        <planeGeometry args={[ROOM.width, 1.05]} />
        <meshPhysicalMaterial
          color={palette.glass}
          transparent
          opacity={palette.glassOpacity + 0.06}
          roughness={0.05}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 1.09, ROOM.halfD]} castShadow>
        <boxGeometry args={[ROOM.width, 0.06, 0.07]} />
        <meshStandardMaterial
          color={palette.metal}
          roughness={palette.metalRoughness}
          metalness={0.85}
          envMapIntensity={palette.envIntensity}
        />
      </mesh>
      {[-8.4, -4.2, 0, 4.2, 8.4].map((x) => (
        <mesh key={x} position={[x, 0.55, ROOM.halfD]} castShadow>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <meshStandardMaterial
            color={palette.metal}
            roughness={palette.metalRoughness}
            metalness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Room;
