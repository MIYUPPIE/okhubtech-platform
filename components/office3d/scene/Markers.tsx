"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, MathUtils, type Group, type Mesh } from "three";

import { GOLD, type Palette } from "../palette";
import { STATIONS, type Station } from "../stations";
import { labelTexture } from "../textures";

/**
 * The gold rings on the floor, and everything that makes them clickable.
 *
 * Three pieces per station: a pulsing ring on the floor, a soft beam so the
 * marker is findable from across the room, and a billboarded label. The label
 * is a canvas texture rather than a DOM overlay, so it is occluded by the
 * furniture in front of it and needs no per-frame projection maths.
 *
 * A click is only a click if the pointer barely moved between press and
 * release. Without that test every orbit drag that happened to start on a
 * marker would fly the camera somewhere the visitor did not ask to go.
 */

const CLICK_SLOP = 8;

type Props = {
  palette: Palette;
  activeId: string | null;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
};

const Marker = ({
  station,
  palette,
  active,
  dimmed,
  onSelect,
  pressRef,
  reducedMotion,
}: {
  station: Station;
  palette: Palette;
  active: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  pressRef: React.RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const ring = useRef<Mesh>(null);
  const beam = useRef<Mesh>(null);
  const label = useRef<Group>(null);
  const glow = useRef(0);

  const texture = useMemo(
    () => labelTexture(station.label, active ? "Open" : "Click to visit"),
    [station.label, active],
  );

  useFrame(({ clock, camera }, delta) => {
    const t = clock.getElapsedTime();
    const pulse = reducedMotion ? 0.5 : (Math.sin(t * 1.6 + station.marker[0]) + 1) / 2;
    const wanted = dimmed ? 0 : hovered ? 1 : 0.55;
    glow.current = MathUtils.damp(glow.current, wanted, 8, Math.min(delta, 0.1));

    if (ring.current) {
      const scale = 1 + pulse * 0.12 + glow.current * 0.22;
      ring.current.scale.setScalar(scale);
      const material = ring.current.material as { opacity: number };
      material.opacity = glow.current * (0.55 + pulse * 0.45);
    }
    if (beam.current) {
      const material = beam.current.material as { opacity: number };
      material.opacity = glow.current * 0.13;
    }
    if (label.current) {
      label.current.quaternion.copy(camera.quaternion);
      // Hold the label at a roughly constant on-screen size, so a marker at
      // the far wall is still readable without being enormous up close.
      const distance = camera.position.distanceTo(label.current.position);
      label.current.scale.setScalar(MathUtils.clamp(distance / 9, 0.55, 1.5));
      label.current.visible = glow.current > 0.04;
      const material = (label.current.children[0] as Mesh | undefined)?.material as
        | { opacity: number }
        | undefined;
      if (material) material.opacity = Math.min(1, glow.current * 1.6);
    }
  });

  const down = (event: ThreeEvent<PointerEvent>) => {
    pressRef.current = { x: event.clientX, y: event.clientY };
  };

  const click = (event: ThreeEvent<MouseEvent>) => {
    const start = pressRef.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_SLOP) return;
    event.stopPropagation();
    onSelect(station.id);
  };

  const enter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const leave = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <group>
      {/* Click volume. Transparent rather than invisible: three's raycaster
          skips anything with visible === false. */}
      <mesh
        position={[station.marker[0], station.hit[1], station.marker[2]]}
        onPointerDown={down}
        onClick={click}
        onPointerOver={enter}
        onPointerOut={leave}
      >
        <boxGeometry args={[station.hit[0] * 2, station.hit[1] * 2, station.hit[2] * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh ref={ring} position={station.marker as unknown as [number, number, number]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.34, 0.44, 48]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0}
          side={DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        ref={beam}
        position={[station.marker[0], 0.9, station.marker[2]]}
      >
        <cylinderGeometry args={[0.34, 0.42, 1.8, 20, 1, true]} />
        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={0}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={label} position={[station.marker[0], 1.75, station.marker[2]]}>
        <mesh>
          <planeGeometry args={[1.5, 0.375]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* A dedicated light so a station reads as lit even when the room is not. */}
      <pointLight
        position={[station.marker[0], 0.6, station.marker[2]]}
        color={GOLD}
        intensity={hovered ? palette.goldIntensity * 1.6 : palette.goldIntensity * 0.35}
        distance={3.4}
        decay={2}
      />
    </group>
  );
};

const Markers = ({ palette, activeId, onSelect, reducedMotion }: Props) => {
  const pressRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <group>
      {STATIONS.map((station) => (
        <Marker
          key={station.id}
          station={station}
          palette={palette}
          active={activeId === station.id}
          // The marker you are standing on is in the way of the thing you came
          // to look at, so it fades out once you arrive.
          dimmed={activeId === station.id}
          onSelect={onSelect}
          pressRef={pressRef}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
};

export default Markers;
