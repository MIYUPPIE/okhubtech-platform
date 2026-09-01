import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/expertise/ai-ml",
  title: "AI & Machine Learning Expertise",
  description:
    "Deep learning, neural networks and custom AI systems for automation, prediction and optimisation, built for enterprises, governments and startups.",
  ogSlug: "expertise",
  ogAlt: "AI & Machine Learning Expertise at OKHub",
});

import React from "react";

export default function AIMLExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">AI & Machine Learning Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          Our AI & Machine Learning team specializes in building intelligent systems for automation, prediction, and optimization. We deliver custom solutions for enterprises, governments, and startups, leveraging the latest advancements in artificial intelligence.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Deep learning and neural networks</li>
          <li>Natural language processing (NLP)</li>
          <li>Computer vision and image analysis</li>
          <li>Predictive analytics and forecasting</li>
          <li>AI-powered automation for business processes</li>
        </ul>
      </section>
    </main>
  );
}
