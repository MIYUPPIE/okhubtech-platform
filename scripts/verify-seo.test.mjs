#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-seo.mjs.
 *
 * The case that matters most is "page shares the homepage's entire share
 * card": that is the literal bug report this script exists to catch - a page
 * that renders successfully, with a <title> and OG tags present, but every
 * one of them copied from the homepage because the page never set its own.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-seo.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import process from "node:process";

const VERIFIER = new URL("./verify-seo.mjs", import.meta.url).pathname;
const SITE_URL = "https://okhubtech.com";

const write = (root, rel, body) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};

function page({
  title = "Networking | OKHub Technology",
  canonical = `${SITE_URL}/services/networking/`,
  ogTitle = "Networking",
  ogDesc = "Reliable connectivity for campuses and data centres.",
  ogImage = `${SITE_URL}/media/og/services.png`,
  ogUrl = `${SITE_URL}/services/networking/`,
  twitterCard = "summary_large_image",
  twitterImage = `${SITE_URL}/media/og/services.png`,
  robots,
  extra = "",
} = {}) {
  return `<!DOCTYPE html><html><head>
<title>${title}</title>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${ogTitle}"/>
<meta property="og:description" content="${ogDesc}"/>
<meta property="og:image" content="${ogImage}"/>
<meta property="og:url" content="${ogUrl}"/>
<meta name="twitter:card" content="${twitterCard}"/>
<meta name="twitter:image" content="${twitterImage}"/>
${robots ? `<meta name="robots" content="${robots}"/>` : ""}
${extra}
</head><body>${"x".repeat(500)}</body></html>`;
}

const HOME_HTML = page({
  title: "OKHub Technology — AI, robotics and data systems, built in Ibadan",
  canonical: `${SITE_URL}/`,
  ogTitle: "OKHub Technology",
  ogDesc: "Training minds. Building solutions. Powering Africa's future.",
  ogImage: `${SITE_URL}/media/brand/og-image.png`,
  ogUrl: `${SITE_URL}/`,
  twitterImage: `${SITE_URL}/media/brand/og-image.png`,
  extra:
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"OKHub Technology"}</script>' +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"OKHub Technology"}</script>',
});

const SITE_TS = `
export const TOP_LEVEL_PAGES = ["about"] as const;
export const STANDALONE_PAGES = ["data"] as const;
export const SERVICE_SLUGS = ["networking"] as const;
export const PORTFOLIO_SLUGS = [] as const;
export const EXPERTISE_SLUGS = [] as const;
export const NOINDEX_ROUTES = ["/admin"] as const;
`;
const PRODUCTS_TS = `export const PRODUCTS = [] as const;\n`;

/** A minimal tree that should pass every check. */
function goodTree(root) {
  write(root, "lib/site.ts", SITE_TS);
  write(root, "lib/products.ts", PRODUCTS_TS);

  write(root, "out/index.html", HOME_HTML);
  write(root, "out/media/brand/og-image.png", "PNG");
  write(root, "out/services/index.html", page({
    title: "Services | OKHub Technology",
    canonical: `${SITE_URL}/services/`,
    ogTitle: "Services",
    ogUrl: `${SITE_URL}/services/`,
    ogImage: `${SITE_URL}/media/og/services.png`,
    twitterImage: `${SITE_URL}/media/og/services.png`,
  }));
  write(root, "out/portfolio/index.html", page({
    title: "Portfolio | OKHub Technology",
    canonical: `${SITE_URL}/portfolio/`,
    ogTitle: "Portfolio",
    ogUrl: `${SITE_URL}/portfolio/`,
    ogImage: `${SITE_URL}/media/og/portfolio.png`,
    twitterImage: `${SITE_URL}/media/og/portfolio.png`,
  }));
  write(root, "out/products/index.html", page({
    title: "Products | OKHub Technology",
    canonical: `${SITE_URL}/products/`,
    ogTitle: "Products",
    ogUrl: `${SITE_URL}/products/`,
    ogImage: `${SITE_URL}/media/og/products.png`,
    twitterImage: `${SITE_URL}/media/og/products.png`,
  }));
  write(root, "out/media/og/portfolio.png", "PNG");
  write(root, "out/media/og/products.png", "PNG");
  write(root, "out/about/index.html", page({
    title: "About | OKHub Technology",
    canonical: `${SITE_URL}/about/`,
    ogTitle: "About OKHub",
    ogUrl: `${SITE_URL}/about/`,
  }));
  write(root, "out/data/index.html", page({
    title: "Data | OKHub Technology",
    canonical: `${SITE_URL}/data/`,
    ogTitle: "Data",
    ogUrl: `${SITE_URL}/data/`,
    ogImage: `${SITE_URL}/media/og/data.png`,
    twitterImage: `${SITE_URL}/media/og/data.png`,
  }));
  write(root, "out/services/networking/index.html", page());
  write(root, "out/media/og/services.png", "PNG");
  write(root, "out/media/og/data.png", "PNG");
  write(root, "out/admin/index.html", page({
    title: "Admin | OKHub Technology",
    canonical: `${SITE_URL}/admin/`,
    ogUrl: `${SITE_URL}/admin/`,
    robots: "noindex, nofollow",
  }));
  return root;
}

