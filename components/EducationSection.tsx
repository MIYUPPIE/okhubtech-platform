"use client";

import { motion } from "framer-motion";
import { Download, BookOpenCheck, GraduationCap, Layers3, NotebookPen, Rocket, Target } from "lucide-react";
import Link from "next/link";
import { ROBOTICS_GUIDE, fileSize } from "@/lib/media";

const programTypes = [
  {
    title: "Free community programs",
    description: "Offline-first kits and mentors, for schools without reliable power or bandwidth.",
    badge: "Open access",
  },
  {
    title: "Professional programs",
    description: "Longer tracks for people going into the work.",
    badge: "Paid + credentialed",
  },
];

const tracks = [
  {
    title: "Foundation",
    icon: BookOpenCheck,
    duration: "6 weeks",
    focus: "Digital and AI basics.",
  },
  {
    title: "Builder",
    icon: Layers3,
    duration: "12 weeks",
    focus: "Engineering, robotics assembly, IoT.",
  },
  {
    title: "Innovator",
    icon: Rocket,
    duration: "16 weeks",
    focus: "Product and venture skills.",
  },
  {
    title: "Leader",
    icon: GraduationCap,
    duration: "Executive sessions",
    focus: "Policy and governance for decision makers.",
  },
];

const obligations = [
  {
    icon: Target,
    label: "Mandatory project deployment",
    detail: "Every cohort ships something real before it certifies.",
  },
  {
    icon: NotebookPen,
    label: "Shared IP studio",
    detail: "Research, datasets and design systems included.",
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
          <h2 className="section-title leading-tight text-black dark:text-white">A track for wherever you are.</h2>
          <p className="mt-4 text-black/70 dark:text-white/70">
            Education is infrastructure. Mentors come from robotics, AI, IoT and data.
          </p>
          <div className="mt-8 grid gap-4">
            {programTypes.map((program) => (
              <div key={program.title} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:bg-white/5 p-5">
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
            <Link href="/bootcamp" className="btn-primary">
              See the 4IR Bootcamp
            </Link>
            <Link href="/contact" className="btn-secondary">
              Enroll Today
            </Link>
          </div>
          <a
            href={ROBOTICS_GUIDE.src}
            download
            className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-black/15 px-4 py-3 text-sm text-black/80 transition hover:border-black/40 dark:border-white/15 dark:text-white/80 dark:hover:border-white/40"
          >
            <Download className="h-4 w-4" style={{ color: "var(--gold-primary)" }} />
            <span>
              A Beginner&rsquo;s Guide to Autonomous Robots
              <span className="ml-2 text-black/50 dark:text-white/50">
                PDF, {fileSize(ROBOTICS_GUIDE.bytes)}
              </span>
            </span>
          </a>
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
