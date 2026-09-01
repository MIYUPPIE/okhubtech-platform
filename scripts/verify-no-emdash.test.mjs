#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-no-emdash.mjs.
 *
 * Unlike the other verify-*.test.mjs files, this one does not end with a
 * "the real repository is clean" assertion against the live tree. At the time
 * this was written, a concurrent session had two files (app/page.tsx,
 * lib/site.ts) mid-edit with em dashes still in them - uncommitted work this
 * session does not own and should not silently pass or silently fail on. The
 * checker function itself is fully covered by fixtures below; whether the
 * live tree is currently clean is a separate, time-varying question, checked
 * by running `node scripts/verify-no-emdash.mjs` directly rather than baked
 * into this suite.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-no-emdash.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import process from "node:process";

import { findEmDashes } from "./verify-no-emdash.mjs";

const write = (root, rel, body) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};

const cases = [
  {
    name: "a clean file passes",
    files: { "components/Thing.tsx": 'export const X = () => <p>Hello, world.</p>;' },
    want: 0,
  },
  {
    name: "an em dash in rendered text fails",
    files: { "components/Thing.tsx": 'export const X = () => <p>Hello — world.</p>;' },
    want: 1,
  },
  {
    name: "an em dash in a comment fails - comments are not exempt",
    files: { "lib/thing.ts": '// this comment has an em dash — right here\nexport const X = 1;' },
    want: 1,
  },
  {
    name: "two em dashes on one line count once per line, not per dash",
    files: { "lib/thing.ts": 'export const X = "a — b — c";' },
    want: 1,
  },
  {
    name: "em dashes on separate lines each count",
    files: {
      "lib/thing.ts": 'export const X = "a — b";\nexport const Y = "c — d";',
    },
    want: 2,
  },
  {
    name: "a plain hyphen is not an em dash",
    files: { "lib/thing.ts": 'export const X = "co-located, well-formed";' },
    want: 0,
  },
  {
    name: "an en dash is not an em dash",
    files: { "lib/thing.ts": 'export const X = "pages 3–5";' },
    want: 0,
  },
  {
    name: "scripts/ is out of scope - not scanned",
    files: { "scripts/thing.mjs": 'console.log("a — b");' },
    want: 0,
  },
  {
    name: "a .js file is out of scope - only .ts/.tsx",
    files: { "components/thing.js": 'export const X = "a — b";' },
    want: 0,
  },
  {
    name: "app/, components/ and lib/ are all in scope",
    files: {
      "app/page.tsx": 'export default () => <p>a — b</p>;',
      "components/Thing.tsx": 'export const X = () => <p>c — d</p>;',
      "lib/thing.ts": 'export const Y = "e — f";',
    },
    want: 3,
  },
];

const failed = [];
let passed = 0;

for (const { name, files, want } of cases) {
  const root = mkdtempSync(join(tmpdir(), "emdash-gate-"));
  try {
    for (const [rel, body] of Object.entries(files)) write(root, rel, body);
    const got = findEmDashes(root).length;
    if (got === want) passed += 1;
    else failed.push({ name, problems: [`got ${got} hit(s), expected ${want}`] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// Line and file must be reported correctly, or the message is unusable.
{
  const root = mkdtempSync(join(tmpdir(), "emdash-gate-"));
  try {
    write(root, "components/Thing.tsx", 'const a = 1;\nconst b = 2;\nconst c = "x — y";');
    const [hit] = findEmDashes(root);
    if (hit && hit.file === "components/Thing.tsx" && hit.line === 3) passed += 1;
    else failed.push({ name: "reports the right file and line", problems: [`got ${JSON.stringify(hit)}`] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const total = cases.length + 1;
if (failed.length === 0) {
  console.log(`PASS  ${passed}/${total} em-dash gate tests`);
  process.exit(0);
}

console.error(`FAIL  ${failed.length}/${total} em-dash gate tests`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
