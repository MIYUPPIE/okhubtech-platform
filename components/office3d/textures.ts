"use client";

import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

import { cycle } from "./cycle";
import { GOLD } from "./palette";

/**
 * Everything on a screen, a sign or a whiteboard in this room is drawn with
 * the 2D canvas API and uploaded as a texture.
 *
 * The alternative was a glTF scene with baked image maps, which would have
 * added megabytes to a static export that currently ships no 3D assets at
 * all. Drawing them costs a few milliseconds once, weighs nothing, and stays
 * crisp at any zoom because the source is vector-ish and the target is small.
 *
 * Every function here touches `document`, so every one of them is only ever
 * called from inside the Canvas, which is mounted with `ssr: false`.
 */

const dpi = 2;

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width * dpi;
  canvas.height = height * dpi;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.scale(dpi, dpi);
  return { canvas, ctx };
}

function finish(canvas: HTMLCanvasElement, anisotropy = 4): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Deterministic pseudo-random, so a given screen looks the same every load. */
function rng(seed: number): () => number {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ---------------------------------------------------------------------------
// Floor markers and labels
// ---------------------------------------------------------------------------

/**
 * The billboarded chip that floats over a station.
 *
 * Drawn as a dark pill with gold type so it stays legible against both the
 * pale day walls and the near-black night ones without needing two variants.
 */
export function labelTexture(text: string, hint: string): CanvasTexture {
  const w = 512;
  const h = 128;
  const { canvas, ctx } = surface(w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(6, 7, 9, 0.88)";
  roundRect(ctx, 6, 30, w - 12, 68, 34);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 215, 0, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(44, 64, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 30px 'Sora', 'Poppins', system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 68, 60);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 18px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(hint, 68, 84);

  return finish(canvas, 8);
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

/** A dashboard: KPI row, a bar chart, a line. Reads as "data" at any size. */
export function dashboardTexture(seed: number, dark: boolean): CanvasTexture {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = surface(w, h);
  const random = rng(seed);

  ctx.fillStyle = dark ? "#0a0d13" : "#101521";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0, 0, w, 34);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 32, 96, 2);
  ctx.font = "600 15px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("OKHUB · PIPELINE", 16, 22);

  const kpis = [
    { value: "98.2%", label: "UPTIME" },
    { value: "1.4s", label: "LATENCY" },
    { value: "12k", label: "ROWS/M" },
    { value: "0", label: "ALERTS" },
  ];
  kpis.forEach(({ value, label }, i) => {
    const x = 16 + i * 122;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, x, 48, 108, 56, 10);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.font = "700 22px 'Sora', system-ui, sans-serif";
    ctx.fillText(value, x + 12, 78);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "500 10px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(label, x + 12, 94);
  });

  // Bars
  const baseY = 268;
  for (let i = 0; i < 22; i += 1) {
    const barHeight = 18 + random() * 106;
    ctx.fillStyle = i % 7 === 3 ? GOLD : "rgba(255,255,255,0.22)";
    ctx.fillRect(18 + i * 14, baseY - barHeight, 8, barHeight);
  }

  // Trend line over the bars
  ctx.strokeStyle = "rgba(120, 220, 255, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 40; i += 1) {
    const x = 18 + (i / 39) * (w - 40);
    const y = 200 - Math.sin(i * 0.35 + seed) * 34 - random() * 8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(18, baseY + 2, w - 36, 1);
  ctx.font = "500 10px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("ingest · normalise · serve", 18, 292);

  return finish(canvas);
}

