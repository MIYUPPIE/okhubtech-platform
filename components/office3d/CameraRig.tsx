"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Spherical, Vector3 } from "three";

import { OVERVIEW, stationById, type Vec3 } from "./stations";

/**
 * Imperative handle the HUD uses to drive the camera from outside the Canvas.
 *
 * The zoom buttons and the keyboard live in `OfficeStage`, which renders as
 * DOM siblings of the Canvas and therefore cannot use hooks from inside it.
 * The rig fills this object in on mount; the stage only ever calls it.
 */
export type OfficeControls = {
  /** Positive zooms out, negative zooms in. One unit is one "notch". */
  zoom: (notches: number) => void;
  /** Nudge the orbit, in radians. Used by the arrow keys in overview. */
  orbit: (dTheta: number, dPhi: number) => void;
};

type Props = {
  controlsRef: React.RefObject<OfficeControls>;
  activeId: string | null;
  /** Suppressed while a panel is open or the visitor is driving. */
  idleOrbit: boolean;
  reducedMotion: boolean;
  /** Called on the first real drag, so the stage can hide the hint. */
  onEngage: () => void;
};

const MIN_RADIUS = 2.1;
const MAX_RADIUS = 19;
/** Polar angle bounds: 0 is straight down from above, PI/2 is eye level. */
const MIN_PHI = 0.45;
const MAX_PHI = 1.58;

/**
 * Where the camera is allowed to be. The room is x -9..9, z -5.5..5.5; these
 * bounds keep the eye a comfortable margin inside every wall it has, and open
 * out to +Z because the front edge of the floor has no wall - that is how the
 * establishing shot sees the whole room at once.
 */
const BOUNDS = {
  minX: -8.4,
  maxX: 8.4,
  minY: 0.55,
  maxY: 6.6,
  minZ: -4.9,
  maxZ: 15,
};

/** Frame-rate independent exponential approach. */
const damp = (current: number, goal: number, lambda: number, dt: number): number =>
  current + (goal - current) * (1 - Math.exp(-lambda * dt));

/** How long the visitor must sit still before the room starts drifting again. */
const IDLE_AFTER = 6;

const toSpherical = (camera: Vec3, target: Vec3): Spherical =>
  new Spherical().setFromVector3(
    new Vector3(camera[0] - target[0], camera[1] - target[1], camera[2] - target[2]),
  );

