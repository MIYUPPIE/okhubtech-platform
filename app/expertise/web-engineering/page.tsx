import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/expertise/web-engineering",
  title: "Web Engineering Expertise",
  description:
    "Responsive, scalable web platforms with custom UI/UX, SEO and accessibility built in from the start.",
  ogSlug: "expertise",
  ogAlt: "Web Engineering Expertise at OKHub",
});

import React from "react";

export default function WebEngineeringExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Web Engineering Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          Our Web Engineering team builds immersive, high-performance web ecosystems. We deliver responsive, scalable platforms with custom UI/UX, SEO optimization, and seamless integration with modern CMS and e-commerce solutions.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Responsive web design and development</li>
          <li>Custom UI/UX for optimal engagement</li>
          <li>SEO optimization and accessibility</li>
          <li>Integration with CMS and e-commerce</li>
          <li>Performance monitoring and support</li>
        </ul>
      </section>
    </main>
  );
}
