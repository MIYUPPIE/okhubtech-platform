
import Link from "next/link";
import React from "react";

const DataAnalyticsSciencePage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Data Analytics & Science</h1>
    <section className="mb-8">
      <p className="text-lg text-black/80 dark:text-white/80 mb-4">
        Our Data Analytics & Science service empowers organizations to make informed decisions from complex signals. We leverage advanced analytics, machine learning, and scientific workflows to transform raw data into actionable insights.
      </p>
      <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
        <li>Big data pipelines with realtime dashboards</li>
        <li>Advanced science workflows for deep problem solving</li>
        <li>Predictive analytics for strategic planning</li>
        <li>Data visualization and reporting</li>
        <li>Custom solutions for industry-specific challenges</li>
        <li>Data governance and security best practices</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Why Choose Us?</h2>
        <p className="text-black/70 dark:text-white/70 mb-2">
          Our team combines domain expertise with technical excellence to deliver analytics solutions that drive growth and innovation. We partner with you to unlock the full potential of your data, ensuring accuracy, reliability, and strategic value.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Watch Our Overview</h2>
        <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/2vK1G6b0GJc"
            title="Data Analytics & Science Explained"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Get Started</h2>
        <p className="text-black/70 dark:text-white/70">
          Ready to harness the power of your data? <Link href="/contact" className="text-gold-ink underline underline-offset-4 hover:opacity-80">Contact our analytics team</Link>, or read the <Link href="/data" className="text-gold-ink underline underline-offset-4 hover:opacity-80">data practice page</Link> for the projects behind this work.
        </p>
      </div>
    </section>
  </main>
);

export default DataAnalyticsSciencePage;
