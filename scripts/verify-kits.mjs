#!/usr/bin/env node
/**
 * Gate: /kits and /schools publish the catalogue's numbers and nothing else.
 *
 * lib/kits.ts and lib/schools.ts are the single source for both pages. They
 * are re-typed from documents that already exist, which is exactly where
 * drift creeps in, so this gate checks them against those documents:
 *
 *  1. PRICE DRIFT. Every price, list price and variant must match
 *     docs/secondary-school-partnership/content.py (the schools PDF's data,
 *     itself tested against the catalogue) and, when the 12MB catalogue PDF is
 *     on disk, the catalogue's own printed text. A price on the site that
 *     differs from the PDF a school is holding is a dispute waiting to happen.
 *
 *  2. PACK MATHS. Lab pack totals use the catalogue's discount tiers and must
 *     come out to the naira the PDF prints.
 *
 *  3. CLAIMS. The catalogue prints "High Marks Guaranteed" and "Bestseller".
 *     Neither is publishable; any guarantee or popularity claim fails here.
 *     So does the catalogue's "080XXXXXXXX" placeholder phone, and the name of
 *     a school we have written a proposal for but not been given permission to
 *     publish.
 *
 *  4. SCHOOLS PLAN. Ten sessions covering all 20 chapters exactly once (bar the
 *     two optional ones), six contact hours on each intensive day, chapter
 *     titles exactly as printed, and every pathway kit a real kit.
 *
 *  5. WIRING. Each kit has its photo in public/media/kits, and both routes are
 *     registered so the sitemap and export gates see them.
 *
 * Deterministic and offline. Needs Node 22.6+ (type stripping) and python3 for
 * the content.py comparison; pdftotext only for the optional catalogue check.
 *
 *   node scripts/verify-kits.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Claims we will not publish, and placeholders that must never ship. */
