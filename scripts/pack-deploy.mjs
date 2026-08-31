#!/usr/bin/env node
/**
 * Build the cPanel upload archive.
 *
 * Writes dist/okhubtech-<timestamp>.zip OUTSIDE out/. The previous deploy left
 * a 13MB OUT.zip sitting inside out/ itself, which meant the archive was
 * publicly downloadable at https://okhubtech.com/OUT.zip and got re-zipped into
 * the next one.
 *
 * Refuses to run unless scripts/verify-export.mjs passes, and includes
 * dotfiles so .htaccess actually makes it into the archive.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const OUT = "out";
const DIST = "dist";

if (!existsSync(OUT)) {
  console.error("pack-deploy: out/ does not exist. Run `npm run build` first.");
  process.exit(1);
}

// Never package a build that failed verification.
try {
  execFileSync(process.execPath, ["scripts/verify-export.mjs", OUT], { stdio: "inherit" });
} catch {
  console.error("\npack-deploy: export verification failed - refusing to package this build.");
  process.exit(1);
}

try {
  execFileSync("zip", ["--version"], { stdio: "ignore" });
} catch {
  console.error("pack-deploy: `zip` is not installed. Install it with: sudo apt install zip");
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const archive = resolve(join(DIST, `okhubtech-${stamp}.zip`));

// -r recurse, -q quiet, -X drop extra file attributes.
// The "." target inside out/ is what pulls in dotfiles such as .htaccess;
// `zip -r archive *` would silently skip it and reintroduce the bug this fixes.
execFileSync("zip", ["-rqX", archive, "."], { cwd: OUT, stdio: "inherit" });

// Prove .htaccess is in the archive rather than assuming it.
const listing = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" });
if (!listing.split("\n").includes("./.htaccess") && !listing.split("\n").includes(".htaccess")) {
  console.error("pack-deploy: .htaccess is missing from the archive - aborting.");
  process.exit(1);
}

const mb = (statSync(archive).size / 1024 / 1024).toFixed(1);
const fileCount = listing.split("\n").filter(Boolean).length;

console.log(`\npack-deploy: ${archive}`);
console.log(`             ${fileCount} entries, ${mb} MB, .htaccess included`);
console.log("\nUpload steps (cPanel File Manager):");
console.log("  1. Delete the OLD contents of public_html (keep any non-site files you host there)");
console.log("  2. Upload the zip into public_html");
console.log("  3. Extract it there, then delete the zip from the server");
console.log("  4. Verify:  npm run verify:live");
