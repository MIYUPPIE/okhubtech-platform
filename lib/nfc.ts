/**
 * NFC card ordering: the catalogue, the pricing engine and the order summary.
 *
 * Single source for /nfc, the PDF and the WhatsApp message. Everything here is
 * pure and deterministic (no Date.now, no Math.random, no DOM) so
 * scripts/verify-nfc.mjs can pin every number.
 *
 * PRICES: whole naira, per-form quantity price breaks anchored to Nigerian
 * listings seen in Nov 2026 (Quikprint metal NFC N11,500 / N9,500 / N6,000 at
 * 50 / 100 / 250+, Hazken printed PVC about N3,000 a card per 100, Jumia blank
 * NFC about N500). Edit PRICING below and nothing else; the page, the PDF and
 * the gate follow. The gate fails on a fractional price or a price break that
 * costs more than the one before it.
 *
 * NDEF: memoryReport() sizes what each tap action writes to the chip, byte for
 * byte, and checks it against NTAG213/215/216 so an order that cannot fit is
 * refused before it is sent.
 *
 * No em dashes anywhere in this file: scripts/verify-no-emdash.mjs.
 */

// The explicit .ts extension lets scripts/verify-nfc.mjs load this file under Node's type stripping.
import { whatsappChatUrl } from "./contact.ts";

export type FormId = "pvc-card" | "wood-card" | "metal-card" | "keyfob" | "sticker" | "wristband";
export type ChipId = "ntag213" | "ntag215" | "ntag216";
export type Sides = "single" | "double";
export type DeliveryId = "pickup" | "ibadan" | "outside";
export type ActionId = "website" | "contact" | "whatsapp" | "wifi" | "social" | "payment" | "text" | "other";
export type ExtraId = "serial" | "hole" | "magstripe";
export type DesignBy = "self" | "okhub";

export type Form = {
  id: FormId;
  label: string;
  blurb: string;
  /** Printed face size in millimetres. */
  widthMm: number;
  heightMm: number;
  shape: "rect" | "circle";
  /** Corner radius in mm for rect shapes. */
  radiusMm: number;
  /** Fewest units we will make of this form. */
  minQty: number;
};

export const FORMS: readonly Form[] = [
  { id: "pvc-card", label: "PVC card", blurb: "Standard bank-card size. The everyday choice.", widthMm: 85.6, heightMm: 54, shape: "rect", radiusMm: 3.2, minQty: 5 },
  { id: "wood-card", label: "Wooden card", blurb: "Laser-engraved bamboo. Warm, premium feel.", widthMm: 85.6, heightMm: 54, shape: "rect", radiusMm: 3.2, minQty: 5 },
  { id: "metal-card", label: "Metal card", blurb: "Brushed steel, engraved. Executive grade.", widthMm: 85.6, heightMm: 54, shape: "rect", radiusMm: 3.2, minQty: 2 },
  { id: "keyfob", label: "Key fob", blurb: "Hangs on a key ring. Access control and loyalty.", widthMm: 40, heightMm: 30, shape: "rect", radiusMm: 5, minQty: 10 },
  { id: "sticker", label: "Round sticker", blurb: "35 mm adhesive tag for phones, desks and products.", widthMm: 35, heightMm: 35, shape: "circle", radiusMm: 0, minQty: 10 },
  { id: "wristband", label: "Wristband", blurb: "Silicone band for events and gyms.", widthMm: 60, heightMm: 20, shape: "rect", radiusMm: 4, minQty: 20 },
];

export type Chip = { id: ChipId; label: string; bytes: number; blurb: string };

export const CHIPS: readonly Chip[] = [
  { id: "ntag213", label: "NTAG213", bytes: 144, blurb: "One link or a short text. Cheapest." },
  { id: "ntag215", label: "NTAG215", bytes: 504, blurb: "A full contact card or a longer message." },
  { id: "ntag216", label: "NTAG216", bytes: 888, blurb: "Most memory. Rich contact cards and Wi-Fi." },
];

