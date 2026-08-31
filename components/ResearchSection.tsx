"use client";

import { motion } from "framer-motion";
import { Beaker, FileText, Microscope, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const researchProjects = [
  {
    title: "Digital twin & Isaac Sim for African ports",
    tag: "Prototype",
    summary: "High-fidelity NVIDIA Isaac Simulation + ROS 2 orchestration for Lagos and Mombasa corridors.",
  },
  {
    title: "Cosmos Robotics Interoperability",
    tag: "Research",
    summary: "Building scalable fleet coordination using Cosmos framework for autonomous infrastructure.",
  },
  {
    title: "AI genomics for community clinics",
    tag: "Research",
    summary: "Federated learning pipeline aligned with continental health data protocols.",
  },
  {
    title: "Agro-climate intelligence",
    tag: "Collaboration",
    summary: "Joint work with universities to deploy predictive systems for cooperatives.",
  },
];

const researchBenefits = [
  {
    icon: Microscope,
    label: "Applied research",
    detail: "Labs focused on autonomous robotics, AI, Digital Twins, Isaac Sim, and ROS 2/Cosmos orchestration for Africa’s realities.",
  },
  {
    icon: FileText,
    label: "Publications",
    detail: "Peer-reviewed papers and implementation guides with Cloudinary-hosted PDFs.",
  },
  {
    icon: Users,
    label: "Industry collaborations",
    detail: "Joint ventures with governments, telcos, and development partners.",
  },
];

const ResearchSection = () => (
  <section className="container-default section-shell" id="research">
    <div className="space-y-4">
      <p className="section-heading">Research & Innovation</p>

      <div className="relative mb-12 h-[300px] w-full overflow-hidden rounded-3xl sm:h-[400px] lg:h-[500px]">
        <Image
          src="/images/digital_twin_center.png"
          alt="Engineers monitoring a glowing 3D digital twin simulation of city infrastructure"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Command Centers</p>
          <p className="mt-2 font-display text-2xl sm:text-4xl">Visualizing Lagos Smart City Infrastructure.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/75 p-8"
        >
          <h2 className="section-title leading-tight text-black dark:text-white">Applied research powering prototypes, publications, and future-ready collaborations.</h2>
          <p className="mt-4 text-black/70 dark:text-white/70">
            OKHub research guilds translate insights into products and deployment kits using cutting-edge frameworks like Digital Twins, NVIDIA Isaac Simulation, ROS 2, and the Cosmos ecosystem. Teams publish findings, ship prototypes, and co-author IP with ministries, universities, and industry.
          </p>
          <div className="mt-8 grid gap-4">
            {researchProjects.map((project) => (
              <div key={project.title} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-black dark:text-white">{project.title}</p>
                  <span className="rounded-full border border-black/15 dark:border-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-black/60 dark:text-white/60">
                    {project.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm text-black/70 dark:text-white/70">{project.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/research" className="btn-primary">
              Join Our Research
            </Link>
            <Link href="/publications" className="btn-secondary">
              View Documentation
            </Link>
          </div>
        </motion.div>
        <div className="space-y-4">
          {researchBenefits.map((benefit) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="flex gap-4 rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-6"
            >
              <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-black dark:text-white">{benefit.label}</p>
                <p className="text-sm text-black/70 dark:text-white/70">{benefit.detail}</p>
              </div>
            </motion.div>
          ))}
          <div className="rounded-3xl border border-dashed border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 p-6 text-black/70 dark:text-white/70">
            Funding partners access dashboards to track prototypes, IP filings, and collaborative KPIs.
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ResearchSection;
