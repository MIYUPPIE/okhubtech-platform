#!/usr/bin/env node
/**
 * Gate: the bootcamp cohort stays in sync with the route, and no social link
 * ships as a placeholder.
 *
 * lib/bootcamp.ts is the single source of truth for /bootcamp, the homepage
 * band and the footer's channel link. Four things can go wrong:
 *
 *  1. DRIFT — a project is added and the route or sitemap disagrees.
 *     PUBLIC_ROUTES derives /bootcamp from STANDALONE_PAGES; this proves it.
 *
 *  2. BROKEN ANCHORS — project ids double as the fragment the homepage links
 *     to (/bootcamp#smart-water-pump). A non-slug id silently dead-ends.
 *
 *  3. THIN ENTRIES — a project with no summary or no capabilities renders as
 *     an empty card.
 *
 *  4. PLACEHOLDER SOCIALS — the footer shipped links to linkedin.com and
 *     twitter.com: those sites' own home pages, presented as OKHub profiles.
 *     Same class of failure as the okhub.tech mailboxes that bounced. Any
 *     social host with no path is rejected.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-bootcamp.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SOURCE = "lib/bootcamp.ts";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Social hosts that must always carry a profile path, never bare. */
const SOCIAL_HOSTS = [
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
];

/** Reads the cohort without executing TypeScript. */
export function readCohort(root) {
  const src = readFileSync(join(root, SOURCE), "utf8");
  const start = src.indexOf("BOOTCAMP_PROJECTS");
  if (start === -1) throw new Error(`${SOURCE}: BOOTCAMP_PROJECTS not found`);
  const body = src.slice(start);

  const projects = [];
  for (const block of body.split(/\n  \{\n/).slice(1)) {
    const field = (name) =>
      block.match(new RegExp(`\\b${name}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    const capsRaw = block.match(/capabilities:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    projects.push({
      id: field("id"),
      title: field("title"),
      summary: field("summary"),
      board: field("board"),
      capabilities: [...capsRaw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]),
      icon: /\bicon:\s*([A-Za-z]+)/.exec(block)?.[1],
    });
  }

  return {
    projects,
    youtube: src.match(/YOUTUBE_CHANNEL\s*=\s*"([^"]+)"/)?.[1],
    handle: src.match(/YOUTUBE_HANDLE\s*=\s*"([^"]+)"/)?.[1],
    route: src.match(/BOOTCAMP_ROUTE\s*=\s*"([^"]+)"/)?.[1],
  };
}

/** Every string literal that looks like a social URL, across the source tree. */
export function findSocialLinks(root) {
  const found = [];
  const skip = new Set(["node_modules", ".next", "out", "out.previous", "dist", ".git", "assets", "public"]);

  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if ([".ts", ".tsx"].includes(extname(entry.name))) {
        const src = readFileSync(full, "utf8");
        for (const m of src.matchAll(/"(https?:\/\/[^"]+)"/g)) {
          found.push({ url: m[1], file: full.slice(root.length + 1) });
        }
      }
    }
  };
  walk(root);
  return found;
}

export function check(root) {
  const failures = [];
  const fail = (what, detail) => failures.push({ what, detail });

  const { projects, youtube, handle, route } = readCohort(root);

  if (projects.length === 0) fail("no projects", `${SOURCE} lists none`);

  const seen = new Set();
  for (const p of projects) {
    const label = p.title ?? p.id ?? "(unnamed)";
    if (!p.id || !SLUG.test(p.id)) {
      fail("id is not a usable anchor", `${label}: "${p.id}" must be lowercase-hyphenated`);
    } else if (seen.has(p.id)) {
      fail("duplicate id", p.id);
    } else {
      seen.add(p.id);
    }
    if (!p.title) fail("missing title", p.id ?? "(no id)");
    if (!p.summary || p.summary.split(/\s+/).length < 5) {
      fail("summary too thin", `${label}: "${p.summary ?? ""}"`);
    }
    if (p.capabilities.length === 0) fail("no capabilities listed", label);
    if (!p.icon) fail("no icon", label);
  }

  // Route and sitemap agreement.
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  const standalone = site.match(/STANDALONE_PAGES\s*=\s*\[([^\]]*)\]/)?.[1] ?? "";
  const slugs = [...standalone.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!slugs.includes("bootcamp")) {
    fail("route not registered", "lib/site.ts STANDALONE_PAGES is missing \"bootcamp\", so /bootcamp never reaches the sitemap");
  }
  if (route !== "/bootcamp") fail("BOOTCAMP_ROUTE disagrees with the app router", String(route));
  if (!existsSync(join(root, "app/bootcamp/page.tsx"))) {
    fail("route has no page", "app/bootcamp/page.tsx is missing");
  }

  // Channel shape.
  if (!youtube || !/^https:\/\/www\.youtube\.com\/@[A-Za-z0-9._-]+$/.test(youtube)) {
    fail("YOUTUBE_CHANNEL is not a channel URL", String(youtube));
  }
  if (!handle || !handle.startsWith("@")) fail("YOUTUBE_HANDLE is not a handle", String(handle));
  if (youtube && handle && !youtube.endsWith(handle)) {
    fail("handle and channel URL disagree", `${handle} vs ${youtube}`);
  }

  // Placeholder socials anywhere in the tree.
  for (const { url, file } of findSocialLinks(root)) {
    let host;
    try {
      host = new URL(url);
    } catch {
      continue;
    }
    const bare = host.pathname === "/" || host.pathname === "";
    const social = SOCIAL_HOSTS.some((h) => host.hostname === h || host.hostname.endsWith(`.${h}`));
    if (social && bare) {
      fail(
        "placeholder social link",
        `${file}: ${url} is the site's own home page, not an OKHub profile`,
      );
    }
  }

  return { failures, projects, youtube };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures, projects, youtube } = check(ROOT);
  if (failures.length === 0) {
    console.log("PASS  bootcamp cohort is consistent");
    console.log(`      ${projects.length} projects, ids usable as anchors`);
    console.log(`      channel ${youtube}`);
    console.log("      no placeholder social links in the source tree");
    process.exit(0);
  }
  console.error(`FAIL  ${failures.length} problem(s) in the bootcamp data\n`);
  for (const { what, detail } of failures) {
    console.error(`  [${what}]`);
    console.error(`      ${detail}`);
  }
  process.exit(1);
}
