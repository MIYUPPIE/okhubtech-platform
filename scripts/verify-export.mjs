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

// H. Every internal link resolves to something that was actually exported.
//    The homepage shipped links to /programs, /partners, /store, /enroll,
//    /research, /publications, /cart and even /services/undefined - eight dead
//    ends on the first page a visitor sees.
{
  const pageTargets = new Set();
  const walkAll = [OUT, ...walkDirs(OUT, (name) => name.startsWith("."))];
  for (const dir of walkAll) {
    if (existsSync(join(dir, "index.html"))) {
      const rel = relative(OUT, dir);
      pageTargets.add(rel === "" ? "/" : `/${rel.split(sep).join("/")}/`);
    }
  }

  const linkRe = /href="(\/[^"#?]*)"/g;
  const broken = new Map();

  const htmlFiles = [];
  const collect = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "_next") collect(full);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(full);
      }
    }
  };
  collect(OUT);

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const from = relative(OUT, file) || "index.html";
    for (const match of html.matchAll(linkRe)) {
      const href = match[1];
      // Asset routes are files, not pages; they are covered by checks B and G.
      if (/^\/(_next|media|api)\//.test(href)) continue;
      const asPage = href.endsWith("/") ? href : `${href}/`;
      if (pageTargets.has(asPage)) continue;
      if (existsSync(join(OUT, href.replace(/^\//, "")))) continue;
      const seen = broken.get(href) ?? new Set();
      seen.add(from);
      broken.set(href, seen);
    }
  }

  for (const [href, from] of [...broken].sort()) {
    fail(
      "H: internal link goes nowhere",
      `${href} is linked from ${[...from].slice(0, 3).join(", ")} but no such page was exported`,
    );
  }
  if (broken.size === 0) {
    notes.push(`every internal link across ${htmlFiles.length} pages resolves`);
  }
}

// I. Every media file the pages reference was actually exported. The manifest
//    is generated from assets/, so deleting a master and rebuilding the site
//    without re-running `npm run media` would leave dead src attributes.
{
  const mediaRe = /(?:src|href)="(\/media\/[^"]+)"/g;
  const missing = new Map();
  const seen = new Set();

  const htmlFiles = [];
  const collect = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "_next") collect(full);
      } else if (entry.name.endsWith(".html")) {
        htmlFiles.push(full);
      }
    }
  };
  collect(OUT);

  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(mediaRe)) {
      const ref = match[1];
      seen.add(ref);
      if (!existsSync(join(OUT, ref.replace(/^\//, "")))) {
        const from = missing.get(ref) ?? new Set();
        from.add(relative(OUT, file) || "index.html");
        missing.set(ref, from);
      }
    }
  }

  // Route handlers export JSON, not HTML, so asset paths inside them are
  // invisible to the sweep above. The whole portfolio index broke this way:
  // out/api/portfolio still served /portfolio/*.png after those files moved.
  const dataFiles = [];
  const collectData = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) collectData(full);
      else if (!/\.(html|js|css|map|png|jpe?g|webp|avif|svg|ico|mp4|webm|woff2?|pdf)$/i.test(entry.name)) {
        dataFiles.push(full);
      }
    }
  };
  collectData(join(OUT, "api"));

  const pathRe = /"(\/[A-Za-z0-9._\/-]+\.(?:webp|png|jpe?g|avif|svg|mp4|webm|pdf))"/g;
  for (const file of dataFiles) {
    const body = readFileSync(file, "utf8");
    for (const match of body.matchAll(pathRe)) {
      const ref = match[1];
      seen.add(ref);
      if (!existsSync(join(OUT, ref.replace(/^\//, "")))) {
        const from = missing.get(ref) ?? new Set();
        from.add(relative(OUT, file));
        missing.set(ref, from);
      }
    }
  }

  for (const [ref, from] of [...missing].sort()) {
    fail(
      "I: referenced media file was not exported",
      `${ref} is referenced by ${[...from].slice(0, 3).join(", ")} - re-run \`npm run media\``,
    );
  }
  if (missing.size === 0 && seen.size > 0) {
    notes.push(`all ${seen.size} referenced media files are present`);
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
