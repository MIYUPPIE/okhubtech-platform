import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/drone-technology",
  title: "Drone Technology",
  description:
    "Aerial intelligence and training: surveys, inspections and precision agriculture, plus certified pilot training.",
  ogSlug: "services",
  ogAlt: "Drone Technology at OKHub",
});

import React from "react";

const DroneTechnologyPage = () => (
  <main className="container-default py-12">
    <h1 className="text-3xl font-bold mb-4">Drone Technology</h1>
    <p className="mb-2">Aerial intelligence + training.</p>
    <ul className="list-disc ml-6 text-lg">
      <li>Surveys, inspections, precision agriculture</li>
      <li>Certified training for professional pilots</li>
    </ul>
  </main>
);

export default DroneTechnologyPage;
