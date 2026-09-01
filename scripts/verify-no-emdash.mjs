#!/usr/bin/env node
/**
 * Gate: no em dash (—, U+2014) anywhere in the site's own source.
 *
 * House style is plain ASCII punctuation: a comma, a colon, a period, or
 * parentheses, chosen per sentence rather than an em dash used as a catch-all.
 * This scans every .ts/.tsx file under app/, components/ and lib/ — both
 * rendered copy and code comments, since a comment full of em dashes is still
 * inconsistent with a codebase that has none anywhere else.
 *
 * Deliberately does not scan scripts/: that is internal build tooling, never
 * rendered to a visitor, and the highest-value target (page copy, product and
 * contact data) already lives under the three directories this checks.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-no-emdash.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCAN_DIRS = ["app", "components", "lib"];
const EM_DASH = "—";

function* tsxFiles(root) {
  const stack = SCAN_DIRS.map((d) => join(root, d));
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
    if (path.endsWith(".ts") || path.endsWith(".tsx")) yield path;
  }
}

/** @returns {{file: string, line: number, snippet: string}[]} */
export function findEmDashes(root) {
  const hits = [];
  for (const path of tsxFiles(root)) {
    const rel = relative(root, path).split(sep).join("/");
    const src = readFileSync(path, "utf8");
    if (!src.includes(EM_DASH)) continue;
    src.split("\n").forEach((lineText, i) => {
      if (lineText.includes(EM_DASH)) {
        hits.push({ file: rel, line: i + 1, snippet: lineText.trim().slice(0, 100) });
      }
    });
  }
  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = findEmDashes(ROOT);
  if (hits.length === 0) {
    console.log(`PASS  no em dashes under ${SCAN_DIRS.join("/, ")}/`);
    process.exit(0);
  }
  console.error(`FAIL  ${hits.length} em dash(es) found`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  ${h.snippet}`);
  process.exit(1);
}
