"use client";

import { DoubleSide, type Texture } from "three";

import { cycle } from "../cycle";
import { GOLD, type Palette } from "../palette";
import { AccentBar, Chair, Desk, Frame, Laptop, Monitor, Plant, Shelf } from "./Kit";
import RobotArm from "./RobotArm";
import { ROOM } from "./Room";

/**
 * The six places worth standing, built out of the kit.
 *
 * Each export owns one region of the floor and nothing else, so a change to
 * the dev pod cannot move the training benches. The coordinates here and the
 * `camera`/`target`/`marker` values in ../stations.ts are the two halves of
 * one layout: if you move a station, move both.
 */

export type SceneTextures = {
  whiteboard: Texture;
  dashboard: Texture;
  dashboardAlt: Texture;
  code: Texture;
  codeAlt: Texture;
  vision: Texture;
  sign: Texture;
  cards: readonly [Texture, ...Texture[]];
};

type Props = { palette: Palette; tex: SceneTextures; animate: boolean };

const BACK = -ROOM.halfD + 0.03;

const BIN_COLOURS = ["#8c3b3b", "#3b5a8c", "#8c7a3b"] as const;
const STICKY_COLOURS = ["#f6d365", "#a1d9c5", "#f7a6a6"] as const;

// ---------------------------------------------------------------------------
// Training floor - x -8.2..-2.8, z -4.6..0.4
// ---------------------------------------------------------------------------

export const TrainingFloor = ({ palette, tex }: Props) => (
  <group>
    {/* Whiteboard */}
    <group position={[-5.4, 1.72, BACK]}>
      <mesh castShadow>
        <boxGeometry args={[3.5, 1.78, 0.06]} />
        <meshStandardMaterial color={palette.trim} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[3.36, 1.64]} />
        <meshStandardMaterial
          map={tex.whiteboard}
          emissiveMap={tex.whiteboard}
          emissive="#ffffff"
          emissiveIntensity={palette.screenGlow * 0.22}
          roughness={0.55}
          toneMapped={false}
        />
      </mesh>
      {/* Marker tray */}
      <mesh position={[0, -0.93, 0.08]} castShadow>
        <boxGeometry args={[3.5, 0.05, 0.12]} />
        <meshStandardMaterial color={palette.metal} roughness={0.4} metalness={0.7} />
      </mesh>
      <AccentBar palette={palette} position={[0, 0.96, 0.05]} args={[3.5, 0.02, 0.02]} />
    </group>

    {/* Two rows of three benches, all facing the board. */}
    {[-2.95, -1.05].map((z, row) =>
      [-7.2, -5.4, -3.6].map((x, seat) => (
        <group key={`${z}-${x}`}>
          <Desk palette={palette} position={[x, 0, z]} width={1.52} depth={0.68}>
            <Laptop
              palette={palette}
              screen={(row + seat) % 2 === 0 ? tex.codeAlt : tex.dashboardAlt}
              position={[-0.28, 0.762, 0.02]}
              rotation={0.12 - seat * 0.1}
            />
            {/* Kit tray: the boards and jumper packs each bench works from. */}
            <mesh position={[0.42, 0.775, 0.04]} castShadow>
              <boxGeometry args={[0.34, 0.025, 0.24]} />
              <meshStandardMaterial color="#1b4d3e" roughness={0.75} />
            </mesh>
            <mesh position={[0.42, 0.8, 0.04]} castShadow>
              <boxGeometry args={[0.16, 0.03, 0.1]} />
              <meshStandardMaterial color="#0f3d2e" roughness={0.6} />
            </mesh>
            <mesh position={[0.62, 0.79, -0.12]} castShadow>
              <boxGeometry args={[0.1, 0.06, 0.14]} />
              <meshStandardMaterial color="#7a2d2d" roughness={0.8} />
            </mesh>
          </Desk>
          <Chair palette={palette} position={[x, 0, z + 0.72]} rotation={Math.PI} />
        </group>
      )),
    )}

    {/* Instructor's stool and a parts trolley by the board. */}
    <Chair palette={palette} position={[-3.2, 0, -4.1]} rotation={-0.6} />
    <group position={[-7.9, 0, -4.3]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.04, 0.46]} />
        <meshStandardMaterial color={palette.wood} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.66, 0.04, 0.42]} />
        <meshStandardMaterial color={palette.wood} roughness={0.7} />
      </mesh>
      {[-0.3, 0.3].map((x) =>
        [-0.19, 0.19].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.21, z]} castShadow>
            <boxGeometry args={[0.03, 0.42, 0.03]} />
            <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.35} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.34, 0.12, 0.26]} />
        <meshStandardMaterial color="#8c7a3b" roughness={0.85} />
      </mesh>
    </group>
  </group>
);

