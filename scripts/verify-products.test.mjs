#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-products.mjs.
 *
 * The parser is the fragile part — it reads TypeScript object literals with a
 * regex rather than a compiler — so it is tested against the real catalogue as
 * well as against fixtures, and it must fail loudly rather than silently
 * returning zero products if the file shape ever changes.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-products.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import { checkCatalogue, checkRouting, readCatalogue, findProblems } from "./verify-products.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/** A complete product; each case below breaks exactly one thing. */
const ok = (over = {}) => ({
  slug: "thing",
  name: "Thing",
  tagline: "Does a thing.",
  sector: "Commerce",
  summary: ["one", "two"],
  highlights: ["a", "b", "c"],
  stack: ["X", "Y"],
  ...over,
});

const cases = [
  ["a complete product passes", [ok()], 0],
  ["no url passes — not everything has a public front door", [ok()], 0],
  ["an https url passes", [ok({ url: "https://x.ng" })], 0],
  ["http url fails", [ok({ url: "http://x.ng" })], 1],
  ["a trailing slash fails — the url is rendered as a label", [ok({ url: "https://x.ng/" })], 1],
  ["a placeholder host fails", [ok({ url: "https://example.com" })], 1],
  ["localhost fails", [ok({ url: "https://localhost:3000" })], 1],
  ["duplicate slug fails", [ok(), ok()], 1],
  ["uppercase slug fails", [ok({ slug: "Thing" })], 1],
  ["slug with spaces fails", [ok({ slug: "two things" })], 1],
  ["one summary paragraph fails", [ok({ summary: ["only"] })], 1],
  ["two highlights fail", [ok({ highlights: ["a", "b"] })], 1],
  ["one stack entry fails", [ok({ stack: ["X"] })], 1],
  ["missing tagline fails", [ok({ tagline: "" })], 1],
  ["an empty catalogue fails loudly", [], 1],
];

const failed = [];
let passed = 0;

for (const [name, products, want] of cases) {
  const got = checkCatalogue(products).length;
  if (got === want) passed += 1;
  else failed.push({ name, problems: [`got ${got} problem(s), expected ${want}`] });
}

// Routing: site.ts must derive from the catalogue rather than repeat it.
{
  const root = mkdtempSync(join(tmpdir(), "products-gate-"));
  const write = (rel, body) => {
    mkdirSync(join(root, "lib"), { recursive: true });
    writeFileSync(join(root, rel), body);
  };
  const problems = [];
  try {
    const GOOD =
      'import { PRODUCT_SLUGS } from "./products";\n' +
      'export const STANDALONE_PAGES = ["data", "products"] as const;\n' +
      "export const PUBLIC_ROUTES = [...PRODUCT_SLUGS.map((s) => `/products/${s}`)];\n";

    write("lib/site.ts", GOOD);
    if (checkRouting(root, [ok()]).length !== 0) problems.push("a correct site.ts should report nothing");

    write("lib/site.ts", GOOD.replace('import { PRODUCT_SLUGS } from "./products";\n', ""));
    if (checkRouting(root, [ok()]).length === 0) problems.push("a site.ts with no PRODUCT_SLUGS import should fail");

    // The import surviving while the mapping is deleted is the subtle case: the
    // string is still in the file, so a naive substring check would pass it.
    write("lib/site.ts", GOOD.replace("[...PRODUCT_SLUGS.map((s) => `/products/${s}`)]", "[]"));
    if (checkRouting(root, [ok()]).length === 0) problems.push("an unused PRODUCT_SLUGS import should fail");

    write("lib/site.ts", GOOD.replace('"data", "products"', '"data"'));
    if (checkRouting(root, [ok()]).length === 0) problems.push("products missing from STANDALONE_PAGES should fail");

    write("lib/site.ts", GOOD + 'const dup = "thing";\n');
    if (checkRouting(root, [ok()]).length === 0) problems.push("a slug hardcoded in site.ts should fail");

    if (problems.length) failed.push({ name: "routing checks", problems });
    else passed += 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// The parser must actually read the real catalogue, not quietly return nothing.
{
  const products = readCatalogue(ROOT);
  const problems = [];
  if (products.length < 5) problems.push(`parsed only ${products.length} products from the real catalogue`);
  const logsme = products.find((p) => p.slug === "logsme");
  if (!logsme) problems.push("did not find the logsme entry");
  else {
    if (!logsme.url?.startsWith("https://")) problems.push("logsme url did not parse");
    if (logsme.summary.length < 2) problems.push("logsme summary did not parse");
    if (logsme.stack.length < 2) problems.push("logsme stack did not parse");
  }
  if (problems.length) failed.push({ name: "parses the real catalogue", problems });
  else passed += 1;
}

// Finally: the real repository must be clean.
{
  const problems = findProblems(ROOT);
  if (problems.length === 0) passed += 1;
  else failed.push({ name: "repository is clean", problems: problems.map((p) => `${p.slug}: ${p.problem}`) });
}

const total = cases.length + 3;
if (failed.length === 0) {
  console.log(`PASS  ${passed}/${total} product-catalogue tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${total} product-catalogue tests`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
