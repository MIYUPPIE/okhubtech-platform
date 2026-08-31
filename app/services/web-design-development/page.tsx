
import React from "react";

const WebDesignDevelopmentPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-white">Web Design & Development</h1>
    <section className="mb-8">
      <p className="text-lg text-white/80 mb-4">
        Our Web Design & Development service delivers immersive, high-performance web ecosystems tailored for modern businesses and organizations. We combine cutting-edge design principles, robust engineering, and a deep understanding of user experience to create platforms that are both beautiful and functional.
      </p>
      <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
        <li>Responsive experience systems built for low-bandwidth realities</li>
        <li>Enterprise-grade platforms engineered for scalability</li>
        <li>Custom UI/UX design for optimal engagement</li>
        <li>SEO optimization and accessibility compliance</li>
        <li>Integration with modern CMS and e-commerce solutions</li>
        <li>Continuous support and performance monitoring</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Why Choose Us?</h2>
        <p className="text-white/70 mb-2">
          We understand the unique challenges faced by African enterprises and global organizations. Our solutions are designed to be robust, scalable, and adaptable to evolving digital landscapes. From initial concept to final deployment, our team ensures every project meets the highest standards of quality and innovation.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Overview</h2>
        <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/3JluqTojuME"
            title="Web Design & Development Explained"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Get Started</h2>
        <p className="text-white/70">
          Ready to elevate your digital presence? <a href="/contact" className="text-gold-primary underline">Contact our team</a> to discuss your project and discover how we can help you achieve your goals.
        </p>
      </div>
    </section>
  </main>
);

export default WebDesignDevelopmentPage;