const CameraRig = ({ controlsRef, activeId, idleOrbit, reducedMotion, onEngage }: Props) => {
  const camera = useThree((s) => s.camera);
  const domElement = useThree((s) => s.gl.domElement);

  // Current and goal state. Kept in refs because every one of these changes
  // every frame and none of them should ever trigger a React render.
  const current = useRef({
    target: new Vector3(...OVERVIEW.target),
    spherical: toSpherical(OVERVIEW.camera, OVERVIEW.target),
  });
  const goal = useRef({
    target: new Vector3(...OVERVIEW.target),
    spherical: toSpherical(OVERVIEW.camera, OVERVIEW.target),
  });

  const drag = useRef({ active: false, x: 0, y: 0, moved: 0, engaged: false });
  const pinch = useRef<{ distance: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const idle = useRef(0);
  /** True from the moment a station is picked until the camera has arrived. */
  const flying = useRef(false);

  const eye = useMemo(() => new Vector3(), []);

  // --- selection -----------------------------------------------------------
  useEffect(() => {
    const station = stationById(activeId);
    const shot = station ?? OVERVIEW;
    const next = toSpherical(shot.camera, shot.target);

    // theta accumulates as the visitor drags, so it can be many turns away
    // from the authored value. Pick the equivalent angle nearest to where the
    // camera already is, or the room spins the long way round.
    const turns = Math.round((goal.current.spherical.theta - next.theta) / (Math.PI * 2));
    next.theta += turns * Math.PI * 2;

    goal.current.target.set(...shot.target);
    goal.current.spherical.copy(next);
    flying.current = true;
    idle.current = 0;

    if (reducedMotion) {
      current.current.target.copy(goal.current.target);
      current.current.spherical.copy(goal.current.spherical);
      flying.current = false;
    }
  }, [activeId, reducedMotion]);

  // --- pointer input -------------------------------------------------------
  useEffect(() => {
    const clampPhi = (phi: number) => MathUtils.clamp(phi, MIN_PHI, MAX_PHI);

    /** Screen distance between the first two live pointers, or null. */
    const pinchDistance = (): number | null => {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return null;
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const clampRadius = (r: number) => MathUtils.clamp(r, MIN_RADIUS, MAX_RADIUS);

    const onPointerDown = (event: PointerEvent) => {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size === 2) {
        const spread = pinchDistance();
        if (spread !== null) pinch.current = { distance: spread };
        return;
      }
      drag.current.active = true;
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
      drag.current.moved = 0;
      idle.current = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pinch.current && pointers.current.size >= 2) {
        const distance = pinchDistance();
        if (distance === null) return;
        const scale = pinch.current.distance / Math.max(distance, 1);
        goal.current.spherical.radius = clampRadius(goal.current.spherical.radius * scale);
        pinch.current.distance = distance;
        idle.current = 0;
        return;
      }

      if (!drag.current.active) return;
      const dx = event.clientX - drag.current.x;
      const dy = event.clientY - drag.current.y;
      drag.current.x = event.clientX;
      drag.current.y = event.clientY;
      drag.current.moved += Math.abs(dx) + Math.abs(dy);

      // A real drag, not the couple of pixels a click carries with it.
      if (drag.current.moved > 8 && !drag.current.engaged) {
        drag.current.engaged = true;
        onEngage();
      }

      goal.current.spherical.theta -= dx * 0.0045;
      goal.current.spherical.phi = clampPhi(goal.current.spherical.phi - dy * 0.0045);
      idle.current = 0;
      flying.current = false;
    };

    const endPointer = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (pointers.current.size === 0) drag.current.active = false;
    };

    /**
     * Plain wheel is left alone on purpose. This canvas is the full height of
     * the viewport, so swallowing the wheel would trap the page: there would
     * be no way to reach anything below the fold with a mouse. Zoom is on
     * shift+wheel, pinch, the +/- buttons and the keyboard instead, and the
     * hint in the HUD says so.
     */
    const onWheel = (event: WheelEvent) => {
      if (!event.shiftKey) return;
      event.preventDefault();
      goal.current.spherical.radius = clampRadius(
        goal.current.spherical.radius * (1 + Math.sign(event.deltaY) * 0.12),
      );
      idle.current = 0;
    };

    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("pointerup", endPointer);
    domElement.addEventListener("pointercancel", endPointer);
    domElement.addEventListener("pointerleave", endPointer);
    domElement.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", endPointer);
      domElement.removeEventListener("pointercancel", endPointer);
      domElement.removeEventListener("pointerleave", endPointer);
      domElement.removeEventListener("wheel", onWheel);
    };
  }, [domElement, onEngage]);

  // --- handle for the HUD --------------------------------------------------
  useEffect(() => {
    controlsRef.current = {
      zoom: (notches) => {
        goal.current.spherical.radius = MathUtils.clamp(
          goal.current.spherical.radius * (1 + notches * 0.18),
          MIN_RADIUS,
          MAX_RADIUS,
        );
        idle.current = 0;
      },
      orbit: (dTheta, dPhi) => {
        goal.current.spherical.theta += dTheta;
        goal.current.spherical.phi = MathUtils.clamp(
          goal.current.spherical.phi + dPhi,
          MIN_PHI,
          MAX_PHI,
        );
        idle.current = 0;
        flying.current = false;
      },
    };
  }, [controlsRef]);

  // --- the loop ------------------------------------------------------------
  useFrame((_, rawDelta) => {
    // A backgrounded tab hands back one enormous delta on return. Cap it, or
    // the damping jumps and the room appears to teleport.
    const dt = Math.min(rawDelta, 0.1);
    idle.current += dt;

    if (idleOrbit && !reducedMotion && !drag.current.active && idle.current > IDLE_AFTER) {
      goal.current.spherical.theta += dt * 0.035;
    }

    // Slower approach on a flight so the move reads as a camera move; snappier
    // under the hand so dragging feels attached to the pointer.
    const lambda = flying.current ? 2.6 : 9;
    const g = goal.current;
    const c = current.current;

    c.target.x = damp(c.target.x, g.target.x, lambda, dt);
    c.target.y = damp(c.target.y, g.target.y, lambda, dt);
    c.target.z = damp(c.target.z, g.target.z, lambda, dt);
    c.spherical.radius = damp(c.spherical.radius, g.spherical.radius, lambda, dt);
    c.spherical.phi = damp(c.spherical.phi, g.spherical.phi, lambda, dt);
    c.spherical.theta = damp(c.spherical.theta, g.spherical.theta, lambda, dt);

    if (flying.current) {
      const arrived =
        c.target.distanceTo(g.target) < 0.02 &&
        Math.abs(c.spherical.radius - g.spherical.radius) < 0.02 &&
        Math.abs(c.spherical.theta - g.spherical.theta) < 0.01;
      if (arrived) flying.current = false;
    }

    eye.setFromSpherical(c.spherical).add(c.target);

    // Keep the eye inside the shell. Clamping the position rather than the
    // orbit means an over-enthusiastic drag stops against the wall instead of
    // punching through it into the void.
    camera.position.set(
      MathUtils.clamp(eye.x, BOUNDS.minX, BOUNDS.maxX),
      MathUtils.clamp(eye.y, BOUNDS.minY, BOUNDS.maxY),
      MathUtils.clamp(eye.z, BOUNDS.minZ, BOUNDS.maxZ),
    );
    camera.lookAt(c.target);
  });

  return null;
};

export default CameraRig;
