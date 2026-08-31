#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-export.mjs.
 *
 * Builds throwaway export fixtures and asserts the verifier's exit code. The
 * important case is "broken shape", which reproduces the exact layout that made
 * every okhubtech.com page serve a LiteSpeed autoindex listing: a `foo.html`
 * beside a `foo/` directory containing only RSC .txt payloads.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-export.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import process from "node:process";

const VERIFIER = new URL("./verify-export.mjs", import.meta.url).pathname;
const HOST = "https://okhubtech.com";
const PAGE = "<!DOCTYPE html><html><body>" + "x".repeat(3000) + "</body></html>";

const HTACCESS = [
  "DirectoryIndex index.html",
  "Options -Indexes",
  "ErrorDocument 404 /404.html",
].join("\n");

const ROBOTS = [
  "User-Agent: *",
  "Allow: /",
  "Disallow: /admin",
  `Host: ${HOST}`,
  `Sitemap: ${HOST}/sitemap.xml`,
].join("\n");

const write = (root, rel, body) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};

const sitemapFor = (routes) =>
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  routes.map((r) => `<url><loc>${HOST}${r === "" ? "/" : `${r}/`}</loc></url>`).join("") +
  "</urlset>";

const ROUTES = ["", "/services", "/services/cctv-surveillance"];

/**
 * A minimal fixture that should pass every check: an `app/` tree declaring
 * ROUTES and an `out/` export that satisfies them.
 */
function goodExport(root) {
  const out = join(root, "out");
  const app = join(root, "app");

  for (const r of ROUTES) {
    write(app, join(r, "page.tsx"), "export default function Page() { return null; }");
    write(out, join(r, "index.html"), PAGE);
  }
  write(out, "404.html", PAGE);
  write(out, ".htaccess", HTACCESS);
  write(out, "robots.txt", ROBOTS);
  write(out, "sitemap.xml", sitemapFor(ROUTES));
  // RSC payloads living alongside index.html is the correct, healthy shape.
  write(out, "services/cctv-surveillance/__next._full.txt", "rsc");
  return { out, app };
}

function run(root) {
  const args = [VERIFIER, join(root, "out"), join(root, "app")];
  try {
    const stdout = execFileSync(process.execPath, args, { encoding: "utf8" });
    return { code: 0, output: stdout };
  } catch (err) {
    return { code: err.status ?? 1, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

const cases = [];
const test = (name, setup, expect) => cases.push({ name, setup, expect });

test("clean export passes", (root) => goodExport(root), { code: 0 });

test(
  "broken shape: page.html beside a directory of only .txt payloads",
  (root) => {
    goodExport(root);
    rmSync(join(root, "out/services/cctv-surveillance/index.html"));
    write(join(root, "out"), "services/cctv-surveillance.html", PAGE);
  },
  { code: 1, contains: ["autoindex listing", "cctv-surveillance"] },
);

test(
  "directory with files but no index.html is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "services/networking/__next._tree.txt", "rsc");
  },
  { code: 1, contains: ["autoindex listing", "networking"] },
);

test(
  "missing .htaccess is rejected",
  (root) => {
    goodExport(root);
    rmSync(join(root, "out/.htaccess"));
  },
  { code: 1, contains: [".htaccess missing"] },
);

test(
  ".htaccess without Options -Indexes is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), ".htaccess", "DirectoryIndex index.html\nErrorDocument 404 /404.html\n");
  },
  { code: 1, contains: ["Options -Indexes"] },
);

test(
  "robots.txt containing TypeScript source is rejected",
  (root) => {
    goodExport(root);
    write(
      join(root, "out"),
      "robots.txt",
      'import type { MetadataRoute } from "next";\nexport default function robots() {}\n',
    );
  },
  { code: 1, contains: ["TypeScript source"] },
);

test(
  "sitemap on the wrong host is rejected",
  (root) => {
    goodExport(root);
    write(
      join(root, "out"),
      "sitemap.xml",
      '<?xml version="1.0"?><urlset><url><loc>https://okhub.tech/</loc></url></urlset>',
    );
  },
  { code: 1, contains: ["wrong host"] },
);

test(
  "sitemap entry without a trailing slash is rejected",
  (root) => {
    goodExport(root);
    write(
      join(root, "out"),
      "sitemap.xml",
      `<?xml version="1.0"?><urlset><url><loc>${HOST}/services</loc></url></urlset>`,
    );
  },
  { code: 1, contains: ["would 301"] },
);

test(
  "sitemap entry with no exported page is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "sitemap.xml", sitemapFor(["", "/services", "/programs"]));
  },
  { code: 1, contains: ["no exported page", "programs"] },
);

test(
  "gated route in the sitemap is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "admin/index.html", PAGE);
    write(join(root, "out"), "sitemap.xml", sitemapFor(["", "/services", "/admin"]));
  },
  { code: 1, contains: ["gated route"] },
);

test(
  "app route with no exported page is rejected",
  (root) => {
    goodExport(root);
    write(
      join(root, "app"),
      "services/drone-technology/page.tsx",
      "export default function Page() { return null; }",
    );
  },
  { code: 1, contains: ["route has no index.html", "drone-technology"] },
);

test(
  "deploy zip left in the web root is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "OUT.zip", "PK");
  },
  { code: 1, contains: ["build artifact", "OUT.zip"] },
);

test(
  "data-only directory passes while Options -Indexes is set",
  (root) => {
    goodExport(root);
    // out/api/* are extensionless static JSON files from route handlers.
    // They legitimately have no index.html; Options -Indexes makes them 403.
    write(join(root, "out"), "api/impact", '{"metrics":[]}');
  },
  { code: 0 },
);

test(
  "data-only directory is rejected when Options -Indexes is absent",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "api/impact", '{"metrics":[]}');
    write(join(root, "out"), ".htaccess", "DirectoryIndex index.html\nErrorDocument 404 /404.html\n");
  },
  { code: 1, contains: ["B2: data directory is listable", "api"] },
);

test(
  "404.html beside 404/ is allowed (ErrorDocument needs the file)",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "404/index.html", PAGE);
  },
  { code: 0 },
);

test(
  "truncated page render is rejected",
  (root) => {
    goodExport(root);
    write(join(root, "out"), "services/index.html", "<html></html>");
  },
  { code: 1, contains: ["implausibly small"] },
);

let passed = 0;
const failed = [];

for (const { name, setup, expect } of cases) {
  const root = mkdtempSync(join(tmpdir(), "okhub-export-"));
  try {
    setup(root);
    const { code, output } = run(root);
    const problems = [];
    if (code !== expect.code) problems.push(`exit ${code}, expected ${expect.code}`);
    for (const needle of expect.contains ?? []) {
      if (!output.includes(needle)) problems.push(`output missing ${JSON.stringify(needle)}`);
    }
    if (problems.length) {
      failed.push({ name, problems, output });
    } else {
      passed += 1;
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (failed.length === 0) {
  console.log(`PASS  ${passed}/${cases.length} export-verifier tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${cases.length} export-verifier tests`);
for (const { name, problems, output } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
  console.error("      --- verifier output ---");
  console.error(output.split("\n").map((l) => `      ${l}`).join("\n"));
}
process.exit(1);
