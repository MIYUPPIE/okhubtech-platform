"use client";

import { useEffect, useState } from "react";

export type Tier = "high" | "low";

export type Capabilities = {
  /** null until the check has run on the client. */
  readonly webgl: boolean | null;
  readonly reducedMotion: boolean;
  readonly tier: Tier;
  /** Coarse pointer, i.e. finger. Changes the hint copy and the DPR cap. */
  readonly touch: boolean;
};

/**
 * One probe, cached for the page's lifetime.
 *
 * Creating a WebGL context is not free and a failed creation can log to the
 * console, so this runs once per document rather than once per mount.
 */
let probed: boolean | null = null;

function probeWebGL(): boolean {
  if (probed !== null) return probed;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    probed = gl !== null && gl !== undefined;
    // Free the context immediately; browsers cap simultaneous contexts at ~16
    // and the real Canvas needs one of them.
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    probed = false;
  }
  return probed;
}

/**
 * What this browser can actually be asked to draw.
 *
 * Deliberately returns `webgl: null` on the server and on the first client
 * render so the markup is identical on both and hydration cannot mismatch. The
 * scene mounts on the second render, by which time the probe has an answer.
 */
export function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>({
    webgl: null,
    reducedMotion: false,
    tier: "high",
    touch: false,
  });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: coarse)");

    // Device memory and core count are both optional; absence is treated as
    // "probably fine" rather than "probably slow", because the common case for
    // a missing value is Safari on real hardware.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 8;
    const narrow = window.innerWidth < 900;
    const tier: Tier = memory <= 4 || cores <= 4 || (narrow && pointer.matches) ? "low" : "high";

    const read = () =>
      setCaps({
        webgl: probeWebGL(),
        reducedMotion: motion.matches,
        tier,
        touch: pointer.matches,
      });

    read();
    motion.addEventListener("change", read);
    return () => motion.removeEventListener("change", read);
  }, []);

  return caps;
}