export type ActionField = { key: string; label: string; placeholder: string; optional?: boolean };

export const ACTIONS: readonly { id: ActionId; label: string; placeholder: string; fields?: readonly ActionField[] }[] = [
  { id: "website", label: "Open a website", placeholder: "https://yourbusiness.com" },
  {
    id: "contact", label: "Save my contact", placeholder: "",
    fields: [
      { key: "name", label: "Full name", placeholder: "Ada Obi" },
      { key: "org", label: "Company", placeholder: "Obi Ventures", optional: true },
      { key: "title", label: "Job title", placeholder: "Managing Director", optional: true },
      { key: "phone", label: "Phone", placeholder: "+234 803 123 4567", optional: true },
      { key: "email", label: "Email", placeholder: "ada@obi.com", optional: true },
      { key: "url", label: "Website", placeholder: "https://obi.com", optional: true },
    ],
  },
  { id: "whatsapp", label: "Start a WhatsApp chat", placeholder: "+234 801 234 5678" },
  {
    id: "wifi", label: "Join a Wi-Fi network", placeholder: "",
    fields: [
      { key: "ssid", label: "Network name", placeholder: "Obi Guest" },
      { key: "password", label: "Password (blank if open)", placeholder: "welcome2026", optional: true },
    ],
  },
  { id: "social", label: "Open a social profile", placeholder: "https://instagram.com/yourhandle" },
  { id: "payment", label: "Show payment details", placeholder: "Bank, account name, account number" },
  { id: "text", label: "Show a text message", placeholder: "The message people see when they tap" },
  { id: "other", label: "Something else (we programme it for you)", placeholder: "Describe what should happen on tap" },
];

/** Which forms can take each extra. A stripe needs a flat card body; a hole needs a card or fob that is not already drilled. */
export const EXTRAS: readonly { id: ExtraId; label: string; blurb: string; forms: readonly FormId[] }[] = [
  { id: "serial", label: "Printed serial numbers", blurb: "A unique number on every card, for tracking.", forms: ["pvc-card", "wood-card", "metal-card", "keyfob", "sticker", "wristband"] },
  { id: "hole", label: "Punched hole", blurb: "For lanyards. Slot or round hole near the top edge.", forms: ["pvc-card", "wood-card", "metal-card"] },
  { id: "magstripe", label: "Magnetic stripe", blurb: "A stripe on the back that swipe readers can read, as well as the tap chip. You give us the number to encode.", forms: ["pvc-card"] },
];

/** Extras that are real for this form, de-duplicated. Anything else the selection carries is ignored. */
export const activeExtras = (form: FormId, extras: readonly ExtraId[]): ExtraId[] =>
  [...new Set(extras)].filter((e) => EXTRAS.find((x) => x.id === e)?.forms.includes(form));

/** Track 2 holds digits only, 37 of them at most. */
export const STRIPE_MAX = 37;


export const DELIVERY: readonly { id: DeliveryId; label: string }[] = [
  { id: "pickup", label: "Pick up in Ibadan" },
  { id: "ibadan", label: "Delivery within Ibadan" },
  { id: "outside", label: "Delivery outside Ibadan" },
];

/** Shown on the page, the PDF and the WhatsApp message. */
export const DELIVERY_TIME = "Delivery takes 2-5 working days.";
export const DELIVERY_BACKORDER = "If the product is not available, delivery takes 15-21 days after payment.";
export const DELIVERY_FEE_NOTE = "The delivery fee is not in the total. OKHub will tell you the fee before you pay.";


