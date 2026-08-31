#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-home.mjs.
 *
 * Two fragile parts get the attention: the station parser, which reads a
 * TypeScript literal with a regex rather than a compiler, and the "did the
 * move actually happen" checks, which are the ones most likely to be defeated
 * by a marker string that turns out not to be unique — that already happened
 * once, with "4IR Bootcamp" appearing in a station blurb on the home page.
 *
 * Every check is exercised in both directions: a good input must report
 * nothing, and one specific breakage must report something. A checker that
 * cannot fail is not a gate.
 *
 * Deterministic, offline, no dependencies. node scripts/verify-home.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";

import {
  checkHome,
  checkMoveHome,
  checkRouting,
  checkStudio,
  checkTargets,
  readStations,
  textOf,
} from "./verify-home.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

const failed = [];
let passed = 0;

const check = (name, problems) => {
  if (problems.length === 0) passed += 1;
  else failed.push({ name, problems });
};

const STATIONS = [
  { id: "training", label: "Training floor", href: "/bootcamp", cta: "See the bootcamp" },
  { id: "workbench", label: "Robotics bench", href: "/studio", cta: "Open the build log" },
  { id: "gallery", label: "Project wall", href: "/portfolio", cta: "Browse the portfolio" },
  { id: "datawall", label: "Data wall", href: "/data", cta: "See the data practice" },
];

/** A home page that should pass every check. */
const goodHome = () => {
  const filler = "word ".repeat(200);
  const links = STATIONS.map((s) => `<a href="${s.href}/">${s.label}</a>`).join("");
  return (
    `<html><body><h1>This is the room</h1><p>${filler}</p>${links}` +
    `<a href="/about/">About</a><a href="/services/">Services</a><a href="/studio/">Studio</a>` +
    `</body></html>`
  );
};

// ---------------------------------------------------------------------------
// textOf
// ---------------------------------------------------------------------------
{
  const problems = [];
  const html = '<p>kept</p><script>var dropped = "dropped";</script><style>.dropped{}</style>';
  const text = textOf(html);
  if (!text.includes("kept")) problems.push("dropped visible text");
  if (text.includes("dropped")) problems.push("kept script or style content");
  // Script content is exactly how a hollow page would fake a word count.
  if (textOf("<div></div><script>" + "word ".repeat(500) + "</script>").split(" ").filter(Boolean).length > 2) {
    problems.push("counted words that were inside a <script>");
  }
  check("textOf strips script and style", problems);
}

// ---------------------------------------------------------------------------
// checkHome
// ---------------------------------------------------------------------------
{
  const problems = [];
  const fail = (name, html, stations = STATIONS) => {
    if (checkHome(html, stations).length === 0) problems.push(`${name} should have failed`);
  };

  if (checkHome(goodHome(), STATIONS).length !== 0) {
    problems.push(`a complete home page reported: ${JSON.stringify(checkHome(goodHome(), STATIONS))}`);
  }

  fail("a hollow shell", '<html><body><h1>x</h1><div id="root"></div></body></html>');
  fail("no <h1>", goodHome().replace(/<h1>.*?<\/h1>/, ""));
  fail("two <h1>s", goodHome().replace("<h1>", "<h1>a</h1><h1>"));
  fail("a server-rendered canvas", goodHome().replace("<h1>", '<canvas id="c"></canvas><h1>'));
  fail("a station label missing from the text", goodHome().replace(">Data wall<", "><"));
  fail("a station href missing", goodHome().replace('href="/data/"', 'href="/elsewhere/"'));
  // The whole point of trailingSlash: true. An unslashed href 301s per click.
  fail("a station href without its trailing slash", goodHome().replace('href="/data/"', 'href="/data"'));
  fail("nothing linking to /about", goodHome().replace('<a href="/about/">About</a>', ""));
  fail("nothing linking to /services", goodHome().replace('<a href="/services/">Services</a>', ""));
  fail("a station list that stopped parsing", goodHome(), []);

  check("checkHome", problems);
}

