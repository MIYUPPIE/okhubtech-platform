import React from "react";

export default function WebEngineeringExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-white">Web Engineering Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-white/80 mb-4">
          Our Web Engineering team builds immersive, high-performance web ecosystems. We deliver responsive, scalable platforms with custom UI/UX, SEO optimization, and seamless integration with modern CMS and e-commerce solutions.
        </p>
        <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
          <li>Responsive web design and development</li>
          <li>Custom UI/UX for optimal engagement</li>
          <li>SEO optimization and accessibility</li>
          <li>Integration with CMS and e-commerce</li>
          <li>Performance monitoring and support</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Expertise</h2>
          <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/3JluqTojuME"
              title="Web Engineering Expertise"
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
