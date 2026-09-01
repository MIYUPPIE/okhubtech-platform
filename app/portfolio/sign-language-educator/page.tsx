import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/sign-language-educator",
  title: "Sign Language Educator",
  description:
    "A computer vision system using YOLO and CNNs to recognise and validate signed gestures in real time, for interactive learning.",
  ogSlug: "portfolio",
  ogAlt: "Sign Language Educator — an OKHub project",
});

import React from "react";

export default function SignLanguageEducatorPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Sign Language Educator</h1>
            <img src="/media/portfolio/sign-language-educator.webp" alt="Sign Language Educator" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-black/10 dark:border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-black/80 dark:text-white/80 mb-4">
                    An immersive computer vision AI system that acts as an interactive sign language educator. Using YOLO object detection and Convolutional Neural Networks (CNNs), it can instantly recognize and validate signed gestures in real-time.
                </p>
                <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
                    <li>Real-time gesture tracking using YOLOv8</li>
                    <li>High-accuracy CNN classification for complex signs</li>
                    <li>Interactive learning modules with instant visual feedback</li>
                    <li>Optimized inference allowing deployment on edge devices</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
                    <p className="text-black/70 dark:text-white/70 mb-2">
                        Created a bridge for communication by lowering the barrier to entry for learning sign language, making educational resources much more accessible to the general public.
                    </p>
                </div>
            </section>
        </main>
    );
}
