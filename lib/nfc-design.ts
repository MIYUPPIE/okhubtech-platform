/**
 * The card designer's model and its canvas renderer.
 *
 * One renderer feeds both the on-screen editor and the PDF, so the artwork the
 * customer approved is byte-for-byte the artwork that goes on the order sheet.
 * Canvas pixels are 300 dpi (PX_PER_MM), the usual print resolution.
 *
 * The model half is pure (testable in Node). `drawSide` only needs a
 * CanvasRenderingContext2D-shaped object, so the gate tests it with a recorder.
 */

import type { Form } from "./nfc";

export const PX_PER_MM = 300 / 25.4;

/** ISO 7811 magnetic stripe on the back of a card: 12.7 mm wide, its top edge 5.5 mm from the card top. */
export const STRIPE_TOP_MM = 5.5;
export const STRIPE_HEIGHT_MM = 12.7;

export type Fill =
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number };

export type Layer =
  | { id: string; kind: "text"; text: string; x: number; y: number; size: number; color: string; weight: "400" | "700"; font: FontId; align: "left" | "center" | "right"; rotate: number }
  | { id: string; kind: "shape"; shape: "rect" | "circle"; x: number; y: number; w: number; h: number; color: string; opacity: number; rotate: number }
  | { id: string; kind: "image"; src: string; x: number; y: number; w: number; h: number; rotate: number }
  | { id: string; kind: "nfc"; x: number; y: number; size: number; color: string; rotate: number };

export type FontId = "sans" | "serif" | "mono" | "display";

export const FONT_STACKS: Record<FontId, string> = {
  sans: "Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
  display: "Impact, 'Arial Black', sans-serif",
};

export type SideDesign = { fill: Fill; layers: Layer[] };
export type Design = { front: SideDesign; back: SideDesign };

/** Layer coordinates are 0..1 of the card, measured to the layer's centre. */
export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export const canvasSize = (form: Form): { w: number; h: number } => ({
  w: Math.round(form.widthMm * PX_PER_MM),
  h: Math.round(form.heightMm * PX_PER_MM),
});

let counter = 0;
export const newId = (): string => `l${Date.now().toString(36)}${(counter++).toString(36)}`;

export function defaultDesign(): Design {
  return {
    front: {
      fill: { kind: "gradient", from: "#111111", to: "#2b2b2b", angle: 135 },
      layers: [
        { id: "f-name", kind: "text", text: "Your Name", x: 0.08, y: 0.62, size: 0.1, color: "#ffffff", weight: "700", font: "sans", align: "left", rotate: 0 },
        { id: "f-role", kind: "text", text: "Your title or business", x: 0.08, y: 0.76, size: 0.055, color: "#ffd700", weight: "400", font: "sans", align: "left", rotate: 0 },
        { id: "f-nfc", kind: "nfc", x: 0.88, y: 0.14, size: 0.12, color: "#ffd700", rotate: 0 },
      ],
    },
    back: {
      fill: { kind: "solid", color: "#ffd700" },
      layers: [
        { id: "b-tap", kind: "text", text: "TAP TO CONNECT", x: 0.5, y: 0.45, size: 0.09, color: "#111111", weight: "700", font: "sans", align: "center", rotate: 0 },
        { id: "b-nfc", kind: "nfc", x: 0.5, y: 0.7, size: 0.16, color: "#111111", rotate: 0 },
      ],
    },
  };
}

/** Canvas-shaped subset the renderer touches, so tests can pass a recorder. */
export type Ctx = Pick<
  CanvasRenderingContext2D,
  | "save" | "restore" | "translate" | "rotate" | "beginPath" | "rect" | "arc" | "fill" | "stroke"
  | "clip" | "fillRect" | "fillText" | "drawImage" | "createLinearGradient" | "moveTo" | "lineTo" | "quadraticCurveTo" | "closePath"
> & {
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  lineCap: CanvasLineCap;
  globalAlpha: number;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
};

export type ImageLookup = (src: string) => CanvasImageSource | undefined;

export function gradientPoints(angleDeg: number, w: number, h: number): [number, number, number, number] {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  const cx = w / 2;
  const cy = h / 2;
  return [cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half];
}

