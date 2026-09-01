import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/web-design-development",
  title: "Web Design & Development",
  description:
    "Responsive, high-performance web platforms engineered for low-bandwidth realities and enterprise-grade scale.",
  ogSlug: "services",
  ogAlt: "Web Design & Development at OKHub",
});


import Link from "next/link";
import React from "react";

const WebDesignDevelopmentPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Web Design & Development</h1>
    <section className="mb-8">
      <p className="text-lg text-black/80 dark:text-white/80 mb-4">
        Our Web Design & Development service delivers immersive, high-performance web ecosystems tailored for modern businesses and organizations. We combine cutting-edge design principles, robust engineering, and a deep understanding of user experience to create platforms that are both beautiful and functional.
      </p>
      <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
        <li>Responsive experience systems built for low-bandwidth realities</li>
        <li>Enterprise-grade platforms engineered for scalability</li>
        <li>Custom UI/UX design for optimal engagement</li>
        <li>SEO optimization and accessibility compliance</li>
        <li>Integration with modern CMS and e-commerce solutions</li>
        <li>Continuous support and performance monitoring</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Why Choose Us?</h2>
        <p className="text-black/70 dark:text-white/70 mb-2">
          We understand the unique challenges faced by African enterprises and global organizations. Our solutions are designed to be robust, scalable, and adaptable to evolving digital landscapes. From initial concept to final deployment, our team ensures every project meets the highest standards of quality and innovation.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Get Started</h2>
        <p className="text-black/70 dark:text-white/70">
          Ready to elevate your digital presence? <Link href="/contact" className="text-gold-ink underline underline-offset-4 hover:opacity-80">Contact our team</Link> to discuss your project and discover how we can help you achieve your goals.
        </p>
      </div>
    </section>
  </main>
);

export default WebDesignDevelopmentPage;
