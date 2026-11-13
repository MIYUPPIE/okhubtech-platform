/**
 * NFC card ordering: the catalogue, the pricing engine and the order summary.
 *
 * Single source for /nfc, the PDF and the WhatsApp message. Everything here is
 * pure and deterministic (no Date.now, no Math.random, no DOM) so
 * scripts/verify-nfc.mjs can pin every number.
 *
 * PRICES: these are launch defaults, in whole naira. Edit PRICING below and
 * nothing else; the page, the PDF and the gate all read from it. The gate
 * (scripts/verify-nfc.mjs) fails if a price is not a non-negative integer or if
 * a bigger order ever costs more per card than a smaller one.
 *
 * No em dashes anywhere in this file: scripts/verify-no-emdash.mjs.
 */

export type FormId = "pvc-card" | "wood-card" | "metal-card" | "keyfob" | "sticker" | "wristband";
export type ChipId = "ntag213" | "ntag215" | "ntag216";
export type FinishId = "gloss" | "matte" | "frosted" | "soft-touch";
export type Sides = "single" | "double";
export type DeliveryId = "pickup" | "ibadan" | "nationwide";
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

export const FINISHES: readonly { id: FinishId; label: string }[] = [
  { id: "gloss", label: "Gloss" },
  { id: "matte", label: "Matte" },
  { id: "frosted", label: "Frosted" },
  { id: "soft-touch", label: "Soft touch" },
];

export const ACTIONS: readonly { id: ActionId; label: string; placeholder: string }[] = [
  { id: "website", label: "Open a website", placeholder: "https://yourbusiness.com" },
  { id: "contact", label: "Save my contact", placeholder: "Full name, phone, email, company" },
  { id: "whatsapp", label: "Start a WhatsApp chat", placeholder: "+234 801 234 5678" },
  { id: "wifi", label: "Join a Wi-Fi network", placeholder: "Network name and password" },
  { id: "social", label: "Open a social profile", placeholder: "https://instagram.com/yourhandle" },
  { id: "payment", label: "Show payment details", placeholder: "Bank, account name, account number" },
  { id: "text", label: "Show a text message", placeholder: "The message people see when they tap" },
  { id: "other", label: "Something else", placeholder: "Describe what should happen on tap" },
];

export const EXTRAS: readonly { id: ExtraId; label: string; blurb: string }[] = [
  { id: "serial", label: "Printed serial numbers", blurb: "A unique number on every card, for tracking." },
  { id: "hole", label: "Punched hole", blurb: "For lanyards and key rings." },
  { id: "magstripe", label: "Magnetic stripe", blurb: "Works with legacy swipe readers." },
];

export const DELIVERY: readonly { id: DeliveryId; label: string }[] = [
  { id: "pickup", label: "Pick up in Ibadan" },
  { id: "ibadan", label: "Delivery within Ibadan" },
  { id: "nationwide", label: "Delivery anywhere in Nigeria" },
];

/** Whole naira. Edit here; everything else follows. */
export const PRICING = {
  /** Per unit, before chip, finish, sides and extras. */
  base: { "pvc-card": 3500, "wood-card": 6000, "metal-card": 15000, keyfob: 2500, sticker: 1200, wristband: 2800 } satisfies Record<FormId, number>,
  /** Per unit, added to the base. */
  chip: { ntag213: 0, ntag215: 600, ntag216: 1000 } satisfies Record<ChipId, number>,
  finish: { gloss: 0, matte: 200, frosted: 400, "soft-touch": 600 } satisfies Record<FinishId, number>,
  /** Per unit, for printing the back as well as the front. */
  doubleSided: 500,
  extra: { serial: 150, hole: 100, magstripe: 700 } satisfies Record<ExtraId, number>,
  /** One-off, covers print plates and setup. Waived from SETUP_WAIVED_FROM units. */
  setupFee: 3000,
  /** One-off, when OKHub does the artwork instead of the customer. */
  designService: 5000,
  /** One-off, per order. */
  delivery: { pickup: 0, ibadan: 1500, nationwide: 4000 } satisfies Record<DeliveryId, number>,
  /** Quantity discount on the unit subtotal. Highest minQty not above the order wins. */
  tiers: [
    { minQty: 1, pct: 0 },
    { minQty: 25, pct: 5 },
    { minQty: 50, pct: 10 },
    { minQty: 100, pct: 15 },
    { minQty: 250, pct: 20 },
    { minQty: 500, pct: 25 },
  ],
} as const;

