#!/usr/bin/env node
/**
 * Gate: the 3D home page still works when the 3D does not.
 *
 * The home page is a WebGL office. That is a presentation layer over content
 * that has to stand on its own, because four sizeable audiences never see the
 * canvas at all: crawlers, anyone with JavaScript off, anyone whose browser or
 * driver blocks WebGL, and anyone on a machine where the context fails to
 * create. For every one of them the exported HTML is the entire page.
 *
 * Four failures this exists to prevent, in the order they are most likely:
 *
 *  1. HOLLOWING OUT — the copy or the station links drift into the canvas
 *     (a 3D text mesh, a runtime-built menu) and the exported HTML becomes a
 *     div with a script tag. Checked by counting rendered words and asserting
 *     every station's label and href are in the markup.
 *
 *  2. SSR LEAK — someone drops the `ssr: false` on the dynamic import. R3F
 *     cannot render on the server, and `next build` would fail loudly, but a
 *     <canvas> in the exported HTML is the earlier, quieter symptom.
 *
 *  3. A BROKEN DOOR — a station points at a route that no longer exists. Every
 *     href is resolved against the actual export, not against a route table.
 *
 *  4. AN UNDONE MOVE — the sections that moved to /studio get copied back onto
 *     the home page instead of moved, so the same markup ships twice and the
 *     front door goes back to being a robotics-and-training page. Checked from
 *     both ends: /studio must carry them and / must not.
 *
 * Deterministic, offline, no dependencies. Run after `next build`.
 *   node scripts/verify-home.mjs [outDir] [root]
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const STATIONS_FILE = "components/office3d/stations.ts";
const HOME_FILE = "app/page.tsx";

/**
 * Rendered words the home page must carry with no JavaScript at all.
 *
 * The real page renders a little over 350; this floor is well under that so
 * ordinary copy edits do not trip it, and well over the ~40 words a hollowed
 * out canvas shell would leave behind.
 */
const MIN_WORDS = 180;

/** Sections that moved to /studio. Each is identified by text it renders. */
const MOVED_SECTIONS = [
  { name: "build log", marker: "Build log" },
  { name: "showreel", marker: "In the classroom" },
  // Not "4IR Bootcamp": the training-floor station blurb names the cohort on
  // the home page quite legitimately. This is the teaser's own line.
  { name: "bootcamp teaser", marker: "Six builds this cohort" },
  { name: "impact metrics", marker: "Impact Metrics" },
  { name: "hero", marker: "build the machines" },
];

/**
 * Section components that must no longer be imported by the home page.
 *
 * ReelsSection is deliberately absent: it was never exclusive to the old home
 * page - /portfolio has always carried it - and the front door showing the
 * three most recent reels is a different job from /studio's full build log.
 */
const MOVED_COMPONENTS = [
  "HeroSection",
  "BuildLogSection",
  "ShowreelSection",
  "BootcampSection",
  "ImpactSection",
];

const problem = (where, detail) => ({ where, detail });

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** Visible text of a page, with script and style content removed. */
export function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pulls the station list out of the TypeScript source without a compiler.
 *
 * Each entry is an object literal with `id`, `label`, `href` and `cta` string
 * fields, which is a stable enough shape to regex. Returning nothing is itself
 * a failure below, so a restructure of the file cannot silently pass.
 */
