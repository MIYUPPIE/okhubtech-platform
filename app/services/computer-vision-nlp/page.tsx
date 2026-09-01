import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/services/computer-vision-nlp",
  title: "Computer Vision & NLP",
  description:
    "Image and video intelligence for safety and logistics, paired with NLP layers that elevate citizen-facing services.",
  ogSlug: "services",
  ogAlt: "Computer Vision & NLP at OKHub",
});

import React from "react";

const ComputerVisionNLPPage = () => (
  <main className="container-default py-12">
    <h1 className="text-3xl font-bold mb-4">Computer Vision & NLP</h1>
    <p className="mb-2">Perception + language copilots.</p>
    <ul className="list-disc ml-6 text-lg">
      <li>Image/video intelligence for safety and logistics</li>
      <li>NLP layers elevating citizen services</li>
    </ul>
  </main>
);

export default ComputerVisionNLPPage;
