#!/usr/bin/env node
/**
 * Gate: the /nfc order page prices correctly and is wired end to end.
 *
 *  1. PRICE TABLE. Every price is a non-negative whole naira; each form's price
 *     breaks start at 1 unit and the unit price only falls.
 *  2. PRICE BEHAVIOUR. Hand-computed quotes match to the naira. A bigger order
 *     never costs more per card than a smaller one, for every form. Quantities
 *     under the minimum are priced at the minimum and flagged.
 *  3. NDEF. The bytes each tap action writes to the chip, hand-computed from the
 *     NFC Forum record layout, and the fit against NTAG213/215/216 to the byte.
 *  3b. ORDER. References are deterministic and use only unambiguous characters;
 *     phones normalise to 234...; validation catches missing contact details;
 *     the WhatsApp caption fits WhatsApp's 1024-character limit.
 *  4. DESIGNER. The renderer draws every layer kind, hit-testing returns the
 *     topmost layer, and the default templates sit inside the card.
 *  5. WIRING. /nfc is a registered route, linked from the footer (the header is full), and
 *     the browser's upload fields are exactly the ones services/nfc-orders reads.
 *
 * Deterministic and offline. Needs Node 22.6+ (type stripping).
 *   node scripts/verify-nfc.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

export async function loadSources(root) {
  const load = (p) => import(pathToFileURL(join(root, p)).href);
  return { nfc: await load("lib/nfc.ts"), design: await load("lib/nfc-design.ts") };
}

const BASE = { form: "pvc-card", chip: "ntag213", finish: "gloss", sides: "single", qty: 50, extras: [], designBy: "self", delivery: "pickup" };

export function checkPricing(nfc) {
  const out = [];
  const P = nfc.PRICING;
  const walk = (obj, path) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "number") {
        if (!Number.isInteger(v) || v < 0) out.push(`price ${path}.${k} = ${v} is not a non-negative whole naira`);
      } else if (v && typeof v === "object" && !Array.isArray(v)) walk(v, `${path}.${k}`);
    }
  };
  walk(P, "PRICING");
  for (const f of nfc.FORMS) {
    const br = P.breaks[f.id];
    if (!br?.length) { out.push(`form ${f.id} has no price breaks`); continue; }
    if (br[0].minQty !== 1) out.push(`${f.id}: first price break must start at 1 unit`);
    for (let i = 1; i < br.length; i++) {
      if (br[i].minQty <= br[i - 1].minQty) out.push(`${f.id}: price break ${i} minQty is not ascending`);
      if (br[i].unit > br[i - 1].unit) out.push(`${f.id}: price break ${i} costs more than the one before`);
    }
    if (br.some((b) => b.unit <= 0)) out.push(`${f.id}: a price break is zero or negative`);
  }
  for (const c of nfc.CHIPS) if (!(c.id in P.chip)) out.push(`chip ${c.id} has no price`);
  for (const f of nfc.FINISHES) if (!(f.id in P.finish)) out.push(`finish ${f.id} has no price`);
  for (const e of nfc.EXTRAS) if (!(e.id in P.extra)) out.push(`extra ${e.id} has no price`);
  for (const d of nfc.DELIVERY) if (!(d.id in P.delivery)) out.push(`delivery ${d.id} has no price`);
  return out;
}

export function checkQuotes(nfc) {
  const out = [];
  const eq = (name, got, want) => got !== want && out.push(`${name}: got ${got}, expected ${want}`);

  // 50 PVC, 1 side: break price 6000 x 50, setup waived, pickup.
  eq("50 pvc pickup", nfc.quote({ ...BASE }).total, 300000);
  // 50 PVC double, delivered in Ibadan: (6000 + 300) x 50 + 2000.
  eq("50 pvc double ibadan", nfc.quote({ ...BASE, sides: "double", delivery: "ibadan" }).total, 317000);
  // 10 PVC, ntag215, matte, serial, pickup: unit 9000+300+100+150 = 9550 -> 95500 + 3000 setup.
  eq("10 pvc small order", nfc.quote({ ...BASE, qty: 10, chip: "ntag215", finish: "matte", extras: ["serial"] }).total, 98500);
  // Duplicate extras must not double charge.
  eq("duplicate extras", nfc.unitPrice({ ...BASE, extras: ["hole", "hole"] }), 6100);
  // OKHub design fee is one-off.
  eq("design service", nfc.quote({ ...BASE, designBy: "okhub" }).total, 300000 + nfc.PRICING.designService);
  // Market anchors: Quikprint metal list, exact.
  for (const [qty, want] of [[50, 11500], [100, 9500], [250, 6000]]) eq(`metal ${qty} break`, nfc.breakPrice("metal-card", qty), want);
  eq("pvc 500 break", nfc.quote({ ...BASE, qty: 500 }).unitPrice, 3800);

  // The PDF cannot print the naira sign, so no line may carry a pre-formatted one.
  for (const l of nfc.quote({ ...BASE }).lines) if (/\u20A6/.test(`${l.label}${l.note ?? ""}`)) out.push(`price line "${l.label}" embeds a naira sign`);

  // Lines always sum to total.
  const q = nfc.quote({ ...BASE, qty: 120, sides: "double", extras: ["serial", "hole", "magstripe"], designBy: "okhub", delivery: "nationwide" });
  eq("lines sum", q.lines.reduce((s, l) => s + l.amount, 0), q.total);

  // Per-card price never rises with quantity.
  for (const f of nfc.FORMS) {
    let last = Infinity;
    for (const qty of [f.minQty, 10, 24, 25, 49, 50, 99, 100, 249, 250, 499, 500, 1000, 10000]) {
      if (qty < f.minQty) continue;
      const p = nfc.quote({ ...BASE, form: f.id, qty }).total / qty;
      if (p > last + 1e-9) out.push(`${f.id}: per-card price rose at qty ${qty} (${p} > ${last})`);
      last = p;
    }
  }

  // Under minimum: priced at minimum, flagged. Junk quantities never produce NaN.
  const low = nfc.quote({ ...BASE, form: "keyfob", qty: 1 });
  if (low.qty !== 10 || low.problems.length !== 1) out.push("under-minimum quantity was not clamped and flagged");
  for (const bad of [NaN, -5, Infinity, 0.4]) {
    const r = nfc.quote({ ...BASE, qty: bad });
    if (!Number.isFinite(r.total) || r.total <= 0) out.push(`quantity ${bad} produced total ${r.total}`);
  }
  if (nfc.quote({ ...BASE, qty: 99999 }).qty !== nfc.MAX_QTY) out.push("quantity above MAX_QTY was not clamped");
  return out;
}

export function checkOrder(nfc) {
  const out = [];
  const bytes = [0, 1, 2, 3];
  const ref = nfc.orderRef(new Date(Date.UTC(2026, 10, 13)), bytes);
  if (ref !== "NFC-261113-2345") out.push(`orderRef drifted: ${ref}`);
  if (!/^NFC-\d{6}-[2-9A-HJ-NP-Z]{4}$/.test(nfc.orderRef(new Date(), [255, 254, 253, 252]))) out.push("orderRef uses ambiguous characters");

  const phones = [["08031234567", "2348031234567"], ["+234 803 123 4567", "2348031234567"], ["8031234567", "2348031234567"], ["0803", null], ["abc", null]];
  for (const [raw, want] of phones) if (nfc.normalisePhone(raw) !== want) out.push(`normalisePhone(${raw}) = ${nfc.normalisePhone(raw)}, expected ${want}`);

  const good = {
    ref, createdAt: "2026-11-13T00:00:00Z", selection: { ...BASE },
    actions: [{ id: "website", value: "https://example.com" }],
    customer: { name: "Ada Obi", business: "", phone: "08031234567", email: "", city: "Ibadan", notes: "" },
  };
  if (nfc.validateOrder(good).length) out.push(`a valid order was rejected: ${nfc.validateOrder(good)}`);
  const bad = (patch) => nfc.validateOrder({ ...good, ...patch });
  if (!bad({ customer: { ...good.customer, name: "" } }).length) out.push("empty name accepted");
  if (!bad({ customer: { ...good.customer, phone: "12" } }).length) out.push("bad phone accepted");
  if (!bad({ customer: { ...good.customer, email: "nope" } }).length) out.push("bad email accepted");
  if (!bad({ actions: [{ id: "website", value: "example.com" }] }).length) out.push("website without https accepted");
  if (!bad({ actions: [{ id: "text", value: "" }] }).length) out.push("empty tap action accepted");
  if (!bad({ actions: [] }).length) out.push("an order with no tap actions was accepted");
  if (!bad({ actions: [{ id: "contact", value: "", fields: { name: "Ada" } }] }).length) out.push("contact with no phone or email accepted");
  if (!bad({ actions: [{ id: "wifi", value: "", fields: { ssid: "" } }] }).length) out.push("wifi with no network name accepted");
  if (bad({ actions: [{ id: "website", value: "https://a.com" }, { id: "text", value: "Hello" }] }).length) out.push("a valid two-item order was rejected");
  // Too big for the chosen chip must be refused, and the message must name the chip that fits.
  const big = { actions: [{ id: "text", value: "x".repeat(135) }] };
  const over = bad(big);
  if (!over.some((m) => /NTAG213 holds 144/.test(m) && /NTAG215/.test(m))) out.push(`over-capacity order not refused with a useful message: ${over}`);
  if (bad({ ...big, selection: { ...good.selection, chip: "ntag215" } }).length) out.push("an order that fits NTAG215 was refused for NTAG215");
  if (!bad({ actions: [{ id: "text", value: "x".repeat(2000) }], selection: { ...good.selection, chip: "ntag216" } }).some((m) => /largest chip/.test(m))) out.push("an order too big for every chip was not refused");

  const long = { ...good, customer: { ...good.customer, name: "N".repeat(100), business: "B".repeat(100) } };
  if (nfc.whatsappCaption(long).length > 1000) out.push("caption exceeds 1000 characters");
  if (!nfc.whatsappCaption(good).includes(ref)) out.push("caption omits the order reference");
  return out;
}

/** A canvas recorder: remembers which drawing calls were made. */
export function recorder() {
  const calls = [];
  const p = new Proxy({}, {
    get: (t, k) => (k in t ? t[k] : (...a) => { calls.push(String(k)); return { addColorStop() {} }; }),
    set: (t, k, v) => { t[k] = v; return true; },
  });
  return { ctx: p, calls };
}

