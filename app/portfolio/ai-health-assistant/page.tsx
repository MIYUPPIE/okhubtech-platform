import React from "react";

export default function AIHealthAssistantPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-white">AI Health Assistant</h1>
            <img src="/portfolio/ai-health-assistant.png" alt="AI Health Assistant" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-white/80 mb-4">
                    The AI Health Assistant leverages a secure Django backend coupled with advanced LLM orchestration to provide reliable, intelligent healthcare diagnostics and guidance. It is designed to act as a preliminary screening tool, improving patient access to medical information.
                </p>
                <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
                    <li>Secure HIPAA-compliant data handling via Django</li>
                    <li>Advanced LLM-driven diagnostic suggestions</li>
                    <li>24/7 availability for patient inquiries</li>
                    <li>Seamless integration with existing hospital APIs</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
                    <p className="text-white/70 mb-2">
                        This platform drastically reduces average wait times for initial consultations and optimizes clinical workflows by filtering and categorizing patient needs before they ever reach a physician.
                    </p>
                </div>
            </section>
        </main>
    );
}
