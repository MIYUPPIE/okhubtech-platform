#!/usr/bin/env node
/**
 * Gate: every indexable page has its own title, description, canonical link
 * and share image - and every gated page is provably kept out of search.
 *
 * The bug this exists to prevent: ~28 of the site's ~40 routes had no
 * metadata of their own and silently inherited the root layout's. Sharing
 * /services/networking, /expertise/robotics, or any of eight portfolio pages
 * on WhatsApp, Twitter or LinkedIn showed the exact same title, description
 * AND preview image as the homepage - a visitor had no way to tell which
 * page they were looking at before clicking through.
 *
 * Deterministic, offline, no dependencies. Run after `next build`.
 *   node scripts/verify-seo.mjs [outDir]
 *
 * Exit 0 = every route carries its own identity. Exit 1 = do not deploy.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const OUT = process.argv[2] ?? "out";
// Third arg exists so the test suite can point route-list reading at a
// fixture tree instead of this repo's real lib/site.ts and lib/products.ts.
const SITE_ROOT = process.argv[3] ?? process.cwd();
const SITE_URL = "https://okhubtech.com";

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });

// ---------------------------------------------------------------------------
// Route lists, read from lib/site.ts without executing TypeScript - the same
// technique scripts/verify-bootcamp.mjs and scripts/verify-products.mjs use,
// so this can never drift from what the site itself considers public.
// ---------------------------------------------------------------------------

function readRouteLists(root) {
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");

  const arrayLiteral = (name) => {
    const m = site.match(new RegExp(`${name}[^=]*=\\s*\\[([^\\]]*)\\]`, "s"));
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  };

  const topLevel = arrayLiteral("TOP_LEVEL_PAGES");
  const standalone = arrayLiteral("STANDALONE_PAGES");
  const services = arrayLiteral("SERVICE_SLUGS");
  const portfolio = arrayLiteral("PORTFOLIO_SLUGS");
  const expertise = arrayLiteral("EXPERTISE_SLUGS");
  const noindex = arrayLiteral("NOINDEX_ROUTES");

  // "services" and "portfolio" are TOP_LEVEL_PAGES entries whose content
  // never renders - app/services/page.tsx and app/portfolio/page.tsx are
  // static routes that win the same path. Checking them here would assert
  // against dead code; see the matching comment in app/[page]/page.tsx.
  const liveTopLevel = topLevel.filter((p) => p !== "services" && p !== "portfolio");

  const productSlugs = (() => {
    const products = readFileSync(join(root, "lib/products.ts"), "utf8");
    return [...products.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  })();

  const routes = [
    "",
    ...liveTopLevel.map((p) => `/${p}`),
    ...standalone.map((p) => `/${p}`),
    ...productSlugs.map((s) => `/products/${s}`),
    ...services.map((s) => `/services/${s}`),
    ...portfolio.map((s) => `/portfolio/${s}`),
    ...expertise.map((s) => `/expertise/${s}`),
    "/services",
    "/portfolio",
    "/products",
  ];

  return { routes: [...new Set(routes)], noindex };
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function pageHtml(route) {
  const path = route === "" ? join(OUT, "index.html") : join(OUT, route, "index.html");
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function metaContent(html, attr, value) {
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  return tag?.match(/content=["']([^"']*)["']/)?.[1] ?? null;
}

function tag(html, name) {
  return html.match(new RegExp(`<${name}[^>]*>([^<]*)</${name}>`, "i"))?.[1] ?? null;
}

function canonicalHref(html) {
  return html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

if (!existsSync(OUT)) {
  console.error(`FAIL: export directory "${OUT}" does not exist. Run \`npm run build\` first.`);
  process.exit(1);
}

const { routes, noindex } = readRouteLists(SITE_ROOT);

const home = pageHtml("");
if (home === null) {
  fail("A: homepage did not export", `expected ${join(OUT, "index.html")}`);
  console.error("FAIL  cannot continue without the homepage to compare every other page against\n");
  for (const { check, detail } of failures) console.error(`  [${check}]\n      ${detail}`);
  process.exit(1);
}
const homeTitle = tag(home, "title");
const homeOgTitle = metaContent(home, "property", "og:title");
const homeOgDesc = metaContent(home, "property", "og:description");
const homeOgImage = metaContent(home, "property", "og:image");

let checked = 0;

for (const route of routes) {
  const html = pageHtml(route);
  if (html === null) {
    fail("A: route has no exported page", `${route === "" ? "/" : route} -> no index.html`);
    continue;
  }
  checked++;
  const label = route === "" ? "/" : route;

  // --- B: <title> -----------------------------------------------------
  const title = tag(html, "title");
  if (!title) {
    fail("B: no <title>", label);
  } else if (route !== "" && title === homeTitle) {
    fail("B: title is identical to the homepage's", `${label}: "${title}"`);
  } else if (route !== "" && !title.endsWith(" | OKHub Technology")) {
    // Caught a real bug during development: app/portfolio/layout.tsx sets
    // its own title so /portfolio itself can have one (a client-component
    // page cannot export metadata), which silently breaks Next's title
    // template for every page nested under that layout - the twelve
    // portfolio leaf pages rendered "UTME Career Advisor" instead of
    // "UTME Career Advisor | OKHub Technology". Fixed by having
    // lib/seo.ts's pageMetadata() compose the full title itself instead of
    // relying on template inheritance; this keeps the fix from silently
    // regressing if a future layout does the same thing.
    fail("B: title is missing the site suffix", `${label}: "${title}"`);
  }

  // --- C: canonical -----------------------------------------------------
  const canonical = canonicalHref(html);
  const expectedCanonical = route === "" ? `${SITE_URL}/` : `${SITE_URL}${route}/`;
  if (!canonical) {
    fail("C: no <link rel=\"canonical\">", label);
  } else if (canonical !== expectedCanonical) {
    fail("C: canonical does not match the served URL", `${label}: got "${canonical}", expected "${expectedCanonical}"`);
  }

  // --- D: Open Graph ------------------------------------------------------
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDesc = metaContent(html, "property", "og:description");
  const ogImage = metaContent(html, "property", "og:image");
  const ogUrl = metaContent(html, "property", "og:url");

  if (!ogTitle) fail("D: no og:title", label);
  if (!ogDesc) fail("D: no og:description", label);
  if (!ogImage) fail("D: no og:image", label);
  if (!ogUrl) fail("D: no og:url", label);

  if (route !== "" && ogTitle === homeOgTitle && ogDesc === homeOgDesc && ogImage === homeOgImage) {
    fail(
      "D: page shares the homepage's entire share card",
      `${label}: og:title, og:description and og:image are all identical to "/" - this page has no metadata of its own`,
    );
  }

  if (ogImage) {
    const imagePath = ogImage.replace(SITE_URL, "").replace(/^\//, "");
    if (!existsSync(join(OUT, imagePath))) {
      fail("D: og:image points at a file that was not exported", `${label}: ${ogImage}`);
    }
  }

  // --- E: Twitter card ------------------------------------------------
  const twitterCard = metaContent(html, "name", "twitter:card");
  if (twitterCard !== "summary_large_image") {
    fail("E: twitter:card is not summary_large_image", `${label}: got "${twitterCard}"`);
  }
  if (!metaContent(html, "name", "twitter:image")) {
    fail("E: no twitter:image", label);
  }
}

// --- F: gated routes are provably out of the index ----------------------
for (const route of noindex) {
  const html = pageHtml(route);
  if (html === null) continue; // covered by check A's counterpart in verify-export
  const robots = metaContent(html, "name", "robots");
  if (!robots || !/noindex/i.test(robots)) {
    fail("F: gated route has no noindex meta tag", `${route}: robots.txt disallows crawling it, but a linked or bookmarked URL can still be indexed without this tag`);
  }
}

// --- G: JSON-LD structured data on the homepage --------------------------
const ldBlocks = [...home.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
  (m) => m[1],
);
const types = ldBlocks
  .map((block) => {
    try {
      return JSON.parse(block)["@type"];
    } catch {
      return null;
    }
  })
  .filter(Boolean);

if (!types.includes("Organization")) fail("G: no Organization JSON-LD on the homepage", "");
if (!types.includes("WebSite")) fail("G: no WebSite JSON-LD on the homepage", "");

// --- H: no fabricated YouTube embeds survived ----------------------------
// Nine service/expertise pages carried "Watch Our Overview" embeds pointing
// at YouTube ids that return 404 on oEmbed - invented, not real OKHub videos.
// They were removed; this keeps them from quietly coming back.
const FAKE_YOUTUBE_IDS = [
  "6oH02sA6aR8", "AdqFQ8pQY7k", "2vK1G6b0GJc",
  "4u5XQWkQe3g", "3JluqTojuME",
];
for (const route of routes) {
  const html = pageHtml(route);
  if (!html) continue;
  for (const id of FAKE_YOUTUBE_IDS) {
    if (html.includes(id)) {
      fail("H: a known-fake YouTube embed is back", `${route || "/"}: video id ${id} does not exist (404 on oEmbed)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (failures.length === 0) {
  console.log(`PASS  ${checked} routes carry their own title, description, canonical and share card`);
  console.log(`      ${noindex.length} gated route(s) confirmed noindex`);
  console.log("      Organization + WebSite JSON-LD present on the homepage");
  console.log("      no fabricated video embeds in the export");
  process.exit(0);
}

console.error(`FAIL  ${failures.length} problem(s) - do not deploy this build\n`);
for (const { check, detail } of failures) {
  console.error(`  [${check}]`);
  if (detail) console.error(`      ${detail}`);
}
process.exit(1);
