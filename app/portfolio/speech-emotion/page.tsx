import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/speech-emotion",
  title: "Speech Emotion Recognition",
  description:
    "A GRU-based audio model that extracts emotional signal from speech for behavioural analytics at scale.",
  ogSlug: "portfolio",
  ogAlt: "Speech Emotion Recognition — an OKHub project",
});

import React from "react";

export default function SpeechEmotionPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Speech Emotion Recognition</h1>
            <img src="/media/portfolio/speech-emotion.webp" alt="Speech Emotion Recognition" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-black/10 dark:border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-black/80 dark:text-white/80 mb-4">
                    An advanced NLP and Audio analysis AI utilizing Gated Recurrent Units (GRU). It extracts complex human emotional insights directly from speech nuances, providing deep behavioral analytics.
                </p>
                <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
                    <li>Raw audio waveform processing and feature extraction</li>
                    <li>GRU-based temporal sequence modeling for shifting emotions</li>
                    <li>Multilingual tone and sentiment detection capabilities</li>
                    <li>Scalable architecture for processing bulk customer service calls</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
                    <p className="text-black/70 dark:text-white/70 mb-2">
                        Revolutionized customer service quality assurance by automatically flagging calls with high frustration or anger, allowing immediate intervention and de-escalation by human managers.
                    </p>
                </div>
            </section>
        </main>
    );
}
