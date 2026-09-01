import type { Metadata } from "next";

import { noindexMetadata } from "@/lib/seo";

/**
 * /login, /register and /unauthorized: robots.txt already disallows crawling
 * these, but that only stops a well-behaved crawler from fetching the page -
 * it does not stop a URL from being indexed if Google reaches it another way
 * (an old link, a bookmark someone shared). The noindex directive here is the
 * layer that actually guarantees these never show up in search or carry a
 * social preview.
 */
export const metadata: Metadata = noindexMetadata("Account");

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
