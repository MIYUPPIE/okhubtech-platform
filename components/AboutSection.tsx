"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";

const signals = [
  {
    icon: Globe,
    title: "Pan-African footprint",
    copy: "Studios in Lagos, Kigali, Nairobi, Accra, and partnership pods across 18 nations.",
  },
  {
    icon: ShieldCheck,
    title: "Sovereign-by-design",
    copy: "Data fabrics, AI stacks, and robotics pipelines architected for African regulations.",
  },
  {
    icon: Sparkles,
    title: "Innovation with accountability",
    copy: "We combine policy labs, talent guilds, and deployment sprints to deliver measurable impact.",
  },
  {
    icon: Users,
    title: "Community-first pedagogy",
    copy: "Youth, ministries, investors, and industry operators co-create every pathway we launch.",
  },
];

const statements = [
  {
    heading: "Mission",
    detail:
      "Equip African talent and institutions with the tools, methods, and confidence to deploy 4IR systems at continental scale.",
  },
  {
    heading: "Vision",
    detail:
      "An Africa where every community can train minds, build sovereign products, and export breakthrough solutions to the world.",
  },
  {
    heading: "Why OKHub exists",
    detail:
      "Because Africa cannot afford imported revolutions. We design campuses, academies, commerce engines, and civic-grade infrastructure that reflect local realities while meeting global benchmarks.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * index, duration: 0.4 },
  }),
};

const AboutSection = () => (
  <section className="container-default section-shell" id="about">
    <div className="space-y-4">
      <p className="section-heading">About OKHub</p>

      <div className="relative mb-12 h-[300px] w-full overflow-hidden rounded-3xl sm:h-[400px] lg:h-[500px]">
        <Image
          src="/images/ai_academy_students.png"
          alt="African students and engineers collaborating in a modern AI Academy"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Innovation Hubs</p>
          <p className="mt-2 font-display text-2xl sm:text-4xl">Building Africa's Future, Today.</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 bg-white shadow-md p-8 text-black dark:border-white/10 dark:bg-black/70 dark:text-white shadow-lg dark:shadow-none"
        >
          <h2 className="section-title leading-tight">
            We merge policy intelligence, engineering rigor, and culture-powered storytelling to build Africa’s flagship 4IR ecosystems.
          </h2>
          <p className="mt-6 text-black/70 dark:text-white/70">
            From government-backed command campuses to community studios in underserved regions, OKHub Technology operationalizes the Fourth Industrial Revolution with accountable governance, modern pedagogy, and responsible capital.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {statements.map((statement) => (
              <div key={statement.heading} className="rounded-2xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{statement.heading}</p>
                <p className="mt-3 text-sm text-black/80 dark:text-white/80">{statement.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="grid gap-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={index}
              className="flex items-start gap-4 rounded-2xl border border-black/15 bg-white shadow-sm dark:border-white/10 dark:bg-black/60 p-5 shadow-sm dark:shadow-none"
            >
              <span className="rounded-2xl border border-black/15 p-3 text-black/80 dark:border-white/15 dark:text-white/80">
                <signal.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-black dark:text-white">{signal.title}</p>
                <p className="text-sm text-black/65 dark:text-white/65">{signal.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
