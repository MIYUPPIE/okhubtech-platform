
import React from "react";

const RoboticsAutomationPage = () => (
  <main className="container-default py-12">
    <h1 className="text-4xl font-bold mb-6 text-white">Robotics & Automation</h1>
    <section className="mb-8">
      <p className="text-lg text-white/80 mb-4">
        Our Robotics & Automation service delivers intelligent machines and automated systems for industrial and commercial applications. We design, build, and deploy robotics solutions that enhance productivity, safety, and operational efficiency.
      </p>
      <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
        <li>Industrial + commercial robotics deployments</li>
        <li>IoT innovation for smart, connected systems</li>
        <li>Custom automation for manufacturing and logistics</li>
        <li>Robotic process automation (RPA)</li>
        <li>Integration with AI and machine learning</li>
        <li>Maintenance and support for deployed systems</li>
      </ul>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Why Choose Us?</h2>
        <p className="text-white/70 mb-2">
          Our robotics engineers and automation specialists deliver solutions that are reliable, scalable, and tailored to your unique needs. We help organizations embrace the future of automation with confidence and expertise.
        </p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Watch Our Overview</h2>
        <div className="aspect-w-16 aspect-h-9 w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/4u5XQWkQe3g"
            title="Robotics & Automation Explained"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Get Started</h2>
        <p className="text-white/70">
          Ready to automate your operations? <a href="/contact" className="text-gold-primary underline">Contact our robotics team</a> to discuss your requirements and discover innovative solutions.
        </p>
      </div>
    </section>
  </main>
);

export default RoboticsAutomationPage;
