import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data | OKHub",
  description:
    "OKHub's data practice: sequence models, computer vision and LLM-backed tools, built to run on small, patchy, real-world data — and taught the same way.",
};

/**
 * /data used to be one of eight routes rendered from the shared pageContent map
 * in app/[page]/page.tsx. That template paints a permanent black gradient and
 * claimed "14 data lakes", "280+ real-time pipelines" and "35 cabinet-ready
 * policy dashboards" — none of which exist. This page is theme-aware and every
 * claim on it traces to a project with a page of its own under /portfolio.
 */

const approach = [
  {
    eyebrow: "Teach",
    title: "It runs as a taught track",
    body: "Data science is one of the things OKHub teaches, not a service line bolted on afterwards. People arrive with a laptop and leave having trained a model, measured it honestly and put it somewhere it has to keep working.",
  },
  {
    eyebrow: "Build",
    title: "Then the same people build",
    body: "The projects below were built the way they were taught: pick the smallest architecture that fits the signal, get it to run end to end, and only then make it faster.",
  },
  {
    eyebrow: "Deploy",
    title: "On the network that exists",
    body: "Inference gets pushed to the edge, models get sized to run on the device in the room, and reporting assumes the connection drops. That constraint shapes the design from the start rather than being patched in at the end.",
  },
] as const;

const projects = [
  {
    title: "Credit Card Fraud Detection",
    href: "/portfolio/credit-card-fraud",
    image: "/media/portfolio/credit-card-fraud.webp",
    technique: "ANN + LSTM",
    summary:
      "Sequence modelling over spending history, so a transaction is judged against the behaviour that came before it rather than in isolation. Exposed to banking systems over REST.",
  },
  {
    title: "Speech Emotion Recognition",
    href: "/portfolio/speech-emotion",
    image: "/media/portfolio/speech-emotion.webp",
    technique: "GRU on raw audio",
    summary:
      "Feature extraction straight off the waveform, then a recurrent model over the sequence, because emotion is in how a sentence moves rather than in any single frame of it.",
  },
  {
    title: "Sign Language Educator",
    href: "/portfolio/sign-language-educator",
    image: "/media/portfolio/sign-language-educator.webp",
    technique: "YOLOv8 + CNN",
    summary:
      "Detection to find the hands, classification to read the sign, both sized to run on an edge device so the feedback is immediate and nothing has to leave the room.",
  },
  {
    title: "UTME Career Advisor",
    href: "/portfolio/utme-career-advisor",
    image: "/media/portfolio/utme-career-advisor.webp",
    technique: "Django + LLM",
    summary:
      "Scores and subject combinations matched against real university requirements, with the language model doing the explaining rather than the deciding.",
  },
  {
    title: "AI-Powered Agriculture",
    href: "/portfolio/ai-agriculture",
    image: "/media/portfolio/agriculture.webp",
    technique: "Sensor feeds + prediction",
    summary:
      "Soil and weather telemetry turned into a recommendation a farmer can act on that morning, delivered to a phone rather than a desktop dashboard.",
  },
] as const;

const stack = [
  { label: "Sequence models", value: "LSTM, GRU" },
  { label: "Vision", value: "YOLOv8, CNNs" },
  { label: "Language", value: "LLM-backed flows behind Django" },
  { label: "Signals", value: "Audio features, IoT sensor telemetry" },
  { label: "Delivery", value: "REST APIs, dashboards, edge inference" },
  { label: "Where it runs", value: "Phones, edge devices, patchy connections" },
] as const;

export default function DataPracticePage() {
  return (
    <main className="container-default py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
        Practice · Data
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-black dark:text-white sm:text-5xl">
        Models that run on the data you actually have.
      </h1>
      <p className="mt-6 max-w-3xl text-lg text-black/80 dark:text-white/80">
        Most of the data work that reaches us starts small and messy: a few
        thousand rows, a sensor that drops out overnight, a spreadsheet someone
        maintains by hand. We build for that rather than for the dataset we
        wish existed, and we teach it the same way — the architecture matters
        less than whether it survives contact with the data you can really get.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/contact" className="btn-primary">
          Talk to us about a build
        </Link>
        <Link href="/portfolio" className="btn-secondary">
          See the work
        </Link>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
          How the practice works
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {approach.map((item) => (
            <div
              key={item.eyebrow}
              className="rounded-2xl border border-black/15 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/50">
                {item.eyebrow}
              </p>
              <h3 className="mt-3 font-display text-xl text-black dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-black/70 dark:text-white/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
          Work we have shipped
        </h2>
        <p className="mt-2 text-black/70 dark:text-white/70">
          Each of these has a page of its own with the full build.
        </p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.href}>
              <Link
                href={project.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-colors hover:border-black/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/40"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold-ink">
                    {project.technique}
                  </p>
                  <h3 className="mt-2 font-display text-xl text-black dark:text-white">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-black/70 dark:text-white/70">
                    {project.summary}
                  </p>
                  <span className="mt-4 text-sm font-medium text-black underline underline-offset-4 group-hover:opacity-70 dark:text-white">
                    Read the build
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
          What we work with
        </h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
          {stack.map((item) => (
            <div key={item.label} className="bg-white p-4 dark:bg-black">
              <dt className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                {item.label}
              </dt>
              <dd className="mt-1 text-black dark:text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 rounded-2xl border border-black/15 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
          Where to go next
        </h2>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/services/data-analytics-science"
            className="text-gold-ink underline underline-offset-4 hover:opacity-80"
          >
            Data analytics &amp; science service
          </Link>
          <Link
            href="/expertise/data-science"
            className="text-gold-ink underline underline-offset-4 hover:opacity-80"
          >
            Data science expertise
          </Link>
          <Link
            href="/ai"
            className="text-gold-ink underline underline-offset-4 hover:opacity-80"
          >
            AI &amp; ML practice
          </Link>
          <Link
            href="/contact"
            className="text-gold-ink underline underline-offset-4 hover:opacity-80"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
