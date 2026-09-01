import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactSection from "@/components/ContactSection";
import AboutSection from "@/components/AboutSection";
import { BANK, EMAIL, FACEBOOK, INSTAGRAM, LOCATION, LOCATION_SHORT, MAILTO, PHONE_DISPLAY, TEL, whatsappLink } from "@/lib/contact";
import { PRODUCTS } from "@/lib/products";
import { BOOTCAMP_PROJECTS } from "@/lib/bootcamp";
import { ROBOTICS_GUIDE, fileSize } from "@/lib/media";

const accentFallback = "from-[var(--gold-primary)] via-[#ff8a1f] to-[#ffd166]";

type Highlight = {
  label: string;
  value: string;
  caption: string;
};

type Section = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

type Spotlight = {
  title: string;
  description: string;
  items: { title: string; detail: string }[];
};

type CaseStudy = {
  title: string;
  sector: string;
  impact: string;
  summary: string;
};

type Resource = {
  label: string;
  href: string;
  external?: boolean;
};

type ContactBlock = {
  title: string;
  detail: string;
  meta: string;
  /** Makes the block actionable. mailto:, tel: and https: are all fine. */
  href?: string;
  external?: boolean;
};

type PageContent = {
  badge: string;
  title: string;
  description: string;
  accent?: string;
  highlights: Highlight[];
  sections: Section[];
  spotlight?: Spotlight;
  caseStudies?: CaseStudy[];
  resources?: Resource[];
  contactBlocks?: ContactBlock[];
  cta?: { label: string; href: string };
};