/** Whole naira. Edit here; everything else follows. */
export const PRICING = {
  /**
   * Per-card price by quantity, before chip, sides and extras. Highest
   * minQty not above the order wins. Must start at minQty 1 and never rise.
   */
  breaks: {
    "pvc-card": [{ minQty: 1, unit: 9000 }, { minQty: 25, unit: 7500 }, { minQty: 50, unit: 6000 }, { minQty: 100, unit: 5000 }, { minQty: 250, unit: 4200 }, { minQty: 500, unit: 3800 }],
    "wood-card": [{ minQty: 1, unit: 14000 }, { minQty: 25, unit: 12000 }, { minQty: 50, unit: 10000 }, { minQty: 100, unit: 8500 }, { minQty: 250, unit: 7500 }, { minQty: 500, unit: 7000 }],
    "metal-card": [{ minQty: 1, unit: 14000 }, { minQty: 50, unit: 11500 }, { minQty: 100, unit: 9500 }, { minQty: 250, unit: 6000 }],
    keyfob: [{ minQty: 1, unit: 6000 }, { minQty: 25, unit: 5000 }, { minQty: 50, unit: 4000 }, { minQty: 100, unit: 3200 }, { minQty: 250, unit: 2800 }, { minQty: 500, unit: 2500 }],
    sticker: [{ minQty: 1, unit: 1500 }, { minQty: 25, unit: 1200 }, { minQty: 50, unit: 1000 }, { minQty: 100, unit: 800 }, { minQty: 250, unit: 700 }, { minQty: 500, unit: 600 }],
    wristband: [{ minQty: 1, unit: 3500 }, { minQty: 25, unit: 3200 }, { minQty: 50, unit: 3000 }, { minQty: 100, unit: 2800 }, { minQty: 250, unit: 2600 }, { minQty: 500, unit: 2500 }],
  } satisfies Record<FormId, readonly { minQty: number; unit: number }[]>,
  /** Per unit, added to the break price. */
  chip: { ntag213: 0, ntag215: 300, ntag216: 700 } satisfies Record<ChipId, number>,
  /** Per unit, for printing the back as well as the front. */
  doubleSided: 300,
  extra: { serial: 150, hole: 100, magstripe: 500 } satisfies Record<ExtraId, number>,
  /** One-off, covers print plates and setup. Waived from SETUP_WAIVED_FROM units. */
  setupFee: 3000,
  /** One-off, when OKHub does the artwork instead of the customer. */
  designService: 7500,
} as const;

export const SETUP_WAIVED_FROM = 50;
export const MAX_QTY = 10000;

export type Selection = {
  form: FormId;
  chip: ChipId;
  sides: Sides;
  qty: number;
  extras: readonly ExtraId[];
  /** Digits to encode on the magnetic stripe, when that extra is chosen. */
  stripeData: string;
  designBy: DesignBy;
  delivery: DeliveryId;
};

export type PriceLine = { label: string; amount: number; note?: string; /** Per-unit price, formatted by the caller (the PDF cannot print the naira sign). */ each?: number;
  /** Not yet priced: shown as "to be confirmed" and counted as 0 in the total. */
  tbc?: boolean };

export type Quote = {
  qty: number;
  unitPrice: number;
  lines: PriceLine[];
  /** True when the order is delivered: the total then excludes a fee OKHub will communicate. */
  deliveryTbc: boolean;
  /** Every line summed, in naira. */
  total: number;
  /** total / qty rounded to the nearest naira, for display. */
  perCard: number;
  problems: string[];
};

export const formById = (id: FormId): Form => FORMS.find((f) => f.id === id) ?? FORMS[0]!;
export const chipById = (id: ChipId): Chip => CHIPS.find((c) => c.id === id) ?? CHIPS[0]!;

export const naira = (n: number): string => `₦${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
/** For the PDF, whose built-in fonts have no naira glyph. */
export const nairaPlain = (n: number): string => `NGN ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

/** The price-break unit price for this form at this quantity. */
export const breakPrice = (form: FormId, qty: number): number => {
  let unit = PRICING.breaks[form][0]!.unit;
  for (const b of PRICING.breaks[form]) if (qty >= b.minQty) unit = b.unit;
  return unit;
};

