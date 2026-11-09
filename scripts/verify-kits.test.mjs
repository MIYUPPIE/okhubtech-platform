#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-kits.mjs.
 *
 * Starts from the real lib/kits.ts and lib/schools.ts, mutates one thing per
 * case, and asserts the checker catches it. The cases that matter most:
 *
 *  - a price typo (the site and the PDF a school is holding disagree);
 *  - "High Marks Guaranteed" and "Bestseller", which the catalogue prints and
 *    the site must not;
 *  - the catalogue's 080XXXXXXXX placeholder phone;
 *  - a dropped chapter in the ten-session plan.
 *
 * The content.py and catalogue checks run against synthetic fixtures, so the
 * test needs neither python3 nor the 12MB PDF.
 *
 * Deterministic, offline.  node scripts/verify-kits.test.mjs
 */

import process from "node:process";

import {
  checkAgainstCatalogue,
  checkAgainstContent,
  checkClaims,
  checkKits,
  checkPacks,
  checkSchools,
  loadSources,
} from "./verify-kits.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const { kits: K, schools: S } = await loadSources(ROOT);

const clone = (v) => structuredClone(v);
const withKit = (slug, patch) => clone(K.KITS).map((k) => (k.slug === slug ? { ...k, ...patch } : k));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** A content.py fixture that agrees with lib/kits.ts. */
const contentFixture = () => ({
  kits: Object.fromEntries(
    K.KITS.map((k) => [
      k.slug,
      {
        name: k.name,
        price: k.price,
        list: k.listPrice,
        chapters: k.chapters.join(", "),
        ...(k.variants.some((v) => /uno/i.test(v.label))
          ? { uno_price: k.variants.find((v) => /uno/i.test(v.label)).price }
          : {}),
      },
    ]),
  ),
  packs: K.LAB_PACKS.map((p) => ({ key: p.key, ...K.packTotal(p.lines) })),
  three_day_kits: K.packTotal(K.THREE_DAY_KIT_LINES),
  chapters: S.CHAPTERS.map(([n, t]) => [n, t]),
  sessions: S.SESSIONS.map((s) => ({ n: s.n, title: s.title, chapters: [...s.chapters] })),
  three_day: S.THREE_DAY.map((d) => ({
    day: d.day,
    blocks: d.blocks.map((b) => ({ hours: b.hours, chapters: [...b.chapters] })),
  })),
  optional: S.OPTIONAL_CHAPTERS.map((o) => o.chapter),
});

/** Catalogue text laid out the way pdftotext prints it. */
const catalogueFixture = (kits = K.KITS) =>
  kits
    .map((k) =>
      [
        `${k.name.toUpperCase()} - ${k.tagline}${k.isNew ? " [NEW]" : ""}`,
        `  ■${fmt(k.price)} ■${fmt(k.listPrice)}`,
        ...k.variants.map((v) => `  ${v.label}: ■${fmt(v.price)}`),
        "  ✓ Free Tutorial PDF & Code",
      ].join("\n"),
    )
    .join("\n\n");

const schoolsWith = (patch) => ({ ...S, ...patch });

