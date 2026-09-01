import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/robotics-automation",
  title: "Robotics & Automation",
  description:
    "Industrial and commercial robotics deployments, IoT-connected systems, and automation for manufacturing and logistics.",
  ogSlug: "services",
  ogAlt: "Robotics & Automation at OKHub",
});


import Link from "next/link";
import React from "react";

const RoboticsAutomationPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Robotics & Automation</h1>
    <section className="mb-8">
      <p className="text-lg text-black/80 dark:text-white/80 mb-4">
        Our Robotics & Automation service delivers intelligent machines and automated systems for industrial and commercial applications. We design, build, and deploy robotics solutions that enhance productivity, safety, and operational efficiency.
      </p>
      <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
        <li>Industrial + commercial robotics deployments</li>
        <li>IoT innovation for smart, connected systems</li>
        <li>Custom automation for manufacturing and logistics</li>
        <li>Robotic process automation (RPA)</li>
        <li>Integration with AI and machine learning</li>
        <li>Maintenance and support for deployed systems</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Why Choose Us?</h2>
        <p className="text-black/70 dark:text-white/70 mb-2">
          Our robotics engineers and automation specialists deliver solutions that are reliable, scalable, and tailored to your unique needs. We help organizations embrace the future of automation with confidence and expertise.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Get Started</h2>
        <p className="text-black/70 dark:text-white/70">
          Ready to automate your operations? <Link href="/contact" className="text-gold-ink underline underline-offset-4 hover:opacity-80">Contact our robotics team</Link> to discuss your requirements and discover innovative solutions.
        </p>
      </div>
    </section>
  </main>
);

export default RoboticsAutomationPage;