/** NDEF byte maths, each number worked out by hand from the NFC Forum record layout. */
export function checkNdef(nfc) {
  const out = [];
  const eq = (name, got, want) => got !== want && out.push(`ndef ${name}: got ${got}, expected ${want}`);

  // URI: header 1 + type len 1 + payload len 1 + type "U" 1 + payload (1 prefix code + rest).
  eq("https URI", nfc.uriRecordBytes("https://okhubtech.com"), 18); // rest "okhubtech.com" = 13, payload 14
  eq("http://www. prefix", nfc.uriRecordBytes("http://www.x.com"), 10); // rest "x.com" = 5, payload 6
  eq("unknown scheme", nfc.uriRecordBytes("ftp://a.b"), 14); // no prefix code: payload 1 + 9
  eq("prefix match ignores case", nfc.uriRecordBytes("HTTPS://okhubtech.com"), 18);
  // Text: payload = 1 status + 2 language + text.
  eq("text", nfc.textRecordBytes("Hello"), 12);
  eq("text is counted in UTF-8 bytes", nfc.textRecordBytes("\u20A6100"), 13); // naira sign is 3 bytes
  // Wi-Fi: type "application/vnd.wfa.wsc" is 23 bytes, payload 44 + ssid + key.
  eq("wifi payload", nfc.wifiPayloadBytes("Home", "pass1234"), 56);
  eq("wifi record", nfc.actionBytes({ id: "wifi", value: "", fields: { ssid: "Home", password: "pass1234" } }), 82);
  eq("open wifi", nfc.actionBytes({ id: "wifi", value: "", fields: { ssid: "Home" } }), 3 + 23 + 48);
  // vCard: 63 bytes for the name-only card, type "text/vcard" is 10 bytes.
  eq("vcard text", nfc.vCard({ name: "Ada Obi" }).length, 63);
  eq("vcard record", nfc.actionBytes({ id: "contact", value: "", fields: { name: "Ada Obi" } }), 76);
  if (!nfc.vCard({ name: "A", org: "X;Y, Z" }).includes("ORG:X\\;Y\\, Z")) out.push("vCard does not escape ; and ,");
  if (nfc.vCard({ name: "Ada Obi" }).includes("ORG")) out.push("vCard wrote an empty ORG line");
  // WhatsApp: normalised, then https://wa.me/234...: rest "wa.me/2348031234567" = 19, payload 20.
  eq("whatsapp", nfc.actionBytes({ id: "whatsapp", value: "08031234567" }), 24);
  eq("whatsapp with bad number", nfc.actionBytes({ id: "whatsapp", value: "12" }), 0);
  eq("something else is not stored", nfc.actionBytes({ id: "other", value: "anything at all" }), 0);
  eq("blank website", nfc.actionBytes({ id: "website", value: "  " }), 0);

  // Long record: payload of 256 or more switches to a 4-byte length (6-byte header).
  eq("short record at 255", nfc.ndefRecordBytes(1, 255), 3 + 1 + 255);
  eq("long record at 256", nfc.ndefRecordBytes(1, 256), 6 + 1 + 256);

  const rep = (actions, chip = "ntag213") => nfc.memoryReport(actions, chip);
  // TLV framing: 0x03, length, message, 0xFE = 3 bytes extra, or 5 once the message is 255+.
  eq("one url used", rep([{ id: "website", value: "https://okhubtech.com" }]).used, 21);
  eq("two items add up", rep([{ id: "website", value: "https://okhubtech.com" }, { id: "text", value: "Hello" }]).used, 18 + 12 + 3);
  eq("empty uses nothing", rep([]).used, 0);
  eq("only 'something else' uses nothing", rep([{ id: "other", value: "x" }]).used, 0);
  eq("long message framing", rep([{ id: "website", value: `https://${"a".repeat(300)}` }], "ntag216").used, 308 + 5);
  const per = rep([{ id: "website", value: "https://a.co" }, { id: "text", value: "Hi" }]).perAction;
  if (per.join() !== "9,9") out.push(`ndef perAction: got ${per}, expected 9,9`);

  // Capacity edges on NTAG213 (144): text record = 7 + length, plus 3 framing.
  const text = (n) => [{ id: "text", value: "x".repeat(n) }];
  const full = rep(text(134));
  if (!(full.used === 144 && full.free === 0 && full.fits && full.smallestChip === "ntag213")) out.push(`exactly full chip: ${JSON.stringify(full)}`);
  const over = rep(text(135));
  if (!(over.used === 145 && !over.fits && over.smallestChip === "ntag215")) out.push(`one byte over: ${JSON.stringify(over)}`);
  if (rep(text(125)).tight !== true) out.push("under 10% free should be tight");
  if (rep(text(100)).tight !== false) out.push("plenty of room should not be tight");
  if (rep(text(2000), "ntag216").smallestChip !== null) out.push("nothing fits 2000 bytes, smallestChip should be null");
  eq("ntag215 capacity", rep([], "ntag215").capacity, 504);
  eq("ntag216 capacity", rep([], "ntag216").capacity, 888);
  return out;
}