/** An editor. Not real code - coloured runs that read as code from two metres. */
export function codeTexture(seed: number): CanvasTexture {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = surface(w, h);
  const random = rng(seed);

  ctx.fillStyle = "#0b0e14";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#11151d";
  ctx.fillRect(0, 0, 40, h);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 0, w, 26);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 11px 'Space Grotesk', monospace";
  ctx.fillText("logsme / whatsapp / router.ts", 12, 17);

  const palette = ["#7dd3fc", "#c4b5fd", "#fca5a5", "#86efac", "#fde68a", "#94a3b8"] as const;
  let y = 44;
  for (let line = 0; line < 22; line += 1) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.font = "400 10px monospace";
    ctx.fillText(String(line + 1).padStart(2, " "), 14, y + 4);

    let x = 48 + (random() < 0.35 ? 16 : 0) + (random() < 0.18 ? 16 : 0);
    const runs = 2 + Math.floor(random() * 4);
    for (let run = 0; run < runs; run += 1) {
      const width = 18 + random() * 76;
      if (x + width > w - 18) break;
      ctx.fillStyle = cycle(palette, Math.floor(random() * palette.length));
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, width, 5);
      ctx.globalAlpha = 1;
      x += width + 8;
    }
    y += 12;
  }

  // Caret
  ctx.fillStyle = GOLD;
  ctx.fillRect(48, y - 12, 2, 9);

  return finish(canvas);
}

/** A vision feed: frame, boxes, labels. The computer-vision class, on a screen. */
export function visionTexture(): CanvasTexture {
  const w = 512;
  const h = 320;
  const { canvas, ctx } = surface(w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1b2430");
  sky.addColorStop(1, "#0a0e14");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo((w / 8) * i, 0);
    ctx.lineTo((w / 8) * i, h);
    ctx.stroke();
  }

  const boxes = [
    { x: 60, y: 96, w: 110, h: 150, label: "person 0.97" },
    { x: 236, y: 132, w: 92, h: 108, label: "person 0.94" },
    { x: 362, y: 168, w: 118, h: 82, label: "board 0.88" },
  ];
  boxes.forEach((box, i) => {
    ctx.strokeStyle = i === 2 ? "#7dd3fc" : GOLD;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = i === 2 ? "#7dd3fc" : GOLD;
    ctx.fillRect(box.x, box.y - 16, ctx.measureText(box.label).width + 22, 16);
    ctx.fillStyle = "#05070a";
    ctx.font = "600 11px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillText(box.label, box.x + 6, box.y - 4);
  });

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, h - 26, w, 26);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 11px 'Space Grotesk', monospace";
  ctx.fillText("cam-01 · 24 fps · edge inference", 12, h - 9);

  return finish(canvas);
}

/** The training-floor whiteboard: a block diagram somebody actually drew. */
export function whiteboardTexture(): CanvasTexture {
  const w = 1024;
  const h = 512;
  const { canvas, ctx } = surface(w, h);

  ctx.fillStyle = "#f7f7f4";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#1f2933";
  ctx.fillStyle = "#1f2933";
  ctx.lineWidth = 3;
  ctx.font = "600 22px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("COHORT BUILD: OBSTACLE AVOIDANCE", 48, 56);
  ctx.fillRect(48, 68, 420, 3);

  const nodes = [
    { x: 70, y: 130, label: "ULTRASONIC" },
    { x: 330, y: 130, label: "ARDUINO" },
    { x: 590, y: 130, label: "MOTOR DRIVER" },
    { x: 330, y: 300, label: "IR SENSOR" },
    { x: 590, y: 300, label: "SERVO SWEEP" },
  ];
  ctx.font = "600 16px 'Space Grotesk', system-ui, sans-serif";
  nodes.forEach((node) => {
    ctx.strokeStyle = "#1f2933";
    ctx.lineWidth = 3;
    roundRect(ctx, node.x, node.y, 200, 66, 10);
    ctx.stroke();
    ctx.fillStyle = "#1f2933";
    ctx.fillText(node.label, node.x + 20, node.y + 40);
  });

  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 4;
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(angle - 0.4), y2 - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 12 * Math.cos(angle + 0.4), y2 - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  };
  ctx.fillStyle = "#c0392b";
  arrow(270, 163, 326, 163);
  arrow(530, 163, 586, 163);
  arrow(430, 300, 586, 300);
  arrow(430, 250, 430, 200);

  ctx.strokeStyle = "#2563eb";
  ctx.fillStyle = "#2563eb";
  ctx.font = "500 18px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("if distance < 20cm → stop, sweep, turn", 70, 420);
  ctx.fillText("PWM 0–255 · both wheels · no delay()", 70, 452);

  return finish(canvas, 8);
}

