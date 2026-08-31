"use client";

import type { ReactNode } from "react";
import type { Texture } from "three";

import { cycle } from "../cycle";
import { GOLD, type Palette } from "../palette";

/**
 * The parts every station is assembled from.
 *
 * Everything is box, cylinder, cone or plane geometry. No loader, no glTF, no
 * network request: the whole office is a few hundred primitives, which is why
 * it can ship inside a static export and still be on screen in well under a
 * second.
 */

type P = { palette: Palette };

/** Ring binders and parts boxes. Muted enough not to fight the gold. */
const BOX_COLOURS = ["#8c3b3b", "#3b5a8c", "#8c7a3b", "#3b8c6f", "#5b3b8c"] as const;

export const Desk = ({
  palette,
  width = 1.6,
  depth = 0.72,
  height = 0.74,
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  children,
}: P & {
  width?: number;
  depth?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: number;
  children?: ReactNode;
}) => (
  <group position={position} rotation-y={rotation}>
    <mesh position={[0, height, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, 0.045, depth]} />
      <meshStandardMaterial
        color={palette.wood}
        roughness={0.62}
        metalness={0.05}
        envMapIntensity={palette.envIntensity}
      />
    </mesh>
    {/* Two hoop legs rather than four posts - fewer meshes, better silhouette. */}
    {[-1, 1].map((side) => (
      <group key={side} position={[side * (width / 2 - 0.09), 0, 0]}>
        <mesh position={[0, height / 2, 0]} castShadow>
          <boxGeometry args={[0.05, height, 0.05]} />
          <meshStandardMaterial
            color={palette.metal}
            roughness={palette.metalRoughness}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.06, 0.04, depth - 0.06]} />
          <meshStandardMaterial
            color={palette.metal}
            roughness={palette.metalRoughness}
            metalness={0.9}
          />
        </mesh>
      </group>
    ))}
    {children}
  </group>
);

export const Chair = ({
  palette,
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: P & { position?: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation-y={rotation}>
    <mesh position={[0, 0.44, 0]} castShadow>
      <boxGeometry args={[0.46, 0.07, 0.44]} />
      <meshStandardMaterial color={palette.fabric} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.72, -0.2]} rotation-x={-0.16} castShadow>
      <boxGeometry args={[0.44, 0.5, 0.06]} />
      <meshStandardMaterial color={palette.fabric} roughness={0.85} />
    </mesh>
    <mesh position={[0, 0.24, 0]} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 0.36, 10]} />
      <meshStandardMaterial color={palette.metal} roughness={0.35} metalness={0.9} />
    </mesh>
    <mesh position={[0, 0.05, 0]} castShadow>
      <cylinderGeometry args={[0.26, 0.28, 0.04, 12]} />
      <meshStandardMaterial color="#22252b" roughness={0.6} metalness={0.4} />
    </mesh>
  </group>
);

/** A monitor on an arm. `screen` is what it is showing. */
export const Monitor = ({
  palette,
  screen,
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  width = 0.62,
  height = 0.39,
  tilt = -0.06,
}: P & {
  screen: Texture;
  position?: [number, number, number];
  rotation?: number;
  width?: number;
  height?: number;
  tilt?: number;
}) => (
  <group position={position} rotation-y={rotation}>
    <mesh position={[0, 0.06, 0]} castShadow>
      <boxGeometry args={[0.22, 0.02, 0.16]} />
      <meshStandardMaterial color="#2a2d33" roughness={0.5} metalness={0.6} />
    </mesh>
    <mesh position={[0, 0.16, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
      <meshStandardMaterial color="#2a2d33" roughness={0.4} metalness={0.8} />
    </mesh>
    <group position={[0, 0.28 + height / 2, 0]} rotation-x={tilt}>
      <mesh castShadow>
        <boxGeometry args={[width + 0.03, height + 0.03, 0.022]} />
        <meshStandardMaterial
          color="#16181d"
          roughness={0.42}
          metalness={0.5}
          envMapIntensity={palette.envIntensity}
        />
      </mesh>
      <mesh position={[0, 0, 0.013]}>
        <planeGeometry args={[width, height]} />
          {/*
             Base colour zeroed: without it this plane also answers to the
             room's lights, and a screen sitting near a bright point light (the
             training-floor whiteboard, three units from a ceiling cove) washes
             out to solid white under ACES + bloom. Only the emissive layer
             should be visible - a display, not a reflective surface.
          */}
        <meshStandardMaterial
          color="#000000"
          emissiveMap={screen}
          emissive="#ffffff"
          emissiveIntensity={palette.screenGlow}
          toneMapped={false}
          roughness={0.25}
        />
      </mesh>
    </group>
  </group>
);

/** An open laptop. Cheaper than a monitor and reads as "student", not "desk". */
export const Laptop = ({
  palette,
  screen,
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
}: P & { screen: Texture; position?: [number, number, number]; rotation?: number }) => (
  <group position={position} rotation-y={rotation}>
    <mesh position={[0, 0.006, 0]} castShadow>
      <boxGeometry args={[0.34, 0.012, 0.24]} />
      <meshStandardMaterial color="#3a3f47" roughness={0.4} metalness={0.75} />
    </mesh>
    <group position={[0, 0.012, -0.12]} rotation-x={-1.18}>
      <mesh position={[0, 0.11, 0]} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.008]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.4} metalness={0.75} />
      </mesh>
      <mesh position={[0, 0.11, 0.005]}>
        <planeGeometry args={[0.31, 0.19]} />
          {/*
             Base colour zeroed: without it this plane also answers to the
             room's lights, and a screen sitting near a bright point light (the
             training-floor whiteboard, three units from a ceiling cove) washes
             out to solid white under ACES + bloom. Only the emissive layer
             should be visible - a display, not a reflective surface.
          */}
        <meshStandardMaterial
          color="#000000"
          emissiveMap={screen}
          emissive="#ffffff"
          emissiveIntensity={palette.screenGlow * 0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  </group>
);

export const Plant = ({
  palette,
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
}: P & { position?: [number, number, number]; scale?: number }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.19, 0.14, 0.34, 14]} />
      <meshStandardMaterial color={palette.trim} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.35, 0]}>
      <cylinderGeometry args={[0.17, 0.17, 0.03, 14]} />
      <meshStandardMaterial color="#2f2a20" roughness={1} />
    </mesh>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i / 6) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.13, 0.62 + (i % 3) * 0.11, Math.sin(angle) * 0.13]}
          rotation={[Math.sin(angle) * 0.5, angle, Math.cos(angle) * 0.5]}
          castShadow
        >
          <coneGeometry args={[0.11, 0.5, 5]} />
          <meshStandardMaterial color={i % 2 ? "#3f6b3a" : "#4f7d44"} roughness={0.9} />
        </mesh>
      );
    })}
  </group>
);

