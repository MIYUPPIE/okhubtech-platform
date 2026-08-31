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
 *  3. app/[page]/page.tsx — /about, /contact, /ai, /web and /robotics — set
 *     `bg-gradient-to-b from-black via-[#050505] to-black text-white` on its
 *     <main>. Five pages stayed pitch black with the site in day mode, with no
 *     way to get them light. An earlier version of this gate *exempted* that
 *     file for exactly that reason, which is how it survived.
 *
 *  4. Gold set as a text colour. `--gold-primary` (#ffd700) is 1.34:1 on the
 *     day ground. It was the colour of every section icon, the homepage
 *     headline gradient, the impact numbers and the store prices — all on
 *     white cards, all invisible until you switched to night mode.
 *
 * So there are four checks:
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
 *  C. GROUND — a page may not paint an opaque dark background with no `dark:`
 *     variant. Scoped to the page.tsx and layout.tsx files under app/, because
 *     that is where a page's ground is decided; components are free to use
 *     `bg-black` as a letterbox behind a video or an image. Translucent blacks
 *     (`bg-black/40`, `from-black/70`) are scrims over media and are allowed.
 *
 *  E. GRADIENT-OVER-COLOUR — a `dark:` gradient sets background-*image*, which
 *     does not replace an unvariant background-*colour*. `bg-white
 *     dark:bg-gradient-to-br dark:from-white/10 …` paints a near-transparent
 *     gradient over a still-white card, so the panel stays white at night. It
 *     needs a `dark:bg-*` colour reset alongside. This one was written *while
 *     fixing* check C and caught in the dark-mode screenshot, not by reading.
 *
 *  D. GOLD-AS-TEXT — `color` may not be set to `--gold-primary`,
 *     `--gold-secondary` or `--gold-deep`, in a class or in an inline style.
 *     Those are fill tokens. `--gold-ink` is the text token: it is #8a6d00 by
 *     day (4.71:1 on white, 4.27:1 on black) and flips to the bright gold under
 *     .dark, so it reads in both modes. A literal hex is still allowed, for the
 *     deliberate case of gold text sitting on an image scrim.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-theme.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/**
 * Route families rendered straight onto the body background, with no dark
 * wrapper of their own. Anything here must be theme-aware or it is invisible in
 * one mode.
 *
 * app/[page] and app/(auth) used to be exempt because they painted their own
 * black. They no longer do — that was the bug — so they are checked now.
 * app/admin is still exempt: the console keeps its own permanent dark chrome,
 * it is not linked from the site, and it is a deliberate design, not an
 * oversight. app/bootcamp and app/data are not listed because their heroes put
 * white type on a `from-black/90` scrim over a video, which is correct in both
 * modes and which this file-scoped check cannot tell apart from a mistake.
 */
const CONTENT_PAGES = [
  /^app\/expertise\/[^/]+\/page\.tsx$/,
  /^app\/services\/[^/]+\/page\.tsx$/,
  /^app\/services\/page\.tsx$/,
  /^app\/portfolio\/[^/]+\/page\.tsx$/,
  /^app\/portfolio\/page\.tsx$/,
  /^app\/\[page\]\/page\.tsx$/,
  /^app\/\(auth\)\/[^/]+\/page\.tsx$/,
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

/**
 * A utility that sets background-*colour*. The opaque form is what can show
 * through a gradient; any form at all, translucent included, counts as a reset,
 * because setting the property is what matters.
 */
const OPAQUE_BG = /^bg-(?:white|black|(?:neutral|gray|zinc|slate|red|green|blue)-\d+|gold-\w+|\[#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\])$/;
const ANY_BG_COLOUR = /^bg-(?:white|black|transparent|(?:neutral|gray|zinc|slate|red|green|blue)-\d+|gold-\w+|\[#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\])(?:\/\d+)?$/;
const GRADIENT_BG = /^bg-(?:gradient|linear|radial|conic)-/;

/** @returns {{file: string, line: number, detail: string, why: string}[]} */
export function checkGradientOverColour(rel, src) {
  const problems = [];
  for (const { line, tokens } of classNames(src)) {
    const parsed = tokens.map((t) => [...splitVariant(t), t]);
    const baseColour = parsed.find(([v, bare]) => v === "" && OPAQUE_BG.test(bare));
    if (!baseColour) continue;

    for (const [variant, bare, token] of parsed) {
      if (variant !== "dark" || !GRADIENT_BG.test(bare)) continue;
      const reset = parsed.some(([v, b]) => v === "dark" && ANY_BG_COLOUR.test(b));
      if (!reset) {
        problems.push({
          file: rel,
          line,
          detail: `${baseColour[2]} ${token}`,
          why: `${token} sets background-image, not background-color, so ${baseColour[2]} still shows through in dark mode; add a dark: background-colour (dark:bg-transparent) beside it`,
        });
      }
    }
  }
  return problems;
}

/**
 * Files that decide a page's ground. app/admin keeps its own permanent dark
 * chrome on purpose, so it is excluded.
 */
const GROUND_FILES = (rel) =>
  /^app\/.*(page|layout)\.tsx$/.test(rel) && !rel.startsWith("app/admin/");

/** Relative luminance, WCAG 2.x. */
const luminance = (hex) => {
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex, 16);
  const channel = (v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};

/** `bg-black`, `from-[#050505]` — opaque, and dark. A `/40` suffix is a scrim. */
const OPAQUE_DARK = (bare) => {
  const solid = /^(bg|from|via|to)-black$/;
  if (solid.test(bare)) return true;
  const arbitrary = /^(?:bg|from|via|to)-\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]$/.exec(bare);
  return arbitrary ? luminance(arbitrary[1]) < 0.2 : false;
};

/** @returns {{file: string, line: number, detail: string, why: string}[]} */
export function checkGround(rel, src) {
  if (!GROUND_FILES(rel)) return [];

  const problems = [];
  for (const { line, tokens } of classNames(src)) {
    for (const token of tokens) {
      const [variant, bare] = splitVariant(token);
      if (variant === "" && OPAQUE_DARK(bare)) {
        problems.push({
          file: rel,
          line,
          detail: token,
          why: `an opaque dark ground with no dark: variant leaves this page black in day mode; pair it (dark:${bare}) or use an opacity suffix if it is a scrim over media`,
        });
      }
    }
  }
  return problems;
}

/** Gold set as a text colour, in a class or an inline style. */
const GOLD_CLASS = /^text-(?:gold-(?:primary|secondary|deep)|\[var\(--gold-(?:primary|secondary|deep)\)\])(?:\/\d+)?$/;
const GOLD_INLINE = /color:\s*["'`]var\(--gold-(primary|secondary|deep)\)["'`]/g;

/** @returns {{file: string, line: number, detail: string, why: string}[]} */
export function checkGoldText(rel, src) {
  const problems = [];
  const why =
    "gold as text is 1.34:1 on the day ground; --gold-primary/secondary/deep are fill tokens. Use text-gold-ink (or var(--gold-ink)), which is #8a6d00 by day and bright gold under .dark";

  for (const { line, tokens } of classNames(src)) {
    for (const token of tokens) {
      const [, bare] = splitVariant(token);
      if (GOLD_CLASS.test(bare)) problems.push({ file: rel, line, detail: token, why });
    }
  }

  for (const match of src.matchAll(GOLD_INLINE)) {
    problems.push({
      file: rel,
      line: src.slice(0, match.index).split("\n").length,
      detail: match[0],
      why,
    });
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
    problems.push(...checkContrast(rel, src), ...checkConflicts(rel, src), ...checkGround(rel, src), ...checkGoldText(rel, src), ...checkGradientOverColour(rel, src));
  }
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = findProblems(ROOT);
  if (problems.length === 0) {
    console.log("PASS  no invisible text, no dark-locked page, no conflicting colour utilities");
    process.exit(0);
  }
  console.error(`FAIL  ${problems.length} theme problem(s)`);
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  ${p.detail}`);
    console.error(`      ${p.why}`);
  }
  process.exit(1);
}