function run(root) {
  const args = [VERIFIER, join(root, "out"), root];
  try {
    const stdout = execFileSync(process.execPath, args, { encoding: "utf8" });
    return { code: 0, output: stdout };
  } catch (err) {
    return { code: err.status ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

const cases = [];
const test = (name, setup, expect) => cases.push({ name, setup, expect });

test("clean tree passes", (root) => goodTree(root), { code: 0 });

test(
  "a page sharing the homepage's entire OG card is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({
      title: "Networking | OKHub Technology", // title differs, so check B alone would miss this
      ogTitle: "OKHub Technology",
      ogDesc: "Training minds. Building solutions. Powering Africa's future.",
      ogImage: `${SITE_URL}/media/brand/og-image.png`,
    }));
  },
  { code: 1, contains: ["shares the homepage's entire share card", "/services/networking"] },
);

test(
  "a page with the homepage's exact <title> is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({
      title: "OKHub Technology — AI, robotics and data systems, built in Ibadan",
    }));
  },
  { code: 1, contains: ["title is identical to the homepage's"] },
);

test(
  "a title missing the site suffix is rejected (the layout-inheritance bug)",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({ title: "Networking" }));
  },
  { code: 1, contains: ["title is missing the site suffix", "Networking"] },
);

test(
  "a missing canonical link is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({ canonical: "" }).replace(/<link[^>]*>/, ""));
  },
  { code: 1, contains: ['no <link rel="canonical">'] },
);

test(
  "a canonical that does not match the served URL is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({ canonical: `${SITE_URL}/services/wrong-slug/` }));
  },
  { code: 1, contains: ["canonical does not match the served URL"] },
);

test(
  "a missing og:image is rejected",
  (root) => {
    goodTree(root);
    write(
      root,
      "out/services/networking/index.html",
      page().replace(/<meta property="og:image"[^>]*>/, ""),
    );
  },
  { code: 1, contains: ["no og:image"] },
);

test(
  "an og:image pointing at a file that was not exported is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({ ogImage: `${SITE_URL}/media/og/ghost.png` }));
  },
  { code: 1, contains: ["og:image points at a file that was not exported", "ghost.png"] },
);

test(
  "twitter:card not set to summary_large_image is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/services/networking/index.html", page({ twitterCard: "summary" }));
  },
  { code: 1, contains: ["twitter:card is not summary_large_image"] },
);

test(
  "a gated route with no noindex meta tag is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/admin/index.html", page({
      title: "Admin | OKHub Technology",
      canonical: `${SITE_URL}/admin/`,
      ogUrl: `${SITE_URL}/admin/`,
    }));
  },
  { code: 1, contains: ["gated route has no noindex meta tag", "/admin"] },
);

test(
  "a homepage with no Organization JSON-LD is rejected",
  (root) => {
    goodTree(root);
    write(root, "out/index.html", HOME_HTML.replace(/"@type":"Organization"[^}]*\}<\/script>/, "").replace(
      '<script type="application/ld+json"></script>',
      "",
    ));
  },
  { code: 1, contains: ["no Organization JSON-LD"] },
);

test(
  "a revived fake YouTube embed is rejected",
  (root) => {
    goodTree(root);
    write(
      root,
      "out/services/networking/index.html",
      page({ extra: '<iframe src="https://www.youtube.com/embed/4u5XQWkQe3g"></iframe>' }),
    );
  },
  { code: 1, contains: ["known-fake YouTube embed is back", "4u5XQWkQe3g"] },
);

test(
  "a route missing from the export entirely is rejected",
  (root) => {
    goodTree(root);
    rmSync(join(root, "out/data"), { recursive: true, force: true });
  },
  { code: 1, contains: ["route has no exported page", "/data"] },
);

let passed = 0;
const failed = [];

for (const { name, setup, expect } of cases) {
  const root = mkdtempSync(join(tmpdir(), "okhub-seo-"));
  try {
    setup(root);
    const { code, output } = run(root);
    const problems = [];
    if (code !== expect.code) problems.push(`exit ${code}, expected ${expect.code}`);
    for (const needle of expect.contains ?? []) {
      if (!output.includes(needle)) problems.push(`output missing ${JSON.stringify(needle)}`);
    }
    if (problems.length) failed.push({ name, problems, output });
    else passed += 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (failed.length === 0) {
  console.log(`PASS  ${passed}/${cases.length} seo-verifier tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${cases.length} seo-verifier tests`);
for (const { name, problems, output } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
  console.error("      --- verifier output ---");
  console.error(output.split("\n").map((l) => `      ${l}`).join("\n"));
}
process.exit(1);
