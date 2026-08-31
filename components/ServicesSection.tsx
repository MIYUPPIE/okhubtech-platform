"use client";

import { motion } from "framer-motion";
import {
  ActivitySquare,
  Brain,
  Bot,
  Globe,
  Layers3,
  LineChart,
  Network,
  Plane,
  ShieldCheck,
  Video,
  Zap,
} from "lucide-react";
import Image from "next/image";

const carouselTopics = [
  "Data Science & Analysis",
  "4IR",
  "AI",
  "Web",
  "App",
  "Robot",
  "CCTV",
  "Drone",
  "Training",
  "Service",
  "Coding",
  "Programming",
  "Building",
  "Simulation",
  "Research",
  "Data",
  "Vision",
  "Digital Twins",
  "Isaac Sim",
  "ROS 2",
  "Cosmos",
];

const innovations = [
  {
    title: "Digital Twin & Isaac Simulation",
    detail: "Virtual replicas that simulate and tune real sites before anyone builds them.",
  },
  {
    title: "ROS 2 & Cosmos Orchestration",
    detail: "Fleets of robots that coordinate on ROS 2.",
  },
  {
    title: "Personalized 3D Printed Nutrition",
    detail: "Printed food matched to local diets.",
  },
  {
    title: "Energy-Generating Wearables",
    detail: "Movement charges the kit you carry.",
  },
  {
    title: "AI-Enhanced Genomic Sequencing",
    detail: "AI-guided genomics, fast enough to matter.",
  },
];

const serviceCatalog = [
  {
    title: "Web Design & Development",
    tagline: "Immersive, high-performance web ecosystems",
    highlights: [
      "Responsive experience systems built for low-bandwidth realities",
      "Enterprise-grade platforms engineered for scalability",
    ],
    icon: Globe,
  },
  {
    title: "Data Analytics & Science",
    tagline: "Make informed decisions from complex signals",
    highlights: [
      "Big data pipelines with realtime dashboards",
      "Advanced science workflows for deep problem solving",
    ],
    icon: LineChart,
  },
  {
    title: "AI & Machine Learning",
    tagline: "Automation, prediction, and optimization",
    highlights: [
      "Custom copilots for ministries and enterprises",
      "Predictive models to steer policy and operations",
    ],
    icon: Brain,
  },
  {
    title: "3D Technologies",
    tagline: "Design, prototyping, and manufacturing",
    highlights: [
      "3D design studios and additive printing labs",
      "Rapid prototyping for health, agri, and mobility",
    ],
    icon: Layers3,
  },
  {
    title: "Robotics & Automation",
    tagline: "Intelligent machines for industry",
    highlights: [
      "Industrial + commercial robotics deployments",
      "IoT innovation for smart, connected systems",
    ],
    icon: Bot,
  },
  {
    title: "Computer Vision & NLP",
    tagline: "Perception + language copilots",
    highlights: [
      "Image/video intelligence for safety and logistics",
      "NLP layers elevating citizen services",
    ],
    icon: Video,
  },
  {
    title: "Drone Technology",
    tagline: "Aerial intelligence + training",
    highlights: [
      "Surveys, inspections, precision agriculture",
      "Certified training for professional pilots",
    ],
    icon: Plane,
  },
  {
    title: "CCTV & Surveillance",
    tagline: "AI-ready monitoring",
    highlights: [
      "Integrated CCTV deployments for complex estates",
      "AI analytics augmenting security operations",
    ],
    icon: Video,
  },
  {
    title: "Renewable Energy",
    tagline: "Sustainable infrastructure",
    highlights: [
      "Solar, wind, and hybrid system architecture",
      "Consulting + integration for grid independence",
    ],
    icon: Zap,
  },
  {
    title: "Cybersecurity",
    tagline: "Secure-by-design posture",
    highlights: [
      "Threat modeling, SOC design, and zero-trust",
      "Resilience testing for national platforms",
    ],
    icon: ShieldCheck,
  },
  {
    title: "Networking",
    tagline: "Reliable connectivity",
    highlights: [
      "Custom networks for campuses + data centers",
      "Secure comms enabling mission-critical work",
    ],
    icon: Network,
  },
  {
    title: "Digital Marketing",
    tagline: "Data-backed storytelling",
    highlights: [
      "SEO, social, and content strategies",
      "Analytics-driven campaign optimization",
    ],
    icon: ActivitySquare,
  },
];

