import React from "react";

export default function AIAgriculturePortfolioPage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">AI-Powered Agriculture Platform</h1>
      <img src="/media/portfolio/agriculture.webp" alt="AI Agriculture" className="rounded-xl mb-6 w-full h-64 object-cover border border-black/10 dark:border-white/10" />
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          This project delivers a scalable platform using AI and IoT to optimize crop yields for African farmers. It integrates real-time sensor data, predictive analytics, and automated recommendations to improve productivity and sustainability.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Real-time monitoring of soil and weather conditions</li>
          <li>AI-driven crop management and yield prediction</li>
          <li>Mobile-friendly dashboards for farmers</li>
          <li>Integration with local supply chains</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
          <p className="text-black/70 dark:text-white/70 mb-2">
            The platform has helped hundreds of farmers increase yields and reduce resource waste, supporting food security and economic growth in rural communities.
          </p>
        </div>
      </section>
    </main>
  );
}
