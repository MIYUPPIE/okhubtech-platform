import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/expertise/robotics",
  title: "Robotics Expertise",
  description:
    "Intelligent machines and automated systems for industrial and commercial use, integrated with AI and IoT.",
  ogSlug: "expertise",
  ogAlt: "Robotics Expertise at OKHub",
});

import React from "react";

export default function RoboticsExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Robotics Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          Our Robotics team delivers intelligent machines and automated systems for industrial and commercial applications. We design, build, and deploy robotics solutions that enhance productivity, safety, and operational efficiency.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Industrial and commercial robotics deployments</li>
          <li>Custom automation for manufacturing and logistics</li>
          <li>Robotic process automation (RPA)</li>
          <li>Integration with AI and IoT</li>
          <li>Maintenance and support for deployed systems</li>
        </ul>
      </section>
    </main>
  );
}
