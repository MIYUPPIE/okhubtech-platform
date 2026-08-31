import React from "react";

export default function RoboticsExpertisePage() {
  return (
    <main className="container-default py-12">
      <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">Robotics Expertise</h1>
      <section className="mb-8">
        <p className="text-lg text-black/80 dark:text-white/80 mb-4">
          Our Robotics team delivers intelligent machines and automated systems for industrial and commercial applications. We design, build, and deploy robotics solutions that enhance productivity, safety, and operational efficiency.
        </p>
        <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
          <li>Industrial and commercial robotics deployments</li>
          <li>Custom automation for manufacturing and logistics</li>
          <li>Robotic process automation (RPA)</li>
          <li>Integration with AI and IoT</li>
          <li>Maintenance and support for deployed systems</li>
        </ul>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Watch Our Expertise</h2>
          <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/4u5XQWkQe3g"
              title="Robotics Expertise"
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
