import React from "react";

export default function SmartCampusPortfolioPage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Smart Campus Automation</h1>
      <img src="/media/portfolio/smart-campus.webp" alt="Smart Campus" className="rounded-xl mb-6 w-full h-64 object-cover border border-black/10 dark:border-white/10" />
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          This project provides end-to-end automation and digital twin technology for a university campus, improving security, energy efficiency, and operational management.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Digital twin for real-time campus simulation</li>
          <li>Automated security and access control</li>
          <li>Energy management and optimization</li>
          <li>Centralized dashboard for campus administrators</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
          <p className="text-black/70 dark:text-white/70 mb-2">
            The solution has reduced operational costs and improved safety, setting a new standard for smart campus management in Africa.
          </p>
        </div>
      </section>
    </main>
  );
}
