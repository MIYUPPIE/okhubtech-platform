"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Bot,
  Cloud,
  Eye,
  Fingerprint,
  Network,
  Shield,
  Workflow,
} from "lucide-react";

const domains = [
  {
    title: "Artificial Intelligence",
    icon: BrainCircuit,
    focus: "Models and copilots you can audit.",
  },
  {
    title: "Robotics",
    icon: Bot,
    focus: "Robots for ports, energy, farms and factories.",
  },
  {
    title: "Internet of Things",
    icon: Network,
    focus: "Sensor networks and edge gateways.",
  },
  {
    title: "Data & Analytics",
    icon: Workflow,
    focus: "Data lakes, governance, dashboards.",
  },
  {
    title: "Cloud Infrastructure",
    icon: Cloud,
    focus: "Hybrid cloud that survives local uptime.",
  },
  {
    title: "Cybersecurity",
    icon: Shield,
    focus: "Zero-trust policy and readiness drills.",
  },
  {
    title: "Blockchain",
    icon: Fingerprint,
    focus: "Identity, traceability, transparency.",
  },
  {
    title: "AR / VR",
    icon: Eye,
    focus: "Training and storytelling that lands.",
  },
];

const DomainsSection = () => (
  <section className="container-default section-shell" id="domains">
    <div className="space-y-4">
      <p className="section-heading">4IR Domains</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
      >
        <h2 className="section-title text-black dark:text-white">Nine domains, one integrated operating system for Africa’s future.</h2>
        <p className="mt-4 text-black/70 dark:text-white/70">
          Our domain guilds work in synchronized squads so strategy, engineering, and capacity-building stay aligned. Every deployment includes documentation, governance playbooks, and talent pathways.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain, index) => (
            <motion.div
              key={domain.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-2xl border border-black/15 dark:border-white/15 p-3 text-black/80 dark:text-white/80">
                  <domain.icon className="h-5 w-5" />
                </span>
                <p className="font-semibold text-black dark:text-white">{domain.title}</p>
              </div>
              <p className="mt-3 text-sm text-black/70 dark:text-white/70">{domain.focus}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default DomainsSection;