export function checkDesigner(nfc, d) {
  const out = [];
  const form = nfc.formById("pvc-card");
  const { w, h } = d.canvasSize(form);
  if (w !== 1011 || h !== 638) out.push(`CR80 at 300dpi should be 1011x638, got ${w}x${h}`);

  const base = d.defaultDesign();
  const all = {
    fill: base.front.fill,
    layers: [
      ...base.front.layers,
      { id: "s", kind: "shape", shape: "circle", x: 0.5, y: 0.5, w: 0.2, h: 0.2, color: "#fff", opacity: 1, rotate: 0 },
      { id: "i", kind: "image", src: "x", x: 0.3, y: 0.3, w: 0.2, h: 0.2, rotate: 0 },
    ],
  };
  for (const f of nfc.FORMS) {
    const r = recorder();
    try {
      d.drawSide(r.ctx, f, all, ...Object.values(d.canvasSize(f)), () => ({}));
    } catch (e) {
      out.push(`drawSide threw for ${f.id}: ${e.message}`);
      continue;
    }
    for (const need of ["clip", "fillRect", "fillText", "arc", "drawImage", "stroke"]) if (!r.calls.includes(need)) out.push(`drawSide(${f.id}) never called ${need}`);
  }

  // Unloaded image: skipped, not a crash.
  const r = recorder();
  try {
    d.drawSide(r.ctx, form, all, w, h, () => undefined);
  } catch (e) {
    out.push(`drawSide threw on an unloaded image: ${e.message}`);
  }
  if (r.calls.includes("drawImage")) out.push("drawSide drew an image that was not loaded");

  // Hit testing: topmost wins, empty space misses.
  const stacked = { fill: base.front.fill, layers: [
    { id: "a", kind: "shape", shape: "rect", x: 0.5, y: 0.5, w: 0.5, h: 0.5, color: "#000", opacity: 1, rotate: 0 },
    { id: "b", kind: "shape", shape: "rect", x: 0.5, y: 0.5, w: 0.2, h: 0.2, color: "#111", opacity: 1, rotate: 0 },
  ] };
  if (d.hitTest(stacked, w / 2, h / 2, w, h) !== 1) out.push("hitTest did not return the topmost layer");
  if (d.hitTest(stacked, 2, 2, w, h) !== -1) out.push("hitTest hit empty space");

  const moved = d.moveLayer(stacked.layers[0], 5, -3);
  if (moved.x !== 1 || moved.y !== 0) out.push("moveLayer let a layer leave the card");

  for (const side of [base.front, base.back]) for (const l of side.layers) if (l.x < 0 || l.x > 1 || l.y < 0 || l.y > 1) out.push(`default layer ${l.id} is off the card`);

  const [x0, , x1] = d.gradientPoints(90, 100, 50);
  if (!(x1 > x0)) out.push("a 90 degree gradient should run left to right");
  return out;
}

