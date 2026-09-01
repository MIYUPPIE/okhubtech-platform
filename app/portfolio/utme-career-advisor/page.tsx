import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/utme-career-advisor",
  title: "UTME Career Advisor",
  description:
    "An academic guidance platform matching UTME scores and subject combinations to university course requirements and personalised career paths.",
  ogSlug: "portfolio",
  ogAlt: "UTME Career Advisor — an OKHub project",
});

import React from "react";

export default function UTMECareerAdvisorPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">UTME Career Advisor</h1>
            <img src="/media/portfolio/utme-career-advisor.webp" alt="UTME Career Advisor" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-black/10 dark:border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-black/80 dark:text-white/80 mb-4">
                    A Django and LLM-based academic guidance platform designed to assist students by providing personalized, robust career paths based on their UTME scores, interests, and academic strengths.
                </p>
                <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
                    <li>Automated analysis of UTME scores and subject combinations</li>
                    <li>LLM-generated personalized career roadmaps</li>
                    <li>Interactive university requirement matching</li>
                    <li>Scalable Django backend handling thousands of concurrent users</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
                    <p className="text-black/70 dark:text-white/70 mb-2">
                        Empowered thousands of secondary school graduates to make informed decisions about their university courses, greatly reducing admission errors and misalignment of skills.
                    </p>
                </div>
            </section>
        </main>
    );
}
