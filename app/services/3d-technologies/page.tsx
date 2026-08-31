
import React from "react";

const ThreeDTechnologiesPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-white">3D Technologies</h1>
    <section className="mb-8">
      <p className="text-lg text-white/80 mb-4">
        Our 3D Technologies service offers advanced design, prototyping, and manufacturing solutions for a wide range of industries. We utilize state-of-the-art 3D modeling, printing, and simulation tools to bring ideas to life with precision and speed.
      </p>
      <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
        <li>3D design studios and additive printing labs</li>
        <li>Rapid prototyping for health, agri, and mobility</li>
        <li>Custom product development and iteration</li>
        <li>Simulation and testing for optimal performance</li>
        <li>Integration with digital twin and IoT platforms</li>
        <li>Consulting for manufacturing and deployment</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Why Choose Us?</h2>
        <p className="text-white/70 mb-2">
          Our team combines creative vision with technical expertise to deliver 3D solutions that accelerate innovation and reduce time-to-market. We support clients from concept to production, ensuring quality and efficiency at every stage.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Overview</h2>
        <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/6oH02sA6aR8"
            title="3D Technologies Explained"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Get Started</h2>
        <p className="text-white/70">
          Ready to innovate with 3D technologies? <a href="/contact" className="text-gold-primary underline">Contact our 3D team</a> to discuss your project and discover tailored solutions.
        </p>
      </div>
    </section>
  </main>
);

export default ThreeDTechnologiesPage;