/** Path of the card outline: rounded rectangle or circle. */
export function outline(ctx: Ctx, form: Form, w: number, h: number): void {
  ctx.beginPath();
  if (form.shape === "circle") {
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    return;
  }
  const r = form.radiusMm * PX_PER_MM;
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
}

/** The universal contactless symbol: a dot and three arcs. */
function drawNfc(ctx: Ctx, size: number, color: string): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = size * 0.1;
  ctx.beginPath();
  ctx.arc(-size * 0.32, 0, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(-size * 0.32, 0, size * (0.17 + i * 0.2), -Math.PI / 3.2, Math.PI / 3.2);
    ctx.stroke();
  }
}

export function fillStyleFor(ctx: Ctx, fill: Fill, w: number, h: number): string | CanvasGradient {
  if (fill.kind === "solid") return fill.color;
  const [x0, y0, x1, y1] = gradientPoints(fill.angle, w, h);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, fill.from);
  g.addColorStop(1, fill.to);
  return g;
}

/** Draw one side, clipped to the card outline. `w`/`h` are canvas pixels. */
export function drawSide(ctx: Ctx, form: Form, side: SideDesign, w: number, h: number, images: ImageLookup): void {
  ctx.save();
  outline(ctx, form, w, h);
  ctx.clip();
  ctx.fillStyle = fillStyleFor(ctx, side.fill, w, h);
  ctx.fillRect(0, 0, w, h);

  for (const layer of side.layers) {
    ctx.save();
    ctx.translate(layer.x * w, layer.y * h);
    ctx.rotate((layer.rotate * Math.PI) / 180);
    switch (layer.kind) {
      case "text": {
        ctx.fillStyle = layer.color;
        ctx.font = `${layer.weight} ${Math.round(layer.size * h)}px ${FONT_STACKS[layer.font]}`;
        ctx.textAlign = layer.align;
        ctx.textBaseline = "middle";
        layer.text.split("\n").forEach((line, i, all) => {
          const lh = layer.size * h * 1.2;
          ctx.fillText(line, 0, (i - (all.length - 1) / 2) * lh);
        });
        break;
      }
      case "shape": {
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = layer.color;
        const lw = layer.w * w;
        const lh = layer.h * h;
        if (layer.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(lw, lh) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-lw / 2, -lh / 2, lw, lh);
        }
        break;
      }
      case "image": {
        const img = images(layer.src);
        if (img) ctx.drawImage(img, (-layer.w * w) / 2, (-layer.h * h) / 2, layer.w * w, layer.h * h);
        break;
      }
      case "nfc":
        drawNfc(ctx, layer.size * h * 2, layer.color);
        break;
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Bounding box of a layer in canvas pixels, centre-based, for hit testing. Ignores rotation. */
export function layerBox(layer: Layer, w: number, h: number): { cx: number; cy: number; hw: number; hh: number } {
  const cx = layer.x * w;
  const cy = layer.y * h;
  switch (layer.kind) {
    case "text": {
      const lines = layer.text.split("\n");
      const longest = Math.max(...lines.map((l) => l.length), 1);
      const fs = layer.size * h;
      const tw = longest * fs * 0.55;
      const off = layer.align === "left" ? tw / 2 : layer.align === "right" ? -tw / 2 : 0;
      return { cx: cx + off, cy, hw: tw / 2, hh: (lines.length * fs * 1.2) / 2 };
    }
    case "shape":
    case "image":
      return { cx, cy, hw: (layer.w * w) / 2, hh: (layer.h * h) / 2 };
    case "nfc":
      return { cx, cy, hw: layer.size * h, hh: layer.size * h };
  }
}

/** Topmost layer under a canvas-pixel point, or -1. */
export function hitTest(side: SideDesign, px: number, py: number, w: number, h: number): number {
  for (let i = side.layers.length - 1; i >= 0; i--) {
    const b = layerBox(side.layers[i]!, w, h);
    if (Math.abs(px - b.cx) <= b.hw && Math.abs(py - b.cy) <= b.hh) return i;
  }
  return -1;
}

/** Keep a layer's centre on the card. */
export function moveLayer<T extends Layer>(layer: T, nx: number, ny: number): T {
  return { ...layer, x: clamp01(nx), y: clamp01(ny) };
}
