import React from "react";

export default function UTMECareerAdvisorPortfolioPage() {
    return (
        <main className="container-default py-12">
            <h1 className="text-4xl font-bold mb-6 text-white">UTME Career Advisor</h1>
            <img src="/portfolio/utme-career-advisor.png" alt="UTME Career Advisor" className="rounded-xl mb-6 w-full h-[32rem] object-cover border border-white/10" />
            <section className="mb-8">
                <p className="text-lg text-white/80 mb-4">
                    A Django and LLM-based academic guidance platform designed to assist students by providing personalized, robust career paths based on their UTME scores, interests, and academic strengths.
                </p>
                <ul className="list-disc ml-6 text-lg text-white/70 mb-4">
                    <li>Automated analysis of UTME scores and subject combinations</li>
                    <li>LLM-generated personalized career roadmaps</li>
                    <li>Interactive university requirement matching</li>
                    <li>Scalable Django backend handling thousands of concurrent users</li>
                </ul>
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Project Impact</h2>
                    <p className="text-white/70 mb-2">
                        Empowered thousands of secondary school graduates to make informed decisions about their university courses, greatly reducing admission errors and misalignment of skills.
                    </p>
                </div>
            </section>
        </main>
    );
}