// ---------------------------------------------------------------------------
// Robotics bench - x -0.9..2.9, against the back wall
// ---------------------------------------------------------------------------

export const RoboticsBench = ({ palette, tex, animate }: Props) => (
  <group>
    {/* Tool board */}
    <group position={[1.0, 1.95, BACK]}>
      <mesh castShadow>
        <boxGeometry args={[2.6, 1.3, 0.05]} />
        <meshStandardMaterial color="#2b2f36" roughness={0.85} />
      </mesh>
      {/* Pegboard holes, as a grid of shallow studs. */}
      {Array.from({ length: 7 }, (_, row) =>
        Array.from({ length: 13 }, (_, col) => (
          <mesh key={`${row}-${col}`} position={[-1.2 + col * 0.2, 0.55 - row * 0.18, 0.028]}>
            <circleGeometry args={[0.012, 6]} />
            <meshStandardMaterial color="#15181d" />
          </mesh>
        )),
      )}
      {/* Hung tools */}
      {[
        { x: -1.02, w: 0.05, h: 0.42, c: "#c0392b" },
        { x: -0.82, w: 0.05, h: 0.34, c: "#2980b9" },
        { x: -0.62, w: 0.07, h: 0.3, c: "#f1c40f" },
        { x: 0.66, w: 0.06, h: 0.38, c: "#95a5a6" },
        { x: 0.86, w: 0.05, h: 0.28, c: "#c0392b" },
        { x: 1.06, w: 0.09, h: 0.22, c: "#7f8c8d" },
      ].map((tool) => (
        <mesh key={tool.x} position={[tool.x, 0.3 - tool.h / 2, 0.05]} castShadow>
          <boxGeometry args={[tool.w, tool.h, 0.035]} />
          <meshStandardMaterial color={tool.c} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      <AccentBar palette={palette} position={[0, 0.72, 0.04]} args={[2.6, 0.02, 0.02]} />
    </group>

    {/* The bench itself: heavier and taller than a desk. */}
    <group position={[1.0, 0, -4.05]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.07, 0.86]} />
        <meshStandardMaterial color="#6b5334" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[3.4, 0.05, 0.7]} />
        <meshStandardMaterial color={palette.metal} roughness={0.5} metalness={0.7} />
      </mesh>
      {[-1.7, 1.7].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]} castShadow>
          <boxGeometry args={[0.09, 0.9, 0.78]} />
          <meshStandardMaterial color={palette.metal} roughness={0.45} metalness={0.85} />
        </mesh>
      ))}
      {/* Component bins along the back edge. */}
      {[-1.35, -1.05, -0.75].map((x, i) => (
        <mesh key={x} position={[x, 0.99, -0.3]} castShadow>
          <boxGeometry args={[0.26, 0.11, 0.2]} />
          <meshStandardMaterial color={cycle(BIN_COLOURS, i)} roughness={0.85} />
        </mesh>
      ))}
      {/* A part in mid-assembly under the arm. */}
      <mesh position={[0.05, 0.96, 0.18]} castShadow>
        <boxGeometry args={[0.2, 0.05, 0.14]} />
        <meshStandardMaterial color="#1b4d3e" roughness={0.7} />
      </mesh>
      {/* Bench light */}
      <mesh position={[-1.5, 1.28, -0.2]} rotation-z={0.4} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-1.36, 1.55, -0.16]} rotation-x={0.5}>
        <coneGeometry args={[0.11, 0.14, 12, 1, true]} />
        <meshStandardMaterial color={palette.metal} metalness={0.8} roughness={0.4} side={DoubleSide} />
      </mesh>
      <pointLight
        position={[-1.36, 1.42, -0.06]}
        color="#fff0cf"
        intensity={palette.screenGlow * 2.6}
        distance={3.4}
        decay={2}
      />
    </group>

    <RobotArm palette={palette} position={[0.9, 0.935, -4.1]} animate={animate} />

    {/* Rover chassis on blocks, plus the bench monitor showing its camera. */}
    <group position={[2.35, 0.935, -3.95]}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.34, 0.09, 0.48]} />
        <meshStandardMaterial color={palette.metal} metalness={0.75} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.15, -0.04]} castShadow>
        <boxGeometry args={[0.24, 0.04, 0.3]} />
        <meshStandardMaterial color="#1b4d3e" roughness={0.7} />
      </mesh>
      {[-0.11, 0.11].map((x) =>
        [-0.16, 0.16].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.03, z]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#22252b" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>

    <Monitor
      palette={palette}
      screen={tex.vision}
      position={[-1.15, 0.965, -4.2]}
      rotation={0.22}
      width={0.56}
      height={0.35}
    />
  </group>
);

