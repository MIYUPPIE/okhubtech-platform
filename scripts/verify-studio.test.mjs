#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-studio.mjs.
 *
 * The fragile part is the same shape as verify-home.mjs's station parser: a
 * regex reading a TypeScript array literal instead of a compiler. Every
 * check is exercised in both directions — a good input reports nothing, one
 * specific breakage reports something — because a checker that cannot fail
 * is not a gate.
 *
 * Deterministic, offline, no dependencies. node scripts/verify-studio.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import { checkFloors, checkRendered, checkWired, readClipGroups } from "./verify-studio.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

const failed = [];
let passed = 0;

const check = (name, problems) => {
  if (problems.length === 0) passed += 1;
  else failed.push({ name, problems });
};

const GOOD_GROUPS = {
  PRIMARY_CLIPS: ["primary-a", "primary-b", "primary-c"],
  SECONDARY_CLIPS: ["secondary-a", "secondary-b", "secondary-c"],
  BOOTCAMP_CLIPS: ["bootcamp-a", "bootcamp-b"],
  TRAINING_CLIPS: ["training-a", "training-b", "training-c"],
};

const goodHtml = () => {
  const posters = Object.values(GOOD_GROUPS)
    .flat()
    .map((id) => `<img src="/media/video/${id}-poster.webp">`)
    .join("");
  return (
    `<html><body>${posters}` +
    `<h3>Building the first robot.</h3><h3>Block code driving real hardware.</h3>` +
    `<h3>The 4IR cohort&#x27;s own builds.</h3><h3>The wider archive.</h3>` +
    `</body></html>`
  );
};

// ---------------------------------------------------------------------------
// checkFloors
// ---------------------------------------------------------------------------
{
  const problems = [];
  const fail = (name, groups) => {
    if (checkFloors(groups).length === 0) problems.push(`${name} should have failed`);
  };

  if (checkFloors(GOOD_GROUPS).length !== 0) {
    problems.push(`a healthy set of groups reported: ${JSON.stringify(checkFloors(GOOD_GROUPS))}`);
  }
  fail("primary dropped to one clip", { ...GOOD_GROUPS, PRIMARY_CLIPS: ["only-one"] });
  fail("bootcamp emptied out entirely", { ...GOOD_GROUPS, BOOTCAMP_CLIPS: [] });
  fail("a group missing from the file entirely", { ...GOOD_GROUPS, TRAINING_CLIPS: undefined });

  check("checkFloors", problems);
}

// ---------------------------------------------------------------------------
// checkRendered
// ---------------------------------------------------------------------------
{
  const problems = [];

  if (checkRendered(goodHtml(), GOOD_GROUPS).length !== 0) {
    problems.push(`a complete page reported: ${JSON.stringify(checkRendered(goodHtml(), GOOD_GROUPS))}`);
  }

  const droppedClip = goodHtml().replace('<img src="/media/video/bootcamp-b-poster.webp">', "");
  if (checkRendered(droppedClip, GOOD_GROUPS).length === 0) {
    problems.push("a clip listed in media.ts but absent from the HTML should fail");
  }

  const droppedHeading = goodHtml().replace("<h3>The wider archive.</h3>", "");
  if (checkRendered(goodHtml(), GOOD_GROUPS).length === 0 && checkRendered(droppedHeading, GOOD_GROUPS).length === 0) {
    problems.push("a missing level heading should fail");
  }

  check("checkRendered", problems);
}

// ---------------------------------------------------------------------------
// checkWired
// ---------------------------------------------------------------------------
{
  const root = mkdtempSync(join(tmpdir(), "studio-gate-"));
  const problems = [];
  try {
    const writePage = (body) => {
      mkdirSync(join(root, "app/studio"), { recursive: true });
      writeFileSync(join(root, "app/studio/page.tsx"), body);
    };

    writePage('import TrainingLevelsSection from "@/components/TrainingLevelsSection";\n<TrainingLevelsSection />');
    if (checkWired(root).length !== 0) problems.push("a page that imports the section still failed");

    writePage("<div>no section here</div>");
    if (checkWired(root).length === 0) problems.push("a page missing the section should fail");

    check("checkWired", problems);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// readClipGroups — must read the real file, not quietly return nothing.
// ---------------------------------------------------------------------------
{
  const groups = readClipGroups(ROOT);
  const problems = [];
  for (const name of ["PRIMARY_CLIPS", "SECONDARY_CLIPS", "BOOTCAMP_CLIPS", "TRAINING_CLIPS"]) {
    const ids = groups[name] ?? [];
    if (ids.length === 0) problems.push(`parsed zero clips out of ${name} in the real file`);
    if (new Set(ids).size !== ids.length) problems.push(`${name} lists the same clip id twice`);
  }
  const allIds = Object.values(groups).flat();
  if (new Set(allIds).size !== allIds.length) {
    problems.push("the same clip id appears in more than one level group");
  }
  check("parses the real lib/media.ts groups", problems);
}

if (failed.length === 0) {
  console.log(`PASS  ${passed} studio gate test group(s)`);
  process.exit(0);
}
console.error(`FAIL  ${failed.length} of ${failed.length + passed} group(s)`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const problem of problems) console.error(`    - ${problem}`);
}
process.exit(1);
