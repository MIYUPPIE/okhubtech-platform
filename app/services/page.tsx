import Link from "next/link";
import { Globe, LineChart, Brain, Layers3, Bot, Video, Plane, Zap, ShieldCheck, Network, ActivitySquare } from "lucide-react";

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
      <h1 className="text-4xl font-bold mb-8 text-white">Our Services</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.title}
            href={service.href}
            className="rounded-2xl border border-white/10 bg-black/70 p-6 flex flex-col gap-3 hover:border-gold-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <service.icon className="h-7 w-7" style={{ color: "var(--gold-primary)" }} />
              <h2 className="text-xl font-semibold text-white">{service.title}</h2>
            </div>
            <p className="text-white/70">{service.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
