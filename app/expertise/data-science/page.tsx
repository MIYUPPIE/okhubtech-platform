import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/expertise/data-science",
  title: "Data Science Expertise",
  description:
    "Big data pipelines, advanced analytics and scientific workflows that turn raw data into decisions worth acting on.",
  ogSlug: "expertise",
  ogAlt: "Data Science Expertise at OKHub",
});

import Link from "next/link";
import React from "react";

export default function DataScienceExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Data Science Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          Our Data Science team transforms raw data into actionable insights. We design and implement big data pipelines, advanced analytics, and custom science workflows for deep problem solving and strategic decision-making.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Big data engineering and management</li>
          <li>Statistical modeling and analysis</li>
          <li>Data visualization and reporting</li>
          <li>Predictive analytics for business strategy</li>
          <li>Custom solutions for industry-specific challenges</li>
        </ul>
        <p className="mt-6 text-black/70 dark:text-white/70">
          For the projects behind this (the architectures, what they run on and
          why), see the{" "}
          <Link href="/data" className="text-gold-ink underline underline-offset-4 hover:opacity-80">
            data practice page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
