import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/credit-card-fraud",
  title: "Credit Card Fraud Detection",
  description:
    "A fraud-detection pipeline using ANN and LSTM sequence modelling to flag fraudulent card transactions from spending behaviour.",
  ogSlug: "portfolio",
  ogAlt: "Credit Card Fraud Detection — an OKHub project",
});

import React from "react";

export default function CreditCardFraudPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Credit Card Fraud Detection</h1>
            <img src="/media/portfolio/credit-card-fraud.webp" alt="Credit Card Fraud Detection" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-black/10 dark:border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-black/80 dark:text-white/80 mb-4">
                    A high-performance financial risk management platform leveraging Artificial Neural Networks (ANN) and Long Short-Term Memory (LSTM) networks to identify and block fraudulent credit card transactions in milliseconds.
                </p>
                <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
                    <li>Millisecond latency transaction analysis pipeline</li>
                    <li>LSTM sequence modeling to understand user spending behaviors</li>
                    <li>Adaptive ANN catching previously unseen fraud patterns</li>
                    <li>Integration-ready REST APIs for banking systems</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
                    <p className="text-black/70 dark:text-white/70 mb-2">
                        Protected millions in digital assets by preventing unauthorized transactions with a 99.8% accuracy rate and incredibly low false-positive occurrences.
                    </p>
                </div>
            </section>
        </main>
    );
}
