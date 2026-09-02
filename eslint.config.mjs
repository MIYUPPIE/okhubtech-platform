import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // services/* are independent projects with their own eslint config,
    // tsconfig and node_modules (see the CLAUDE.md services-first rule) —
    // without this, running eslint here also walked
    // services/video-store/.next/**'s generated type-checking shims and
    // reported ~4600 problems that belong to a different project entirely.
    "services/**",
  ]),
]);

export default eslintConfig;