export const SETUP_WAIVED_FROM = 50;
export const MAX_QTY = 10000;

export type Selection = {
  form: FormId;
  chip: ChipId;
  finish: FinishId;
  sides: Sides;
  qty: number;
  extras: readonly ExtraId[];
  designBy: DesignBy;
  delivery: DeliveryId;
};

export type PriceLine = { label: string; amount: number; note?: string; /** Per-unit price, formatted by the caller (the PDF cannot print the naira sign). */ each?: number };

export type Quote = {
  qty: number;
  unitPrice: number;
  /** Discount percentage applied to the unit subtotal. */
  discountPct: number;
  lines: PriceLine[];
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

export const tierFor = (qty: number): number => {
  let pct = 0;
  for (const t of PRICING.tiers) if (qty >= t.minQty) pct = t.pct;
  return pct;
};

/** Per-card price before the quantity discount. */
export const unitPrice = (s: Selection): number =>
  PRICING.base[s.form] +
  PRICING.chip[s.chip] +
  PRICING.finish[s.finish] +
  (s.sides === "double" ? PRICING.doubleSided : 0) +
  [...new Set(s.extras)].reduce((sum, e) => sum + PRICING.extra[e], 0);

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

  const unit = unitPrice(s);
  const subtotal = unit * qty;
  const pct = tierFor(qty);
  const discount = Math.round((subtotal * pct) / 100);

  const lines: PriceLine[] = [
    { label: `${form.label} x ${qty}`, amount: subtotal, each: unit },
  ];
  if (discount > 0) lines.push({ label: `Quantity discount (${pct}%)`, amount: -discount });
  if (qty < SETUP_WAIVED_FROM) lines.push({ label: "Print setup", amount: PRICING.setupFee, note: `Free from ${SETUP_WAIVED_FROM} units` });
  if (s.designBy === "okhub") lines.push({ label: "OKHub designs it for you", amount: PRICING.designService });
  const ship = PRICING.delivery[s.delivery];
  lines.push({ label: DELIVERY.find((d) => d.id === s.delivery)?.label ?? "Delivery", amount: ship });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { qty, unitPrice: unit, discountPct: pct, lines, total, perCard: Math.round(total / qty), problems };
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

export type TapAction = { id: ActionId; value: string };

export type Order = {
  ref: string;
  createdAt: string;
  selection: Selection;
  action: TapAction;
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

export function validateOrder(o: Order): string[] {
  const errors: string[] = [];
  if (o.customer.name.trim().length < 2) errors.push("Enter your name.");
  if (normalisePhone(o.customer.phone) === null) errors.push("Enter a valid phone number, for example 0803 123 4567.");
  if (o.customer.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.customer.email.trim())) errors.push("That email address does not look right.");
  if (o.action.value.trim().length < 2) errors.push("Tell us what the card should do when tapped.");
  if (o.action.id === "website" || o.action.id === "social") {
    if (!/^https?:\/\/\S+\.\S+/i.test(o.action.value.trim())) errors.push("Start the link with https://");
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
  return [
    `NEW NFC ORDER ${o.ref}`,
    `${o.customer.name}${o.customer.business ? ` (${o.customer.business})` : ""}`,
    `Phone: ${o.customer.phone}`,
    `${q.qty} x ${f.label}, ${c.label}, ${o.selection.sides} sided`,
    `Total: ${nairaPlain(q.total)}`,
    "Full specification and artwork are in the attached PDF.",
  ].join("\n");
}

/** Opening message for the wa.me fallback, when no order endpoint is configured. */
export function whatsappFallbackText(o: Order): string {
  return `${whatsappCaption(o)}\n\nI am attaching the PDF now.`;
}
