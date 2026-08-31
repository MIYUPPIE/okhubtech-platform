#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-theme.mjs.
 *
 * Every check has opposite failure risks, so both directions are covered:
 *
 * CONTRAST must fire on a bare white in a content page and stay quiet on a
 * paired one, on a dark:-prefixed one, and on any file outside the content
 * families (a component may legitimately put white text on a scrim).
 *
 * CONFLICT must fire on two utilities of the same property under the same
 * variant, and stay quiet when the variants differ — `dark:border-white/10`
 * beside `dark:hover:border-white/40` is a resting state and a hover state, not
 * a conflict, and an earlier draft of this scanner got that wrong.
 *
 * GROUND must fire on the exact className that shipped on app/[page]/page.tsx
 * and left /about, /contact, /ai, /web and /robotics black in day mode, and
 * stay quiet on a translucent scrim over media (`from-black/70`), on a paired
 * `dark:bg-black`, and on a component, which may letterbox a video in black.
 *
 * GOLD-AS-TEXT must fire on the class and the inline-style spellings of the
 * fill tokens, and stay quiet on `text-gold-ink`, on `bg-gold-primary` (a fill,
 * which is what the token is for), and on a literal hex, which is the escape
 * hatch for gold type on an image scrim.
 *
 * GRADIENT-OVER-COLOUR must fire on the exact className that left the /about
 * spotlight panel white at night, and stay quiet once a dark: colour reset is
 * present, when the gradient is unvariant (same layer as the colour, so the
 * author can see it), and when there is no base colour to show through.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-theme.test.mjs
 */

import process from "node:process";
import { checkContrast, checkConflicts, checkGradientOverColour, checkGround, checkGoldText, classNames, findProblems } from "./verify-theme.mjs";

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
  ["the marketing template is checked (it used to be exempt)", "app/[page]/page.tsx", '<h1 className="text-white">x</h1>', 1],
  ["the login page is checked", "app/(auth)/login/page.tsx", '<p className="text-white/70">x</p>', 1],
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

const PAGE = "app/[page]/page.tsx";

const groundCases = [
  // The className that actually shipped, and the reason this check exists.
  ["the shipped black gradient fires", PAGE, '<main className="bg-gradient-to-b from-black via-[#050505] to-black text-white">x</main>', 3],
  ["a solid bg-black on a page fires", PAGE, '<div className="bg-black" />', 1],
  ["a dark arbitrary hex fires", PAGE, '<div className="bg-[#0a0a0a]" />', 1],
  ["a light arbitrary hex is fine", PAGE, '<div className="bg-[#fafafa]" />', 0],
  ["a translucent scrim over media is fine", PAGE, '<div className="bg-gradient-to-t from-black/70 to-transparent" />', 0],
  ["bg-black/40 is a scrim and is fine", PAGE, '<div className="bg-black/40" />', 0],
  ["a paired ground is fine", PAGE, '<div className="bg-white dark:bg-black" />', 0],
  ["a dark:-only black is fine", PAGE, '<div className="dark:bg-black" />', 0],
  ["a component may letterbox in black", COMPONENT, '<video className="bg-black" />', 0],
  ["a layout is checked too", "app/layout.tsx", '<body className="bg-black" />', 1],
  ["admin keeps its own dark chrome", "app/admin/layout.tsx", '<div className="bg-black" />', 0],
];

const goldCases = [
  ["text-gold-primary fires", '<p className="text-gold-primary">x</p>', 1],
  ["the var() spelling fires", '<p className="text-[var(--gold-primary)]">x</p>', 1],
  ["text-gold-secondary fires", '<p className="text-gold-secondary">x</p>', 1],
  ["an inline gold colour fires", '<Icon style={{ color: "var(--gold-primary)" }} />', 1],
  ["a dark:-prefixed gold class still fires (day mode is the problem)", '<p className="dark:text-gold-primary">x</p>', 1],
  ["text-gold-ink is the right answer", '<p className="text-gold-ink">x</p>', 0],
  ["an inline gold-ink is the right answer", '<Icon style={{ color: "var(--gold-ink)" }} />', 0],
  ["gold as a fill is fine", '<div className="bg-gold-primary border-gold-primary" />', 0],
  ["a literal hex on a scrim is the escape hatch", '<p className="text-[#f7b801]">x</p>', 0],
];

const gradientCases = [
  // Written while fixing the black-page bug; the panel stayed white in dark mode.
  ["a dark gradient over a base colour fires", '<div className="bg-white dark:bg-gradient-to-br dark:from-white/10 dark:to-transparent" />', 1],
  ["a dark: colour reset clears it", '<div className="bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-white/10" />', 0],
  ["dark:bg-white/5 is also a reset", '<div className="bg-white dark:bg-white/5 dark:bg-gradient-to-br" />', 0],
  ["no base colour, nothing to show through", '<div className="dark:bg-gradient-to-br dark:from-white/10" />', 0],
  ["an unvariant gradient beside an unvariant colour is not this bug", '<div className="bg-white bg-gradient-to-br from-white/10" />', 0],
  ["a plain paired background is fine", '<div className="bg-white dark:bg-black" />', 0],
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

for (const [name, file, src, want] of groundCases) {
  const got = checkGround(file, src).length;
  if (got === want) passed += 1;
  else failed.push({ name, problems: [`got ${got} finding(s), expected ${want}`] });
}

for (const [name, src, want] of goldCases) {
  const got = checkGoldText(COMPONENT, src).length;
  if (got === want) passed += 1;
  else failed.push({ name, problems: [`got ${got} finding(s), expected ${want}`] });
}

for (const [name, src, want] of gradientCases) {
  const got = checkGradientOverColour(COMPONENT, src).length;
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

const total = contrastCases.length + conflictCases.length + groundCases.length + goldCases.length + gradientCases.length + 3;
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
