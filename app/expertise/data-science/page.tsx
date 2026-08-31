import React from "react";

export default function DataScienceExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-white">Data Science Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-white/80 mb-4">
          Our Data Science team transforms raw data into actionable insights. We design and implement big data pipelines, advanced analytics, and custom science workflows for deep problem solving and strategic decision-making.
        </p>
        <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
          <li>Big data engineering and management</li>
          <li>Statistical modeling and analysis</li>
          <li>Data visualization and reporting</li>
          <li>Predictive analytics for business strategy</li>
          <li>Custom solutions for industry-specific challenges</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Expertise</h2>
          <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/2vK1G6b0GJc"
              title="Data Science Expertise"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
