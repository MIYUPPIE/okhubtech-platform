import React from "react";

export default function IoTHomePortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-black dark:text-white">IoT Home Automation</h1>
            <img src="/media/portfolio/iot-home.webp" alt="IoT Home Automation" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-black/10 dark:border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-black/80 dark:text-white/80 mb-4">
                    A fully integrated smart home ecosystem driven by Python and various embedded systems. It centralizes control over lighting, security, thermodynamics, and energy utilization seamlessly through a local network.
                </p>
                <ul className="list-disc ml-6 text-lg text-black/70 dark:text-white/70 mb-4">
                    <li>Python-based central hub using MQTT protocols</li>
                    <li>Custom embedded microcontrollers acting as sensor nodes</li>
                    <li>Machine learning predictive climate control</li>
                    <li>Real-time security analytics and phone notifications</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">Project Impact</h2>
                    <p className="text-black/70 dark:text-white/70 mb-2">
                        Provided robust infrastructure for sustainable, energy-efficient living by drastically cutting down electricity waste and giving homeowners precise remote control over their environment.
                    </p>
                </div>
            </section>
        </main>
    );
}
