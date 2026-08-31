import React from "react";

export default function FirefightingRobotPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-white">Firefighting Robot</h1>
            <img src="/portfolio/firefighting-robot.png" alt="Firefighting Robot" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-white/80 mb-4">
                    A ruggedized, vision-based robotic safety system specialized in hazard mitigation. Using advanced thermal imaging and AI tracking, the robot navigates infernos, extinguishes flames, and locates victims autonomously.
                </p>
                <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
                    <li>Thermal bounding box generation using custom vision models</li>
                    <li>Heavy-duty tracks and flame-resistant chassis</li>
                    <li>Targeted high-pressure water/foam deployment</li>
                    <li>Real-time telemetry and video uplink for human operators</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
                    <p className="text-white/70 mb-2">
                        Enhances the capabilities of first responders by taking on the most extreme hazards, ensuring that fires are suppressed efficiently without placing human life at critical risk.
                    </p>
                </div>
            </section>
        </main>
    );
}