/** Per-card price at the selection's quantity: break price plus chip, sides and extras. */
export const unitPrice = (s: Selection): number =>
  breakPrice(s.form, s.qty) +
  PRICING.chip[s.chip] +
  (s.sides === "double" ? PRICING.doubleSided : 0) +
  activeExtras(s.form, s.extras).reduce((sum, e) => sum + PRICING.extra[e], 0);

/**
 * The whole quote. An invalid quantity still returns lines (priced at the
 * nearest valid quantity) with `problems` filled in, so the UI can keep
 * showing a number while telling the customer what to fix.
 */
export function quote(s: Selection): Quote {
  const form = formById(s.form);
  const problems: string[] = [];
  let qty = Number.isFinite(s.qty) ? Math.floor(s.qty) : 0;
  if (qty < form.minQty) {
    problems.push(`Minimum order for ${form.label.toLowerCase()} is ${form.minQty}.`);
    qty = form.minQty;
  }
  if (qty > MAX_QTY) {
    problems.push(`For more than ${MAX_QTY.toLocaleString("en-NG")} units, message us for a custom quote.`);
    qty = MAX_QTY;
  }

  const unit = unitPrice({ ...s, qty });
  const subtotal = unit * qty;

  const lines: PriceLine[] = [
    { label: `${form.label} x ${qty}`, amount: subtotal, each: unit },
  ];
  if (qty < SETUP_WAIVED_FROM) lines.push({ label: "Print setup", amount: PRICING.setupFee, note: `Free from ${SETUP_WAIVED_FROM} units` });
  if (s.designBy === "okhub") lines.push({ label: "OKHub designs it for you", amount: PRICING.designService });
  const deliveryTbc = s.delivery !== "pickup";
  lines.push({
    label: DELIVERY.find((d) => d.id === s.delivery)?.label ?? "Delivery",
    amount: 0,
    ...(deliveryTbc ? { tbc: true, note: "Fee communicated by OKHub" } : {}),
  });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { qty, unitPrice: unit, lines, deliveryTbc, total, perCard: Math.round(total / qty), problems };
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export type Customer = {
  name: string;
  business: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
};

/** `value` for single-field actions, `fields` for contact and wifi. */
export type TapAction = { id: ActionId; value: string; fields?: Record<string, string> };

export type Order = {
  ref: string;
  createdAt: string;
  selection: Selection;
  /** In tap order: phones act on the first one. */
  actions: TapAction[];
  customer: Customer;
};

/** NFC-YYMMDD-XXXX. Date and random bytes are injected so tests are exact. */
export function orderRef(date: Date, bytes: ArrayLike<number>): string {
  const yy = String(date.getUTCFullYear()).slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  // No 0, 1, I, O: easy to read out over a call.
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let tail = "";
  for (let i = 0; i < 4; i++) tail += alphabet[(bytes[i] ?? 0) % alphabet.length];
  return `NFC-${yy}${mm}${dd}-${tail}`;
}

/** Digits only, Nigerian numbers normalised to 234XXXXXXXXXX. Returns null if it cannot be a phone number. */
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = `234${d.slice(1)}`;
  if (d.length === 10 && /^[789]/.test(d)) d = `234${d}`;
  return d.length >= 11 && d.length <= 15 ? d : null;
}

// ---------------------------------------------------------------------------
// NDEF: what actually gets written to the chip, byte for byte
// ---------------------------------------------------------------------------

const utf8 = (t: string): number => new TextEncoder().encode(t).length;

/** NFC Forum URI identifier codes. A matching prefix is stored as one byte. */
const URI_PREFIXES: readonly [string, number][] = [
  ["http://www.", 0x01],
  ["https://www.", 0x02],
  ["http://", 0x03],
  ["https://", 0x04],
  ["tel:", 0x05],
  ["mailto:", 0x06],
];

/** One NDEF record: 1 header + type length + payload length (1 byte, or 4 from 256) + type + payload. */
export const ndefRecordBytes = (typeLen: number, payloadLen: number): number =>
  (payloadLen < 256 ? 3 : 6) + typeLen + payloadLen;

