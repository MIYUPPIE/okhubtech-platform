#!/usr/bin/env node
/**
 * Post-deploy check against the live site.
 *
 * Unlike scripts/verify-export.mjs this hits the network, so it is NOT a gate
 * test - run it after uploading. It answers one question the local check
 * cannot: is the server actually serving pages, or is it serving a directory
 * listing?
 *
 *   npm run verify:live
 *   node scripts/verify-live.mjs https://staging.example.com
 */

import { readFileSync, existsSync } from "node:fs";
import process from "node:process";

const ORIGIN = (process.argv[2] ?? "https://okhubtech.com").replace(/\/$/, "");
const OUT = "out";
const TIMEOUT_MS = 15000;

/** Routes to probe, read from the deployed sitemap so the list never drifts. */
function routesFromSitemap() {
  const path = `${OUT}/sitemap.xml`;
  if (!existsSync(path)) return null;
  const xml = readFileSync(path, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, ""),
  );
}

const routes = routesFromSitemap() ?? [
  "/",
  "/services/",
  "/services/cctv-surveillance/",
  "/portfolio/",
  "/about/",
  "/contact/",
];

async function probe(path) {
  const url = `${ORIGIN}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    const body = await res.text();

    // LiteSpeed and Apache autoindex fingerprints. This is the failure being
    // guarded against: a 200 that is a file listing, not a page.
    const isListing =
      /Proudly Served by LiteSpeed/i.test(body) ||
      /<title>Index of \//i.test(body) ||
      /<h1>Index of \//i.test(body);

    const hasApp = /__next_f|_next\/static/.test(body);

    if (res.status !== 200) return { path, ok: false, why: `HTTP ${res.status}` };
    if (isListing) return { path, ok: false, why: "serving a directory listing, not the page" };
    if (!hasApp) return { path, ok: false, why: "200 but no Next.js markup in the response" };
    return { path, ok: true, why: `${res.status} ${(body.length / 1024).toFixed(0)}kb` };
  } catch (err) {
    return { path, ok: false, why: err.name === "AbortError" ? "timed out" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function probeAsset(path, reject) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ORIGIN}${path}`, { signal: controller.signal });
    const body = await res.text();
    if (res.status !== 200) return { path, ok: false, why: `HTTP ${res.status}` };
    const bad = reject(body);
    return bad ? { path, ok: false, why: bad } : { path, ok: true, why: "200" };
  } catch (err) {
    return { path, ok: false, why: err.message };
  } finally {
    clearTimeout(timer);
  }
}

console.log(`Probing ${ORIGIN} (${routes.length} routes)\n`);

const results = [];
// Small concurrency so a shared host is not hammered.
for (let i = 0; i < routes.length; i += 6) {
  results.push(...(await Promise.all(routes.slice(i, i + 6).map(probe))));
}

results.push(
  await probeAsset("/robots.txt", (b) =>
    /^\s*import\s|export\s+default/.test(b) ? "serving TypeScript source instead of robots rules" : null,
  ),
);
results.push(
  await probeAsset("/sitemap.xml", (b) => (b.includes("<loc>") ? null : "no <loc> entries")),
);

for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"}  ${r.path.padEnd(42)} ${r.why}`);
}

const failures = results.filter((r) => !r.ok);
console.log("");
if (failures.length === 0) {
  console.log(`PASS  ${results.length}/${results.length} live checks against ${ORIGIN}`);
  process.exit(0);
}
console.error(`FAIL  ${failures.length}/${results.length} live checks against ${ORIGIN}`);
process.exit(1);
