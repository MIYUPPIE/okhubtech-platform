import type { Metadata } from "next";
import Link from "next/link";

import DomainsSection from "@/components/DomainsSection";
import { pageMetadata } from "@/lib/seo";
import SolutionCenterSection from "@/components/SolutionCenterSection";
import ECommerceSection from "@/components/ECommerceSection";
import { Globe, LineChart, Brain, Layers3, Bot, Video, Plane, Zap, ShieldCheck, Network, ActivitySquare } from "lucide-react";

export const metadata: Metadata = pageMetadata({
  path: "/services",
  title: "Services",
  description:
    "Twelve practices: web, AI, data, robotics, computer vision, drones, CCTV, renewable energy, cybersecurity, networking and digital marketing, plus the domains and commerce systems built on top of them.",
  ogSlug: "services",
  ogAlt: "OKHub services",
});

const services = [
  {
    title: "Web Design & Development",
    description: "Immersive, high-performance web ecosystems.",
    href: "/services/web-design-development",
    icon: Globe,
  },
  {
    title: "Data Analytics & Science",
    description: "Make informed decisions from complex signals.",
    href: "/services/data-analytics-science",
    icon: LineChart,
  },
  {
    title: "AI & Machine Learning",
    description: "Automation, prediction, and optimization.",
    href: "/services/ai-machine-learning",
    icon: Brain,
  },
  {
    title: "3D Technologies",
    description: "Design, prototyping, and manufacturing.",
    href: "/services/3d-technologies",
    icon: Layers3,
  },
  {
    title: "Robotics & Automation",
    description: "Intelligent machines for industry.",
    href: "/services/robotics-automation",
    icon: Bot,
  },
  {
    title: "Computer Vision & NLP",
    description: "Perception + language copilots.",
    href: "/services/computer-vision-nlp",
    icon: Video,
  },
  {
    title: "Drone Technology",
    description: "Aerial intelligence + training.",
    href: "/services/drone-technology",
    icon: Plane,
  },
  {
    title: "CCTV & Surveillance",
    description: "AI-ready monitoring.",
    href: "/services/cctv-surveillance",
    icon: Video,
  },
  {
    title: "Renewable Energy",
    description: "Sustainable infrastructure.",
    href: "/services/renewable-energy",
    icon: Zap,
  },
  {
    title: "Cybersecurity",
    description: "Secure-by-design posture.",
    href: "/services/cybersecurity",
    icon: ShieldCheck,
  },
  {
    title: "Networking",
    description: "Reliable connectivity.",
    href: "/services/networking",
    icon: Network,
  },
  {
    title: "Digital Marketing",
    description: "Data-backed storytelling.",
    href: "/services/digital-marketing",
    icon: ActivitySquare,
  },
];

export default function ServicesPage() {
  return (
    <main className="container-default py-12">
      <h1 className="mb-8 font-display text-4xl font-bold text-black dark:text-white">What we do</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.title}
            href={service.href}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-colors hover:border-black/30 dark:border-white/10 dark:bg-black/70 dark:hover:border-white/40"
          >
            <div className="flex items-center gap-3 mb-2">
              <service.icon className="h-7 w-7" style={{ color: "var(--gold-ink)" }} />
              <h2 className="text-xl font-semibold text-black dark:text-white">{service.title}</h2>
            </div>
            <p className="text-black/70 dark:text-white/70">{service.description}</p>
          </Link>
        ))}
      </div>

      {/* Moved off the homepage: someone on /services has already asked for
          the capability detail, so it belongs here rather than in front of
          every first-time visitor. */}
      <DomainsSection />
      <SolutionCenterSection />
      <ECommerceSection />
    </main>
  );
}
