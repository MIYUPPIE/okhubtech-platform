import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/digital-marketing",
  title: "Digital Marketing",
  description:
    "Data-backed storytelling: SEO, social and content strategy with analytics-driven campaign optimisation.",
  ogSlug: "services",
  ogAlt: "Digital Marketing at OKHub",
});

import React from "react";

const DigitalMarketingPage = () => (
  <main className="container-default py-12">
    <h1 className="text-3xl font-bold mb-4">Digital Marketing</h1>
    <p className="mb-2">Data-backed storytelling.</p>
    <ul className="list-disc ml-6 text-lg">
      <li>SEO, social, and content strategies</li>
      <li>Analytics-driven campaign optimization</li>
    </ul>
  </main>
);

export default DigitalMarketingPage;
