import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/ai-machine-learning",
  title: "AI & Machine Learning",
  description:
    "Custom copilots, predictive models and automation built for ministries and enterprises, from data pipeline to deployed model.",
  ogSlug: "services",
  ogAlt: "AI & Machine Learning at OKHub",
});


import Link from "next/link";
import React from "react";

const AIMachineLearningPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">AI & Machine Learning</h1>
    <section className="mb-8">
      <p className="text-lg text-black/80 dark:text-white/80 mb-4">
        Our AI & Machine Learning service delivers automation, prediction, and optimization for organizations seeking to leverage the power of artificial intelligence. We design and deploy custom AI solutions that drive efficiency, innovation, and strategic advantage.
      </p>
      <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
        <li>Custom copilots for ministries and enterprises</li>
        <li>Predictive models to steer policy and operations</li>
        <li>Natural language processing and computer vision</li>
        <li>AI-powered automation for business processes</li>
        <li>Data-driven decision support systems</li>
        <li>Continuous model training and improvement</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Why Choose Us?</h2>
        <p className="text-black/70 dark:text-white/70 mb-2">
          Our team of AI experts combines deep technical knowledge with industry experience to deliver solutions that are both innovative and practical. We work closely with clients to understand their unique challenges and deliver measurable results.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Get Started</h2>
        <p className="text-black/70 dark:text-white/70">
          Ready to transform your organization with AI? <Link href="/contact" className="text-gold-ink underline underline-offset-4 hover:opacity-80">Contact our AI team</Link> to discuss your goals and discover how we can help you innovate.
        </p>
      </div>
    </section>
  </main>
);

export default AIMachineLearningPage;
