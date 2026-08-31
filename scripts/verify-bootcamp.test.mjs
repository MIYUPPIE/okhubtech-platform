#!/usr/bin/env node
/**
 * Gate tests for scripts/verify-bootcamp.mjs.
 *
 * Builds throwaway source trees and asserts the checker catches each failure.
 * The case that matters most is `placeholder social link`: the footer really
 * did ship links to linkedin.com and twitter.com — those sites' own home pages
 * — presented as OKHub profiles.
 *
 * Deterministic, offline, no dependencies.  node scripts/verify-bootcamp.test.mjs
 */

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import process from "node:process";

import { check } from "./verify-bootcamp.mjs";

const write = (root, rel, body) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
};

const project = ({
  id = "smart-water-pump",
  title = "Smart Water Pump",
  summary = "A pump that knows when the tank is full and stops on its own.",
  capabilities = ["Water-level sensing", "Automatic pump cut-off at level"],
  board,
  icon = "Droplets",
} = {}) =>
  [
    "  {",
    `    id: "${id}",`,
    `    title: "${title}",`,
    `    summary:`,
    `      "${summary}",`,
    `    capabilities: [${capabilities.map((c) => `"${c}"`).join(", ")}],`,
    ...(board === undefined ? [] : [`    board: "${board}",`]),
    `    icon: ${icon},`,
    "  },",
  ].join("\n");

function bootcampSource({
  projects = [project(), project({ id: "railway-crossing-safety", title: "Railway Crossing", icon: "TrainFront" })],
  youtube = "https://www.youtube.com/@okhubtech",
  handle = "@okhubtech",
  route = "/bootcamp",
} = {}) {
  return [
    'import { Droplets, TrainFront } from "lucide-react";',
    "",
    "export const BOOTCAMP_PROJECTS: readonly BootcampProject[] = [",
    ...projects,
    "];",
    "",
    `export const YOUTUBE_CHANNEL = "${youtube}";`,
    `export const YOUTUBE_HANDLE = "${handle}";`,
    `export const BOOTCAMP_ROUTE = "${route}";`,
  ].join("\n");
}

/** A tree that should pass every check. */
function goodTree(root, overrides = {}) {
  write(root, "lib/bootcamp.ts", bootcampSource(overrides));
  write(
    root,
    "lib/site.ts",
    'export const STANDALONE_PAGES = ["bootcamp", "data", "products"] as const;\n',
  );
  write(root, "app/bootcamp/page.tsx", "export default function Page() { return null; }\n");
  return root;
}

const cases = [];
const test = (name, setup, expect) => cases.push({ name, setup, expect });

test("clean tree passes", (root) => goodTree(root), { fails: 0 });

test(
  "a project id that is not a slug is rejected",
  (root) => goodTree(root, { projects: [project({ id: "Smart Water Pump" })] }),
  { contains: "id is not a usable anchor" },
);

test(
  "duplicate project ids are rejected",
  (root) => goodTree(root, { projects: [project(), project()] }),
  { contains: "duplicate id" },
);

test(
  "a thin summary is rejected",
  (root) => goodTree(root, { projects: [project({ summary: "A pump." })] }),
  { contains: "summary too thin" },
);

test(
  "a project with no capabilities is rejected",
  (root) => goodTree(root, { projects: [project({ capabilities: [] })] }),
  { contains: "no capabilities listed" },
);

test(
  "an unregistered route is rejected",
  (root) => {
    goodTree(root);
    write(root, "lib/site.ts", 'export const STANDALONE_PAGES = ["data", "products"] as const;\n');
  },
  { contains: "route not registered" },
);

test(
  "a registered route with no page is rejected",
  (root) => {
    goodTree(root);
    rmSync(join(root, "app/bootcamp/page.tsx"));
  },
  { contains: "route has no page" },
);

test(
  "a YouTube URL that is not a channel is rejected",
  (root) => goodTree(root, { youtube: "https://youtube.com" }),
  { contains: "YOUTUBE_CHANNEL is not a channel URL" },
);

test(
  "a handle that disagrees with the channel URL is rejected",
  (root) => goodTree(root, { handle: "@someoneelse" }),
  { contains: "handle and channel URL disagree" },
);

test(
  "a bare linkedin.com link anywhere in the tree is rejected",
  (root) => {
    goodTree(root);
    write(
      root,
      "components/Footer.tsx",
      'const socials = [{ href: "https://www.linkedin.com", label: "LinkedIn" }];\n',
    );
  },
  { contains: "placeholder social link" },
);

test(
  "a bare twitter.com link anywhere in the tree is rejected",
  (root) => {
    goodTree(root);
    write(root, "components/Footer.tsx", 'const x = "https://twitter.com";\n');
  },
  { contains: "placeholder social link" },
);

test(
  "a real profile URL on a social host passes",
  (root) => {
    goodTree(root);
    write(
      root,
      "components/Footer.tsx",
      'const socials = [{ href: "https://www.linkedin.com/company/okhubtech", label: "LinkedIn" }];\n',
    );
  },
  { fails: 0 },
);

let passed = 0;
const failed = [];

for (const { name, setup, expect } of cases) {
  const root = mkdtempSync(join(tmpdir(), "okhub-bootcamp-"));
  try {
    setup(root);
    const { failures } = check(root);
    const problems = [];
    if (expect.fails === 0 && failures.length !== 0) {
      problems.push(`expected no failures, got: ${failures.map((f) => f.what).join(", ")}`);
    }
    if (expect.contains !== undefined) {
      if (!failures.some((f) => f.what === expect.contains)) {
        problems.push(
          `expected a "${expect.contains}" failure, got: ${
            failures.map((f) => f.what).join(", ") || "none"
          }`,
        );
      }
    }
    if (problems.length) failed.push({ name, problems });
    else passed += 1;
  } catch (err) {
    failed.push({ name, problems: [`threw: ${err.message}`] });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (failed.length === 0) {
  console.log(`PASS  ${passed}/${cases.length} bootcamp tests`);
  process.exit(0);
}
console.error(`FAIL  ${failed.length}/${cases.length} bootcamp tests`);
for (const { name, problems } of failed) {
  console.error(`  ${name}`);
  for (const p of problems) console.error(`      ${p}`);
}
process.exit(1);
