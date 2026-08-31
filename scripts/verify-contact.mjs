#!/usr/bin/env node
/**
 * Gate: every contact detail on the site comes from lib/contact.ts.
 *
 * Before this check the site shipped four different answers to "how do I reach
 * OKHub" — hello@okhub.tech in ContactSection, five more @okhub.tech mailboxes
 * plus a fictional Abuja HQ on /contact, and a second phone number nobody
 * answers in FloatingContact. None of okhub.tech is a domain OKHub owns, so
 * mail to it bounced into nowhere and every one of those pages was a dead end.
 *
 * The rule this enforces: contact literals live in lib/contact.ts and nowhere
 * else. Comments may still discuss the old values (that is how the history
 * above stays readable), so the scanner strips comments and string-aware
 * tokenises before matching — a literal only counts when it would actually
 * render.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-contact.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SOURCE_OF_TRUTH = "lib/contact.ts";
const SCAN_DIRS = ["app", "components", "lib", "server", "prisma"];
const EXTENSIONS = [".ts", ".tsx"];

/** The retired details. Anywhere in code, these are a bug. */
const RETIRED = [
  {
    pattern: /"https:\/\/(www\.)?(linkedin|twitter|x)\.com\/?"/g,
    why: "a social network's own front page, not an OKHub profile — the footer shipped these for months",
  },
  {
    pattern: /"https:\/\/(www\.)?(youtube|facebook|instagram)\.com\/?"/g,
    why: "a social network's own front page, not an OKHub profile",
  },
  { pattern: /[a-z0-9._%+-]+@okhub\.tech\b/gi, why: "okhub.tech is not a domain OKHub owns; mail to it bounces" },
  { pattern: /\+?234[\s-]?808[\s-]?113[\s-]?0222/g, why: "retired second phone number" },
  { pattern: /2348081130222/g, why: "retired second phone number" },
  { pattern: /okhub\.tech\/[a-z-]+/gi, why: "link into a dead domain" },
];

/**
 * Strip comments so a file may still explain the old values, while tracking
 * string and template-literal state so `"https://..."` is never mistaken for a
 * line comment and a `//` inside a string is never stripped.
 */