// ---------------------------------------------------------------------------
// Project wall - the left wall, z -0.4..4.6
// ---------------------------------------------------------------------------

export const ProjectWall = ({ palette, tex }: Props) => {
  const x = -ROOM.halfW + 0.06;
  const frames: { z: number; y: number; w: number; h: number }[] = [
    { z: 0.1, y: 1.72, w: 0.6, h: 0.78 },
    { z: 0.98, y: 1.86, w: 0.6, h: 0.52 },
    { z: 1.86, y: 1.66, w: 0.72, h: 0.92 },
    { z: 2.86, y: 1.86, w: 0.6, h: 0.52 },
    { z: 3.74, y: 1.72, w: 0.6, h: 0.78 },
  ];

  return (
    <group>
      {frames.map((frame, i) => (
        <group key={frame.z}>
          <Frame
            palette={palette}
            art={cycle(tex.cards, i)}
            position={[x, frame.y, frame.z]}
            width={frame.w}
            height={frame.h}
          />
          {/* Picture light above each frame. */}
          <mesh position={[x + 0.16, frame.y + frame.h / 2 + 0.16, frame.z]} castShadow>
            <boxGeometry args={[0.28, 0.04, 0.06]} />
            <meshStandardMaterial color={palette.metal} metalness={0.85} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <spotLight
        position={[-7.6, 3.1, 1.9]}
        target-position={[-9, 1.7, 1.9]}
        angle={0.85}
        penumbra={0.9}
        intensity={palette.screenGlow * 12}
        color="#fff3dc"
        distance={7}
        decay={2}
      />

      {/* Caption strip under the run of frames. */}
      <mesh position={[x + 0.01, 1.06, 1.92]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[4.4, 0.02]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={palette.goldIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Bench to stand back and look from. */}
      <group position={[-8.0, 0, 1.9]}>
        <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.07, 1.9]} />
          <meshStandardMaterial color={palette.wood} roughness={0.7} />
        </mesh>
        {[-0.75, 0.75].map((z) => (
          <mesh key={z} position={[0, 0.2, z]} castShadow>
            <boxGeometry args={[0.34, 0.4, 0.05]} />
            <meshStandardMaterial color={palette.metal} metalness={0.85} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <Plant palette={palette} position={[-8.3, 0, 4.6]} scale={1.15} />
    </group>
  );
};

// ---------------------------------------------------------------------------
// Data wall - back-right corner
// ---------------------------------------------------------------------------

export const DataWall = ({ palette, tex }: Props) => (
  <group>
    {/* The board */}
    <group position={[6.5, 1.85, BACK]}>
      <mesh castShadow>
        <boxGeometry args={[2.7, 1.56, 0.06]} />
        <meshStandardMaterial color="#101216" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[2.56, 1.42]} />
        <meshStandardMaterial
          map={tex.dashboard}
          emissiveMap={tex.dashboard}
          emissive="#ffffff"
          emissiveIntensity={palette.screenGlow * 1.15}
          toneMapped={false}
        />
      </mesh>
    </group>

    {/* Rack in the corner. Front face is a stack of lit blades. */}
    <group position={[8.2, 0, -4.55]} rotation-y={-0.42}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, 2.0, 0.9]} />
        <meshStandardMaterial color="#191c21" roughness={0.55} metalness={0.55} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[0, 0.28 + i * 0.19, 0.455]}>
          <mesh>
            <planeGeometry args={[0.66, 0.14]} />
            <meshStandardMaterial color="#23262c" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[-0.25, 0, 0.004]}>
            <planeGeometry args={[0.035, 0.035]} />
            <meshStandardMaterial
              color={i % 4 === 1 ? GOLD : "#4ade80"}
              emissive={i % 4 === 1 ? GOLD : "#4ade80"}
              emissiveIntensity={palette.goldIntensity * 1.2}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[-0.19, 0, 0.004]}>
            <planeGeometry args={[0.02, 0.02]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={palette.goldIntensity * 0.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <AccentBar palette={palette} position={[0, 2.02, 0]} args={[0.76, 0.02, 0.02]} />
    </group>

    {/* Analyst desk in front of the board. */}
    <Desk palette={palette} position={[6.6, 0, -3.5]} width={1.9} depth={0.78} rotation={0.1}>
      <Monitor
        palette={palette}
        screen={tex.dashboardAlt}
        position={[-0.34, 0.762, -0.06]}
        rotation={0.3}
      />
      <Monitor
        palette={palette}
        screen={tex.code}
        position={[0.36, 0.762, -0.06]}
        rotation={-0.3}
      />
      <mesh position={[0, 0.772, 0.24]} castShadow>
        <boxGeometry args={[0.44, 0.016, 0.15]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.6} />
      </mesh>
    </Desk>
    <Chair palette={palette} position={[6.7, 0, -2.7]} rotation={Math.PI - 0.1} />
    <Plant palette={palette} position={[5.1, 0, -4.6]} />
  </group>
);

// ---------------------------------------------------------------------------
// Dev pod - right front
// ---------------------------------------------------------------------------

export const DevPod = ({ palette, tex }: Props) => (
  <group>
    <Desk palette={palette} position={[5.6, 0, 2.0]} width={1.8} depth={0.78} rotation={-0.35}>
      <Monitor
        palette={palette}
        screen={tex.code}
        position={[-0.32, 0.762, -0.08]}
        rotation={0.22}
        width={0.68}
        height={0.42}
      />
      <Monitor
        palette={palette}
        screen={tex.codeAlt}
        position={[0.42, 0.762, -0.02]}
        rotation={-0.34}
        width={0.5}
        height={0.44}
        tilt={-0.02}
      />
      <mesh position={[0.02, 0.772, 0.26]} castShadow>
        <boxGeometry args={[0.42, 0.016, 0.14]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.6} />
      </mesh>
      <mesh position={[0.34, 0.775, 0.26]} castShadow>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.5} />
      </mesh>
    </Desk>
    <Chair palette={palette} position={[5.2, 0, 2.85]} rotation={Math.PI - 0.35} />

    <Desk palette={palette} position={[7.0, 0, 3.5]} width={1.6} depth={0.74} rotation={0.9}>
      <Monitor
        palette={palette}
        screen={tex.dashboardAlt}
        position={[-0.2, 0.762, -0.04]}
        rotation={0.1}
      />
      <Laptop palette={palette} screen={tex.codeAlt} position={[0.42, 0.762, 0.06]} rotation={-0.3} />
    </Desk>
    <Chair palette={palette} position={[6.35, 0, 3.9]} rotation={-0.7} />

    {/* Standing whiteboard the pod actually plans on. */}
    <group position={[4.3, 0, 4.3]} rotation-y={0.6}>
      <mesh position={[0, 1.24, 0]} castShadow>
        <boxGeometry args={[1.5, 0.96, 0.05]} />
        <meshStandardMaterial color="#f2f1ee" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.7, 0.66, 0]} castShadow>
          <boxGeometry args={[0.05, 1.32, 0.05]} />
          <meshStandardMaterial color={palette.metal} metalness={0.85} roughness={0.4} />
        </mesh>
      ))}
      {/* Sticky notes: the only thing on a planning board you can read at 3m. */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[-0.5 + (i % 3) * 0.42, 1.5 - Math.floor(i / 3) * 0.3, 0.028]}
          rotation-z={(i % 4) * 0.04 - 0.06}
        >
          <planeGeometry args={[0.22, 0.18]} />
          <meshStandardMaterial color={cycle(STICKY_COLOURS, i)} roughness={0.95} />
        </mesh>
      ))}
      <AccentBar palette={palette} position={[0, 1.76, 0.03]} args={[1.5, 0.02, 0.02]} />
    </group>

    <Shelf palette={palette} position={[8.4, 0, 1.0]} rotation={-Math.PI / 2} width={1.5} levels={3} />
    <Plant palette={palette} position={[4.4, 0, 2.6]} scale={0.9} />
  </group>
);

