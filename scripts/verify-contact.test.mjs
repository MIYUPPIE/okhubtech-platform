#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-contact.mjs.
 *
 * Two jobs. First, prove the scanner actually catches the four shapes of the
 * bug it exists for: a dead-domain mailbox, the retired phone number, a second
 * copy of a canonical value, and a hardcoded wa.me link. Second, prove it does
 * not fire on the things that look similar but are fine — a comment discussing
 * the old values, and a URL whose "//" must not read as a line comment.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-contact.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import process from "node:process";

import { checkDocs, findViolations, readSourceOfTruth, stripComments } from "./verify-contact.mjs";

const CONTACT_TS = `
export const EMAIL = "info@okhubtech.com";
export const PHONE_E164 = "+2349069958990";
export const PHONE_DISPLAY = "+234 906 995 8990";
export const WHATSAPP_NUMBER = PHONE_E164.replace(/\\D/g, "");
export const LOCATION = "Mokola, Ibadan, Oyo State, Nigeria";
export const FACEBOOK = "https://www.facebook.com/okhubtech";
export const INSTAGRAM = "https://www.instagram.com/okhubtech";
export const reelEmbed = (id) => \`https://www.instagram.com/reel/\${id}/embed/\`;
export const LOCATION_SHORT = "Ibadan, Nigeria";
export const MAILTO = \`mailto:\${EMAIL}\`;
export const TEL = \`tel:\${PHONE_E164}\`;
export const whatsappLink = (m) => \`https://wa.me/\${WHATSAPP_NUMBER}\`;
export const BANK = {
  name: "Paystack MFB",
  accountName: "OKHUB TECHNOLOGY",
  accountNumber: "0102106463",
} as const;
`;

const write = (root, rel, body) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};

/** A fixture repo whose only contact literals live in lib/contact.ts. */
function fixture(componentBody = 'export const X = () => null;') {
  const root = mkdtempSync(join(tmpdir(), "contact-gate-"));
  write(root, "lib/contact.ts", CONTACT_TS);
  write(root, "components/Thing.tsx", componentBody);
  return root;
}

const cases = [
  {
    name: "clean tree passes",
    body: 'import { EMAIL, TEL } from "@/lib/contact";\nexport const X = () => EMAIL + TEL;',
    expect: [],
  },
  {
    name: "dead-domain mailbox in a string is caught",
    body: 'export const X = () => "hello@okhub.tech";',
    expect: ["hello@okhub.tech"],
  },
  {
    name: "dead domain in a comment is allowed",
    body: '// hello@okhub.tech used to be here; see lib/contact.ts\nexport const X = () => null;',
    expect: [],
  },
  {
    name: "dead domain in a block comment is allowed",
    body: '/**\n * partners@okhub.tech bounced.\n */\nexport const X = () => null;',
    expect: [],
  },
  {
    name: "a url is not a comment",
    body: 'export const X = () => "https://okhubtech.com/contact"; // fine\nexport const Y = 1;',
    expect: [],
  },
  {
    name: "// inside a string is not stripped",
    body: 'export const X = () => "see //hello@okhub.tech";',
    expect: ["hello@okhub.tech"],
  },
  {
    name: "retired phone number is caught",
    body: 'export const X = () => "+2348081130222";',
    expect: ["+2348081130222", "2348081130222"],
  },
  {
    name: "duplicated canonical email is caught",
    body: 'export const X = () => "info@okhubtech.com";',
    expect: ["info@okhubtech.com"],
  },
  {
    name: "duplicated canonical phone is caught",
    body: 'export const X = () => "+2349069958990";',
    expect: ["+2349069958990", "2349069958990"],
  },
  {
    name: "duplicated bank account number is caught",
    body: 'export const X = () => "0102106463";',
    expect: ["0102106463"],
  },
  {
    name: "a bare social front page is caught",
    body: 'export const X = () => "https://twitter.com";',
    expect: ["\"https://twitter.com\""],
  },
  {
    name: "a bare instagram.com is caught",
    body: 'export const X = () => "https://www.instagram.com/";',
    expect: ["\"https://www.instagram.com/\""],
  },
  {
    name: "duplicated instagram profile is caught",
    body: 'export const X = () => "https://www.instagram.com/okhubtech";',
    expect: ["https://www.instagram.com/okhubtech"],
  },
  {
    name: "duplicated facebook profile is caught",
    body: 'export const X = () => "https://www.facebook.com/okhubtech";',
    expect: ["https://www.facebook.com/okhubtech"],
  },
  {
    name: "a hardcoded reel url is caught",
    body: 'export const X = () => "https://www.instagram.com/reel/ABC123/embed/";',
    expect: ["instagram.com/reel/"],
  },
  {
    name: "a real profile url imported, not inlined, passes",
    body: 'import { INSTAGRAM } from "@/lib/contact";\nexport const X = () => INSTAGRAM;',
    expect: [],
  },
  {
    name: "hardcoded wa.me link is caught",
    body: 'export const X = () => "https://wa.me/2349069958990";',
    expect: ["2349069958990", "wa.me/"],
  },
];

