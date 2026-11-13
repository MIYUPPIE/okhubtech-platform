#!/usr/bin/env node
/**
 * Proves scripts/verify-nfc.mjs can fail: each case breaks one thing and
 * expects the matching check to notice. A gate that cannot fail is theatre.
 *
 *   node scripts/verify-nfc.test.mjs
 */

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import { checkDesigner, checkNdef, checkOrder, checkPricing, checkQuotes, checkWiring, loadSources } from "./verify-nfc.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const { nfc, design } = await loadSources(ROOT);
const problems = [];
const expect = (name, found, re) => {
  if (!found.some((m) => re.test(m))) problems.push(`${name}: expected a problem matching ${re}, got ${JSON.stringify(found)}`);
};

// The real sources are clean.
for (const [n, f] of [["pricing", checkPricing(nfc)], ["quotes", checkQuotes(nfc)], ["order", checkOrder(nfc)], ["ndef", checkNdef(nfc)], ["designer", checkDesigner(nfc, design)], ["wiring", checkWiring(ROOT)]]) {
  if (f.length) problems.push(`real ${n} should be clean: ${f}`);
}

// 1. Price table
const withPricing = (patch) => ({ ...nfc, PRICING: { ...nfc.PRICING, ...patch } });
expect("fractional price", checkPricing(withPricing({ setupFee: 3000.5 })), /whole naira/);
expect("negative price", checkPricing(withPricing({ doubleSided: -1 })), /whole naira/);
const br = (patch) => withPricing({ breaks: { ...nfc.PRICING.breaks, ...patch } });
expect("rising break", checkPricing(br({ keyfob: [{ minQty: 1, unit: 100 }, { minQty: 50, unit: 200 }] })), /costs more/);
expect("break not starting at 1", checkPricing(br({ keyfob: [{ minQty: 5, unit: 100 }] })), /start at 1/);
expect("missing form", checkPricing(withPricing({ breaks: { "pvc-card": nfc.PRICING.breaks["pvc-card"] } })), /no price breaks/);

// 2. Quote behaviour
expect("wrong total", checkQuotes({ ...nfc, quote: (s) => ({ ...nfc.quote(s), total: nfc.quote(s).total + 1 }) }), /got/);
expect("per-card price rising", checkQuotes({ ...nfc, quote: (s) => { const q = nfc.quote(s); return s.qty === 1000 ? { ...q, total: q.total * 10 } : q; } }), /per-card price rose/);
expect("NaN not handled", checkQuotes({ ...nfc, quote: (s) => (Number.isNaN(s.qty) ? { ...nfc.quote(s), total: NaN } : nfc.quote(s)) }), /produced total/);

// 3. Order
expect("ref drift", checkOrder({ ...nfc, orderRef: () => "NFC-000000-0000" }), /orderRef/);
expect("phone accepted junk", checkOrder({ ...nfc, normalisePhone: () => "2348031234567" }), /normalisePhone/);
expect("everything valid", checkOrder({ ...nfc, validateOrder: () => [] }), /accepted/);
expect("long caption", checkOrder({ ...nfc, whatsappCaption: () => "x".repeat(1200) }), /caption exceeds/);

// 3b. NDEF
expect("uri ignores prefix compression", checkNdef({ ...nfc, uriRecordBytes: (u) => 3 + 1 + 1 + u.length }), /https URI/);
expect("text counted in chars not bytes", checkNdef({ ...nfc, textRecordBytes: (t) => 3 + 1 + 3 + t.length }), /UTF-8/);
expect("long record header wrong", checkNdef({ ...nfc, ndefRecordBytes: (t, p) => 3 + t + p }), /long record/);
expect("wifi payload drift", checkNdef({ ...nfc, wifiPayloadBytes: () => 50 }), /wifi payload/);
expect("framing forgotten", checkNdef({ ...nfc, memoryReport: (a, c) => { const r = nfc.memoryReport(a, c); return { ...r, used: r.messageBytes, free: r.capacity - r.messageBytes }; } }), /one url used|full chip|one byte over/);
expect("wrong capacity", checkNdef({ ...nfc, memoryReport: (a, c) => ({ ...nfc.memoryReport(a, c), capacity: 100 }) }), /capacity/);
expect("over-capacity allowed", checkNdef({ ...nfc, memoryReport: (a, c) => ({ ...nfc.memoryReport(a, c), fits: true }) }), /one byte over/);
expect("contact needs no phone", checkOrder({ ...nfc, actionProblem: () => null, validateOrder: (o) => nfc.validateOrder(o).filter((m) => !/Save my contact/.test(m)) }), /contact with no phone/);
expect("capacity check removed", checkOrder({ ...nfc, validateOrder: (o) => nfc.validateOrder(o).filter((m) => !/bytes/.test(m)) }), /over-capacity/);

// 4. Designer
expect("wrong px size", checkDesigner(nfc, { ...design, canvasSize: () => ({ w: 100, h: 100 }) }), /1011x638/);
expect("hit test bottom-most", checkDesigner(nfc, { ...design, hitTest: () => 0 }), /topmost|empty space/);
expect("draw throws", checkDesigner(nfc, { ...design, drawSide: () => { throw new Error("boom"); } }), /threw/);
expect("move off card", checkDesigner(nfc, { ...design, moveLayer: (l) => ({ ...l, x: 2 }) }), /leave the card/);

// 5. Wiring, against a scratch tree
const tree = (files) => {
  const root = mkdtempSync(join(tmpdir(), "nfc-"));
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), c);
  }
  return root;
};
const empty = checkWiring(tree({}));
expect("no page", empty, /page\.tsx is missing/);
expect("not in sitemap", empty, /STANDALONE_PAGES/);
expect("no footer link", empty, /footer/);
expect("field mismatch", empty, /Worker does not read "pdf"/);
expect("token leak", checkWiring(tree({ "lib/nfc.ts": "const WHATSAPP_TOKEN = 'EAAB123'" })), /exposes a WhatsApp token/);

if (problems.length) {
  console.error(`verify-nfc.test: ${problems.length} failure(s)`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("verify-nfc.test: every check fails when it should");