const pageContent: Record<string, PageContent> = {
  about: {
    badge: "About OKHub",
    title: "AI, robotics and data systems — built and taught in Ibadan.",
    description:
      "OKHub Technology is a training and engineering studio. We teach the skills in the same rooms where we ship the work, so a lesson is never far from a real deploy.",
    accent: "from-[var(--gold-primary)] via-[#f97316] to-[#ffcd5a]",
    highlights: [
      {
        label: "Products shipped",
        value: String(PRODUCTS.length),
        caption: "Live software across commerce, agriculture, health, language and civic tech — see them at /products.",
      },
      {
        label: "Bootcamp builds",
        value: String(BOOTCAMP_PROJECTS.length),
        caption: "Robots and systems the current 4IR Bootcamp cohort is building right now.",
      },
      {
        label: "Where we are",
        value: LOCATION_SHORT,
        caption: LOCATION,
      },
    ],
    sections: [
      {
        eyebrow: "What we do",
        title: "Two things, in the same building",
        description:
          "We train people in AI, robotics and software, and we build systems for people who need them. Neither is the marketing arm of the other — the same engineers do both.",
        bullets: [
          "Cohort training that ships a real, working build before it certifies.",
          "Client and product work across commerce, agriculture, health, language and civic tech.",
          "Trainees work on real client problems, not simulated ones.",
        ],
      },
      {
        eyebrow: "How we build",
        title: "For the constraints that are actually there",
        description:
          "Most of the places this software runs do not have the reliable power, bandwidth or budget that a lot of tooling assumes. We design for the network and hardware people actually have, not the ones we wish they had.",
        bullets: [
          "Offline-first where a connection cannot be guaranteed — data syncs when it returns.",
          "Edge inference over cloud dependency, where the hardware allows it.",
          "WhatsApp and SMS as first-class interfaces, because that is where the users already are.",
        ],
      },
    ],
    resources: [
      {
        label: `A Beginner's Guide to Autonomous Robots — PDF, ${fileSize(ROBOTICS_GUIDE.bytes)}`,
        href: ROBOTICS_GUIDE.src,
        external: true,
      },
      { label: "See the current bootcamp cohort", href: "/bootcamp" },
      { label: "See the hardware and research work", href: "/portfolio" },
    ],
    cta: { label: "See the products", href: "/products" },
  },
  services: {
    badge: "Offerings",
    title: "Advisory, build, and managed services for bold African transformations.",
    description:
      "From blueprint to deployment, we help governments, enterprises, and ecosystem builders design resilient 4IR programs that deliver measurable returns.",
    accent: "from-[#ff6f61] via-[#ffb347] to-[#ffd700]",
    highlights: [
      {
        label: "Advisory Playbooks",
        value: "30+",
        caption: "Sector-specific compasses for energy, health, mobility, fintech, and creative economies.",
      },
      {
        label: "Delivery Studios",
        value: "8",
        caption: "Cross-border teams pairing strategists, engineers, creatives, and growth operators.",
      },
      {
        label: "Support Cycles",
        value: "18 weeks",
        caption: "Average time from discovery to operational pilot in market.",
      },
    ],
    sections: [
      {
        eyebrow: "Strategy",
        title: "Boardroom-to-ground advisory",
        description:
          "We translate national digital economy goals into pragmatic roadmaps while structuring financing, partnerships, and procurement vehicles.",
        bullets: [
          "4IR readiness audits layered with climate, gender, and youth lenses.",
          "Policy sandboxes and regulatory architecture to unlock frontier sectors.",
          "Capital stack design including sovereign funds, DFIs, and venture vehicles.",
        ],
      },
      {
        eyebrow: "Delivery",
        title: "Integrated build partners",
        description:
          "Product, data, and engineering teams stay embedded through co-design, prototyping, deployment, and capability transfer.",
        bullets: [
          "Experience labs, digital twins, and immersive simulations to de-risk execution.",
          "Interoperable architectures built on modern DevOps, security, and observability standards.",
          "Capacity building programs and workforce academies to sustain operations locally.",
        ],
      },
      {
        eyebrow: "Managed Services",
        title: "Run + evolve",
        description:
          "OKHub maintains uptime SLAs, delivers continuous optimization, and plugs in specialist squads for advanced analytics, AI, or commercialization.",
        bullets: [
          "Command centers with live impact telemetry.",
          "24/7 support pods covering product, infra, and citizen engagement.",
          "Venture commercialization, licensing, and export pathways.",
        ],
      },
    ],
    spotlight: {
      title: "Engagement flow",
      description: "A transparent pipeline keeps every stakeholder aligned from intake to scale.",
      items: [
        { title: "Discovery", detail: "Immersive fieldwork, ethnography, and data digestion." },
        { title: "Design", detail: "Experience mapping, architecture decisions, and investment gating." },
        { title: "Build", detail: "Agile delivery, QA automation, and site-readiness orchestration." },
        { title: "Transfer", detail: "Capability academies, documentation, and runbooks for local teams." },
      ],
    },
    resources: [
      { label: "Download service catalog", href: "/contact" },
      { label: "Request executive briefing", href: "/contact" },
    ],
    cta: { label: "Book a strategy call", href: "/contact" },
  },
  portfolio: {
    badge: "Case Studies",
    title: "Flagship programs proving Africa's 4IR advantage.",
    description:
      "Our portfolio spans sovereign infrastructure, cultural economies, and industrial transformation initiatives already live across the continent.",
    highlights: [
      {
        label: "Flagship Deployments",
        value: "26",
        caption: "From digital public infrastructure to carbon-negative industrial corridors.",
      },
      {
        label: "Capital Mobilized",
        value: "$420M",
        caption: "Blended finance spanning sovereign, catalytic, and private vehicles.",
      },
      {
        label: "Communities Impacted",
        value: "2.1M",
        caption: "Entrepreneurs, civil servants, students, and creative workers.",
      },
    ],
    sections: [
      {
        eyebrow: "Proof points",
        title: "From prototype to continental scale",
        description:
          "We build for radical practicality—programs only graduate when they show economic uplift and resilience across multiple states.",
        bullets: [
          "Climate-positive manufacturing corridors spanning West and East Africa.",
          "Creative economy pipelines exporting African IP globally.",
          "GovTech stacks digitizing permitting, licensing, and civic participation.",
        ],
      },
      {
        eyebrow: "How we measure",
        title: "Impact telemetry",
        description:
          "Our admin dashboard tracks financial, social, and environmental indicators per program, enabling radical accountability.",
        bullets: [
          "Impact-weighted scorecards tied to SDGs and Agenda 2063.",
          "Net-new job creation, inclusion, and gender metrics per cohort.",
          "Open data rooms for investors and regulators.",
        ],
      },
    ],
    caseStudies: [
      {
        title: "Infinite Rail",
        sector: "Logistics + Mobility",
        impact: "32% reduction in inland freight timelines",
        summary:
          "A rail automation initiative built with West African transport authorities, featuring predictive maintenance, smart ports, and customs integrations.",
      },
      {
        title: "Nile BioCities",
        sector: "Green Manufacturing",
        impact: "150MW renewable micro-grids over five sites",
        summary:
          "Circular manufacturing zones activating biotech, agro-processing, and climate innovation with blended finance.",
      },
      {
        title: "Afroverse Campus",
        sector: "Creative Economy",
        impact: "65 creative ventures accelerated, 40% led by women",
        summary:
          "Immersive media studio, digital fashion lab, and Web3 licensing stack powering cultural exports.",
      },
    ],
    cta: { label: "Discuss a pilot", href: "/contact" },
  },
  contact: {
    badge: "Contact",
    title: "Tell us what you want to build, or learn.",
    description:
      "One inbox, one number, one team. Whether it is a cohort place, a system you need built, or a programme you want to back, it all comes to the same place and a person reads it.",
    accent: "from-[#00c6ff] via-[#0072ff] to-[var(--gold-primary)]",
    highlights: [
      { label: "Call or WhatsApp", value: PHONE_DISPLAY, caption: "Same number for both." },
      { label: "Email", value: EMAIL, caption: "Reaches the whole team, not a queue." },
      { label: "Find us", value: "Ibadan", caption: LOCATION },
    ],
    sections: [
      {
        eyebrow: "What we take on",
        title: "Three kinds of conversation",
        description:
          "The form below routes on which of these you pick. Say which one you are in the first line and we can skip a round of questions.",
        bullets: [
          "Training: cohort places, team upskilling, school and campus programmes.",
          "Build: AI, robotics, web, data and networking work, from prototype to deployed system.",
          "Support: funding or sponsoring scholarships, labs and community builds.",
        ],
      },
      {
        eyebrow: "Before you write",
        title: "What helps us reply properly",
        description:
          "A short brief beats a long one. These four lines are usually enough for us to come back with something concrete rather than a request for more detail.",
        bullets: [
          "What you are trying to build or learn, in plain terms.",
          "When you need it by, and whether a budget is already set.",
          "Who else is involved: team, school, vendor, funder.",
          "Anything already built or bought that we should work around.",
        ],
      },
    ],
    contactBlocks: [
      { title: "Email", detail: EMAIL, meta: "Training, projects, partnerships. All of it.", href: MAILTO },
      { title: "Call", detail: PHONE_DISPLAY, meta: "Speak to someone directly.", href: TEL },
      {
        title: "WhatsApp",
        detail: PHONE_DISPLAY,
        meta: "Fastest route for a quick question.",
        href: whatsappLink("Hi OKHub, I would like to talk about "),
        external: true,
      },
      { title: "Visit", detail: "Ibadan", meta: LOCATION },
      {
        title: "Instagram",
        detail: "@okhubtech",
        meta: "Build videos and cohort work as it happens.",
        href: INSTAGRAM,
        external: true,
      },
      {
        title: "Facebook",
        detail: "@okhubtech",
        meta: "Announcements, intakes and events.",
        href: FACEBOOK,
        external: true,
      },
      {
        title: "Bank transfer",
        detail: `${BANK.accountNumber} · ${BANK.name}`,
        meta: `Account name: ${BANK.accountName}. For course fees and invoices. Send the receipt to ${EMAIL}.`,
      },
    ],
    resources: [
      { label: "See what we do", href: "/services" },
      { label: "Recent work", href: "/portfolio" },
    ],
    cta: { label: `Email ${EMAIL}`, href: MAILTO },
  },
  ai: {
    badge: "AI & ML Studio",
    title: "From policy-aligned AI roadmaps to sovereign LLM deployment.",
    description:
      "We craft localized models, evaluation harnesses, and operating standards that respect African data residency, language diversity, and cultural nuance.",
    accent: "from-[#7f00ff] via-[#e100ff] to-[#ff8c37]",
    highlights: [
      { label: "Custom LLMs", value: "9", caption: "Arabic, Hausa, Kiswahili, Amharic, Yoruba, and French corpora." },
      { label: "Edge Sites", value: "42", caption: "AI workloads tuned for hospitals, ports, and mini-grid deployments." },
      { label: "Responsible AI", value: "100%", caption: "Scorecards covering governance, bias, and audit readiness." },
    ],
    sections: [
      {
        eyebrow: "Strategy",
        title: "AI readiness sprints",
        description:
          "Policy, data, and infra assessments feed a prioritized backlog spanning copilots, automation, and citizen-facing services.",
        bullets: [
          "AI governance charters aligned with continental data policies.",
          "Capability academies for executives, product teams, and regulators.",
          "Vendor and open-source stack assessments with TCO modeling.",
        ],
      },
      {
        eyebrow: "Build",
        title: "Model engineering",
        description:
          "Our ML engineers fine-tune foundation models, build retrieval pipelines, and wire evaluation harnesses for mission-critical use cases.",
        bullets: [
          "Domain-adapted LLMs with Guardrails + policy enforcement.",
          "Speech, vision, and geospatial models for defense, agri, and health.",
          "Automated evaluation labs with red-teaming and audit trails.",
        ],
      },
      {
        eyebrow: "Operate",
        title: "MLOps & assurance",
        description:
          "We deploy observability, drift detection, and continuous training loops while keeping data sovereign and secure.",
        bullets: [
          "Hybrid cloud, sovereign cloud, and offline-capable options.",
          "Operational playbooks for regulators and compliance officers.",
          "Cyber, privacy, and ethics review boards chaired by OKHub.",
        ],
      },
    ],
    spotlight: {
      title: "Delivery accelerators",
      description: "Reusable assets cut launch timelines by half.",
      items: [
        { title: "ModelOps control plane", detail: "Opinionated pipelines for training, evaluation, and approvals." },
        { title: "Multilingual data engine", detail: "Curated corpora across dialects, sectors, and civic datasets." },
        { title: "AI assurance toolkit", detail: "Bias, fairness, privacy, and safety test suites." },
        { title: "Edge deployment kits", detail: "Ruggedized hardware + offline orchestration." },
      ],
    },
    resources: [
      { label: "AI readiness checklist", href: "/contact" },
      { label: "Book an AI deep-dive", href: "/contact" },
    ],
    cta: { label: "Engage AI architects", href: "/contact" },
  },
  web: {
    badge: "Web Engineering",
    title: "Luxury-grade digital products with African aesthetics and reliability.",
    description:
      "We craft omni-channel experiences, commerce ecosystems, and digital public services that feel cinematic, performant, and trustworthy.",
    accent: "from-[#1d976c] via-[#93f9b9] to-[var(--gold-primary)]",
    highlights: [
      { label: "Experience Blueprints", value: "50+", caption: "User journeys crafted for citizen, enterprise, and culture brands." },
      { label: "Performance", value: "<1s", caption: "Median load time across core experiences on 3G networks." },
      { label: "Accessibility", value: "AA+", caption: "Inclusive standards across language, ability, and connectivity." },
    ],
    sections: [
      {
        eyebrow: "Product Vision",
        title: "Narratives, systems, and craft",
        description:
          "Strategy partners translate brand purpose or public mandate into modular design languages, content systems, and experimentation roadmaps.",
        bullets: [
          "Design research across multiple cities and diasporas.",
          "Component libraries with localization, dark mode, and offline states.",
          "Content ops with storytelling, editorial governance, and immersive media.",
        ],
      },
      {
        eyebrow: "Engineering",
        title: "Full-stack delivery",
        description:
          "We build with Next.js, edge networks, headless CMS, and composable commerce while integrating legacy or sovereign systems.",
        bullets: [
          "Streaming, personalization, and AI-assisted customer journeys.",
          "DevSecOps, automated testing, and observability baked in.",
          "VR/AR extensions, voice interfaces, and immersive retail.",
        ],
      },
      {
        eyebrow: "Growth",
        title: "Lifecycle operations",
        description:
          "Cross-functional pods manage experimentation, SEO, performance marketing, and community activation.",
        bullets: [
          "Experimentation pipelines with analytics and CRM integration.",
          "Commerce ops: payments, logistics, local compliance.",
          "Playbooks for ambassadors, creators, and loyalty ecosystems.",
        ],
      },
    ],
    resources: [
      { label: "View flagship builds", href: "/portfolio" },
      { label: "Brief the studio", href: "/contact" },
    ],
    cta: { label: "Launch a digital flagship", href: "/contact" },
  },
  robotics: {
    badge: "Robotics & Intelligent Hardware",
    title: "Automation built for African terrain, industries, and civic needs.",
    description:
      "From agritech to defense, we prototype, test, and deploy rugged hardware integrated with AI, IoT, and cloud orchestration.",
    accent: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    highlights: [
      { label: "Field Pilots", value: "68", caption: "Across agriculture, mining, healthcare, and mobility." },
      {
        label: "Manufacturing Partners",
        value: "22",
        caption: "Local fabs, OEM alliances, and rapid prototyping labs.",
      },
      { label: "Autonomy Stack", value: "Level 4", caption: "Mission planning, sensor fusion, and control systems." },
    ],
    sections: [
      {
        eyebrow: "Discovery",
        title: "Terrain-aware research",
        description:
          "We co-create with field operators to understand payload, power, and connectivity constraints before a single chassis is welded.",
        bullets: [
          "On-site diagnostics across farms, factories, and ports.",
          "Safety, compliance, and export-readiness reviews.",
          "Supply chain modeling for components and servicing.",
        ],
      },
      {
        eyebrow: "Engineering",
        title: "Robotics stack",
        description:
          "Electrical, mechanical, and software teams iterate on digital twins before fabricating modular hardware ready for harsh environments.",
        bullets: [
          "Navigation, perception, and manipulation systems tuned to local conditions.",
          "Interchangeable payloads for inspection, delivery, and manufacturing.",
          "Secure command centers with live teleoperation capabilities.",
        ],
      },
      {
        eyebrow: "Commercialization",
        title: "Scale and sustain",
        description:
          "We secure certifications, structure service models, and train technicians through OKHub academies and partner universities.",
        bullets: [
          "Financing models including leasing, PPPs, and revenue share.",
          "Field maintenance networks and spare-part logistics.",
          "Export playbooks for other emerging markets.",
        ],
      },
    ],
    spotlight: {
      title: "Reference deployments",
      description: "Sample missions currently in production.",
      items: [
        { title: "Agro Swarm", detail: "Autonomous planters, soil analytics, and drone scouting for climate-smart farms." },
        { title: "Sentry Grid", detail: "Border security and emergency response rovers with mesh comms." },
        { title: "MedExpress", detail: "Cold-chain delivery bots servicing peri-urban clinics." },
        { title: "Atlas Mine", detail: "Inspection and haulage robotics operating 24/7 in subterranean environments." },
      ],
    },
    resources: [
      { label: "Download hardware spec", href: "/contact" },
      { label: "Tour the mechatronics lab", href: "/contact" },
    ],
    cta: { label: "Prototype with OKHub", href: "/contact" },
  },
};