const failed = [];
let passed = 0;

for (const { name, body, expect } of cases) {
  const root = fixture(body);
  try {
    const literals = findViolations(root).map((v) => v.literal).sort();
    const want = [...expect].sort();
    if (JSON.stringify(literals) !== JSON.stringify(want)) {
      failed.push({ name, problems: [`got ${JSON.stringify(literals)}, expected ${JSON.stringify(want)}`] });
    } else {
      passed += 1;
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// stripComments must be lossless outside comments, or a real literal could slip
// through by hiding next to one.
const unitCases = [
  ['const a = "x"; // y', 'const a = "x"; '],
  ['const a = "http://x"; ', 'const a = "http://x"; '],
  ["const a = `a//b`;", "const a = `a//b`;"],
  ['const a = "he said \\"//\\""; // gone', 'const a = "he said \\"//\\""; '],
  ["/* all */const a = 1;", "const a = 1;"],
  ["const re = /https:\\/\\//; const a = 1;", "const re = /https:\\/\\//; const a = 1;"],
];
for (const [input, want] of unitCases) {
  const got = stripComments(input);
  if (got !== want) {
    failed.push({ name: `stripComments ${JSON.stringify(input)}`, problems: [`got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`] });
  } else {
    passed += 1;
  }
}

// README.md documents the values, so it must be kept honest too.
{
  const root = fixture();
  try {
    const problems = [];
    // No README at all: nothing to contradict, nothing to report.
    if (checkDocs(root).length !== 0) problems.push("a repo with no README should report nothing");

    write(root, "README.md", "Reach us on info@okhubtech.com at +234 906 995 8990.");
    const stale = checkDocs(root).map((v) => v.literal).sort();
    const wantStale = ["0102106463", "Mokola, Ibadan, Oyo State, Nigeria", "OKHUB TECHNOLOGY", "Paystack MFB"];
    if (JSON.stringify(stale) !== JSON.stringify(wantStale)) {
      problems.push(`partial README: got ${JSON.stringify(stale)}, expected ${JSON.stringify(wantStale)}`);
    }

    write(
      root,
      "README.md",
      "info@okhubtech.com · +234 906 995 8990 · Mokola, Ibadan, Oyo State, Nigeria · OKHUB TECHNOLOGY · Paystack MFB · 0102106463",
    );
    if (checkDocs(root).length !== 0) problems.push("a complete README should report nothing");

    if (problems.length) failed.push({ name: "README is kept in sync", problems });
    else passed += 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// A missing export must fail loudly rather than silently skipping a check.
{
  const root = mkdtempSync(join(tmpdir(), "contact-gate-"));
  try {
    // Everything present except PHONE_E164, so the throw names that one
    // specifically rather than whichever field happens to be read first.
    write(
      root,
      "lib/contact.ts",
      [
        'export const EMAIL = "info@okhubtech.com";',
        'export const FACEBOOK = "https://www.facebook.com/okhubtech";',
        'export const INSTAGRAM = "https://www.instagram.com/okhubtech";',
      ].join("\n"),
    );
    let threw = false;
    try {
      readSourceOfTruth(root);
    } catch (error) {
      threw = /PHONE_E164/.test(String(error.message));
    }
    if (threw) passed += 1;
    else failed.push({ name: "missing export throws", problems: ["readSourceOfTruth did not throw for a missing PHONE_E164"] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Finally: the real repository must be clean.
{
  const violations = findViolations(new URL("..", import.meta.url).pathname.replace(/\/$/, ""));
  if (violations.length === 0) passed += 1;
  else failed.push({ name: "repository is clean", problems: violations.map((v) => `${v.file}: ${v.literal}`) });
}

const total = cases.length + unitCases.length + 3;
if (failed.length === 0) {
  console.log(`PASS  ${passed}/${total} contact-detail tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${total} contact-detail tests`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
