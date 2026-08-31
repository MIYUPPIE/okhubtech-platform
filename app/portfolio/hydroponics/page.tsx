import React from "react";

export default function HydroponicsPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-white">Hydroponics Automation System</h1>
            <img src="/media/portfolio/hydroponics.webp" alt="Hydroponics Automation System" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-white/80 mb-4">
                    A high-tech approach to modern agriculture. This GSM and IoT driven infrastructure automates indoor vertical farming, ensuring that crops receive precise nutrients and climate control without reliance on local broadband.
                </p>
                <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
                    <li>GSM telemetry designed for remote and rural operations</li>
                    <li>Automated pH, nutrient dosing, and water cycles</li>
                    <li>AI-analyzed growth metrics from camera feeds</li>
                    <li>Redundancy systems to maintain yields during power outages</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
                    <p className="text-white/70 mb-2">
                        Dramatically multiplied annual crop yields within dense urban centers and resource-scarce environments, utilizing 90% less water than traditional soil-based farming.
                    </p>
                </div>
            </section>
        </main>
    );
}
