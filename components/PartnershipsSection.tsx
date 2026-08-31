"use client";

import { motion } from "framer-motion";
import { Building2, Handshake, Landmark, School } from "lucide-react";
import Link from "next/link";

const partnerTypes = [
  {
    icon: School,
    title: "Schools & universities",
    detail: "Curriculum co-design, labs, and faculty upskilling for campuses across the continent.",
  },
  {
    icon: Building2,
    title: "Corporations",
    detail: "Enterprise innovation pods, workforce training, and co-branded solution deployments.",
  },
  {
    icon: Landmark,
    title: "Governments",
    detail: "National programs, policy labs, and sovereign infrastructure planning.",
  },
  {
    icon: Handshake,
    title: "NGOs & development partners",
    detail: "Impact-focused accelerators, funding coalitions, and community innovation labs.",
  },
];

const PartnershipsSection = () => (
  <section className="container-default section-shell" id="partnerships">
    <div className="space-y-4">
      <p className="section-heading">Partnerships</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
      >
        <h2 className="section-title text-black dark:text-white">Coalitions with schools, NGOs, governments, and corporations.</h2>
        <p className="mt-4 text-black/70 dark:text-white/70">
          OKHub convenes multi-stakeholder alliances to co-finance, co-design, and co-govern deployments. Partner profiles include collaboration requests, governance frameworks, and KPIs.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {partnerTypes.map((partner) => (
            <div key={partner.title} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                  <partner.icon className="h-5 w-5" />
                </span>
                <p className="text-lg font-semibold text-black dark:text-white">{partner.title}</p>
              </div>
              <p className="mt-3 text-sm text-black/70 dark:text-white/70">{partner.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/contact" className="btn-primary">
            Partner With Us
          </Link>
          <Link href="/contact" className="btn-secondary">
            Submit Collaboration Request
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default PartnershipsSection;