// ---------------------------------------------------------------------------
// Front desk
// ---------------------------------------------------------------------------

export const FrontDesk = ({ palette, tex }: Props) => (
  <group>
    {/* Partition behind the counter, carrying the sign.
        Kept at 2.05m and 3.2m wide: at 2.5 x 3.6 it stood square in the middle
        of the establishing shot and walled off the whole room behind it. */}
    <group position={[-1.2, 0, 3.25]}>
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.05, 0.12]} />
        <meshStandardMaterial color={palette.trim} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.42, 0.065]}>
        <planeGeometry args={[2.2, 0.73]} />
        <meshStandardMaterial
          map={tex.sign}
          emissiveMap={tex.sign}
          emissive="#ffffff"
          emissiveIntensity={palette.screenGlow * 0.7}
          transparent
          toneMapped={false}
        />
      </mesh>
      <AccentBar palette={palette} position={[0, 0.4, 0.07]} args={[3.2, 0.02, 0.02]} />
    </group>

    {/* Counter: a desk top with a raised front panel. */}
    <group position={[-1.2, 0, 4.15]}>
      <mesh position={[0, 1.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.07, 0.72]} />
        <meshStandardMaterial color={palette.wood} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.53, 0.31]} castShadow>
        <boxGeometry args={[3.0, 1.06, 0.1]} />
        <meshStandardMaterial color={palette.trim} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, -0.1]} castShadow>
        <boxGeometry args={[2.6, 0.8, 0.5]} />
        <meshStandardMaterial color={palette.wood} roughness={0.7} />
      </mesh>
      {/* Under-counter glow, the detail that makes a lobby read as a lobby. */}
      <mesh position={[0, 0.06, 0.34]}>
        <planeGeometry args={[2.9, 0.03]} />
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={palette.goldIntensity * 1.4}
          toneMapped={false}
        />
      </mesh>
      <Laptop palette={palette} screen={tex.dashboardAlt} position={[-0.7, 1.1, -0.02]} rotation={0.3} />
      <mesh position={[0.75, 1.13, 0]} castShadow>
        <boxGeometry args={[0.2, 0.06, 0.28]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.5} />
      </mesh>
      <mesh position={[0.75, 1.2, -0.02]} rotation-x={-0.35} castShadow>
        <boxGeometry args={[0.16, 0.02, 0.16]} />
        <meshStandardMaterial color="#3a3f47" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>

    <Chair palette={palette} position={[-1.2, 0, 3.75]} rotation={0} />
    <Plant palette={palette} position={[0.9, 0, 4.4]} scale={1.2} />
    <Plant palette={palette} position={[-3.3, 0, 4.4]} scale={1.0} />

    {/* Two lounge chairs and a low table, facing the counter. */}
    <group position={[-4.6, 0, 3.0]}>
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0]} rotation-y={x > 0 ? -0.5 : 0.5}>
          <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.16, 0.6]} />
            <meshStandardMaterial color={palette.fabric} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.56, -0.24]} rotation-x={-0.2} castShadow>
            <boxGeometry args={[0.6, 0.42, 0.12]} />
            <meshStandardMaterial color={palette.fabric} roughness={0.9} />
          </mesh>
          {[-0.24, 0.24].map((lx) =>
            [-0.24, 0.24].map((lz) => (
              <mesh key={`${lx}-${lz}`} position={[lx, 0.13, lz]} castShadow>
                <cylinderGeometry args={[0.022, 0.022, 0.26, 8]} />
                <meshStandardMaterial color={palette.wood} roughness={0.6} />
              </mesh>
            )),
          )}
        </group>
      ))}
      <mesh position={[0, 0.36, 0.7]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 20]} />
        <meshStandardMaterial color={palette.wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0.7]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.36, 12]} />
        <meshStandardMaterial color={palette.metal} metalness={0.9} roughness={0.35} />
      </mesh>
    </group>
  </group>
);
