import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Youtube } from "lucide-react";

import VideoLoop from "@/components/media/VideoLoop";
import {
  BOOTCAMP_NAME,
  BOOTCAMP_PROJECTS,
  YOUTUBE_CHANNEL,
  YOUTUBE_HANDLE,
} from "@/lib/bootcamp";
import { HERO_LOOP } from "@/lib/media";

export const metadata: Metadata = {
  title: `${BOOTCAMP_NAME} | OKHub`,
  description:
    "The current OKHub 4IR Bootcamp cohort builds six working systems: a dual-mode robotic car, an obstacle-avoidance robot, classroom automation, a deaf-blind obstacle alert, a smart water pump and a railway crossing safety system.",
};

export default function BootcampPage() {
  return (
    <main className="pb-8">
      <section className="container-default pt-12">
        <div className="relative overflow-hidden rounded-[32px] border border-black/10 dark:border-white/10">
          <VideoLoop item={HERO_LOOP} fill />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40"
            aria-hidden
          />
          <div className="relative px-6 py-16 sm:px-12 sm:py-20">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60">
              Running now
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              {BOOTCAMP_NAME}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Six builds. Every one of them a working system by the end, not a
              slide about one.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Join the next cohort <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={YOUTUBE_CHANNEL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                <Youtube className="h-4 w-4" /> Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-default section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-heading">What this cohort builds</p>
            <h2 className="section-title mt-3">Six systems, start to finish.</h2>
          </div>
          <p className="max-w-xs text-sm text-black/60 dark:text-white/60">
            Sensing, decisions and actuation — the same loop, six different
            problems.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {BOOTCAMP_PROJECTS.map((project, index) => (
            <li
              key={project.id}
              id={project.id}
              className="flex flex-col rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-black/30 dark:border-white/10 dark:bg-black/60 dark:hover:border-white/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="rounded-2xl border border-black/10 p-3 dark:border-white/10"
                  style={{ color: "var(--gold-primary)" }}
                >
                  <project.icon className="h-6 w-6" />
                </span>
                <span className="font-display text-sm text-black/35 dark:text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold text-black dark:text-white">
                {project.title}
              </h3>
              {project.board !== undefined && (
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                  {project.board}
                </p>
              )}
              <p className="mt-3 mb-5 text-black/70 dark:text-white/70">{project.summary}</p>

              <ul className="mt-auto space-y-2 border-t border-black/10 pt-5 dark:border-white/10">
                {project.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="flex gap-2 text-sm text-black/65 dark:text-white/65"
                  >
                    <span aria-hidden style={{ color: "var(--gold-primary)" }}>
                      &bull;
                    </span>
                    {capability}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-default">
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm transition hover:border-black/30 dark:border-white/10 dark:bg-black/60 dark:hover:border-white/40"
        >
          <div>
            <p className="section-heading">Follow the builds</p>
            <p className="mt-3 font-display text-2xl text-black dark:text-white">
              Cohort work goes up on YouTube.
            </p>
            <p className="mt-2 text-black/60 dark:text-white/60">{YOUTUBE_HANDLE}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-sm text-black transition group-hover:border-black/40 dark:border-white/15 dark:text-white dark:group-hover:border-white/40">
            <Youtube className="h-4 w-4" style={{ color: "var(--gold-primary)" }} />
            Open the channel
          </span>
        </a>
      </section>
    </main>
  );
}