// ---------------------------------------------------------------------------
// checkMoveHome / checkStudio — the move, from both ends
// ---------------------------------------------------------------------------
{
  const problems = [];
  const source = 'import OfficeStage from "@/components/office3d/OfficeStage";';

  if (checkMoveHome(goodHome(), source).length !== 0) {
    problems.push("a clean home page reported a leftover section");
  }
  if (checkMoveHome(goodHome().replace("<h1>", "<p>Impact Metrics</p><h1>"), source).length === 0) {
    problems.push("impact metrics left on the home page should fail");
  }
  if (checkMoveHome(goodHome(), `${source}\nimport BuildLogSection from "x";`).length === 0) {
    problems.push("a re-imported section component should fail");
  }
  // The regression that produced this comment: a station blurb naming the
  // bootcamp must not read as the bootcamp teaser having moved back.
  const withBlurb = goodHome().replace("<h1>", "<p>The current 4IR Bootcamp cohort ships six systems.</p><h1>");
  if (checkMoveHome(withBlurb, source).length !== 0) {
    problems.push('a blurb mentioning "4IR Bootcamp" was mistaken for the bootcamp teaser');
  }

  const studio =
    "<p>Build log</p><p>In the classroom</p><p>Six builds this cohort</p>" +
    "<p>Impact Metrics</p><p>build the machines</p>";
  if (checkStudio(studio).length !== 0) problems.push("a complete /studio reported missing sections");
  if (checkStudio(studio.replace("<p>Impact Metrics</p>", "")).length === 0) {
    problems.push("a /studio missing impact metrics should fail");
  }
  if (checkStudio(null).length === 0) problems.push("a missing /studio should fail");

  check("the move happened in both directions", problems);
}

// ---------------------------------------------------------------------------
// checkTargets
// ---------------------------------------------------------------------------
{
  const root = mkdtempSync(join(tmpdir(), "home-gate-"));
  const problems = [];
  try {
    const page = (rel) => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "<html></html>");
    };
    STATIONS.forEach((s) => page(join(s.href.replace(/^\//, ""), "index.html")));

    if (checkTargets(root, STATIONS).length !== 0) problems.push("every target exists but it still failed");
    if (checkTargets(root, [...STATIONS, { id: "ghost", label: "Ghost", href: "/nowhere" }]).length === 0) {
      problems.push("a station pointing at a missing page should fail");
    }
    // The exact bug trailingSlash exists to prevent: an HTML file beside the
    // directory rather than inside it is not a page a directory request serves.
    rmSync(join(root, "data/index.html"));
    page("data.html");
    if (checkTargets(root, STATIONS).length === 0) {
      problems.push("a target written as data.html instead of data/index.html should fail");
    }
    check("checkTargets", problems);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// checkRouting
// ---------------------------------------------------------------------------
{
  const root = mkdtempSync(join(tmpdir(), "home-gate-"));
  const problems = [];
  try {
    const write = (body) => {
      mkdirSync(join(root, "lib"), { recursive: true });
      writeFileSync(join(root, "lib/site.ts"), body);
    };
    write('export const STANDALONE_PAGES = ["bootcamp", "data", "products", "studio"] as const;');
    if (checkRouting(root).length !== 0) problems.push("studio present in STANDALONE_PAGES still failed");
    write('export const STANDALONE_PAGES = ["bootcamp", "data", "products"] as const;');
    if (checkRouting(root).length === 0) problems.push("studio missing from STANDALONE_PAGES should fail");
    // A mention elsewhere in the file must not satisfy the check.
    write('const note = "studio";\nexport const STANDALONE_PAGES = ["data"] as const;');
    if (checkRouting(root).length === 0) problems.push('a stray "studio" string should not satisfy the check');
    check("checkRouting", problems);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// The parser must read the real file, not quietly return nothing.
// ---------------------------------------------------------------------------
{
  const stations = readStations(ROOT);
  const problems = [];
  if (stations.length < 4) problems.push(`parsed only ${stations.length} stations from the real file`);
  for (const station of stations) {
    if (!station.label) problems.push(`station ${station.id} has no label`);
    if (!station.href?.startsWith("/")) problems.push(`station ${station.id} has no usable href`);
    if (!station.cta) problems.push(`station ${station.id} has no cta`);
  }
  if (new Set(stations.map((s) => s.href)).size !== stations.length) {
    problems.push("two stations point at the same page");
  }
  check("parses the real stations file", problems);
}

if (failed.length === 0) {
  console.log(`PASS  ${passed} home page gate test group(s)`);
  process.exit(0);
}
console.error(`FAIL  ${failed.length} of ${failed.length + passed} group(s)`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const problem of problems) console.error(`    - ${problem}`);
}
process.exit(1);
