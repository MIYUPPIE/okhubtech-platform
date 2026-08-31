"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Users } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EducationSection from "@/components/EducationSection";
import ServicesSection from "@/components/ServicesSection";
import SolutionCenterSection from "@/components/SolutionCenterSection";
import DomainsSection from "@/components/DomainsSection";
import ECommerceSection from "@/components/ECommerceSection";
import ResearchSection from "@/components/ResearchSection";
import PartnershipsSection from "@/components/PartnershipsSection";
import ImpactSection from "@/components/ImpactSection";
import ContactSection from "@/components/ContactSection";
import InnovationSection from "@/components/InnovationSection";
import LoadingScreen from "@/components/LoadingScreen";
import { useEffect, useState } from "react";

const credibilityStats = [
  { label: "Global delivery hubs", value: "6", icon: Users },
  { label: "Security certifications", value: "ISO27001", icon: ShieldCheck },
  { label: "Innovation awards", value: "14", icon: Sparkles },
];

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLoader(false), 2800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <LoadingScreen active={showLoader} />
      <section className="relative pb-20">
        <div className="mx-auto mt-10 w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <HeroSection />
        </div>

        <div className="container-default mt-16">
          <motion.div
            className="grid gap-4 rounded-3xl border border-black/15 bg-white shadow-sm dark:border-white/10 dark:bg-black/60 p-6 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            {credibilityStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div
                  className="rounded-2xl border border-black/15 dark:border-white/10 p-3"
                  style={{ color: "var(--gold-primary)" }}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-black/65 dark:text-white/50">
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold text-black dark:text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <AboutSection />
        <EducationSection />
        <SolutionCenterSection />
        <DomainsSection />

        <ServicesSection />
        <ECommerceSection />
        <ResearchSection />
        <InnovationSection />
        <PartnershipsSection />
        <ImpactSection />
        <ContactSection />

        <div className="container-default section-shell">
          <div className="rounded-3xl border border-black/15 dark:border-white/10 bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-black dark:to-[#050505] p-10 text-center shadow-lg dark:shadow-none">
            <p className="section-heading">Engage the studio</p>
            <h3 className="mt-4 text-3xl font-semibold text-black dark:text-white">
              Commission a flagship program or rapid innovation pod.
            </h3>
            <p className="mt-4 text-black/70 dark:text-white/70">
              Every OKHub engagement includes premium creative direction, secure data fabric, and AI-first delivery teams.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href="/contact" className="btn-primary">
                Launch a Program
              </a>
              <a href="/services" className="btn-secondary">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
