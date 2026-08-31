"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { HalfFloatType, Vector2, WebGLRenderTarget } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import type { Palette } from "../palette";

/**
 * Bloom, and the render loop that goes with it.
 *
 * This is what makes the emissive surfaces - the screens, the ceiling coves,
 * the gold datum lines and the marker rings - read as light rather than as
 * bright paint. It is also the most expensive thing in the scene, so it only
 * mounts on the `high` tier; the low tier gets the same room with a plain
 * forward render and looks correct, just flatter.
 *
 * Ordering matters. RenderPass writes linear colour into a half-float target,
 * UnrealBloomPass works in that linear space, and OutputPass applies the
 * renderer's tone mapping and colour space exactly once at the end. Dropping
 * OutputPass produces a washed-out, un-tone-mapped image; adding it before the
 * bloom produces haloes around everything.
 *
 * `useFrame(..., 1)` takes the render loop away from R3F. Unmounting this
 * component hands it straight back.
 */
const Effects = ({ palette }: { palette: Palette }) => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const { composer, bloom } = useMemo(() => {
    const target = new WebGLRenderTarget(size.width, size.height, {
      type: HalfFloatType,
      samples: 4,
    });
    const next = new EffectComposer(gl, target);
    next.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new Vector2(size.width, size.height),
      palette.bloom.strength,
      0.55,
      palette.bloom.threshold,
    );
    next.addPass(bloomPass);
    next.addPass(new OutputPass());
    return { composer: next, bloom: bloomPass };
    // Rebuilding on every resize would thrash GPU memory; setSize below covers
    // that case, so size is read once for the initial allocation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(dpr);
    composer.setSize(size.width, size.height);
    bloom.setSize(size.width, size.height);
  }, [composer, bloom, size.width, size.height, dpr]);

  useEffect(() => {
    bloom.strength = palette.bloom.strength;
    bloom.threshold = palette.bloom.threshold;
  }, [bloom, palette.bloom.strength, palette.bloom.threshold]);

  useEffect(
    () => () => {
      composer.dispose();
    },
    [composer],
  );

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};

export default Effects;
