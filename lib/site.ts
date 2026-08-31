import { PRODUCT_SLUGS } from "./products";

/**
 * Canonical site configuration.
 *
 * Single source of truth for the deployed origin. The live site is
 * okhubtech.com; the previous `https://okhub.tech` fallback was shipping wrong
 * canonical URLs, og:url, og:image and sitemap <loc> values on every page.
 *
 * Override per-environment with SITE_URL (no trailing slash).
 */
export const SITE_URL = (process.env.SITE_URL ?? "https://okhubtech.com").replace(/\/$/, "");

/** Routes rendered by app/[page]/page.tsx (keys of its `pageContent` map). */
export const TOP_LEVEL_PAGES = [
  "about",
  "services",
  "portfolio",
  "contact",
  "ai",
  "web",
  "robotics",
] as const;

/**
 * Top-level routes that have their own file under app/ instead of a slot in the
 * pageContent map. A page moves here when it outgrows the shared template —
 * that template paints a permanent black gradient, so anything living in it
 * ignores the light theme.
 */
export const STANDALONE_PAGES = ["data", "products"] as const;

/** Mirrors the directories under app/services/. */
export const SERVICE_SLUGS = [
  "3d-technologies",
  "ai-machine-learning",
  "cctv-surveillance",
  "computer-vision-nlp",
  "cybersecurity",
  "data-analytics-science",
  "digital-marketing",
  "drone-technology",
  "networking",
  "renewable-energy",
  "robotics-automation",
  "web-design-development",
] as const;

/** Mirrors the directories under app/portfolio/. */
export const PORTFOLIO_SLUGS = [
  "ai-agriculture",
  "ai-health-assistant",
  "credit-card-fraud",
  "ecommerce-transformation",
  "firefighting-robot",
  "hydroponics",
  "iot-home",
  "serving-robot",
  "sign-language-educator",
  "smart-campus",
  "speech-emotion",
  "utme-career-advisor",
] as const;

/** Mirrors the directories under app/expertise/. */
export const EXPERTISE_SLUGS = [
  "ai-ml",
  "data-science",
  "robotics",
  "web-engineering",
] as const;

/**
 * Every publicly indexable route, as a site-root path with a leading slash and
 * no trailing slash ("" is the home page).
 *
 * Deliberately excludes /admin, /login, /register, /unauthorized and /404:
 * those are either gated or error pages and must not enter the sitemap.
 *
 * scripts/verify-export.mjs asserts this list matches what `next build`
 * actually wrote into out/, so it cannot silently drift from the app router.
 */
export const PUBLIC_ROUTES: string[] = [
  "",
  ...TOP_LEVEL_PAGES.map((p) => `/${p}`),
  ...STANDALONE_PAGES.map((p) => `/${p}`),
  ...PRODUCT_SLUGS.map((s) => `/products/${s}`),
  ...SERVICE_SLUGS.map((s) => `/services/${s}`),
  ...PORTFOLIO_SLUGS.map((s) => `/portfolio/${s}`),
  ...EXPERTISE_SLUGS.map((s) => `/expertise/${s}`),
];

/** Routes that exist in the export but must never be indexed. */
export const NOINDEX_ROUTES = [
  "/admin",
  "/login",
  "/register",
  "/unauthorized",
] as const;
