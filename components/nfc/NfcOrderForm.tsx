"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, ImagePlus, Loader2, MessageCircle, Trash2, Type, Square, Circle, Radio } from "lucide-react";

import {
  ACTIONS, CHIPS, DELIVERY, EXTRAS, FINISHES, FORMS, MAX_QTY, formById, naira, orderRef, quote, validateOrder,
  type ActionId, type ChipId, type DeliveryId, type ExtraId, type FinishId, type FormId, type Order, type Selection,
} from "@/lib/nfc";
import {
  canvasSize, defaultDesign, drawSide, hitTest, layerBox, moveLayer, newId, FONT_STACKS,
  type Design, type FontId, type Layer, type SideDesign,
} from "@/lib/nfc-design";
import { buildOrderPdf, pdfFileName } from "@/lib/nfc-pdf";
import { deliver, type DeliveryResult } from "@/lib/nfc-delivery";

const STEPS = ["Card", "Design", "Function", "Details"] as const;

const INPUT =
  "w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-black outline-none focus:border-black dark:border-white/20 dark:bg-white/5 dark:text-white dark:focus:border-white";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-black/55 dark:text-white/55";
const CHIP_BTN = (on: boolean) =>
  `rounded-2xl border p-3 text-left transition ${
    on ? "border-black bg-black text-[#fafafa] dark:border-gold-primary dark:bg-gold-primary/10 dark:text-white" : "border-black/15 hover:border-black/40 dark:border-white/15 dark:hover:border-white/40"
  }`;

const TEMPLATES: { name: string; build: () => Design }[] = [
  { name: "Black and gold", build: defaultDesign },
  {
    name: "Clean white",
    build: () => {
      const d = defaultDesign();
      d.front.fill = { kind: "solid", color: "#ffffff" };
      d.front.layers = d.front.layers.map((l) => (l.kind === "text" ? { ...l, color: l.id === "f-role" ? "#666666" : "#111111" } : l.kind === "nfc" ? { ...l, color: "#111111" } : l));
      d.back.fill = { kind: "solid", color: "#111111" };
      d.back.layers = d.back.layers.map((l) => (l.kind === "text" ? { ...l, color: "#ffffff" } : l.kind === "nfc" ? { ...l, color: "#ffd700" } : l));
      return d;
    },
  },
  {
    name: "Bold blue",
    build: () => {
      const d = defaultDesign();
      d.front.fill = { kind: "gradient", from: "#0b3d91", to: "#1976d2", angle: 120 };
      d.front.layers = d.front.layers.map((l) => (l.kind === "text" ? { ...l, color: "#ffffff" } : l.kind === "nfc" ? { ...l, color: "#ffffff" } : l));
      d.back.fill = { kind: "solid", color: "#ffffff" };
      d.back.layers = d.back.layers.map((l) => (l.kind === "text" ? { ...l, color: "#0b3d91" } : l.kind === "nfc" ? { ...l, color: "#0b3d91" } : l));
      return d;
    },
  },
];

