import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/renewable-energy",
  title: "Renewable Energy",
  description:
    "Sustainable infrastructure: solar, wind and hybrid system architecture, with consulting for grid independence.",
  ogSlug: "services",
  ogAlt: "Renewable Energy at OKHub",
});

import React from "react";

const RenewableEnergyPage = () => (
  <main className="container-default py-12">
    <h1 className="text-3xl font-bold mb-4">Renewable Energy</h1>
    <p className="mb-2">Sustainable infrastructure.</p>
    <ul className="list-disc ml-6 text-lg">
      <li>Solar, wind, and hybrid system architecture</li>
      <li>Consulting + integration for grid independence</li>
    </ul>
  </main>
);

export default RenewableEnergyPage;
