"use client";

import { motion } from "framer-motion";
import { BookOpenCheck, GraduationCap, Layers3, NotebookPen, Rocket, Target } from "lucide-react";
import Link from "next/link";

const programTypes = [
  {
    title: "Free community programs",
    description: "Foundation labs for underserved learners featuring offline-first toolkits, micro-grants, and community mentors.",
    badge: "Open access",
  },
  {
    title: "Professional programs",
    description: "Intensive Builder, Innovator, and Leader pathways co-designed with ministries and enterprises for mission-critical talent.",
    badge: "Paid + credentialed",
  },
];

const tracks = [
  {
    title: "Foundation",
    icon: BookOpenCheck,
    duration: "6 weeks",
    focus: "Digital fluency, AI literacy, low-code automation, and soft-skill mastery.",
  },
  {
    title: "Builder",
    icon: Layers3,
    duration: "12 weeks",
    focus: "Full-stack engineering, robotics assembly, and IoT deployment playbooks.",
  },
  {
    title: "Innovator",
    icon: Rocket,
    duration: "16 weeks",
    focus: "Product leadership, venture readiness, and sovereign infrastructure patterns.",
  },
  {
    title: "Leader",
    icon: GraduationCap,
    duration: "Executive sessions",
    focus: "Policy, governance, and scale orchestration for ministers, CTOs, and ecosystem partners.",
  },
];

const obligations = [
  {
    icon: Target,
    label: "Mandatory project deployment",
    detail: "Every cohort ships a live solution with measurable impact metrics before certification.",
  },
  {
    icon: NotebookPen,
    label: "Shared IP studio",
    detail: "Learners access curated research, industry datasets, and design systems hosted on sovereign infrastructure.",
  },
];

const EducationSection = () => (
  <section className="container-default section-shell" id="education">
    <div className="space-y-4">
      <p className="section-heading">Education Center</p>
      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <h2 className="section-title leading-tight text-black dark:text-white">Tracks for every operator in the Fourth Industrial Revolution.</h2>
          <p className="mt-4 text-black/70 dark:text-white/70">
            We treat education as infrastructure. Programs are bilingual, industry-backed, and powered by mentors across robotics, AI, IoT, immersive media, and data governance.
          </p>
          <div className="mt-8 grid gap-4">
            {programTypes.map((program) => (
              <div key={program.title} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 dark:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-black dark:text-white">{program.title}</p>
                  <span className="rounded-full border border-black/15 dark:border-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-black/60 dark:text-white/60">
                    {program.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm text-black/70 dark:text-white/70">{program.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/programs" className="btn-primary">
              Explore Programs
            </Link>
            <Link href="/enroll" className="btn-secondary">
              Enroll Today
            </Link>
          </div>
        </motion.div>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {tracks.map((track) => (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                    <track.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-black dark:text-white">{track.title}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{track.duration}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-black/70 dark:text-white/70">{track.focus}</p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-3xl border border-dashed border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {obligations.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-black dark:text-white">{item.label}</p>
                    <p className="text-sm text-black/70 dark:text-white/70">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-black/60 dark:text-white/60">
              Cohorts blend remote simulations with on-campus labs. Certificates remain future-ready, with blockchain verification coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default EducationSection;
