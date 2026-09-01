"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, PMREMGenerator, type Texture } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import CameraRig, { type OfficeControls } from "./CameraRig";
import { PALETTES, type Mode } from "./palette";
import { OVERVIEW } from "./stations";
import type { Tier } from "./useCapabilities";
import Effects from "./scene/Effects";
import Markers from "./scene/Markers";
import Room from "./scene/Room";
import Rover from "./scene/Rover";
import {
  DataWall,
  DevPod,
  FrontDesk,
  ProjectWall,
  RoboticsBench,
  TrainingFloor,
  type SceneTextures,
} from "./scene/Stations";
import {
  codeTexture,
  dashboardTexture,
  projectCardTexture,
  signTexture,
  visionTexture,
  whiteboardTexture,
} from "./textures";

/**
 * The office, assembled.
 *
 * Mounted through next/dynamic with `ssr: false` - a WebGL canvas cannot be
 * server rendered, and every texture in here reaches for `document`. The HTML
 * that ships in the static export comes from OfficeStage instead, which is why
 * this file can assume a browser without costing the page its content.
 */

type Props = {
  mode: Mode;
  tier: Tier;
  reducedMotion: boolean;
  activeId: string | null;
  onSelect: (id: string | null) => void;
  controlsRef: React.RefObject<OfficeControls>;
  /** False while the stage is scrolled out of view: stops the render loop. */
  visible: boolean;
  onEngage: () => void;
  onReady: () => void;
};

const CLICK_SLOP = 8;

/**
 * A prefiltered indoor environment for the metal and glass to reflect.
 *
 * Without this every metallic surface samples a flat colour and reads as grey
 * plastic. RoomEnvironment ships with three, costs one render to a small cube
 * map, and is the single biggest difference between "some boxes" and "a room".
 *
 * Attached declaratively rather than by assigning `scene.environment`, so R3F
 * owns putting it on and taking it off. Per-surface strength is set with
 * `envMapIntensity` on the materials that actually reflect, which is also how
 * day and night differ - see Palette.envIntensity.
 */
const EnvironmentRig = () => {
  const gl = useThree((s) => s.gl);

  const texture = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    // The generator and the source scene are both scaffolding; the render
    // target's texture outlives them and is what gets sampled.
    pmrem.dispose();
    room.dispose();
    return target.texture;
  }, [gl]);

  useEffect(() => () => texture.dispose(), [texture]);

  return <primitive object={texture} attach="environment" />;
};

/** Records where each press started, so a drag is never mistaken for a click. */
const PressTracker = ({ pressRef }: { pressRef: React.RefObject<{ x: number; y: number }> }) => {
  const domElement = useThree((s) => s.gl.domElement);
  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      pressRef.current = { x: event.clientX, y: event.clientY };
    };
    domElement.addEventListener("pointerdown", onDown);
    return () => domElement.removeEventListener("pointerdown", onDown);
  }, [domElement, pressRef]);
  return null;
};

