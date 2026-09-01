import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

/**
 * app/portfolio/page.tsx is a client component (it fetches /api/portfolio in
 * a useEffect), and a client component cannot export `metadata` - Next drops
 * it silently rather than erroring, which is how this route ended up
 * inheriting the root layout's title, description and share image. A layout
 * has no such restriction and applies to the page beneath it.
 */
export const metadata: Metadata = pageMetadata({
  path: "/portfolio",
  title: "Portfolio",
  description:
    "Systems OKHub has shipped: an offline AI assistant, a serving robot, hydroponics automation, agriculture, fraud detection, campus automation and more.",
  ogSlug: "portfolio",
  ogAlt: "OKHub portfolio",
});

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