export function readStations(root) {
  const src = readFileSync(join(root, STATIONS_FILE), "utf8");
  const body = src.slice(src.indexOf("export const STATIONS"));
  const stations = [];
  for (const block of body.split(/\n  \{\n/).slice(1)) {
    const field = (name) => block.match(new RegExp(`\\b${name}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    const id = field("id");
    if (!id) continue;
    stations.push({ id, label: field("label"), href: field("href"), cta: field("cta") });
  }
  return stations;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

/** 1 and 2: the home page carries its own content, and ships no canvas. */
export function checkHome(html, stations) {
  const problems = [];
  const text = textOf(html);
  const words = text.split(" ").filter(Boolean).length;

  if (words < MIN_WORDS) {
    problems.push(
      problem("/", `renders only ${words} words without JavaScript; expected at least ${MIN_WORDS}`),
    );
  }

  const h1s = html.match(/<h1[\s>]/gi) ?? [];
  if (h1s.length !== 1) {
    problems.push(problem("/", `has ${h1s.length} <h1> elements; a page needs exactly one`));
  }

  if (/<canvas[\s>]/i.test(html)) {
    problems.push(
      problem("/", "a <canvas> is in the exported HTML: the scene lost its `ssr: false` and is being server rendered"),
    );
  }

  if (stations.length < 4) {
    problems.push(problem(STATIONS_FILE, `parsed only ${stations.length} stations; the file shape changed`));
  }

  for (const station of stations) {
    if (!station.label || !text.includes(station.label)) {
      problems.push(problem("/", `station "${station.id}" label is not in the rendered text`));
    }
    // trailingSlash: true is set in next.config.ts, so every internal href is
    // written with one. An href without it would 301 on every click.
    if (!station.href || !html.includes(`href="${station.href}/"`)) {
      problems.push(
        problem("/", `station "${station.id}" has no <a href="${station.href}/"> in the markup`),
      );
    }
  }

  // The two top-level routes with no station of their own still have to be
  // reachable from the front door.
  for (const href of ["/about", "/services", "/studio"]) {
    if (!html.includes(`href="${href}/"`)) {
      problems.push(problem("/", `nothing on the home page links to ${href}`));
    }
  }

  return problems;
}

/** 4a: the home page no longer renders the sections that moved. */
export function checkMoveHome(homeHtml, homeSource) {
  const problems = [];
  const text = textOf(homeHtml);
  for (const { name, marker } of MOVED_SECTIONS) {
    if (text.includes(marker)) {
      problems.push(
        problem("/", `still renders the ${name} section ("${marker}"); it belongs to /studio now`),
      );
    }
  }
  for (const component of MOVED_COMPONENTS) {
    if (new RegExp(`\\b${component}\\b`).test(homeSource)) {
      problems.push(
        problem(HOME_FILE, `still references ${component}; that section moved to app/studio/page.tsx`),
      );
    }
  }
  return problems;
}

/** 4b: /studio carries every section that left the home page. */
export function checkStudio(html) {
  const problems = [];
  if (html === null) {
    return [problem("/studio", "out/studio/index.html does not exist")];
  }
  const text = textOf(html);
  for (const { name, marker } of MOVED_SECTIONS) {
    if (!text.includes(marker)) {
      problems.push(problem("/studio", `is missing the ${name} section (looked for "${marker}")`));
    }
  }
  return problems;
}

/** 3: every station href resolves to a real page in the export. */
export function checkTargets(outDir, stations) {
  const problems = [];
  for (const station of stations) {
    if (!station.href) continue;
    const page = join(outDir, station.href.replace(/^\//, ""), "index.html");
    if (!existsSync(page)) {
      problems.push(
        problem(STATIONS_FILE, `station "${station.id}" points at ${station.href}, which has no ${page}`),
      );
    }
  }
  return problems;
}

/** /studio is a real route as far as the sitemap and the route table know. */
export function checkRouting(root) {
  const problems = [];
  const site = readFileSync(join(root, "lib/site.ts"), "utf8");
  if (!/STANDALONE_PAGES = \[[^\]]*"studio"/.test(site)) {
    problems.push(
      problem("lib/site.ts", '"studio" is missing from STANDALONE_PAGES, so /studio is not in the sitemap'),
    );
  }
  return problems;
}

export function findProblems(root, outDir) {
  const stations = readStations(root);
  const read = (rel) => (existsSync(join(outDir, rel)) ? readFileSync(join(outDir, rel), "utf8") : null);
  const home = read("index.html");
  if (home === null) {
    return [problem("/", `${join(outDir, "index.html")} does not exist; run next build first`)];
  }
  const homeSource = readFileSync(join(root, HOME_FILE), "utf8");

  return [
    ...checkHome(home, stations),
    ...checkMoveHome(home, homeSource),
    ...checkStudio(read("studio/index.html")),
    ...checkTargets(outDir, stations),
    ...checkRouting(root),
  ];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] ?? "out";
  const root = process.argv[3] ?? ROOT;
  const problems = findProblems(root, outDir);

  if (problems.length === 0) {
    const stations = readStations(root);
    const words = textOf(readFileSync(join(outDir, "index.html"), "utf8")).split(" ").length;
    console.log("PASS  home page works without WebGL");
    console.log(`      ${words} words and ${stations.length} station links in the exported HTML, no <canvas>`);
    console.log(`      stations: ${stations.map((s) => `${s.label} -> ${s.href}`).join(", ")}`);
    console.log(`      ${MOVED_SECTIONS.length} moved sections found on /studio and absent from /`);
    process.exit(0);
  }

  console.error(`FAIL  ${problems.length} home page problem(s)`);
  for (const { where, detail } of problems) console.error(`  ${where}: ${detail}`);
  process.exit(1);
}
