import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LAB, LAB_KINDS, type LabItem } from "@/lib/lab";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Lab",
  description:
    "OKHub's research, papers, prototypes, tools and teaching material: accessible communication research, fab scheduling, submitted papers on LogSME and GambleAlert, and the tools behind our work.",
  ogSlug: "lab",
  ogAlt: "OKHub Lab: research, papers, prototypes and tools",
});

function LabCard({ item }: { item: LabItem }) {
  return (
    <li
      id={item.slug}
      className="flex scroll-mt-28 flex-col rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-gold-ink">{item.status}</p>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-black dark:text-white">
        {item.title}
      </h3>
      {item.authors !== undefined && (
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">{item.authors.join(", ")}</p>
      )}
      <p className="mt-3 font-medium text-black/80 dark:text-white/80">{item.tagline}</p>
      <p className="mt-3 text-sm text-black/70 dark:text-white/70">{item.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {item.points.map((point) => (
          <li key={point} className="flex gap-2 text-sm text-black/70 dark:text-white/70">
            <span aria-hidden className="text-gold-ink">
              &bull;
            </span>
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <ul className="flex flex-wrap gap-1.5">
          {item.stack.map((tech) => (
            <li
              key={tech}
              className="rounded border border-black/10 px-2 py-0.5 text-xs text-black/60 dark:border-white/10 dark:text-white/60"
            >
              {tech}
            </li>
          ))}
        </ul>
        {item.links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/10 pt-4 dark:border-white/10">
            {item.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 text-sm font-medium text-black underline underline-offset-4 hover:opacity-70 dark:text-white"
              >
                {link.label} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default function LabPage() {
  const groups = LAB_KINDS.map((k) => ({ ...k, items: LAB.filter((i) => i.kind === k.kind) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <main className="pb-16">
      <section className="container-default pt-12">
        <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">Lab</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-black dark:text-white sm:text-5xl">
          Research, prototypes and the tools behind our work.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-black/80 dark:text-white/80">
          Not everything we build is for sale. This is the rest of it: the questions we are
          researching, the papers we have written about systems we deployed, the prototypes that
          prove one idea at a time, and the tools and guides we use every week. Each one says
          plainly how far it has got.
        </p>
        <nav aria-label="Lab sections" className="mt-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.kind}
              href={`#${g.kind}`}
              className="rounded-full border border-black/15 px-4 py-1.5 text-sm text-black/75 transition hover:border-black/40 dark:border-white/15 dark:text-white/75 dark:hover:border-white/40"
            >
              {g.title} <span className="text-black/40 dark:text-white/40">{g.items.length}</span>
            </a>
          ))}
        </nav>
      </section>

      {groups.map((g) => (
        <section key={g.kind} id={g.kind} className="container-default section-shell scroll-mt-24">
          <p className="section-heading">{g.title}</p>
          <p className="mt-3 max-w-2xl text-black/65 dark:text-white/65">{g.intro}</p>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {g.items.map((item) => (
              <LabCard key={item.slug} item={item} />
            ))}
          </ul>
        </section>
      ))}

      <section className="container-default">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="max-w-xl">
            <p className="font-display text-2xl text-black dark:text-white">
              Working on something close to one of these?
            </p>
            <p className="mt-2 text-black/65 dark:text-white/65">
              We take on research partnerships and pilot builds. The finished work is on the
              products page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Talk to us
            </Link>
            <Link href="/products" className="btn-secondary">
              See the products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
