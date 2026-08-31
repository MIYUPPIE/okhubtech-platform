import type { MetadataRoute } from "next";

import { PUBLIC_ROUTES, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Home gets top priority, section indexes next, leaf pages below that. */
function priorityFor(route: string): number {
  if (route === "") return 1;
  return route.split("/").length > 2 ? 0.6 : 0.8;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    // trailingSlash: true is set in next.config.ts, so the canonical URL of
    // every non-home route ends in "/". Emitting the unslashed form here would
    // list URLs that 301 rather than the ones actually served.
    url: route === "" ? `${SITE_URL}/` : `${SITE_URL}${route}/`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: priorityFor(route),
  }));
}