/** The reception sign and any other flat piece of type in the room. */
export function signTexture(title: string, sub: string, dark = true): CanvasTexture {
  const w = 768;
  const h = 256;
  const { canvas, ctx } = surface(w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = dark ? "rgba(8,9,12,0.92)" : "rgba(255,255,255,0.94)";
  roundRect(ctx, 0, 0, w, h, 18);
  ctx.fill();

  ctx.fillStyle = GOLD;
  ctx.fillRect(40, 60, 8, 92);

  ctx.fillStyle = dark ? "#ffffff" : "#050505";
  ctx.font = "700 62px 'Sora', 'Poppins', system-ui, sans-serif";
  ctx.fillText(title, 68, 118);

  ctx.fillStyle = dark ? "rgba(255,255,255,0.55)" : "rgba(5,5,5,0.55)";
  ctx.font = "500 24px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(sub, 70, 156);

  return finish(canvas, 8);
}

/** Framed print for the project wall - a title card, not a photograph. */
export function projectCardTexture(title: string, sector: string, seed: number): CanvasTexture {
  const w = 384;
  const h = 480;
  const { canvas, ctx } = surface(w, h);
  const random = rng(seed);

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#12161d");
  bg.addColorStop(1, "#080a0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // A schematic-ish plot so each frame differs without carrying a photo.
  ctx.strokeStyle = "rgba(255,215,0,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 26; i += 1) {
    const x = 32 + (i / 25) * (w - 64);
    const y = 200 + Math.sin(i * 0.6 + seed) * 70 * random();
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(32, 120 + i * 32);
    ctx.lineTo(w - 32, 120 + i * 32);
    ctx.stroke();
  }

  ctx.fillStyle = GOLD;
  ctx.fillRect(32, 60, 46, 3);
  ctx.font = "600 13px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(sector.toUpperCase(), 32, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 27px 'Sora', system-ui, sans-serif";
  const words = title.split(" ");
  let line = "";
  let y = 380;
  const lines: string[] = [];
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > w - 64) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  lines.push(line);
  y = 400 - (lines.length - 1) * 32;
  lines.forEach((text) => {
    ctx.fillText(text, 32, y);
    y += 32;
  });

  return finish(canvas, 8);
}

/** What you see through the window band on the right-hand wall. */
export function skyTexture(top: string, bottom: string, night: boolean): CanvasTexture {
  const w = 512;
  const h = 512;
  const { canvas, ctx } = surface(w, h);

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  // A low skyline so the window reads as a window and not as a light box.
  const random = rng(7);
  ctx.fillStyle = night ? "#03050a" : "rgba(70, 85, 105, 0.55)";
  let x = -20;
  while (x < w + 20) {
    const width = 26 + random() * 54;
    const height = 40 + random() * 130;
    ctx.fillRect(x, h - height - 60, width, height + 60);
    if (night) {
      ctx.fillStyle = "rgba(255, 214, 120, 0.85)";
      for (let i = 0; i < 14; i += 1) {
        if (random() > 0.55) {
          ctx.fillRect(
            x + 6 + random() * (width - 14),
            h - height - 52 + random() * (height - 10),
            4,
            5,
          );
        }
      }
      ctx.fillStyle = "#03050a";
    }
    x += width + 6 + random() * 14;
  }

  return finish(canvas, 4);
}

/** Fine grid used on the floor for a faint architectural underlay. */
export function floorGridTexture(dark: boolean): Texture {
  const size = 256;
  const { canvas, ctx } = surface(size, size);
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  const texture = finish(canvas, 8);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(18, 11);
  return texture;
}