/** Shelving unit. `fill` paints the boxes and folders on each shelf. */
export const Shelf = ({
  palette,
  position = [0, 0, 0] as [number, number, number],
  rotation = 0,
  width = 1.4,
  levels = 4,
}: P & {
  position?: [number, number, number];
  rotation?: number;
  width?: number;
  levels?: number;
}) => (
  <group position={position} rotation-y={rotation}>
    {Array.from({ length: levels }, (_, level) => (
      <group key={level} position={[0, 0.38 + level * 0.44, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, 0.035, 0.32]} />
          <meshStandardMaterial color={palette.wood} roughness={0.7} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh
            key={i}
            position={[-width / 2 + 0.16 + i * (width / 5.4), 0.13, 0]}
            castShadow
          >
            <boxGeometry args={[0.09 + (i % 3) * 0.02, 0.22 + (i % 2) * 0.05, 0.24]} />
            <meshStandardMaterial
              color={cycle(BOX_COLOURS, i)}
              roughness={0.85}
            />
          </mesh>
        ))}
      </group>
    ))}
    {[-1, 1].map((side) => (
      <mesh key={side} position={[(side * width) / 2, 0.9 + (levels - 4) * 0.22, 0]} castShadow>
        <boxGeometry args={[0.04, 1.8 + (levels - 4) * 0.44, 0.32]} />
        <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.8} />
      </mesh>
    ))}
  </group>
);

/** Framed print for the project wall. */
export const Frame = ({
  palette,
  art,
  position,
  width = 0.62,
  height = 0.78,
}: P & {
  art: Texture;
  position: [number, number, number];
  width?: number;
  height?: number;
}) => (
  <group position={position} rotation-y={Math.PI / 2}>
    <mesh castShadow>
      <boxGeometry args={[width, height, 0.035]} />
      <meshStandardMaterial
        color={palette.trim}
        roughness={0.55}
        metalness={0.2}
        envMapIntensity={palette.envIntensity}
      />
    </mesh>
    <mesh position={[0, 0, 0.019]}>
      <planeGeometry args={[width - 0.06, height - 0.06]} />
        {/*
           Base colour zeroed: without it this plane also answers to the
           room's lights, and a screen sitting near a bright point light (the
           training-floor whiteboard, three units from a ceiling cove) washes
           out to solid white under ACES + bloom. Only the emissive layer
           should be visible - a display, not a reflective surface.
        */}
      <meshStandardMaterial
        color="#000000"
        emissiveMap={art}
        emissive="#ffffff"
        emissiveIntensity={palette.screenGlow * 0.28}
        roughness={0.42}
        toneMapped={false}
      />
    </mesh>
  </group>
);

/** A thin gold accent bar, used to underline a station without adding a light. */
export const AccentBar = ({
  palette,
  position,
  args = [1.2, 0.02, 0.02] as [number, number, number],
  rotation = 0,
}: P & {
  position: [number, number, number];
  args?: [number, number, number];
  rotation?: number;
}) => (
  <mesh position={position} rotation-y={rotation}>
    <boxGeometry args={args} />
    <meshStandardMaterial
      color={GOLD}
      emissive={GOLD}
      emissiveIntensity={palette.goldIntensity}
      toneMapped={false}
    />
  </mesh>
);
