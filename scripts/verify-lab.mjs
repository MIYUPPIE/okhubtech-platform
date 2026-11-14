#!/usr/bin/env node
/**
 * Gate: /lab lists only OKHub's own work, labelled for what it is.
 *
 * lib/lab.ts holds research, papers, prototypes, tools and teaching material:
 * exactly the kind of list where overclaiming creeps in. This gate stops the
 * specific ways it could:
 *
 *  1. THIRD-PARTY WORK AS OURS. The folders this page was built from also hold
 *     Intrinsic's AI for Industry Challenge toolkit, a vendor agents course, a
 *     fork of someone else's drum-kit repo, a fan game, and course notes that
 *     follow NVIDIA's autonomous-robots course. None of them may appear here.
 *
 *  2. PAPERS AS PUBLISHED. A paper is "Submitted" until it is not, and it
 *     names its authors.
 *
 *  3. CLIENTS AND PRIVATE DETAILS. No client name, no email address, no
 *     server address.
 *
 *  4. DEAD LINKS. Every link is a route the site exports or a file in public/.
 *
 *  5. THIN OR UNLABELLED ENTRIES, and a page that is not wired in.
 *
 * Deterministic, offline. Node 22.6+ (type stripping).  node scripts/verify-lab.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KINDS = new Set(["research", "paper", "prototype", "tool", "teaching"]);

/** Work that is not OKHub's, and names that must not be published. */
export const FORBIDDEN = [
  { re: /AI for Industry Challenge|intrinsic-dev|\baic\b/i, why: "Intrinsic's competition toolkit, not our code" },
  { re: /agents? for beginners/i, why: "a third-party course" },
  { re: /drum[- ]?kit|alexbuildstech/i, why: "a fork of someone else's repo" },
  { re: /naruto/i, why: "third-party IP" },
  { re: /beginner'?s guide to autonomous robots|nvidia/i, why: "NVIDIA-derived course material" },
  { re: /\bKSO\b|kso\.ng/i, why: "removed at the owner's request" },
  { re: /vesi|spirit ?life/i, why: "a client name" },
  { re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, why: "an email address" },
  { re: /\b\d{1,3}(?:\.\d{1,3}){3}\b/, why: "a server address" },
];

function strings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

export async function loadLab(root) {
  return import(pathToFileURL(join(root, "lib/lab.ts")).href);
}

/** Routes the site has: the static ones from lib/site.ts plus product slugs. */
export function knownRoutes(root) {
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  const list = (name) =>
    [...(site.match(new RegExp(`${name} = \\[([\\s\\S]*?)\\]`))?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const products = [...readFileSync(join(root, "lib/products.ts"), "utf8").matchAll(/\n    slug: "([^"]+)"/g)].map((m) => m[1]);
  return new Set([
    "/",
    ...list("TOP_LEVEL_PAGES").map((p) => `/${p}`),
    ...list("STANDALONE_PAGES").map((p) => `/${p}`),
    ...list("SERVICE_SLUGS").map((p) => `/services/${p}`),
    ...list("PORTFOLIO_SLUGS").map((p) => `/portfolio/${p}`),
    ...list("EXPERTISE_SLUGS").map((p) => `/expertise/${p}`),
    ...products.map((p) => `/products/${p}`),
  ]);
}

/** @returns {string[]} */
export function checkLab(items, kinds, routes, root) {
  const problems = [];
  const seen = new Set();
  if (items.length === 0) return ["no items in lib/lab.ts"];
  const kindKeys = new Set(kinds.map((k) => k.kind));

  for (const it of items) {
    const say = (p) => problems.push(`${it.slug}: ${p}`);
    if (!SLUG.test(it.slug)) say("slug is not lowercase-with-hyphens");
    if (seen.has(it.slug)) say("duplicate slug");
    seen.add(it.slug);
    if (!KINDS.has(it.kind)) say(`unknown kind "${it.kind}"`);
    if (!kindKeys.has(it.kind)) say(`kind "${it.kind}" has no section in LAB_KINDS`);
    for (const f of ["title", "tagline", "status", "summary"]) if (!it[f]) say(`missing ${f}`);
    if (it.points.length < 2) say(`only ${it.points.length} points; needs 2`);
    if (it.stack.length < 1) say("empty stack");

    if (it.kind === "paper") {
      if (!/^Submitted\b/.test(it.status)) say(`paper status "${it.status}" must start with "Submitted"`);
      if (!it.authors || it.authors.length === 0) say("paper has no authors");
    } else if (it.authors !== undefined) {
      say("only papers carry authors");
    }
    if (/\bpublished\b/i.test(it.status)) say("status claims publication");

    for (const link of it.links) {
      if (!link.label) say(`link to ${link.href} has no label`);
      if (!link.href.startsWith("/")) { say(`link ${link.href} is not internal`); continue; }
      const path = link.href.split("#")[0].replace(/\/$/, "") || "/";
      const isFile = /\.[a-z0-9]+$/i.test(path);
      if (isFile ? !(root && existsSync(join(root, "public", path))) : !routes.has(path)) {
        say(`link ${link.href} does not resolve to a page or file`);
      }
    }
  }

  for (const s of strings(items)) {
    for (const { re, why } of FORBIDDEN) if (re.test(s)) problems.push(`"${s.slice(0, 60)}" names ${why}`);
  }
  return problems;
}

export function checkWiring(root) {
  const problems = [];
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  if (!/STANDALONE_PAGES = \[[^\]]*"lab"/.test(site)) problems.push('"lab" missing from STANDALONE_PAGES');
  if (!existsSync(join(root, "app/lab/page.tsx"))) problems.push("app/lab/page.tsx missing");
  if (!readFileSync(join(root, "components/Footer.tsx"), "utf8").includes('href: "/lab"')) {
    problems.push("/lab missing from the footer");
  }
  if (!existsSync(join(root, "public/media/og/lab.png"))) problems.push("public/media/og/lab.png missing; run npm run media");
  return problems;
}

async function main() {
  const lab = await loadLab(ROOT);
  const problems = [...checkLab(lab.LAB, lab.LAB_KINDS, knownRoutes(ROOT), ROOT), ...checkWiring(ROOT)];
  if (problems.length > 0) {
    console.error(`verify-lab: ${problems.length} problem(s)\n`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  const counts = lab.LAB_KINDS.map((k) => [lab.LAB.filter((i) => i.kind === k.kind).length, k.kind])
    .filter(([n]) => n > 0)
    .map(([n, kind]) => `${n} ${kind}`)
    .join(", ");
  console.log(`PASS  /lab: ${lab.LAB.length} items (${counts}), links resolve, nothing third-party`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
