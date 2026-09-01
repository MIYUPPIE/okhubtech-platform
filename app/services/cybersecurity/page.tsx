import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/cybersecurity",
  title: "Cybersecurity",
  description:
    "Threat modelling, SOC design and zero-trust architecture, plus resilience testing for national-scale platforms.",
  ogSlug: "services",
  ogAlt: "Cybersecurity at OKHub",
});

import React from "react";

const CybersecurityPage = () => (
  <main className="container-default py-12">
    <h1 className="text-3xl font-bold mb-4">Cybersecurity</h1>
    <p className="mb-2">Secure-by-design posture.</p>
    <ul className="list-disc ml-6 text-lg">
      <li>Threat modeling, SOC design, and zero-trust</li>
      <li>Resilience testing for national platforms</li>
    </ul>
  </main>
);

export default CybersecurityPage;
