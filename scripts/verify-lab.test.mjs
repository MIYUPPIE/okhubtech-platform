#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-lab.mjs. Starts from the real lib/lab.ts,
 * mutates one thing per case, and asserts the checker catches it.
 *
 * Deterministic, offline.  node scripts/verify-lab.test.mjs
 */

import process from "node:process";

import { checkLab, knownRoutes, loadLab } from "./verify-lab.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const { LAB, LAB_KINDS } = await loadLab(ROOT);
const routes = knownRoutes(ROOT);

const withItem = (slug, patch) => structuredClone(LAB).map((i) => (i.slug === slug ? { ...i, ...patch } : i));
const run = (items) => checkLab(items, LAB_KINDS, routes, ROOT);

const cases = [
  ["baseline passes", () => run(LAB), 0],
  ["route list parsed", () => (routes.has("/products/logsme") && routes.has("/schools") ? [] : ["routes not parsed"]), 0],

  // third-party work and private details
  ["competition toolkit listed as ours", () => run(withItem("camguard", { title: "AI for Industry Challenge entry" })), /Intrinsic/],
  ["vendor course", () => run(withItem("pybullet-for-kids", { title: "AI Agents for Beginners" })), /third-party course/],
  ["forked repo", () => run(withItem("camguard", { summary: "A virtual physics drum kit." })), /fork/],
  ["NVIDIA course notes", () => run(withItem("pybullet-for-kids", { title: "A Beginner's Guide to Autonomous Robots" })), /NVIDIA/],
  ["removed campaign", () => run(withItem("nfctool", { tagline: "Built for kso.ng" })), /removed/],
  ["client named", () => run(withItem("whatsapp-gateway", { status: "In production for Vesi" })), /client name/],
  ["email address", () => run(withItem("logsme-paper", { summary: "Contact someone@example.com." })), /email address/],
  ["server address", () => run(withItem("whatsapp-gateway", { summary: "Runs on 159.223.30.191." })), /server address/],

  // papers
  ["paper claimed as published", () => run(withItem("logsme-paper", { status: "Published, 2025" })), /must start with "Submitted"/],
  ["paper without authors", () => run(withItem("gamblealert-paper", { authors: [] })), /no authors/],
  ["authors on a non-paper", () => run(withItem("camguard", { authors: ["Someone"] })), /only papers carry authors/],

  // links and shape
  ["dead internal link", () => run(withItem("camguard", { links: [{ label: "x", href: "/products/no-such" }] })), /does not resolve/],
  ["missing file link", () => run(withItem("camguard", { links: [{ label: "x", href: "/media/docs/nope.pdf" }] })), /does not resolve/],
  ["external link", () => run(withItem("camguard", { links: [{ label: "x", href: "https://example.org" }] })), /not internal/],
  ["anchor on a real route is fine", () => run(withItem("camguard", { links: [{ label: "x", href: "/schools#lab-packs" }] })), 0],
  ["unknown kind", () => run(withItem("camguard", { kind: "product" })), /unknown kind/],
  ["duplicate slug", () => run([...structuredClone(LAB), structuredClone(LAB[0])]), /duplicate slug/],
  ["thin entry", () => run(withItem("camguard", { points: ["one"] })), /needs 2/],
  ["bad slug", () => run(withItem("camguard", { slug: "Cam Guard" })), /slug is not/],
];

const failed = [];
let passed = 0;
for (const [name, fn, expect] of cases) {
  let problems;
  try { problems = fn(); } catch (e) { problems = [`threw: ${e.message}`]; }
  const ok = expect === 0 ? problems.length === 0 : problems.some((p) => expect.test(p));
  if (ok) passed++; else failed.push({ name, problems, expect });
}
if (failed.length === 0) {
  console.log(`PASS  ${passed}/${cases.length} lab tests`);
  process.exit(0);
}
console.error(`FAIL  ${failed.length}/${cases.length} lab tests`);
for (const { name, problems, expect } of failed) {
  console.error(`  ${name}  (expected ${expect === 0 ? "no problems" : expect})`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