export function stripComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    // A "/" escaped by a backslash belongs to a regex literal (/https:\/\//),
    // not to a comment. Treating it as one would strip live code off the line
    // and hide any literal sitting there.
    if (c === "/" && next === "/" && src[i - 1] !== "\\") {
      while (i < n && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      out += c;
      i += 1;
      while (i < n) {
        if (src[i] === "\\") {
          out += src[i] + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

/** Pull the canonical values out of lib/contact.ts without executing TypeScript. */
export function readSourceOfTruth(root) {
  const src = readFileSync(join(root, SOURCE_OF_TRUTH), "utf8");
  const value = (name) => {
    const m = src.match(new RegExp(`export const ${name} = "([^"]+)"`));
    if (!m) throw new Error(`${SOURCE_OF_TRUTH} is missing "export const ${name}"`);
    return m[1];
  };
  const bankField = (name) => {
    const m = src.match(new RegExp(`\\b${name}: "([^"]+)"`));
    if (!m) throw new Error(`${SOURCE_OF_TRUTH} is missing BANK.${name}`);
    return m[1];
  };

  return {
    EMAIL: value("EMAIL"),
    FACEBOOK: value("FACEBOOK"),
    INSTAGRAM: value("INSTAGRAM"),
    PHONE_E164: value("PHONE_E164"),
    PHONE_DISPLAY: value("PHONE_DISPLAY"),
    LOCATION: value("LOCATION"),
    LOCATION_SHORT: value("LOCATION_SHORT"),
    BANK: {
      name: bankField("name"),
      accountName: bankField("accountName"),
      accountNumber: bankField("accountNumber"),
    },
  };
}

/**
 * README.md documents the canonical values in a table, which makes it a second
 * copy and therefore a drift risk. Rather than ban it, require it to agree: if
 * lib/contact.ts changes and the docs do not, this fires.
 *
 * @returns {{file: string, literal: string, why: string}[]}
 */
export function checkDocs(root) {
  let readme;
  try {
    readme = readFileSync(join(root, "README.md"), "utf8");
  } catch {
    return [];
  }

  const truth = readSourceOfTruth(root);
  const documented = [
    truth.EMAIL,
    truth.PHONE_DISPLAY,
    truth.LOCATION,
    truth.BANK.name,
    truth.BANK.accountName,
    truth.BANK.accountNumber,
  ];

  return documented
    .filter((value) => !readme.includes(value))
    .map((value) => ({
      file: "README.md",
      literal: value,
      why: `README.md documents contact details but is missing this one; update the table to match ${SOURCE_OF_TRUTH}`,
    }));
}

function* sourceFiles(root) {
  for (const dir of SCAN_DIRS) {
    const base = join(root, dir);
    let entries;
    try {
      entries = readdirSync(base);
    } catch {
      continue;
    }
    const stack = entries.map((e) => join(base, e));
    while (stack.length) {
      const path = stack.pop();
      if (statSync(path).isDirectory()) {
        if (path.includes("node_modules")) continue;
        stack.push(...readdirSync(path).map((e) => join(path, e)));
        continue;
      }
      if (EXTENSIONS.some((ext) => path.endsWith(ext))) yield path;
    }
  }
}

/** @returns {{file: string, literal: string, why: string}[]} */
export function findViolations(root) {
  const truth = readSourceOfTruth(root);
  const violations = [];

  // Duplicating a canonical value is how the copies drift apart, so a second
  // occurrence anywhere outside lib/contact.ts is itself the defect.
  const duplicated = [
    { value: truth.EMAIL, why: `import EMAIL from ${SOURCE_OF_TRUTH}` },
    { value: truth.PHONE_E164, why: `import PHONE_E164 / TEL from ${SOURCE_OF_TRUTH}` },
    { value: truth.PHONE_DISPLAY, why: `import PHONE_DISPLAY from ${SOURCE_OF_TRUTH}` },
    { value: truth.PHONE_E164.replace(/\D/g, ""), why: `import WHATSAPP_NUMBER from ${SOURCE_OF_TRUTH}` },
    { value: truth.BANK.accountNumber, why: `import BANK from ${SOURCE_OF_TRUTH}` },
    { value: "wa.me/", why: `import whatsappLink from ${SOURCE_OF_TRUTH}` },
    { value: truth.FACEBOOK, why: `import FACEBOOK from ${SOURCE_OF_TRUTH}` },
    { value: truth.INSTAGRAM, why: `import INSTAGRAM from ${SOURCE_OF_TRUTH}` },
  ];

  for (const path of sourceFiles(root)) {
    const rel = relative(root, path);
    if (rel === SOURCE_OF_TRUTH) continue;

    const code = stripComments(readFileSync(path, "utf8"));

    for (const { pattern, why } of RETIRED) {
      for (const match of code.matchAll(pattern)) {
        violations.push({ file: rel, literal: match[0], why });
      }
    }
    for (const { value, why } of duplicated) {
      if (code.includes(value)) violations.push({ file: rel, literal: value, why });
    }
  }

  return [...violations, ...checkDocs(root)];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const violations = findViolations(ROOT);
  if (violations.length === 0) {
    const truth = readSourceOfTruth(ROOT);
    console.log(`PASS  contact details single-sourced from ${SOURCE_OF_TRUTH}`);
    console.log(`      ${truth.EMAIL} · ${truth.PHONE_DISPLAY} · ${truth.LOCATION}`);
    console.log(`      ${truth.BANK.accountName} · ${truth.BANK.name} · ${truth.BANK.accountNumber}`);
    console.log(`      ${truth.FACEBOOK} · ${truth.INSTAGRAM}`);
    process.exit(0);
  }
  console.error(`FAIL  ${violations.length} hardcoded contact detail(s)`);
  for (const v of violations) {
    console.error(`  ${v.file}: ${JSON.stringify(v.literal)}`);
    console.error(`      ${v.why}`);
  }
  process.exit(1);
}