/** Shrink uploads so a phone photo cannot bloat the PDF. Keeps transparency. */
async function loadImage(file: File): Promise<{ src: string; img: HTMLImageElement; ratio: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * k));
    c.height = Math.max(1, Math.round(img.naturalHeight * k));
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const src = c.toDataURL("image/png");
    const small = new Image();
    small.src = src;
    await small.decode();
    return { src, img: small, ratio: c.width / c.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function NfcOrderForm() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection>({
    form: "pvc-card", chip: "ntag213", finish: "gloss", sides: "double", qty: 50, extras: [], designBy: "self", delivery: "ibadan",
  });
  const [design, setDesign] = useState<Design>(defaultDesign);
  const [side, setSide] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<{ id: ActionId; value: string }>({ id: "website", value: "" });
  const [customer, setCustomer] = useState({ name: "", business: "", phone: "", email: "", city: "", notes: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ order: Order; blob: Blob; name: string; result: DeliveryResult } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef(new Map<string, HTMLImageElement>());
  const [, bump] = useState(0);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const form = formById(sel.form);
  const { w, h } = useMemo(() => canvasSize(form), [form]);
  const q = useMemo(() => quote(sel), [sel]);
  const current: SideDesign = design[side];
  const layer = current.layers.find((l) => l.id === selected) ?? null;

  const lookup = useCallback((src: string) => images.current.get(src), []);

  // Draw on every change.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    drawSide(ctx, form, current, w, h, lookup);
    if (layer) {
      ctx.save();
      ctx.setLineDash([14, 10]);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#00a3ff";
      const b = layerBox(layer, w, h);
      ctx.strokeRect(b.cx - b.hw - 8, b.cy - b.hh - 8, b.hw * 2 + 16, b.hh * 2 + 16);
      ctx.restore();
    }
  }, [w, h, form, current, layer, lookup]);

  const patchSide = (fn: (s: SideDesign) => SideDesign) => setDesign((d) => ({ ...d, [side]: fn(d[side]) }));
  const patchLayer = (id: string, patch: Partial<Layer>) =>
    patchSide((s) => ({ ...s, layers: s.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)) }));
  const addLayer = (l: Layer) => {
    patchSide((s) => ({ ...s, layers: [...s.layers, l] }));
    setSelected(l.id);
  };

  const toCanvas = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
  };
  const onDown = (e: React.PointerEvent) => {
    const p = toCanvas(e);
    const i = hitTest(current, p.x, p.y, w, h);
    if (i < 0) return setSelected(null);
    const l = current.layers[i]!;
    setSelected(l.id);
    drag.current = { id: l.id, dx: l.x * w - p.x, dy: l.y * h - p.y };
    canvasRef.current!.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = toCanvas(e);
    const { id, dx, dy } = drag.current;
    patchSide((s) => ({ ...s, layers: s.layers.map((l) => (l.id === id ? moveLayer(l, (p.x + dx) / w, (p.y + dy) / h) : l)) }));
  };
  const onUp = () => {
    drag.current = null;
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) return setErrors(["Choose an image file (PNG, JPG or SVG)."]);
    try {
      const { src, img, ratio } = await loadImage(file);
      images.current.set(src, img);
      const lw = 0.3;
      addLayer({ id: newId(), kind: "image", src, x: 0.5, y: 0.5, w: lw, h: (lw * w) / ratio / h, rotate: 0 });
      bump((n) => n + 1);
      setErrors([]);
    } catch {
      setErrors(["That image could not be read. Try a PNG or JPG."]);
    }
  };

  const removeLayer = (id: string) => {
    patchSide((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) }));
    setSelected(null);
  };

  const toggleExtra = (e: ExtraId) =>
    setSel((s) => ({ ...s, extras: s.extras.includes(e) ? s.extras.filter((x) => x !== e) : [...s.extras, e] }));

  const renderPng = (d: SideDesign): string => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    drawSide(ctx, form, d, w, h, lookup);
    return c.toDataURL("image/png");
  };

  const submit = async () => {
    const now = new Date();
    const order: Order = {
      ref: orderRef(now, crypto.getRandomValues(new Uint8Array(4))),
      createdAt: now.toISOString(),
      selection: sel,
      action,
      customer,
    };
    const errs = validateOrder(order);
    setErrors(errs);
    if (errs.length) return;
    setBusy(true);
    try {
      const blob = await buildOrderPdf(order, { front: renderPng(design.front), back: renderPng(design.back) });
      const name = pdfFileName(order);
      const result = await deliver(order, blob, name);
      setDone({ order, blob, name, result });
    } catch {
      setErrors(["Something went wrong building your PDF. Please try again, or message us on WhatsApp."]);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (!done) return;
    const url = URL.createObjectURL(done.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = done.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // ------------------------------------------------------------------ done
  if (done) {
    const direct = done.result.via === "direct";
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-primary text-black"><Check /></div>
        <h2 className="font-display text-3xl font-bold text-black dark:text-white">Order {done.order.ref}</h2>
        <p className="mt-3 text-black/70 dark:text-white/70">
          {direct && "Your order sheet has been sent to OKHub on WhatsApp. We will reply on the number you gave to confirm and arrange payment."}
          {done.result.via === "share" && "Your order sheet was shared. If you did not send it to OKHub's WhatsApp, use the button below."}
          {done.result.via === "whatsapp-link" && "Your PDF has downloaded. Press the button below, then attach the PDF in the chat and send it to finish the order."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {done.result.via === "whatsapp-link" && (
            <a href={done.result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-[#fafafa]">
              <MessageCircle size={18} /> Open WhatsApp
            </a>
          )}
          <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-full border border-black/20 px-6 py-3 font-semibold text-black dark:border-white/30 dark:text-white">
            <Download size={18} /> Download your PDF
          </button>
        </div>
        <p className="mt-6 text-sm text-black/55 dark:text-white/55">Total {naira(quote(done.order.selection).total)}. Do not pay until we confirm.</p>
      </div>
    );
  }

  // ------------------------------------------------------------------ steps
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div>
        <ol className="mb-6 flex gap-2" aria-label="Order steps">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button type="button" onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}
                className={`w-full rounded-full px-3 py-2 text-sm font-semibold transition ${i === step ? "bg-black text-[#fafafa] dark:bg-gold-primary dark:text-black" : "bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60"}`}>
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>

        {errors.length > 0 && (
          <ul role="alert" className="mb-6 space-y-1 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}

        {step === 0 && (
          <section className="space-y-8">
            <div>
              <span className={LABEL}>Type</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {FORMS.map((f) => (
                  <button key={f.id} type="button" className={CHIP_BTN(sel.form === f.id)} onClick={() => setSel({ ...sel, form: f.id as FormId, qty: Math.max(sel.qty, f.minQty) })}>
                    <span className="block font-semibold">{f.label}</span>
                    <span className="block text-sm opacity-70">{f.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className={LABEL}>Chip</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHIPS.map((c) => (
                  <button key={c.id} type="button" className={CHIP_BTN(sel.chip === c.id)} onClick={() => setSel({ ...sel, chip: c.id as ChipId })}>
                    <span className="block font-semibold">{c.label}</span>
                    <span className="block text-xs opacity-70">{c.bytes} bytes</span>
                    <span className="mt-1 block text-sm opacity-70">{c.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className={LABEL} htmlFor="qty">Quantity</label>
                <input id="qty" type="number" inputMode="numeric" min={form.minQty} max={MAX_QTY} className={INPUT} value={sel.qty}
                  onChange={(e) => setSel({ ...sel, qty: Number(e.target.value) })} />
                <p className="mt-1 text-xs text-black/50 dark:text-white/50">Minimum {form.minQty}</p>
              </div>
              <div>
                <label className={LABEL} htmlFor="finish">Finish</label>
                <select id="finish" className={INPUT} value={sel.finish} onChange={(e) => setSel({ ...sel, finish: e.target.value as FinishId })}>
                  {FINISHES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="sides">Printing</label>
                <select id="sides" className={INPUT} value={sel.sides} onChange={(e) => setSel({ ...sel, sides: e.target.value as Selection["sides"] })}>
                  <option value="single">Front only</option>
                  <option value="double">Front and back</option>
                </select>
              </div>
            </div>
            <div>
              <span className={LABEL}>Extras</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {EXTRAS.map((x) => (
                  <button key={x.id} type="button" className={CHIP_BTN(sel.extras.includes(x.id))} aria-pressed={sel.extras.includes(x.id)} onClick={() => toggleExtra(x.id)}>
                    <span className="block font-semibold">{x.label}</span>
                    <span className="block text-sm opacity-70">{x.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className={CHIP_BTN(sel.designBy === "self")} onClick={() => setSel({ ...sel, designBy: "self" })}>
                <span className="block font-semibold">I will design it here</span>
                <span className="block text-sm opacity-70">Free. Drag, type, upload your logo.</span>
              </button>
              <button type="button" className={CHIP_BTN(sel.designBy === "okhub")} onClick={() => setSel({ ...sel, designBy: "okhub" })}>
                <span className="block font-semibold">OKHub designs it for me</span>
                <span className="block text-sm opacity-70">Our designer follows your notes and logo. One-off fee.</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["front", "back"] as const).map((s) => (
                <button key={s} type="button" onClick={() => { setSide(s); setSelected(null); }}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${side === s ? "bg-black text-[#fafafa] dark:bg-gold-primary dark:text-black" : "bg-black/5 dark:bg-white/10"}`}>
                  {s === "front" ? "Front" : "Back"}
                </button>
              ))}
              <span className="ml-auto text-xs text-black/50 dark:text-white/50">Templates:</span>
              {TEMPLATES.map((t) => (
                <button key={t.name} type="button" onClick={() => { setDesign(t.build()); setSelected(null); }} className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-medium dark:border-white/20">{t.name}</button>
              ))}
            </div>

            <div className="rounded-3xl bg-[repeating-conic-gradient(#e5e5e5_0_25%,#f5f5f5_0_50%)] bg-[length:20px_20px] p-4 sm:p-8 dark:bg-[repeating-conic-gradient(#262626_0_25%,#1c1c1c_0_50%)]">
              <canvas
                ref={canvasRef}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                role="img" aria-label={`${side} of the card. Drag items to move them.`}
                className="mx-auto block h-auto w-full max-w-xl touch-none cursor-move rounded-2xl shadow-2xl"
                style={{ aspectRatio: `${w} / ${h}`, maxWidth: form.shape === "circle" ? "20rem" : undefined }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
                onClick={() => addLayer({ id: newId(), kind: "text", text: "New text", x: 0.5, y: 0.5, size: 0.08, color: "#ffffff", weight: "700", font: "sans", align: "center", rotate: 0 })}><Type size={16} /> Text</button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20">
                <ImagePlus size={16} /> Logo or image
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
                onClick={() => addLayer({ id: newId(), kind: "shape", shape: "rect", x: 0.5, y: 0.5, w: 0.4, h: 0.2, color: "#ffd700", opacity: 1, rotate: 0 })}><Square size={16} /> Box</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
                onClick={() => addLayer({ id: newId(), kind: "shape", shape: "circle", x: 0.5, y: 0.5, w: 0.25, h: 0.4, color: "#ffd700", opacity: 1, rotate: 0 })}><Circle size={16} /> Circle</button>
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
                onClick={() => addLayer({ id: newId(), kind: "nfc", x: 0.5, y: 0.5, size: 0.12, color: "#ffd700", rotate: 0 })}><Radio size={16} /> NFC symbol</button>
            </div>

            <div className="grid gap-5 rounded-2xl border border-black/10 p-4 sm:grid-cols-2 dark:border-white/10">
              <fieldset className="space-y-3">
                <legend className={LABEL}>{side === "front" ? "Front" : "Back"} background</legend>
                <div className="flex gap-2">
                  <button type="button" className={CHIP_BTN(current.fill.kind === "solid") + " flex-1 text-center text-sm"} onClick={() => patchSide((s) => ({ ...s, fill: { kind: "solid", color: s.fill.kind === "solid" ? s.fill.color : s.fill.from } }))}>Solid</button>
                  <button type="button" className={CHIP_BTN(current.fill.kind === "gradient") + " flex-1 text-center text-sm"} onClick={() => patchSide((s) => ({ ...s, fill: { kind: "gradient", from: s.fill.kind === "solid" ? s.fill.color : s.fill.from, to: "#000000", angle: 135 } }))}>Gradient</button>
                </div>
                {current.fill.kind === "solid" ? (
                  <input aria-label="Background colour" type="color" className="h-10 w-full rounded-lg" value={current.fill.color} onChange={(e) => patchSide((s) => ({ ...s, fill: { kind: "solid", color: e.target.value } }))} />
                ) : (
                  <div className="flex gap-2">
                    <input aria-label="Gradient start" type="color" className="h-10 flex-1 rounded-lg" value={current.fill.from} onChange={(e) => patchSide((s) => (s.fill.kind === "gradient" ? { ...s, fill: { ...s.fill, from: e.target.value } } : s))} />
                    <input aria-label="Gradient end" type="color" className="h-10 flex-1 rounded-lg" value={current.fill.to} onChange={(e) => patchSide((s) => (s.fill.kind === "gradient" ? { ...s, fill: { ...s.fill, to: e.target.value } } : s))} />
                    <input aria-label="Gradient angle" type="range" min={0} max={360} className="flex-1" value={current.fill.angle} onChange={(e) => patchSide((s) => (s.fill.kind === "gradient" ? { ...s, fill: { ...s.fill, angle: Number(e.target.value) } } : s))} />
                  </div>
                )}
              </fieldset>

              <fieldset className="space-y-3" disabled={!layer}>
                <legend className={LABEL}>{layer ? `Selected ${layer.kind}` : "Tap an item to edit it"}</legend>
                {layer?.kind === "text" && (
                  <>
                    <textarea aria-label="Text" rows={2} className={INPUT} value={layer.text} onChange={(e) => patchLayer(layer.id, { text: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <select aria-label="Font" className={INPUT} value={layer.font} onChange={(e) => patchLayer(layer.id, { font: e.target.value as FontId })}>
                        {(Object.keys(FONT_STACKS) as FontId[]).map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <select aria-label="Weight" className={INPUT} value={layer.weight} onChange={(e) => patchLayer(layer.id, { weight: e.target.value as "400" | "700" })}>
                        <option value="400">Regular</option><option value="700">Bold</option>
                      </select>
                      <select aria-label="Alignment" className={INPUT} value={layer.align} onChange={(e) => patchLayer(layer.id, { align: e.target.value as "left" | "center" | "right" })}>
                        <option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option>
                      </select>
                      <input aria-label="Colour" type="color" className="h-[2.6rem] w-full rounded-lg" value={layer.color} onChange={(e) => patchLayer(layer.id, { color: e.target.value })} />
                    </div>
                    <label className="block text-xs">Size<input type="range" min={0.03} max={0.25} step={0.005} className="w-full" value={layer.size} onChange={(e) => patchLayer(layer.id, { size: Number(e.target.value) })} /></label>
                  </>
                )}
                {layer?.kind === "shape" && (
                  <>
                    <input aria-label="Colour" type="color" className="h-10 w-full rounded-lg" value={layer.color} onChange={(e) => patchLayer(layer.id, { color: e.target.value })} />
                    <label className="block text-xs">Width<input type="range" min={0.05} max={1} step={0.01} className="w-full" value={layer.w} onChange={(e) => patchLayer(layer.id, { w: Number(e.target.value) })} /></label>
                    <label className="block text-xs">Height<input type="range" min={0.05} max={1} step={0.01} className="w-full" value={layer.h} onChange={(e) => patchLayer(layer.id, { h: Number(e.target.value) })} /></label>
                    <label className="block text-xs">Opacity<input type="range" min={0.1} max={1} step={0.05} className="w-full" value={layer.opacity} onChange={(e) => patchLayer(layer.id, { opacity: Number(e.target.value) })} /></label>
                  </>
                )}
                {layer?.kind === "image" && (
                  <label className="block text-xs">Size<input type="range" min={0.05} max={1} step={0.01} className="w-full" value={layer.w}
                    onChange={(e) => { const nw = Number(e.target.value); patchLayer(layer.id, { w: nw, h: (layer.h / layer.w) * nw }); }} /></label>
                )}
                {layer?.kind === "nfc" && (
                  <>
                    <input aria-label="Colour" type="color" className="h-10 w-full rounded-lg" value={layer.color} onChange={(e) => patchLayer(layer.id, { color: e.target.value })} />
                    <label className="block text-xs">Size<input type="range" min={0.05} max={0.4} step={0.005} className="w-full" value={layer.size} onChange={(e) => patchLayer(layer.id, { size: Number(e.target.value) })} /></label>
                  </>
                )}
                {layer && (
                  <div className="flex items-center gap-2">
                    <label className="flex-1 text-xs">Rotate<input type="range" min={-180} max={180} className="w-full" value={layer.rotate} onChange={(e) => patchLayer(layer.id, { rotate: Number(e.target.value) })} /></label>
                    <button type="button" aria-label="Delete item" onClick={() => removeLayer(layer.id)} className="rounded-full border border-red-500/40 p-2 text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}
              </fieldset>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <div>
              <label className={LABEL} htmlFor="action">When someone taps the card</label>
              <select id="action" className={INPUT} value={action.id} onChange={(e) => setAction({ ...action, id: e.target.value as ActionId })}>
                {ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="avalue">Details</label>
              <textarea id="avalue" rows={4} className={INPUT} placeholder={ACTIONS.find((a) => a.id === action.id)?.placeholder} value={action.value} onChange={(e) => setAction({ ...action, value: e.target.value })} />
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">We programme every chip with this before it ships.</p>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={LABEL} htmlFor="cn">Your name</label><input id="cn" autoComplete="name" className={INPUT} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
              <div><label className={LABEL} htmlFor="cb">Business (optional)</label><input id="cb" autoComplete="organization" className={INPUT} value={customer.business} onChange={(e) => setCustomer({ ...customer, business: e.target.value })} /></div>
              <div><label className={LABEL} htmlFor="cp">Phone / WhatsApp</label><input id="cp" type="tel" autoComplete="tel" className={INPUT} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></div>
              <div><label className={LABEL} htmlFor="ce">Email (optional)</label><input id="ce" type="email" autoComplete="email" className={INPUT} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
              <div><label className={LABEL} htmlFor="cc">City</label><input id="cc" autoComplete="address-level2" className={INPUT} value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} /></div>
              <div>
                <label className={LABEL} htmlFor="cd">Delivery</label>
                <select id="cd" className={INPUT} value={sel.delivery} onChange={(e) => setSel({ ...sel, delivery: e.target.value as DeliveryId })}>
                  {DELIVERY.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div><label className={LABEL} htmlFor="cno">Anything else we should know</label><textarea id="cno" rows={3} className={INPUT} value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} /></div>
            <button type="button" disabled={busy} onClick={() => void submit()} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-lg font-semibold text-[#fafafa] disabled:opacity-60 dark:bg-gold-primary dark:text-black">
              {busy ? <><Loader2 className="animate-spin" size={20} /> Building your PDF</> : <><MessageCircle size={20} /> Send my order to OKHub</>}
            </button>
            <p className="text-center text-xs text-black/50 dark:text-white/50">You get the same PDF to keep. Nothing is charged until we confirm on WhatsApp.</p>
          </section>
        )}

        <div className="mt-8 flex justify-between">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-full border border-black/20 px-5 py-2.5 font-semibold disabled:opacity-30 dark:border-white/30">Back</button>
          {step < 3 && <button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-black px-6 py-2.5 font-semibold text-[#fafafa] dark:bg-gold-primary dark:text-black">Next</button>}
        </div>
      </div>

      <aside aria-label="Price" className="h-fit rounded-3xl border border-black/10 bg-white p-5 shadow-sm lg:sticky lg:top-28 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50 dark:text-white/50">Your price</p>
        <p className="mt-1 font-display text-4xl font-bold text-black dark:text-white" aria-live="polite">{naira(q.total)}</p>
        <p className="text-sm text-black/60 dark:text-white/60">about {naira(q.perCard)} per card</p>
        <ul className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm dark:border-white/10">
          {q.lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-3">
              <span className="text-black/75 dark:text-white/75">{l.label}</span>
              <span className="whitespace-nowrap font-medium text-black dark:text-white">{l.amount < 0 ? `-${naira(-l.amount)}` : naira(l.amount)}</span>
            </li>
          ))}
        </ul>
        {q.problems.map((p) => <p key={p} className="mt-3 text-xs text-red-600 dark:text-red-300">{p}</p>)}
        <p className="mt-4 text-xs text-black/50 dark:text-white/50">Bigger orders cost less per card. 50 or more skips the setup fee.</p>
      </aside>
    </div>
  );
}