export const BANNED = [
  { re: /guarantee/i, why: "a guarantee" },
  { re: /best\s*-?\s*sell/i, why: "a popularity claim" },
  { re: /\bno\.?\s*1\b|number one|#1\b/i, why: "a ranking claim" },
  { re: /X{4,}/, why: "a placeholder (the catalogue's 080XXXXXXXX phone)" },
  { re: /kingspark/i, why: "a named school without permission to publish it" },
];

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Every string anywhere inside a value. */
function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

export async function loadSources(root) {
  const kits = await import(pathToFileURL(join(root, "lib/kits.ts")).href);
  const schools = await import(pathToFileURL(join(root, "lib/schools.ts")).href);
  return { kits, schools };
}

/** content.py as JSON, or null when python3 is unavailable. */
export function loadContent(root) {
  const dir = join(root, "docs/secondary-school-partnership");
  if (!existsSync(join(dir, "content.py"))) return null;
  const py = `
import json, sys
sys.path.insert(0, ${JSON.stringify(dir)})
import content as C
print(json.dumps(dict(
  kits=C.KITS, packs=[dict(key=p["key"], net=p["calc"]["net"], gross=p["calc"]["gross"]) for p in C.PACKS],
  three_day_kits=C.THREE_DAY_KITS, chapters=C.CHAPTERS,
  sessions=[dict(n=s["n"], title=s["title"], chapters=s["chapters"]) for s in C.SESSIONS],
  three_day=[dict(day=d["day"], blocks=[dict(hours=b[1], chapters=b[3]) for b in d["blocks"]]) for d in C.THREE_DAY],
  optional=[o["chapter"] for o in C.OPTIONAL],
)))
`;
  try {
    return JSON.parse(execFileSync("python3", ["-I", "-c", py], { encoding: "utf8" }));
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/** The catalogue PDF as text, or null when the PDF or pdftotext is missing. */
export function loadCatalogueText(root) {
  const pdf = join(root, "assets/OkhubTech-CUSTOMER-Catalog-2024.pdf");
  if (!existsSync(pdf)) return null;
  try {
    return execFileSync("pdftotext", ["-layout", pdf, "-"], { encoding: "utf8" });
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/** Shape, claims and photos. */
export function checkKits(kits, root) {
  const problems = [];
  const seen = new Set();
  if (kits.length === 0) return ["no kits in lib/kits.ts"];

  for (const k of kits) {
    const say = (p) => problems.push(`${k.slug}: ${p}`);
    if (!SLUG.test(k.slug)) say("slug is not lowercase-with-hyphens");
    if (seen.has(k.slug)) say("duplicate slug");
    seen.add(k.slug);
    for (const f of ["name", "tagline", "badge", "level"]) if (!k[f]) say(`missing ${f}`);
    if (!Number.isInteger(k.price) || k.price <= 0) say(`price ${k.price} is not a positive whole naira amount`);
    if (!(k.listPrice > k.price)) say(`list price ${k.listPrice} is not above the selling price ${k.price}`);
    if (k.contents.length < 3) say(`only ${k.contents.length} contents lines; needs 3`);
    if (k.builds.length < 2) say(`only ${k.builds.length} builds; needs 2`);
    if (k.chapters.some((c) => !Number.isInteger(c) || c < 1 || c > 20)) say("chapter outside 1-20");
    const labels = new Set();
    for (const v of k.variants) {
      if (labels.has(v.label)) say(`duplicate variant "${v.label}"`);
      labels.add(v.label);
      if (!Number.isInteger(v.price) || v.price <= 0) say(`variant "${v.label}" has no valid price`);
    }
    if (root !== undefined) {
      for (const f of [`${k.slug}.webp`, `${k.slug}-sm.webp`]) {
        if (!existsSync(join(root, "public/media/kits", f))) say(`photo public/media/kits/${f} missing; run npm run media`);
      }
    }
  }
  return problems;
}

/** No guarantees, rankings, placeholders or unpermitted school names, anywhere on either page. */
export function checkClaims(...sources) {
  const problems = [];
  for (const s of sources.flatMap((x) => strings(x))) {
    for (const { re, why } of BANNED) {
      if (re.test(s)) problems.push(`"${s.slice(0, 70)}" contains ${why}`);
    }
  }
  return problems;
}

/** lib/kits.ts against content.py's KITS. */
export function checkAgainstContent(kits, content) {
  const problems = [];
  const bySlug = new Map(kits.map((k) => [norm(k.name), k]));
  const names = Object.values(content.kits).map((c) => norm(c.name));
  if (names.length !== kits.length) {
    problems.push(`content.py has ${names.length} kits, lib/kits.ts has ${kits.length}`);
  }
  for (const c of Object.values(content.kits)) {
    const k = bySlug.get(norm(c.name));
    if (!k) { problems.push(`content.py kit "${c.name}" is not in lib/kits.ts`); continue; }
    const say = (p) => problems.push(`${k.slug}: ${p} (content.py)`);
    if (k.price !== c.price) say(`price ${k.price} != ${c.price}`);
    if (k.listPrice !== c.list) say(`list price ${k.listPrice} != ${c.list}`);
    if (c.uno_price !== undefined) {
      const uno = k.variants.find((v) => /uno/i.test(v.label));
      if (!uno || uno.price !== c.uno_price) say(`UNO variant ${uno?.price} != ${c.uno_price}`);
    }
    const chapters = c.chapters.split(",").map((s) => Number(s.trim()));
    if (chapters.join() !== k.chapters.join()) say(`chapters ${k.chapters} != ${chapters}`);
  }
  return problems;
}

/** lib/kits.ts against the catalogue PDF's printed text. */
export function checkAgainstCatalogue(kits, text) {
  const problems = [];
  const upper = text.toUpperCase();
  const starts = kits.map((k) => ({ k, at: upper.indexOf(k.name.toUpperCase()) }));
  for (const { k, at } of starts) {
    if (at === -1) { problems.push(`${k.slug}: name "${k.name}" not found in the catalogue`); continue; }
    const next = starts.map((s) => s.at).filter((a) => a > at).sort((a, b) => a - b)[0] ?? text.length;
    const block = text.slice(at, next);
    const has = (n) => block.includes(fmt(n)) || block.includes(`${n / 1000}k`);
    const say = (p) => problems.push(`${k.slug}: ${p} (catalogue PDF)`);
    if (!has(k.price)) say(`price ${fmt(k.price)} not printed`);
    if (!has(k.listPrice)) say(`list price ${fmt(k.listPrice)} not printed`);
    for (const v of k.variants) if (!has(v.price)) say(`variant "${v.label}" ${fmt(v.price)} not printed`);
    if (k.isNew !== /\[NEW\]/.test(block)) say(`isNew is ${k.isNew} but the catalogue ${k.isNew ? "does not mark" : "marks"} it [NEW]`);
  }
  return problems;
}

/** Pack totals: recomputed, and matched to content.py. */
export function checkPacks(kitsModule, content) {
  const problems = [];
  const { LAB_PACKS, THREE_DAY_KIT_LINES, packTotal, discountRate } = kitsModule;

  const tiers = [[1, 0], [4, 0], [5, 0.05], [9, 0.05], [10, 0.1], [30, 0.1]];
  for (const [q, r] of tiers) {
    if (discountRate(q) !== r) problems.push(`discountRate(${q}) is ${discountRate(q)}, catalogue says ${r}`);
  }

  for (const pack of LAB_PACKS) {
    let total;
    try { total = packTotal(pack.lines); } catch (e) { problems.push(`pack ${pack.key}: ${e.message}`); continue; }
    if (total.net !== total.gross - total.saving) problems.push(`pack ${pack.key}: net + saving != gross`);
    const c = content?.packs.find((p) => p.key === pack.key);
    if (content && !c) problems.push(`pack ${pack.key} is not in content.py`);
    if (c && c.net !== total.net) problems.push(`pack ${pack.key}: net ${total.net} != content.py ${c.net}`);
    if (c && c.gross !== total.gross) problems.push(`pack ${pack.key}: gross ${total.gross} != content.py ${c.gross}`);
  }
  if (content) {
    const t = packTotal(THREE_DAY_KIT_LINES);
    if (t.net !== content.three_day_kits.net) {
      problems.push(`three-day kits: net ${t.net} != content.py ${content.three_day_kits.net}`);
    }
  }
  return problems;
}

/** The schools plan: coverage, hours, titles, kit references. */
export function checkSchools(schools, kits, content) {
  const problems = [];
  const { SESSIONS, OPTIONAL_CHAPTERS, THREE_DAY, HOURS_PER_DAY, CHAPTERS, PATHWAY, BOOK } = schools;

  if (CHAPTERS.length !== BOOK.chapters) problems.push(`${CHAPTERS.length} chapters listed, the book has ${BOOK.chapters}`);

  const count = new Map();
  for (const s of SESSIONS) for (const c of s.chapters) count.set(c, (count.get(c) ?? 0) + 1);
  for (const o of OPTIONAL_CHAPTERS) count.set(o.chapter, (count.get(o.chapter) ?? 0) + 1);
  for (let c = 1; c <= BOOK.chapters; c++) {
    const n = count.get(c) ?? 0;
    if (n !== 1) problems.push(`chapter ${c} appears ${n} times across sessions and optional; must be exactly once`);
  }

  for (const d of THREE_DAY) {
    const hours = d.blocks.reduce((h, b) => h + b.hours, 0);
    if (Math.abs(hours - HOURS_PER_DAY) > 1e-9) problems.push(`intensive day ${d.day} is ${hours}h, not ${HOURS_PER_DAY}h`);
  }

  const slugs = new Set(kits.map((k) => k.slug));
  for (const stage of PATHWAY) {
    for (const s of stage.kits) if (!slugs.has(s)) problems.push(`pathway "${stage.stage}" names unknown kit "${s}"`);
  }

  if (content) {
    const printed = new Map(content.chapters.map(([n, t]) => [n, t]));
    for (const [n, t] of CHAPTERS) {
      if (printed.get(n) !== t) problems.push(`chapter ${n} title "${t}" != content.py "${printed.get(n)}"`);
    }
    if (content.sessions.length !== SESSIONS.length) problems.push(`${SESSIONS.length} sessions, content.py has ${content.sessions.length}`);
    for (const c of content.sessions) {
      const s = SESSIONS.find((x) => x.n === c.n);
      if (!s) { problems.push(`session ${c.n} missing`); continue; }
      if (s.title !== c.title) problems.push(`session ${c.n} title "${s.title}" != content.py "${c.title}"`);
      if (s.chapters.join() !== c.chapters.join()) problems.push(`session ${c.n} chapters ${s.chapters} != content.py ${c.chapters}`);
    }
    for (const cd of content.three_day) {
      const d = THREE_DAY.find((x) => x.day === cd.day);
      const mine = d?.blocks.map((b) => `${b.hours}:${b.chapters}`).join("|");
      const theirs = cd.blocks.map((b) => `${b.hours}:${b.chapters}`).join("|");
      if (mine !== theirs) problems.push(`intensive day ${cd.day} blocks differ from content.py`);
    }
  }
  return problems;
}

/** Both routes registered, both in the header. */
export function checkWiring(root) {
  const problems = [];
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  const standalone = site.match(/STANDALONE_PAGES = \[([^\]]*)\]/)?.[1] ?? "";
  const header = readFileSync(join(root, "components/Header.tsx"), "utf8");
  for (const route of ["kits", "schools"]) {
    if (!standalone.includes(`"${route}"`)) problems.push(`"${route}" missing from STANDALONE_PAGES in lib/site.ts`);
    if (!existsSync(join(root, `app/${route}/page.tsx`))) problems.push(`app/${route}/page.tsx missing`);
    if (!header.includes(`href: "/${route}"`)) problems.push(`/${route} missing from the header nav`);
  }
  return problems;
}

async function main() {
  const { kits, schools } = await loadSources(ROOT);
  const content = loadContent(ROOT);
  const catalogue = loadCatalogueText(ROOT);

  const problems = [
    ...checkKits(kits.KITS, ROOT),
    ...checkClaims(kits.KITS, kits.LAB_PACKS, kits.KIT_PROMISES, schools),
    ...(content ? checkAgainstContent(kits.KITS, content) : []),
    ...(catalogue ? checkAgainstCatalogue(kits.KITS, catalogue) : []),
    ...checkPacks(kits, content),
    ...checkSchools(schools, kits.KITS, content),
    ...checkWiring(ROOT),
  ];

  if (!content) console.warn("verify-kits: python3 not found, skipped the content.py comparison");
  if (!catalogue) console.warn("verify-kits: catalogue PDF or pdftotext not found, skipped the printed-price check");

  if (problems.length > 0) {
    console.error(`verify-kits: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(
    `verify-kits: ok (${kits.KITS.length} kits, ${kits.LAB_PACKS.length} packs, ` +
      `${schools.SESSIONS.length} sessions; content.py ${content ? "matched" : "skipped"}, ` +
      `catalogue PDF ${catalogue ? "matched" : "skipped"})`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
