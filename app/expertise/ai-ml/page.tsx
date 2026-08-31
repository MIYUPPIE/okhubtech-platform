import React from "react";

export default function AIMLExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-white">AI & Machine Learning Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-white/80 mb-4">
          Our AI & Machine Learning team specializes in building intelligent systems for automation, prediction, and optimization. We deliver custom solutions for enterprises, governments, and startups, leveraging the latest advancements in artificial intelligence.
        </p>
        <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
          <li>Deep learning and neural networks</li>
          <li>Natural language processing (NLP)</li>
          <li>Computer vision and image analysis</li>
          <li>Predictive analytics and forecasting</li>
          <li>AI-powered automation for business processes</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Expertise</h2>
          <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/AdqFQ8pQY7k"
              title="AI & Machine Learning Expertise"
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
