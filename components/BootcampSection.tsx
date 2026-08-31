import Link from "next/link";
import { ArrowRight, Youtube } from "lucide-react";

import { BOOTCAMP_NAME, BOOTCAMP_PROJECTS, YOUTUBE_CHANNEL } from "@/lib/bootcamp";

/**
 * The current cohort, on the homepage.
 *
 * Deliberately a list and not an essay: six names, six icons, two links. The
 * detail lives on /bootcamp, and the homepage stays short.
 */
const BootcampSection = () => (
  <section className="container-default section-shell">
    <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-black/50 sm:p-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-heading">Running now</p>
          <h2 className="section-title mt-3">{BOOTCAMP_NAME}</h2>
          <p className="mt-4 max-w-md text-black/70 dark:text-white/70">
            Six builds this cohort. Each one works by the end.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/bootcamp" className="btn-primary">
            See the builds <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <Youtube className="h-4 w-4" /> YouTube
          </a>
        </div>
      </div>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BOOTCAMP_PROJECTS.map((project) => (
          <li key={project.id}>
            <Link
              href={`/bootcamp#${project.id}`}
              className="flex items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 transition hover:border-black/30 dark:border-white/10 dark:hover:border-white/40"
            >
              <project.icon
                className="h-5 w-5 shrink-0"
                style={{ color: "var(--gold-primary)" }}
                aria-hidden
              />
              <span className="text-sm text-black dark:text-white">{project.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default BootcampSection;
