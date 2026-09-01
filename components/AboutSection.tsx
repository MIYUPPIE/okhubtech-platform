"use client";

import { motion } from "framer-motion";
import { Globe, ShieldCheck, Sparkles, Users } from "lucide-react";
import Image from "next/image";

const signals = [
  {
    icon: Globe,
    title: "Built in Nigeria",
    copy: "Every product in the catalogue solves a Nigerian problem, for Nigerian conditions.",
  },
  {
    icon: ShieldCheck,
    title: "Built for local rules",
    copy: "Software and hardware built to the regulations that actually apply, not retrofitted to them.",
  },
  {
    icon: Sparkles,
    title: "Teach it, build it, ship it",
    copy: "The same engineers who train a cohort ship the client work.",
  },
  {
    icon: Users,
    title: "Community-first pedagogy",
    copy: "Students, schools and industry, in the same room.",
  },
];

const statements = [
  {
    heading: "Mission",
    detail:
      "Give people the tools and the confidence to build.",
  },
  {
    heading: "Vision",
    detail:
      "Communities that build their own technology.",
  },
  {
    heading: "Why OKHub exists",
    detail:
      "Imported solutions do not survive local conditions. We build for the conditions we have.",
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
          src="/media/video/students-actuator-class-poster.webp"
          alt="Students building an actuator circuit during a practical robotics class"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">In the room</p>
          <p className="mt-2 font-display text-2xl sm:text-4xl">Building Africa&rsquo;s Future, Today.</p>
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
            We teach the skills, then build with them.
          </h2>
          <p className="mt-6 text-black/70 dark:text-white/70">
            OKHub Technology trains people and builds systems, out of the same
            building in Ibadan. The work spans commerce, health, agriculture,
            civic tech and more. Robotics is one part of it, not the whole of
            it. Trainees work on real problems, not exercises invented for a
            classroom.
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
