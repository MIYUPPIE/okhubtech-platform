#!/usr/bin/env node
/**
 * Gate test for the static export in out/.
 *
 * The bug this exists to prevent: `output: 'export'` without
 * `trailingSlash: true` writes `services/cctv-surveillance.html` beside a real
 * `services/cctv-surveillance/` directory that holds only RSC `.txt` payloads.
 * Apache/LiteSpeed mod_dir 301s the extensionless URL to the directory, finds no
 * index.html, and serves an autoindex listing. Every page on okhubtech.com
 * except the home page was serving a file listing this way.
 *
 * Deterministic, offline, no dependencies. Run after `next build`.
 *   node scripts/verify-export.mjs [outDir] [appDir]
 *
 * Exit 0 = safe to deploy. Exit 1 = do not upload this build.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

const OUT = process.argv[2] ?? "out";
// Second arg exists so the test suite can point check A at a fixture app tree
// instead of this repo's real app/.
const APP = process.argv[3] ?? "app";
const CANONICAL_HOST = "okhubtech.com";

/** Minimum plausible size of a rendered page, in bytes. */
const MIN_HTML_BYTES = 2000;

const failures = [];
const notes = [];
const fail = (check, detail) => failures.push({ check, detail });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dirs(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

/** Recursively collect every directory under root, as root-relative paths. */
function walkDirs(root, skip = () => false) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const cur = stack.pop();
    for (const name of dirs(cur)) {
      const full = join(cur, name);
      if (skip(name, full)) continue;
      out.push(full);
      stack.push(full);
    }
  }
  return out;
}

/**
 * Static routes declared by the app router: any directory holding a page file,
 * with route groups "(name)" stripped and dynamic "[param]" segments excluded
 * (those are covered by the out/ directory sweep instead).
 */
function staticRoutesFromApp() {
  const routes = [];
  const hasPage = (d) =>
    ["page.tsx", "page.ts", "page.jsx", "page.js"].some((f) => existsSync(join(d, f)));

  if (hasPage(APP)) routes.push("");

  for (const dir of walkDirs(APP, (name) => name === "api" || name.startsWith("_"))) {
    if (!hasPage(dir)) continue;
    const segments = relative(APP, dir).split(sep);
    if (segments.some((s) => s.startsWith("["))) continue; // dynamic
    const route = segments.filter((s) => !s.startsWith("(")).join("/");
    routes.push(route);
  }
  return [...new Set(routes)].sort();
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

if (!existsSync(OUT)) {
  console.error(`FAIL: export directory "${OUT}" does not exist. Run \`npm run build\` first.`);
  process.exit(1);
}

// A. Every static app-router route resolves to <route>/index.html.
const appRoutes = existsSync(APP) ? staticRoutesFromApp() : [];
if (!existsSync(APP)) {
  notes.push(`app router directory "${APP}" not found - route coverage check skipped`);
}
for (const route of appRoutes) {
  const indexPath = route === "" ? join(OUT, "index.html") : join(OUT, route, "index.html");
  if (!existsSync(indexPath)) {
    fail("A: route has no index.html", `/${route} -> missing ${indexPath}`);
    continue;
  }
  const bytes = statSync(indexPath).size;
  if (bytes < MIN_HTML_BYTES) {
    fail("A: rendered page implausibly small", `${indexPath} is ${bytes} bytes`);
  }
}

// B. No directory in the export lacks an index.html.
//    This is the autoindex bug itself, and it also covers dynamic routes.
//
//    Two tiers, because "no index.html" means different things:
//      B1 a directory holding page output (.html, or __next*.txt RSC payloads)
//         with no index.html is a BROKEN ROUTE - the page did not render where
//         the server will look for it. Always a failure.
//      B2 a data-only directory (out/api/, static JSON) legitimately has no
//         index.html. It is safe only because `Options -Indexes` turns the
//         listing into a 403, so it fails if that directive is not verified.
const skipDirs = new Set(["_next", "images", "portfolio-assets"]);
const htaccessPath = join(OUT, ".htaccess");
const indexesDisabled =
  existsSync(htaccessPath) && readFileSync(htaccessPath, "utf8").includes("Options -Indexes");

for (const dir of walkDirs(OUT, (name) => skipDirs.has(name) || name.startsWith("."))) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  if (files.length === 0 || existsSync(join(dir, "index.html"))) continue;

  const rel = relative(OUT, dir);
  const looksLikeRoute = files.some((f) => f.endsWith(".html") || f.startsWith("__next"));

  if (looksLikeRoute) {
    fail(
      "B1: route directory would render as an autoindex listing",
      `/${rel}/ has no index.html; would expose: ${files.slice(0, 6).join(", ")}`,
    );
  } else if (!indexesDisabled) {
    fail(
      "B2: data directory is listable",
      `/${rel}/ has no index.html and .htaccess does not disable Options -Indexes; ` +
        `would expose: ${files.slice(0, 6).join(", ")}`,
    );
  } else {
    notes.push(
      `/${rel}/ has no index.html (data only: ${files.slice(0, 4).join(", ")}) ` +
        `- returns 403 because Options -Indexes is set`,
    );
  }
}

