"use client";

import { motion } from "framer-motion";
import { Activity, Brain, Leaf, Stethoscope, TowerControl } from "lucide-react";

const solutionCategories = [
  {
    icon: Brain,
    industry: "Education",
    problem: "STEM capacity is thin and scattered.",
    technology: "AI tutoring, robotics labs, an LMS you own.",
    status: "Deployed in 6 nations",
    impact: "31,000 learners onboarded with 92% certification completion.",
  },
  {
    icon: Stethoscope,
    industry: "Healthcare",
    problem: "Rural diagnostics arrive too late.",
    technology: "Edge AI imaging and connected clinics.",
    status: "Pilot to national rollout",
    impact: "Diagnostics time reduced by 67% with human-in-loop assurance.",
  },
  {
    icon: TowerControl,
    industry: "Smart Infrastructure",
    problem: "Ports and rail run blind.",
    technology: "A digital twin ops centre and IoT telemetry.",
    status: "Live across 3 mega-corridors",
    impact: "Downtime shaved by 38% while unlocking new concession revenue.",
  },
  {
    icon: Leaf,
    industry: "Agriculture & Food Systems",
    problem: "Post-harvest losses eat farmer margins.",
    technology: "Cold chain, drone monitoring, traceability.",
    status: "Scaling to 12,000 co-ops",
    impact: "Losses reduced to 8% with finance-ready datasets for partners.",
  },
];

const SolutionCenterSection = () => (
  <section className="container-default section-shell" id="solutions">
    <div className="space-y-4">
      <p className="section-heading">Solution Center</p>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <h2 className="section-title leading-tight text-black dark:text-white">Deployment-grade playbooks for education, health, infrastructure, and agriculture.</h2>
          <p className="mt-4 text-black/70 dark:text-white/70">
            Every OKHub solution documents the problem definition, technology stack, deployment maturity, and measurable impact. Governments, corporates, and NGOs can license the blueprint or co-create custom variants.
          </p>
          <div className="mt-8 rounded-2xl border border-dashed border-black/20 dark:border-white/20 bg-white/40 dark:bg-black/40 p-6 text-black/75 dark:text-white/75">
            <p className="text-sm text-black/70 dark:text-white/70">
              Solution artifacts include: policy memos, technical architectures, talent plans, procurement kits, and KPI dashboards. Deployment teams remain on retainer until adoption metrics are met.
            </p>
          </div>
        </motion.div>
        <div className="grid gap-4">
          {solutionCategories.map((solution) => (
            <motion.div
              key={solution.industry}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-black/15 dark:border-white/10 bg-white/65 dark:bg-black/65 p-6 text-black dark:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                  <solution.icon className="h-5 w-5" />
                </span>
                <p className="text-lg font-semibold">{solution.industry}</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-black/75 dark:text-white/75">
                <p><span className="text-black/65 dark:text-white/50">Problem:</span> {solution.problem}</p>
                <p><span className="text-black/65 dark:text-white/50">Technology:</span> {solution.technology}</p>
                <p><span className="text-black/65 dark:text-white/50">Deployment:</span> {solution.status}</p>
                <p><span className="text-black/65 dark:text-white/50">Impact:</span> {solution.impact}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SolutionCenterSection;
