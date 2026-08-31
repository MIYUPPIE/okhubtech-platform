#!/usr/bin/env node
/**
 * Gate: no text is the same colour as the ground it sits on.
 *
 * Two failures this exists for, both of which shipped:
 *
 *  1. Every page under app/expertise/, app/services/<slug>/ and
 *     app/portfolio/<slug>/ set `text-white` with no `dark:` variant. The body
 *     background in day mode is #fafafa, so the entire page was white on white
 *     — the headings, the prose, the lists. Twenty-eight pages, invisible.
 *
 *  2. A later pass wrote `dark:bg-white dark:bg-white/5` and
 *     `dark:text-black dark:text-white` into the same className. Which one wins
 *     depends on the order Tailwind emits the utilities, not the order they are
 *     written, so the card was white-on-white at night on a coin flip.
 *
 * So there are two checks:
 *
 *  A. CONTRAST — a "content page" (one that renders on the default body
 *     background, listed in CONTENT_PAGES) may not use a bare `text-white`.
 *     Those files declare no dark ground of their own, so an unqualified white
 *     is unreadable in day mode by construction. This is exact, not heuristic:
 *     it is scoped to files that are known to have no dark background, rather
 *     than guessing at ancestry across every component on the site.
 *
 *  B. CONFLICT — within a single className, two utilities that set the same
 *     CSS property under the same variant. Applies everywhere, and needs no
 *     knowledge of backgrounds at all.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-theme.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/**
 * Route families rendered straight onto the body background, with no dark
 * wrapper of their own. Anything here must be theme-aware or it is invisible in
 * one mode. Deliberately excludes app/admin and app/(auth), which paint their
 * own permanent dark chrome, and app/[page], whose <main> sets a black gradient.
 */
const CONTENT_PAGES = [
  /^app\/expertise\/[^/]+\/page\.tsx$/,
  /^app\/services\/[^/]+\/page\.tsx$/,
  /^app\/services\/page\.tsx$/,
  /^app\/portfolio\/[^/]+\/page\.tsx$/,
  /^app\/portfolio\/page\.tsx$/,
];

const CLASSNAME = /className=(?:"([^"]*)"|\{`([^`]*)`\})/gs;

/** Utilities that fight each other when two land on one element. */
const PROPERTY_GROUPS = [
  ["text colour", /^text-(white|black|\[#[0-9a-fA-F]+\]|(?:neutral|gray|zinc|slate)-\d+|gold-\w+)(\/\d+)?$/],
  ["background", /^bg-(white|black|\[#[0-9a-fA-F]+\]|(?:neutral|gray|zinc|slate)-\d+|gold-\w+)(\/\d+)?$/],
  ["border colour", /^border-(white|black|(?:neutral|gray|zinc|slate)-\d+|gold-\w+)(\/\d+)?$/],
  ["shadow", /^shadow-\[.*\]$/],
];

/** A bare white that would render on the light body background. */
const BARE_WHITE = /^(text|border|divide|ring)-white(\/\d+)?$/;

/** Split "dark:hover:text-white" into ["dark:hover", "text-white"]. */
const splitVariant = (token) => {
  const parts = token.split(":");
  return [parts.slice(0, -1).join(":"), parts[parts.length - 1]];
};

/** Every className value in a file, with the line it sits on. */
export function classNames(src) {
  const found = [];
  for (const match of src.matchAll(CLASSNAME)) {
    // Template-literal holes are runtime values; only the static text is checkable.
    const raw = (match[1] ?? match[2] ?? "").replace(/\$\{[^}]*\}/g, " ");
    found.push({ line: src.slice(0, match.index).split("\n").length, tokens: raw.split(/\s+/).filter(Boolean) });
  }
  return found;
}

/** @returns {{file: string, line: number, detail: string, why: string}[]} */
export function checkContrast(rel, src) {
  if (!CONTENT_PAGES.some((rx) => rx.test(rel))) return [];

  const problems = [];
  for (const { line, tokens } of classNames(src)) {
    for (const token of tokens) {
      const [variant, bare] = splitVariant(token);
      if (variant === "" && BARE_WHITE.test(bare)) {
        problems.push({
          file: rel,
          line,
          detail: token,
          why: `renders on the #fafafa body background in day mode; pair it, e.g. ${bare.replace("white", "black")} dark:${bare}`,
        });
      }
    }
  }
  return problems;
}

/** @returns {{file: string, line: number, detail: string, why: string}[]} */
export function checkConflicts(rel, src) {
  const problems = [];
  for (const { line, tokens } of classNames(src)) {
    for (const [label, rx] of PROPERTY_GROUPS) {
      const byVariant = new Map();
      for (const token of tokens) {
        const [variant, bare] = splitVariant(token);
        if (rx.test(bare)) {
          if (!byVariant.has(variant)) byVariant.set(variant, []);
          byVariant.get(variant).push(token);
        }
      }
      for (const [variant, hits] of byVariant) {
        if (hits.length > 1) {
          problems.push({
            file: rel,
            line,
            detail: hits.join(" "),
            why: `two ${label} utilities under "${variant || "no variant"}"; which wins depends on Tailwind's emit order, not this one`,
          });
        }
      }
    }
  }
  return problems;
}

function* tsxFiles(root) {
  const stack = [join(root, "app"), join(root, "components")];
  while (stack.length) {
    const path = stack.pop();
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (path.includes("node_modules")) continue;
      stack.push(...readdirSync(path).map((e) => join(path, e)));
      continue;
    }
    if (path.endsWith(".tsx")) yield path;
  }
}

export function findProblems(root) {
  const problems = [];
  for (const path of tsxFiles(root)) {
    const rel = relative(root, path).split(sep).join("/");
    const src = readFileSync(path, "utf8");
    problems.push(...checkContrast(rel, src), ...checkConflicts(rel, src));
  }
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = findProblems(ROOT);
  if (problems.length === 0) {
    console.log("PASS  no invisible text and no conflicting colour utilities");
    process.exit(0);
  }
  console.error(`FAIL  ${problems.length} theme problem(s)`);
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  ${p.detail}`);
    console.error(`      ${p.why}`);
  }
  process.exit(1);
}
