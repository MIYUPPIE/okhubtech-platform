#!/usr/bin/env node
/**
 * Remove the previous export before `next build` writes a new one.
 *
 * `next build` does not clear out/. Without this, a `services/networking.html`
 * left over from a pre-`trailingSlash` build survives beside the new
 * `services/networking/index.html`, and gets re-uploaded on the next deploy.
 * Stale deploy artifacts (OUT.zip) linger the same way.
 *
 * out/ is fully reproducible from source and gitignored, so this is safe. The
 * previous export is moved to out.previous/ rather than deleted, so a bad build
 * never leaves you with nothing to fall back on.
 */

import { existsSync, rmSync, renameSync } from "node:fs";
import process from "node:process";

const OUT = "out";
const PREVIOUS = "out.previous";

if (!existsSync(OUT)) {
  console.log("clean-out: no existing out/, nothing to do");
  process.exit(0);
}

if (existsSync(PREVIOUS)) {
  rmSync(PREVIOUS, { recursive: true, force: true });
}

renameSync(OUT, PREVIOUS);
console.log(`clean-out: moved ${OUT}/ -> ${PREVIOUS}/ (previous build kept for rollback)`);
