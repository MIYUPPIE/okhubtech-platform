#!/usr/bin/env node
/**
 * Gate: the product catalogue stays honest and stays in sync with the routes.
 *
 * lib/products.ts is the single source of truth for /products, every
 * /products/<slug> page, and the sitemap entries for both. Three things can go
 * wrong, and all three have precedents on this site:
 *
 *  1. DRIFT — a product is added to the catalogue and the sitemap silently
 *     disagrees, or a slug is renamed and the old URL 404s. PUBLIC_ROUTES
 *     derives from PRODUCT_SLUGS to prevent this; this check proves it.
 *
 *  2. DEAD LINKS — a product linking a domain that does not resolve. /contact
 *     shipped six mailboxes on a domain OKHub does not own; linking a dead
 *     product domain is the same failure. Resolution itself is a network call
 *     and cannot live in an offline gate, so what is enforced here is the
 *     shape: https only, no trailing slash, no placeholder host.
 *
 *  3. THIN ENTRIES — a catalogue row with no summary, no highlights or no
 *     stack renders as an empty page. Better to fail the build than publish it.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-products.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const CATALOGUE = "lib/products.ts";

/** Slug rules: lowercase, digits and single hyphens, so the URL is stable. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Reads the catalogue without executing TypeScript. Every product is an object
 * literal in PRODUCTS_DATA; this pulls the fields the checks below need.
 */
export function readCatalogue(root) {
  const src = readFileSync(join(root, CATALOGUE), "utf8");
  const body = src.slice(src.indexOf("const PRODUCTS_DATA"));

  const products = [];
  for (const block of body.split(/\n  \{\n/).slice(1)) {
    const field = (name) => block.match(new RegExp(`\\b${name}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    const list = (name) => {
      const m = block.match(new RegExp(`\\b${name}: \\[([\\s\\S]*?)\\n?\\s*\\],`));
      if (!m) return [];
      return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    };
    const slug = field("slug");
    if (!slug) continue;
    products.push({
      slug,
      name: field("name"),
      tagline: field("tagline"),
      sector: field("sector"),
      url: field("url"),
      summary: list("summary"),
      highlights: list("highlights"),
      stack: list("stack"),
    });
  }
  return products;
}

/** @returns {{slug: string, problem: string}[]} */
export function checkCatalogue(products) {
  const problems = [];
  const seen = new Set();

  if (products.length === 0) {
    return [{ slug: "(catalogue)", problem: "no products parsed — did the file shape change?" }];
  }

  for (const p of products) {
    const say = (problem) => problems.push({ slug: p.slug, problem });

    if (!SLUG.test(p.slug)) say(`slug "${p.slug}" is not url-safe lowercase-with-hyphens`);
    if (seen.has(p.slug)) say("duplicate slug — two products would fight for one URL");
    seen.add(p.slug);

    if (!p.name) say("missing name");
    if (!p.tagline) say("missing tagline — the index card would be blank");
    if (!p.sector) say("missing sector");

    // A url is optional — plenty of this work has no public front door. But if
    // one is set it becomes a link on the page, so it has to be a real https
    // origin rather than a placeholder somebody meant to fill in later.
    if (p.url !== undefined) {
      if (!p.url.startsWith("https://")) say(`url "${p.url}" is not https`);
      else if (/\/$/.test(p.url)) say(`url "${p.url}" has a trailing slash; it is rendered as a label`);
      else if (/(example\.|localhost|127\.0\.0\.1|TODO|your-)/i.test(p.url)) say(`url "${p.url}" is a placeholder`);
    }

    if (p.summary.length < 2) say(`only ${p.summary.length} summary paragraph(s); needs at least 2`);
    if (p.highlights.length < 3) say(`only ${p.highlights.length} highlight(s); needs at least 3`);
    if (p.stack.length < 2) say(`only ${p.stack.length} stack entr(y/ies); needs at least 2`);
  }

  return problems;
}

/** The routes file must derive from the catalogue, not repeat it. */
export function checkRouting(root, products) {
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  const problems = [];

  // Checking for the import, not just a mention: a leftover reference in a
  // template string still reads as "PRODUCT_SLUGS" while the binding is gone.
  if (!/import \{[^}]*\bPRODUCT_SLUGS\b[^}]*\} from "\.\/products"/.test(site)) {
    problems.push({
      slug: "(routing)",
      problem: 'lib/site.ts does not import PRODUCT_SLUGS from "./products", so product routes can drift from the catalogue',
    });
  }
  if (!/PRODUCT_SLUGS\.map/.test(site)) {
    problems.push({
      slug: "(routing)",
      problem: "lib/site.ts imports PRODUCT_SLUGS but never maps it into PUBLIC_ROUTES",
    });
  }
  if (!/STANDALONE_PAGES = \[[^\]]*"products"/.test(site)) {
    problems.push({ slug: "(routing)", problem: '"products" is missing from STANDALONE_PAGES, so /products is not in the sitemap' });
  }
  // A slug hardcoded in site.ts would be a second copy of the catalogue.
  for (const p of products) {
    if (site.includes(`"${p.slug}"`)) {
      problems.push({ slug: p.slug, problem: "slug is hardcoded in lib/site.ts; it should come from PRODUCT_SLUGS" });
    }
  }
  return problems;
}

export function findProblems(root) {
  const products = readCatalogue(root);
  return [...checkCatalogue(products), ...checkRouting(root, products)];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const products = readCatalogue(ROOT);
  const problems = findProblems(ROOT);
  if (problems.length === 0) {
    const linked = products.filter((p) => p.url);
    const sectors = [...new Set(products.map((p) => p.sector))];
    console.log(`PASS  ${products.length} products across ${sectors.length} sectors, routed from ${CATALOGUE}`);
    console.log(`      ${linked.length} linked: ${linked.map((p) => p.url.replace("https://", "")).join(", ")}`);
    process.exit(0);
  }
  console.error(`FAIL  ${problems.length} catalogue problem(s)`);
  for (const { slug, problem } of problems) console.error(`  ${slug}: ${problem}`);
  process.exit(1);
}