// C. The broken shape: foo.html sitting beside a foo/ directory.
// `out/404.html` is written on purpose alongside `out/404/index.html`, because
// the ErrorDocument directive needs a real file path to point at.
const ALLOWED_SIBLING_HTML = new Set(["404"]);
for (const dir of [OUT, ...walkDirs(OUT, (name) => skipDirs.has(name) || name.startsWith("."))]) {
  for (const name of dirs(dir)) {
    if (dir === OUT && ALLOWED_SIBLING_HTML.has(name)) continue;
    if (existsSync(join(dir, `${name}.html`))) {
      fail(
        "C: stale non-trailing-slash export shape",
        `${join(relative(OUT, dir), name)}.html exists beside directory ${name}/ ` +
          `- is trailingSlash still true in next.config.ts, and was out/ cleaned?`,
      );
    }
  }
}

// D. .htaccess shipped and carries the directives that stop a listing.
const htaccess = join(OUT, ".htaccess");
if (!existsSync(htaccess)) {
  fail("D: .htaccess missing from export", `expected ${htaccess} (source: public/.htaccess)`);
} else {
  const text = readFileSync(htaccess, "utf8");
  for (const required of ["Options -Indexes", "DirectoryIndex index.html", "ErrorDocument 404"]) {
    if (!text.includes(required)) {
      fail("D: .htaccess missing directive", `"${required}" not found in out/.htaccess`);
    }
  }
}

// E. robots.txt is robots syntax, not the TypeScript source of a route file.
const robots = join(OUT, "robots.txt");
if (!existsSync(robots)) {
  fail("E: robots.txt not exported", `expected ${robots}`);
} else {
  const text = readFileSync(robots, "utf8");
  if (/^\s*import\s|export\s+default/.test(text)) {
    fail("E: robots.txt contains TypeScript source", "app/robots.ts must be .ts, not a literal robots.txt");
  }
  if (!/user-agent:/i.test(text)) {
    fail("E: robots.txt has no User-Agent rule", text.slice(0, 120));
  }
  if (!text.includes(CANONICAL_HOST)) {
    fail("E: robots.txt points at the wrong host", `expected ${CANONICAL_HOST}`);
  }
}

// F. sitemap.xml uses the canonical host and lists only URLs that are served
//    as-is (trailing slash), never ones that would 301.
const sitemap = join(OUT, "sitemap.xml");
if (!existsSync(sitemap)) {
  fail("F: sitemap.xml not exported", `expected ${sitemap}`);
} else {
  const text = readFileSync(sitemap, "utf8");
  const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) fail("F: sitemap.xml has no <loc> entries", sitemap);

  for (const loc of locs) {
    if (!loc.includes(CANONICAL_HOST)) {
      fail("F: sitemap entry on the wrong host", loc);
    }
    if (!loc.endsWith("/")) {
      fail("F: sitemap entry would 301", `${loc} lacks the trailing slash the server redirects to`);
    }
    const path = loc.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
    const target = path === "" ? join(OUT, "index.html") : join(OUT, path, "index.html");
    if (!existsSync(target)) {
      fail("F: sitemap entry has no exported page", `${loc} -> missing ${target}`);
    }
  }

  for (const gated of ["/admin", "/login", "/register", "/unauthorized"]) {
    if (locs.some((l) => l.includes(gated))) {
      fail("F: gated route listed in sitemap", gated);
    }
  }
  notes.push(`sitemap.xml lists ${locs.length} URLs, all resolving to exported pages`);
}

// G. No build or deploy junk shipped to the web root.
const junkPatterns = [/\.zip$/i, /\.tar(\.gz)?$/i, /^\.env/, /\.map$/, /^tsconfig\.json$/];
for (const entry of readdirSync(OUT, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (junkPatterns.some((re) => re.test(entry.name))) {
    fail("G: build artifact in the web root", `out/${entry.name} would be publicly downloadable`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const pageCount = walkDirs(OUT, (n) => skipDirs.has(n) || n.startsWith(".")).filter((d) =>
  existsSync(join(d, "index.html")),
).length + (existsSync(join(OUT, "index.html")) ? 1 : 0);

if (failures.length === 0) {
  console.log(`PASS  static export verified in ${OUT}/`);
  console.log(`      ${appRoutes.length} app-router routes checked, ${pageCount} pages with index.html`);
  for (const n of notes) console.log(`      ${n}`);
  console.log(`      no directory in the export can render as a file listing`);
  process.exit(0);
}

console.error(`FAIL  ${failures.length} problem(s) in ${OUT}/ - do not deploy this build\n`);
for (const { check, detail } of failures) {
  console.error(`  [${check}]`);
  console.error(`      ${detail}`);
}
process.exit(1);
