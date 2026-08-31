#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-theme.mjs.
 *
 * The two checks have opposite failure risks, so both directions are covered:
 * the contrast check must fire on a bare white in a content page and stay quiet
 * on a paired one, on a dark:-prefixed one, and on any file outside the content
 * families (a component may legitimately put white text on a scrim). The
 * conflict check must fire on two utilities of the same property under the same
 * variant, and stay quiet when the variants differ — `dark:border-white/10`
 * beside `dark:hover:border-white/40` is a resting state and a hover state, not
 * a conflict, and an earlier draft of this scanner got that wrong.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-theme.test.mjs
 */

import process from "node:process";
import { checkContrast, checkConflicts, classNames, findProblems } from "./verify-theme.mjs";

const CONTENT = "app/expertise/ai-ml/page.tsx";
const COMPONENT = "components/AboutSection.tsx";

const contrastCases = [
  ["bare white in a content page fires", CONTENT, '<h1 className="text-4xl text-white">x</h1>', 1],
  ["bare white/70 in a content page fires", CONTENT, '<p className="text-white/70">x</p>', 1],
  ["bare border-white fires", CONTENT, '<div className="border border-white/10" />', 1],
  ["paired colour is fine", CONTENT, '<h1 className="text-black dark:text-white">x</h1>', 0],
  ["dark-only white is fine", CONTENT, '<h1 className="dark:text-white">x</h1>', 0],
  ["bg-white is not text and is fine", CONTENT, '<div className="bg-white dark:bg-black" />', 0],
  ["same markup in a component is not checked", COMPONENT, '<h1 className="text-white">x</h1>', 0],
  ["portfolio index is checked", "app/portfolio/page.tsx", '<h1 className="text-white">x</h1>', 1],
  ["services index is checked", "app/services/page.tsx", '<h1 className="text-white">x</h1>', 1],
  ["admin is exempt (its own dark chrome)", "app/admin/page.tsx", '<h1 className="text-white">x</h1>', 0],
  ["the marketing template is exempt (black gradient main)", "app/[page]/page.tsx", '<h1 className="text-white">x</h1>', 0],
  ["template-literal holes do not crash", CONTENT, 'className={`text-white ${x ? "a" : "b"}`}', 1],
];

const conflictCases = [
  ["two dark text colours fire", '<p className="dark:text-black dark:text-white">x</p>', 1],
  ["two dark backgrounds fire", '<div className="dark:bg-white/5 dark:bg-white" />', 1],
  ["a repeated arbitrary shadow fires", '<div className="shadow-[0_1px_2px_rgba(0,0,0,0.1)] shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />', 1],
  ["resting vs hover is not a conflict", '<a className="dark:border-white/10 dark:hover:border-white/40" />', 0],
  ["light vs dark is not a conflict", '<p className="text-black dark:text-white">x</p>', 0],
  ["base vs hover is not a conflict", '<a className="text-black/80 hover:text-black" />', 0],
  ["text and background are different properties", '<p className="bg-white text-black" />', 0],
  ["three under one variant fire once", '<div className="dark:bg-white/5 dark:bg-white dark:bg-white/5" />', 1],
];

const failed = [];
let passed = 0;

for (const [name, file, src, want] of contrastCases) {
  const got = checkContrast(file, src).length;
  if (got === want) passed += 1;
  else failed.push({ name, problems: [`got ${got} finding(s), expected ${want}`] });
}

for (const [name, src, want] of conflictCases) {
  const got = checkConflicts(COMPONENT, src).length;
  if (got === want) passed += 1;
  else failed.push({ name, problems: [`got ${got} finding(s), expected ${want}`] });
}

// The line number has to point at the className, or the message is unusable.
{
  const src = 'const a = 1;\nconst b = 2;\n<p className="text-white">x</p>';
  const [hit] = checkContrast(CONTENT, src);
  if (hit && hit.line === 3) passed += 1;
  else failed.push({ name: "reports the right line", problems: [`got line ${hit?.line}, expected 3`] });
}

// Several classNames in one file must all be seen.
{
  const src = '<a className="text-white" /><b className="text-white/70" />';
  if (classNames(src).length === 2 && checkContrast(CONTENT, src).length === 2) passed += 1;
  else failed.push({ name: "scans every className in a file", problems: ["missed one"] });
}

// Finally: the real repository must be clean.
{
  const problems = findProblems(new URL("..", import.meta.url).pathname.replace(/\/$/, ""));
  if (problems.length === 0) passed += 1;
  else failed.push({ name: "repository is clean", problems: problems.map((p) => `${p.file}:${p.line} ${p.detail}`) });
}

const total = contrastCases.length + conflictCases.length + 3;
if (failed.length === 0) {
  console.log(`PASS  ${passed}/${total} theme tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${total} theme tests`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