const Contents = ({
  mode,
  tier,
  reducedMotion,
  activeId,
  onSelect,
  controlsRef,
  pressRef,
  onEngage,
}: Omit<Props, "visible" | "onReady"> & {
  pressRef: React.RefObject<{ x: number; y: number }>;
}) => {
  const palette = PALETTES[mode];
  const night = mode === "night";
  const animate = !reducedMotion;

  const tex = useMemo<SceneTextures>(
    () => ({
      whiteboard: whiteboardTexture(),
      dashboard: dashboardTexture(3, night),
      dashboardAlt: dashboardTexture(11, night),
      code: codeTexture(5),
      codeAlt: codeTexture(17),
      vision: visionTexture(),
      sign: signTexture("OKHub", "Technology · Ibadan, Nigeria"),
      cards: [
        projectCardTexture("Serving robot", "Robotics", 2),
        projectCardTexture("AI health assistant", "Health", 5),
        projectCardTexture("Hydroponics controller", "Agriculture", 8),
        projectCardTexture("Smart campus", "Public sector", 12),
        projectCardTexture("Sign language educator", "Accessibility", 19),
      ],
    }),
    [night],
  );

  // Canvas textures are GPU allocations like any other. Swapping day for night
  // rebuilds them, so the previous set has to go back.
  useEffect(
    () => () => {
      const all: Texture[] = [
        tex.whiteboard,
        tex.dashboard,
        tex.dashboardAlt,
        tex.code,
        tex.codeAlt,
        tex.vision,
        tex.sign,
        ...tex.cards,
      ];
      all.forEach((texture) => texture.dispose());
    },
    [tex],
  );

  const shadowSize = tier === "high" ? 2048 : 1024;

  return (
    <>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.fog[0], palette.fog[1], palette.fog[2]]} />

      <EnvironmentRig />

      <ambientLight intensity={palette.ambient} />
      <hemisphereLight
        args={[palette.hemi.sky, palette.hemi.ground, palette.hemi.intensity]}
      />
      {/* The sun, coming in through the window band on the right-hand wall. */}
      <directionalLight
        position={[15, 7.5, 3.5]}
        color={palette.sun.color}
        intensity={palette.sun.intensity}
        castShadow={tier === "high"}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-8}
      />
      {/* Fill from the open front edge so the near faces are not solid black. */}
      <directionalLight
        position={[-2, 4, 12]}
        color={night ? "#8fa6c8" : "#ffffff"}
        intensity={night ? 0.18 : 0.55}
      />

      <Room palette={palette} night={night} />

      <TrainingFloor palette={palette} tex={tex} animate={animate} />
      <RoboticsBench palette={palette} tex={tex} animate={animate} />
      <ProjectWall palette={palette} tex={tex} animate={animate} />
      <DataWall palette={palette} tex={tex} animate={animate} />
      <DevPod palette={palette} tex={tex} animate={animate} />
      <FrontDesk palette={palette} tex={tex} animate={animate} />

      <Rover palette={palette} animate={animate} />

      <Markers
        palette={palette}
        activeId={activeId}
        onSelect={onSelect}
        reducedMotion={reducedMotion}
      />

      <PressTracker pressRef={pressRef} />
      <CameraRig
        controlsRef={controlsRef}
        activeId={activeId}
        idleOrbit={activeId === null}
        reducedMotion={reducedMotion}
        onEngage={onEngage}
      />

      {tier === "high" ? <Effects palette={palette} /> : null}
    </>
  );
};

const OfficeScene = ({
  mode,
  tier,
  reducedMotion,
  activeId,
  onSelect,
  controlsRef,
  visible,
  onEngage,
  onReady,
}: Props) => {
  const pressRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <Canvas
      shadows={tier === "high" ? "soft" : false}
      // R3F clamps this ceiling against the device's own devicePixelRatio, so
      // it only raises resolution on screens that are actually dense enough
      // to use it - a 1x-DPR laptop is untouched either way. `tier` here is
      // "low" for every touch+narrow device regardless of how capable the
      // phone actually is, which is the right call for shadows and bloom
      // (genuinely expensive) but was wrong for DPR: at a 1.25 ceiling, a
      // normal 3x-DPR phone rendered the room at under half the pixel
      // density a laptop got, and the upscaled result read as blurry next to
      // the crisp desktop/tablet view. This scene has no bloom or shadows on
      // low tier to begin with, so the remaining fill cost is cheap enough
      // for a modern phone GPU to carry at a full 2x.
      dpr={tier === "high" ? [1, 1.75] : [1, 2]}
      frameloop={visible ? "always" : "never"}
      camera={{
        fov: 42,
        near: 0.1,
        far: 120,
        position: [...OVERVIEW.camera],
      }}
      gl={{
        // Antialiasing was tied to `tier` alongside shadows and bloom, but on
        // this low-poly furniture MSAA is cheap on its own - it is the post-
        // processing composite pass that was ever expensive, and that stays
        // gated to high tier below. Turning AA back on for low tier is what
        // actually cleans up the jagged edges that read as "not as sharp"
        // separately from the DPR fix above.
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
      }}
      onCreated={onReady}
      onPointerMissed={(event) => {
        // Clicking the floor or a wall steps back out to the wide shot - but
        // only if it was a click. Letting go of an orbit drag over empty space
        // must not throw away the station the visitor is reading.
        const start = pressRef.current;
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_SLOP) {
          return;
        }
        onSelect(null);
      }}
    >
      <Contents
        mode={mode}
        tier={tier}
        reducedMotion={reducedMotion}
        activeId={activeId}
        onSelect={onSelect}
        controlsRef={controlsRef}
        pressRef={pressRef}
        onEngage={onEngage}
      />
    </Canvas>
  );
};

export default OfficeScene;