const cases = [
  // ---- baselines: the real data must pass every check
  ["baseline: kits shape", () => checkKits(K.KITS), 0],
  ["baseline: claims", () => checkClaims(K.KITS, K.LAB_PACKS, K.KIT_PROMISES, S), 0],
  ["baseline: content.py", () => checkAgainstContent(K.KITS, contentFixture()), 0],
  ["baseline: catalogue", () => checkAgainstCatalogue(K.KITS, catalogueFixture()), 0],
  ["baseline: packs", () => checkPacks(K, contentFixture()), 0],
  ["baseline: schools", () => checkSchools(S, K.KITS, contentFixture()), 0],

  // ---- price drift
  ["price typo vs content.py", () => checkAgainstContent(withKit("ignite-genesis", { price: 56500 }), contentFixture()), /price 56500 != 65500/],
  ["list price typo vs content.py", () => checkAgainstContent(withKit("rover-m2", { listPrice: 50000 }), contentFixture()), /list price/],
  ["UNO variant drift vs content.py", () =>
    checkAgainstContent(withKit("rover-m2", { variants: [{ label: "With an Arduino UNO", price: 67000 }] }), contentFixture()), /UNO variant/],
  ["kit missing from lib/kits.ts", () => checkAgainstContent(clone(K.KITS).slice(1), contentFixture()), /not in lib\/kits\.ts/],
  ["price not printed in catalogue", () => {
    const text = catalogueFixture().replace(`■${fmt(65500)}`, "■66,500");
    return checkAgainstCatalogue(K.KITS, text);
  }, /ignite-genesis: price 65,500 not printed/],
  ["isNew disagrees with catalogue", () => checkAgainstCatalogue(withKit("rover-sense-iot", { isNew: false }), catalogueFixture()), /isNew is false/],
  ["k-suffixed price counts as printed", () => {
    const text = catalogueFixture().replace(`■${fmt(175000)}`, "■175k");
    return checkAgainstCatalogue(K.KITS, text);
  }, 0],

  // ---- shape
  ["selling price above list price", () => checkKits(withKit("picode-lab", { price: 50000 })), /not above the selling price/],
  ["bad slug", () => checkKits(withKit("picode-lab", { slug: "PiCode Lab" })), /slug is not/],
  ["duplicate slug", () => checkKits([...clone(K.KITS), clone(K.KITS[0])]), /duplicate slug/],
  ["thin contents", () => checkKits(withKit("picode-lab", { contents: ["a board"] })), /contents/],
  ["chapter out of range", () => checkKits(withKit("picode-lab", { chapters: [21] })), /chapter outside/],
  ["missing photo", () => checkKits(withKit("picode-lab", { slug: "no-such-kit" }), ROOT), /photo public\/media\/kits\/no-such-kit\.webp missing/],

  // ---- claims
  ["guarantee", () => checkClaims(withKit("rover-guard-iot", { builds: ["Final Year Project - High Marks Guaranteed", "x"] })), /a guarantee/],
  ["bestseller badge", () => checkClaims(withKit("rover-sense-iot", { badge: "IoT Bestseller" })), /popularity claim/],
  ["placeholder phone", () => checkClaims([{ note: "WhatsApp: 080XXXXXXXX" }]), /placeholder/],
  ["unpermitted school name", () => checkClaims(schoolsWith({ PREPARED_FOR: "Kingspark Group of Schools" })), /named school/],

  // ---- packs
  ["discount tiers changed", () => checkPacks({ ...K, discountRate: (q) => (q >= 6 ? 0.05 : 0) }, null), /discountRate\(5\)/],
  ["pack net differs from content.py", () => {
    const c = contentFixture();
    c.packs[0].net += 1;
    return checkPacks(K, c);
  }, /pack foundations: net/],
  ["pack with unknown kit", () => checkPacks({ ...K, LAB_PACKS: [{ key: "x", lines: [{ kit: "nope", qty: 1 }] }] }, null), /unknown kit "nope"/],
  ["pack with unknown variant", () =>
    checkPacks({ ...K, LAB_PACKS: [{ key: "x", lines: [{ kit: "rover-m2", variant: "Gold edition", qty: 1 }] }] }, null), /no variant "Gold edition"/],

  // ---- schools
  ["chapter dropped from the plan", () => {
    const sessions = clone(S.SESSIONS);
    sessions[4].chapters = [];
    return checkSchools(schoolsWith({ SESSIONS: sessions }), K.KITS, null);
  }, /chapter 7 appears 0 times/],
  ["chapter taught twice", () => {
    const sessions = clone(S.SESSIONS);
    sessions[0].chapters = [1, 2, 3];
    return checkSchools(schoolsWith({ SESSIONS: sessions }), K.KITS, null);
  }, /chapter 3 appears 2 times/],
  ["intensive day over six hours", () => {
    const days = clone(S.THREE_DAY);
    days[1].blocks[0].hours = 2;
    return checkSchools(schoolsWith({ THREE_DAY: days }), K.KITS, null);
  }, /intensive day 2 is 6.5h/],
  ["chapter title retyped", () => {
    const chapters = clone(S.CHAPTERS);
    chapters[12] = [13, "Wheeled Robot"];
    return checkSchools(schoolsWith({ CHAPTERS: chapters }), K.KITS, contentFixture());
  }, /chapter 13 title/],
  ["pathway names an unknown kit", () => {
    const pathway = clone(S.PATHWAY);
    pathway[0].kits = ["ignite"];
    return checkSchools(schoolsWith({ PATHWAY: pathway }), K.KITS, null);
  }, /unknown kit "ignite"/],
  ["session title drifts from content.py", () => {
    const sessions = clone(S.SESSIONS);
    sessions[2].title = "Electronics";
    return checkSchools(schoolsWith({ SESSIONS: sessions }), K.KITS, contentFixture());
  }, /session 3 title/],
];

const failed = [];
let passed = 0;
for (const [name, run, expect] of cases) {
  let problems;
  try {
    problems = run();
  } catch (e) {
    problems = [`threw: ${e.message}`];
  }
  const ok = expect === 0 ? problems.length === 0 : problems.some((p) => expect.test(p));
  if (ok) passed++;
  else failed.push({ name, problems, expect });
}

if (failed.length === 0) {
  console.log(`PASS  ${passed}/${cases.length} kits tests`);
  process.exit(0);
}
console.error(`FAIL  ${failed.length}/${cases.length} kits tests`);
for (const { name, problems, expect } of failed) {
  console.error(`  ${name}  (expected ${expect === 0 ? "no problems" : expect})`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
