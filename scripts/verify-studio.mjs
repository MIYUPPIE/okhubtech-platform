#!/usr/bin/env node
/**
 * Gate: /studio's class footage is grouped by level, and nothing in a group
 * got lost on the way from lib/media.ts to the exported HTML.
 *
 * Two failures this exists to prevent:
 *
 *  1. AN EMPTY BUCKET — PRIMARY_CLIPS, SECONDARY_CLIPS, BOOTCAMP_CLIPS or
 *     TRAINING_CLIPS drops to near nothing (a bad merge, an accidental
 *     deletion) and a whole level of the page goes quietly thin. Checked
 *     against a floor for each group.
 *  2. A DROPPED CLIP — a clip is listed in lib/media.ts but never makes it
 *     into the rendered page (a typo'd id, a component that stopped mapping
 *     over the array). Checked id by id against the exported HTML.
 *
 * Deterministic, offline, no dependencies. Run after `next build`.
 *   node scripts/verify-studio.mjs [outDir] [root]
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const MEDIA_FILE = "lib/media.ts";
const STUDIO_PAGE = "app/studio/page.tsx";

/** Group name -> minimum clip count. Below this, a group is "gone thin". */
const GROUP_FLOORS = {
  PRIMARY_CLIPS: 3,
  SECONDARY_CLIPS: 3,
  BOOTCAMP_CLIPS: 2,
  TRAINING_CLIPS: 3,
};

/**
 * Each level's title, as rendered by TrainingLevelsSection. The bootcamp
 * title is split around its apostrophe rather than asserted verbatim, since
 * how React's static renderer escapes `'` in text nodes is an implementation
 * detail this check has no business depending on.
 */
const LEVEL_TITLES = [
  "Building the first robot.",
  "Block code driving real hardware.",
  "The 4IR cohort",
  "own builds.",
  "The wider archive.",
];

const problem = (where, detail) => ({ where, detail });

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/**
 * Pulls each `export const X_CLIPS: ... = [ ... ];` array out of lib/media.ts
 * without a compiler, reading the video id out of every `captionedVideo("id"`
 * call inside it. A group that no longer exists in the file reads as empty,
 * which the floor check below turns into a failure rather than a silent pass.
 */
export function readClipGroups(root) {
  const src = readFileSync(join(root, MEDIA_FILE), "utf8");
  const groups = {};
  for (const name of Object.keys(GROUP_FLOORS)) {
    const marker = `export const ${name}:`;
    const start = src.indexOf(marker);
    if (start === -1) {
      groups[name] = [];
      continue;
    }
    const end = src.indexOf("\n];", start);
    const block = src.slice(start, end === -1 ? undefined : end);
    groups[name] = [...block.matchAll(/captionedVideo\(\s*"([^"]+)"/g)].map((m) => m[1]);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

/** 1: no group has quietly gone thin. */
export function checkFloors(groups) {
  const problems = [];
  for (const [name, floor] of Object.entries(GROUP_FLOORS)) {
    const count = groups[name]?.length ?? 0;
    if (count < floor) {
      problems.push(
        problem(MEDIA_FILE, `${name} has ${count} clip(s); expected at least ${floor}`),
      );
    }
  }
  return problems;
}

/** 2: every clip named in lib/media.ts actually made it into the export. */
export function checkRendered(html, groups) {
  const problems = [];
  for (const [name, ids] of Object.entries(groups)) {
    for (const id of ids) {
      if (!html.includes(`/media/video/${id}`)) {
        problems.push(problem("/studio", `${name} lists "${id}" but it is not in the exported HTML`));
      }
    }
  }
  for (const title of LEVEL_TITLES) {
    if (!html.includes(title)) {
      problems.push(problem("/studio", `level heading "${title}" is missing from the exported HTML`));
    }
  }
  return problems;
}

/** The section is actually wired into the page, not just defined. */
export function checkWired(root) {
  const problems = [];
  const source = readFileSync(join(root, STUDIO_PAGE), "utf8");
  if (!/\bTrainingLevelsSection\b/.test(source)) {
    problems.push(problem(STUDIO_PAGE, "does not reference TrainingLevelsSection"));
  }
  return problems;
}

export function findProblems(root, outDir) {
  const groups = readClipGroups(root);
  const page = join(outDir, "studio/index.html");
  if (!existsSync(page)) {
    return [problem("/studio", `${page} does not exist; run next build first`)];
  }
  const html = readFileSync(page, "utf8");

  return [...checkFloors(groups), ...checkRendered(html, groups), ...checkWired(root)];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] ?? "out";
  const root = process.argv[3] ?? ROOT;
  const problems = findProblems(root, outDir);

  if (problems.length === 0) {
    const groups = readClipGroups(root);
    const summary = Object.entries(groups)
      .map(([name, ids]) => `${name}=${ids.length}`)
      .join(", ");
    console.log("PASS  /studio's level sections are all present and wired");
    console.log(`      ${summary}`);
    process.exit(0);
  }

  console.error(`FAIL  ${problems.length} studio problem(s)`);
  for (const { where, detail } of problems) console.error(`  ${where}: ${detail}`);
  process.exit(1);
}