type PageKey = keyof typeof pageContent;

type PageParams = {
  params: Promise<{
    page: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(pageContent) as PageKey[]).map((page) => ({ page }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const resolvedParams = await params;
  const config = pageContent[resolvedParams.page as PageKey];
  if (!config) {
    return {};
  }

  return {
    title: `${config.title} | OKHub`,
    description: config.description,
  };
}

const MarketingPage = async ({ params }: PageParams) => {
  const resolvedParams = await params;
  const config = pageContent[resolvedParams.page as PageKey];

  if (!config) {
    notFound();
  }

  return (
    <main className="space-y-16 pb-24 pt-12">
      <section className="container-default section-shell space-y-6">
        {/*
          The accent ramp ranges from #ffd700 (light) to #0f2027 (near-black on
          robotics), so no single text colour reads on all six. A solid fill
          would need to special-case each one and break again the next time an
          accent is added. Putting the gradient on a 1px ring instead — with the
          text on a fixed white/black pill inside it — keeps the per-page colour
          identity while the text sits on a background this file already knows
          is legible in both themes.
        */}
        <span className={`inline-flex w-fit rounded-full bg-gradient-to-r p-px ${config.accent ?? accentFallback}`}>
          <span className="rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-black dark:bg-black dark:text-white">
            {config.badge}
          </span>
        </span>
        <h1 className="max-w-4xl font-display text-4xl leading-tight text-black dark:text-white md:text-5xl">
          {config.title}
        </h1>
        <p className="max-w-3xl text-lg text-black/70 dark:text-white/70">{config.description}</p>
        {config.cta && (
          <Link href={config.cta.href} className="btn-primary w-fit">
            {config.cta.label}
          </Link>
        )}
      </section>

      <section className="container-default">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.highlights.map((highlight) => (
            <div key={highlight.label} className="rounded-3xl border border-black/10 bg-white px-6 py-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">{highlight.label}</p>
              <p className="mt-3 font-display text-3xl text-black dark:text-white">{highlight.value}</p>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">{highlight.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-default space-y-10">
        {config.sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">{section.eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl text-black dark:text-white">{section.title}</h2>
            <p className="mt-3 text-black/70 dark:text-white/70">{section.description}</p>
            <ul className="mt-4 space-y-2 text-black/80 dark:text-white/80">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--gold-primary)]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {config.spotlight && (
        <section className="container-default">
          <div className="grid gap-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-transparent dark:bg-gradient-to-br dark:from-white/10 dark:via-white/5 dark:to-transparent dark:shadow-none lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Spotlight</p>
              <h3 className="mt-3 font-display text-3xl text-black dark:text-white">{config.spotlight.title}</h3>
              <p className="mt-3 text-black/70 dark:text-white/70">{config.spotlight.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {config.spotlight.items.map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/10 bg-black/[0.04] p-4 dark:border-white/10 dark:bg-black/40">
                  <p className="text-sm uppercase tracking-[0.2em] text-black/50 dark:text-white/50">{item.title}</p>
                  <p className="mt-2 text-black/80 dark:text-white/80">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {config.caseStudies && (
        <section className="container-default space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Case Studies</p>
            <h3 className="mt-2 font-display text-3xl text-black dark:text-white">Outcomes across sectors</h3>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {config.caseStudies.map((study) => (
              <div key={study.title} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <p className="text-sm uppercase tracking-[0.3em] text-black/50 dark:text-white/50">{study.sector}</p>
                <h4 className="mt-3 font-display text-2xl text-black dark:text-white">{study.title}</h4>
                <p className="mt-2 text-sm text-gold-ink">{study.impact}</p>
                <p className="mt-3 text-black/70 dark:text-white/70">{study.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {config.resources && (
        <section className="container-default space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Resources</p>
          <div className="flex flex-wrap gap-3">
            {config.resources.map((resource) => (
              resource.external ? (
                <a
                  key={resource.label}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black hover:border-black/40 dark:border-white/10 dark:text-white dark:hover:border-white/40"
                >
                  {resource.label}
                </a>
              ) : (
                <Link
                  key={resource.label}
                  href={resource.href}
                  className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-black hover:border-black/40 dark:border-white/10 dark:text-white dark:hover:border-white/40"
                >
                  {resource.label}
                </Link>
              )
            ))}
          </div>
        </section>
      )}

      {config.contactBlocks && (
        <section className="container-default space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Direct channels</p>
          <div className="grid gap-4 md:grid-cols-2">
            {config.contactBlocks.map((block) => {
              const body = (
                <>
                  <p className="text-sm uppercase tracking-[0.2em] text-black/60 dark:text-white/60">{block.title}</p>
                  <p className="mt-2 break-words font-display text-2xl text-black dark:text-white">{block.detail}</p>
                  <p className="mt-1 text-sm text-black/70 dark:text-white/70">{block.meta}</p>
                </>
              );
              const className = "rounded-3xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none";

              return block.href ? (
                <a
                  key={block.title}
                  href={block.href}
                  {...(block.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className={`${className} transition hover:border-black/40 dark:hover:border-white/40`}
                >
                  {body}
                </a>
              ) : (
                <div key={block.title} className={className}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {resolvedParams.page === "contact" && (
        <div className="pt-4">
          <ContactSection />
        </div>
      )}

      {/* Moved off the homepage. The story belongs on the page people open
          when they want the story. */}
      {resolvedParams.page === "about" && <AboutSection />}
    </main>
  );
};

export default MarketingPage;