const ServicesSection = () => (
  <section className="section-shell">
    <div className="container-default space-y-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.4em] text-black/65 dark:text-white/50">
            <span className="rounded-full border border-black/15 dark:border-white/10 px-4 py-1">c4c</span>
            <span className="rounded-full border border-black/15 dark:border-white/10 px-4 py-1">Fourth Industrial Revolution</span>
          </div>
          <h2 className="section-title font-display text-black dark:text-white">
            Okhub Technology activates Africa’s 4IR future through services and training.
          </h2>
          <p className="text-lg text-black/75 dark:text-white/75">
            Okhub Technology stands at the vanguard of the Fourth Industrial Revolution, delivering a wide array of services and academies tailored to the needs of modern enterprises, governments, and makers.
          </p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Just as every tribe possesses a unique language, every challenge across the continent speaks its own dialect. We decode that language with bespoke technology, policy insight, and talent enablement.
          </p>
          <div className="flex flex-wrap gap-3">
            {carouselTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-black/15 dark:border-white/10 px-4 py-2 text-sm text-black/70 dark:text-white/70"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="space-y-5 rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <h3 className="text-2xl font-semibold text-black dark:text-white">
            Experience the Future of Technology with Okhub Innovation
          </h3>
          <p className="text-sm text-black/70 dark:text-white/70">
            Dive into AI, robotics, data, and spatial services engineered to unleash creativity, build sovereign capacity, and accelerate industrial leaps for Africa and beyond.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Join Our Research</button>
            <button className="btn-secondary">Documentation</button>
          </div>
        </motion.div>
      </div>

      <div className="relative h-[250px] w-full overflow-hidden rounded-3xl sm:h-[350px] lg:h-[450px]">
        <Image
          src="/media/photos/img-20230629-151725.webp"
          alt="Student-built rover chassis running under green indicator LEDs"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#f7b801]">Robotics</p>
          <p className="mt-2 font-display text-2xl sm:text-4xl">Built, wired and tested here.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {innovations.map((innovation, idx) => (
          <motion.div
            key={innovation.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="rounded-3xl border border-black/15 dark:border-white/10 bg-white/65 dark:bg-black/65 p-6"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-black/60 dark:text-white/40">Research</p>
            <h4 className="mt-3 text-xl font-semibold text-black dark:text-white">{innovation.title}</h4>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">{innovation.detail}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-heading">Services</p>
            <h3 className="text-3xl font-semibold text-black dark:text-white">Comprehensive 4IR services and academies.</h3>
            <p className="mt-2 max-w-2xl text-black/70 dark:text-white/70">
              From AI copilots to renewable energy systems, we architect, train, and deploy the core capabilities modern Africa needs to thrive in the Fourth Industrial Revolution.
            </p>
          </div>
          <a href="/services" className="btn-secondary">Learn More</a>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {serviceCatalog.map((service) => {
            // Map service titles to their corresponding page slugs
            const slugMap = {
              "Web Design & Development": "web-design-development",
              "Data Analytics & Science": "data-analytics-science",
              "AI & Machine Learning": "ai-machine-learning",
              "3D Technologies": "3d-technologies",
              "Robotics & Automation": "robotics-automation",
              "Computer Vision & NLP": "computer-vision-nlp",
              "Drone Technology": "drone-technology",
              "CCTV & Surveillance": "cctv-surveillance",
              "Renewable Energy": "renewable-energy",
              "Cybersecurity": "cybersecurity",
              "Networking": "networking",
              "Digital Marketing": "digital-marketing",
            };
            const href = `/services/${slugMap[service.title as keyof typeof slugMap]}`;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-black/15 dark:border-white/15 p-3" style={{ color: "var(--gold-primary)" }}>
                    <service.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-black dark:text-white">{service.title}</h4>
                    <p className="text-sm text-black/60 dark:text-white/60">{service.tagline}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-black/70 dark:text-white/70">
                  {service.highlights.map((highlight) => (
                    <li key={highlight}>• {highlight}</li>
                  ))}
                </ul>
                <a
                  href={href}
                  className="mt-4 inline-block text-sm font-semibold text-black/80 dark:text-white/80 underline underline-offset-4 hover:text-black dark:text-white"
                >
                  Learn More
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;