export function checkWiring(root) {
  const out = [];
  const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), "utf8") : "");
  if (!existsSync(join(root, "app/nfc/page.tsx"))) out.push("app/nfc/page.tsx is missing");
  if (!/STANDALONE_PAGES = \[[^\]]*"nfc"/.test(read("lib/site.ts"))) out.push('"nfc" is missing from STANDALONE_PAGES, so /nfc is not in the sitemap');
  if (!read("components/Footer.tsx").includes('href: "/nfc"')) out.push("footer does not link /nfc");

  // Browser and Worker must agree on the field names.
  const client = read("lib/nfc-delivery.ts");
  const worker = read("services/nfc-orders/src/worker.ts");
  for (const field of ["ref", "name", "phone", "caption", "website", "pdf"]) {
    if (!client.includes(`f.set("${field}"`)) out.push(`lib/nfc-delivery.ts does not send "${field}"`);
    if (!worker.includes(`form.get("${field}")`)) out.push(`the Worker does not read "${field}"`);
  }
  // The WhatsApp token must never be public.
  for (const p of ["lib/nfc-delivery.ts", "lib/nfc.ts", "components/nfc/NfcOrderForm.tsx", ".env.example"]) {
    if (/WHATSAPP_TOKEN\s*=\s*\S+/.test(read(p)) || /NEXT_PUBLIC_[A-Z_]*TOKEN/.test(read(p))) out.push(`${p} exposes a WhatsApp token`);
  }
  return out;
}

async function main() {
  const { nfc, design } = await loadSources(ROOT);
  const problems = [...checkPricing(nfc), ...checkQuotes(nfc), ...checkOrder(nfc), ...checkNdef(nfc), ...checkDesigner(nfc, design), ...checkWiring(ROOT)];
  if (problems.length) {
    console.error(`verify-nfc: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log("verify-nfc: pricing, order, designer and wiring OK");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