export const uriRecordBytes = (uri: string): number => {
  const hit = URI_PREFIXES.find(([p]) => uri.toLowerCase().startsWith(p));
  return ndefRecordBytes(1, 1 + utf8(hit ? uri.slice(hit[0].length) : uri));
};

/** Well-known Text record: status byte, 2-byte language code, UTF-8 text. */
export const textRecordBytes = (text: string): number => ndefRecordBytes(1, 3 + utf8(text));

const vEsc = (v: string): string => v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** vCard 3.0, CRLF line endings, only the lines that have content. */
export function vCard(f: Record<string, string>): string {
  const g = (k: string): string => (f[k] ?? "").trim();
  const name = g("name");
  const parts = name.split(/\s+/);
  const family = parts.length > 1 ? parts[parts.length - 1]! : "";
  const given = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${vEsc(family)};${vEsc(given)};;;`, `FN:${vEsc(name)}`];
  if (g("org")) lines.push(`ORG:${vEsc(g("org"))}`);
  if (g("title")) lines.push(`TITLE:${vEsc(g("title"))}`);
  if (g("phone")) lines.push(`TEL;TYPE=CELL:${g("phone").replace(/[^\d+]/g, "")}`);
  if (g("email")) lines.push(`EMAIL:${g("email")}`);
  if (g("url")) lines.push(`URL:${g("url")}`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

const MIME_VCARD = "text/vcard";
const MIME_WIFI = "application/vnd.wfa.wsc";

/**
 * Wi-Fi Simple Configuration payload: version (5) + credential TLV (4 + 35 + ssid + key),
 * where 35 covers network index, auth type, encryption type and the MAC address field.
 */
export const wifiPayloadBytes = (ssid: string, key: string): number => 44 + utf8(ssid) + utf8(key);

/** Bytes of NDEF records this action writes. "Something else" is not stored on the chip. */
export function actionBytes(a: TapAction): number {
  const f = a.fields ?? {};
  const v = a.value.trim();
  switch (a.id) {
    case "website":
    case "social":
      return v ? uriRecordBytes(v) : 0;
    case "whatsapp": {
      const n = normalisePhone(v);
      return n ? uriRecordBytes(whatsappChatUrl(n)) : 0;
    }
    case "contact":
      return (f.name ?? "").trim() ? ndefRecordBytes(utf8(MIME_VCARD), utf8(vCard(f))) : 0;
    case "wifi":
      return (f.ssid ?? "").trim() ? ndefRecordBytes(utf8(MIME_WIFI), wifiPayloadBytes((f.ssid ?? "").trim(), f.password ?? "")) : 0;
    case "payment":
    case "text":
      return v ? textRecordBytes(v) : 0;
    case "other":
      return 0;
  }
}

export type MemoryReport = {
  /** Bytes of NDEF records, per action in order. */
  perAction: number[];
  messageBytes: number;
  /** The tag stores the message inside a TLV: type, length (1 or 3 bytes) and a terminator. */
  overheadBytes: number;
  used: number;
  capacity: number;
  free: number;
  fits: boolean;
  /** Under 10% free: it fits but leaves no room to change anything. */
  tight: boolean;
  /** Smallest chip that holds it, or null when nothing we sell is big enough. */
  smallestChip: ChipId | null;
};

export function memoryReport(actions: readonly TapAction[], chip: ChipId): MemoryReport {
  const perAction = actions.map(actionBytes);
  const messageBytes = perAction.reduce((a, b) => a + b, 0);
  const overheadBytes = messageBytes === 0 ? 0 : messageBytes < 255 ? 3 : 5;
  const used = messageBytes + overheadBytes;
  const capacity = chipById(chip).bytes;
  const smallest = CHIPS.find((c) => c.bytes >= used);
  return {
    perAction, messageBytes, overheadBytes, used, capacity,
    free: capacity - used,
    fits: used <= capacity,
    tight: used <= capacity && capacity - used < capacity * 0.1,
    smallestChip: smallest ? smallest.id : null,
  };
}

/** Is this action filled in enough to write? Returns a message when not. */
export function actionProblem(a: TapAction): string | null {
  const label = ACTIONS.find((x) => x.id === a.id)?.label ?? a.id;
  const f = a.fields ?? {};
  const v = a.value.trim();
  switch (a.id) {
    case "contact":
      if (!(f.name ?? "").trim()) return `${label}: enter the name.`;
      if (!(f.phone ?? "").trim() && !(f.email ?? "").trim()) return `${label}: add a phone number or an email.`;
      if ((f.email ?? "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email!.trim())) return `${label}: that email does not look right.`;
      return null;
    case "wifi":
      return (f.ssid ?? "").trim() ? null : `${label}: enter the network name.`;
    case "website":
    case "social":
      return /^https?:\/\/\S+\.\S+/i.test(v) ? null : `${label}: start the link with https://`;
    case "whatsapp":
      return normalisePhone(v) ? null : `${label}: enter a valid phone number.`;
    default:
      return v.length >= 2 ? null : `${label}: tell us what it should say or do.`;
  }
}

