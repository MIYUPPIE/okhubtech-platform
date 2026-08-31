import React from "react";

export default function EcommerceTransformationPortfolioPage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-white">E-Commerce Transformation</h1>
      <img src="/media/portfolio/ecommerce.webp" alt="E-Commerce Transformation" className="rounded-xl mb-6 w-full h-64 object-cover border border-white/10" />
      <section className="mb-8">
        <p className="text-lg text-white/80 mb-4">
          This project delivers a modern e-commerce platform with integrated payment and logistics for local businesses, enabling seamless online transactions and efficient order fulfillment.
        </p>
        <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
          <li>Custom storefronts for local vendors</li>
          <li>Secure payment gateway integration</li>
          <li>Automated logistics and delivery tracking</li>
          <li>Analytics dashboard for business owners</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
          <p className="text-white/70 mb-2">
            The platform has empowered small businesses to reach new customers and streamline operations, driving growth in the local digital economy.
          </p>
        </div>
      </section>
    </main>
  );
}
