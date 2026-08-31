import React from "react";

export default function ServingRobotPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-white">Serving Robot</h1>
            <img src="/portfolio/serving-robot.png" alt="Serving Robot" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-white/80 mb-4">
                    An autonomous serving robot engineered atop ROS (Robot Operating System). It maps complex, highly-dynamic indoor environments like restaurants and hospitality lounges, navigating safely to deliver items.
                </p>
                <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
                    <li>Advanced simultaneous localization and mapping (SLAM)</li>
                    <li>LIDAR and depth-camera sensor fusion for obstacle avoidance</li>
                    <li>Multi-robot fleet management API</li>
                    <li>Smooth kinematic path planning to avoid spilling liquids</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
                    <p className="text-white/70 mb-2">
                        Modernized service delivery, mitigating labor shortages in the hospitality sector while offering guests an undeniably futuristic and engaging dining experience.
                    </p>
                </div>
            </section>
        </main>
    );
}