export function validateOrder(o: Order): string[] {
  const errors: string[] = [];
  if (o.customer.name.trim().length < 2) errors.push("Enter your name.");
  if (normalisePhone(o.customer.phone) === null) errors.push("Enter a valid phone number, for example 0803 123 4567.");
  if (o.customer.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.customer.email.trim())) errors.push("That email address does not look right.");

  if (o.actions.length === 0) errors.push("Add at least one thing for the card to do when tapped.");
  for (const a of o.actions) {
    const problem = actionProblem(a);
    if (problem) errors.push(problem);
  }
  if (activeExtras(o.selection.form, o.selection.extras).includes("magstripe") && !/^\d{1,37}$/.test(o.selection.stripeData.trim())) {
    errors.push(`Magnetic stripe: enter the digits to encode (numbers only, up to ${STRIPE_MAX}).`);
  }
  const mem = memoryReport(o.actions, o.selection.chip);
  if (!mem.fits) {
    const chip = chipById(o.selection.chip);
    errors.push(
      mem.smallestChip
        ? `Your details need ${mem.used} bytes but ${chip.label} holds ${chip.bytes}. Choose ${chipById(mem.smallestChip).label} or remove something.`
        : `Your details need ${mem.used} bytes. The largest chip we sell holds ${CHIPS[CHIPS.length - 1]!.bytes}. Remove something.`,
    );
  }
  const q = quote(o.selection);
  errors.push(...q.problems);
  return errors;
}

/** Plain-text caption sent with the PDF. */
export function whatsappCaption(o: Order): string {
  const q = quote(o.selection);
  const f = formById(o.selection.form);
  const c = chipById(o.selection.chip);
  const mem = memoryReport(o.actions, o.selection.chip);
  return [
    `NEW NFC ORDER ${o.ref}`,
    `${o.customer.name}${o.customer.business ? ` (${o.customer.business})` : ""}`,
    `Phone: ${o.customer.phone}`,
    `${q.qty} x ${f.label}, ${c.label}, ${o.selection.sides} sided`,
    `Chip memory: ${mem.used} of ${mem.capacity} bytes, ${o.actions.length} item${o.actions.length === 1 ? "" : "s"}`,
    `Total: ${nairaPlain(q.total)}${q.deliveryTbc ? " (delivery fee to be confirmed)" : ""}`,
    `Delivery: ${DELIVERY.find((d) => d.id === o.selection.delivery)?.label ?? o.selection.delivery}`,
    "Full specification and artwork are in the attached PDF.",
  ].join("\n");
}

/** Opening message for the wa.me fallback, when no order endpoint is configured. */
export function whatsappFallbackText(o: Order): string {
  return `${whatsappCaption(o)}\n\nI am attaching the PDF now.`;
}
