"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Scene3DAdvanced from "@/components/Scene3DAdvanced";
import Spotlight from "@/components/ui/Spotlight";
import TextGenerateEffect from "@/components/ui/TextGenerateEffect";

const stats = [
  { label: "African nations activated", value: "18" },
  { label: "Engineers certified", value: "4.8K" },
  { label: "Smart campuses deployed", value: "26" },
];

const logos = ["GAMBLEALERT", "ULTIMA RESTAURANT", "ESTATEBLOC", "AZDAM HOMES", "SOILLIGHT"];

const heroPillars = [
  {
    title: "Pan-African AI academies",
    detail: "Immersive learning tracks, bilingual curriculum, and accredited talent pipelines.",
  },
  {
    title: "Robotics & Cosmos infrastructure",
    detail: "Ports, energy, and digital twin ecosystems powered by ROS 2 and NVIDIA Isaac Simulation.",
  },
  {
    title: "Immersive policy studios",
    detail: "XR governance war rooms aligning regulators, investors, and operators.",
  },
];

const journeySteps = [
  { title: "Vision alignment", meta: "2 weeks", detail: "Presidential + ministerial clinics defining 4IR mandates" },
  { title: "Talent ignition", meta: "8 weeks", detail: "Bootcamps and fellowships co-led with African universities" },
  { title: "Nationwide deployment", meta: "120 days", detail: "Smart campus rollout, robotics labs, and KPI command boards" },
];

const HeroSection = () => (
  <section className="relative w-full overflow-hidden rounded-[32px] border border-black/15 bg-white/80 dark:border-white/10 dark:bg-black/80 px-5 py-12 sm:px-8 lg:px-12">
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <Scene3DAdvanced />
    </div>
    <Spotlight className="left-[-60px] top-0" />
    <Spotlight className="right-[-160px] top-1/2" size={520} color="rgba(255,215,0,0.32)" />
    <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-14">
      <div className="flex flex-1 flex-col gap-7">
        <div className="flex flex-wrap gap-3 text-[0.55rem] uppercase tracking-[0.4em] text-black/70 dark:text-white/55 sm:text-[0.65rem]">
          <span className="rounded-full border border-black/15 dark:border-white/15 px-4 py-1">4IR Africa</span>
          <span className="rounded-full border border-black/15 dark:border-white/15 px-4 py-1">Skills + Autonomy</span>
        </div>
        <TextGenerateEffect
          text="Training Minds. Building Solutions. Powering Africa’s Future."
          className="text-[2.4rem] leading-[1.1] text-[#050505] dark:text-white sm:text-[3rem] lg:text-[3.6rem]"
        />
        <p className="max-w-2xl text-base text-black/75 dark:text-white/75 sm:text-lg">
          OKHub Technology partners with African governments, banks, and telcos to build sovereign data fabrics, robotics corridors, and elite training programs that unlock continental competitiveness.
        </p>
        <p className="max-w-2xl text-sm text-black/60 dark:text-white/60 sm:text-base">
          We blend executive advisory with hands-on academies so ministries, enterprises, and youth talent co-create resilient 4IR ecosystems built for African realities.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/programs" className="btn-primary min-w-[190px] text-center">
            Explore Programs
          </Link>
          <Link href="/partners" className="btn-secondary min-w-[190px] text-center">
            Partner With Us
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-black/15 bg-white shadow-md dark:border-white/15 dark:bg-black/75 p-6 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Impact metrics</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="kpi-card">
                  <p className="kpi-value">{stat.value}</p>
                  <p className="kpi-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/15 dark:bg-black/65 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-black/60 dark:text-white/40">What we orchestrate</p>
            <div className="grid gap-3 sm:grid-cols-1">
              {heroPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-black/15 dark:border-white/5 px-4 py-3">
                  <p className="font-semibold text-black dark:text-white">{pillar.title}</p>
                  <p className="text-xs text-black/65 dark:text-white/65">{pillar.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <motion.div
        className="glass-panel relative flex w-full flex-col gap-8 p-8 sm:p-10 xl:w-[420px]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-56 w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/hero_real_tech.png"
            alt="Advanced robotic arm and drone technology in a modern African tech laboratory"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="space-y-4">
          <span className="rounded-full border border-black/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-black/60 dark:border-white/15 dark:text-white/60">
            Active program
          </span>
          <h3 className="text-2xl font-semibold text-black dark:text-white">Continental 4IR Command Campus</h3>
          <p className="text-sm text-black/70 dark:text-white/70">
            Multi-city hub fusing ROS 2 orchestration, NVIDIA Isaac Simulation hangars, and immersive Digital Twin classrooms to train 2,000 engineers on the Cosmos network for critical African infrastructure.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Engagement journey</p>
          <ol className="space-y-4">
            {journeySteps.map((step) => (
              <li key={step.title} className="rounded-2xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-4 text-sm text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-2 text-black dark:text-white">
                  <p className="font-semibold">{step.title}</p>
                  <span className="text-xs uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{step.meta}</span>
                </div>
                <p className="mt-2 text-black/70 dark:text-white/70">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Trusted by category leaders</p>
          <div className="mt-6 overflow-hidden">
            <div className="marquee-track flex gap-10 whitespace-nowrap text-lg font-medium text-black/70 dark:text-white/70">
              {[...logos, ...logos].map((name, index) => (
                <span key={`${name}-${index}`} className="opacity-80">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
