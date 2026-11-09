import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Mail, MessageCircle } from "lucide-react";

import VideoLoop from "@/components/media/VideoLoop";
import { BOOTCAMP_PROJECTS } from "@/lib/bootcamp";
import { EMAIL, whatsappLink } from "@/lib/contact";
import { LAB_PACKS, THREE_DAY_KIT_LINES, kitBySlug, naira, packTotal, unitPrice, type PackLine } from "@/lib/kits";
import { SECONDARY_CLIPS } from "@/lib/media";
import {
  BOOK,
  CHAPTERS,
  HANDOVER,
  MILESTONES,
  OKHUB_PROVIDES,
  OPTIONAL_CHAPTERS,
  PARTS,
  PATHWAY,
  SCHOOL_PROVIDES,
  SESSIONS,
  THREE_DAY,
  TOOLS,
  TRACKS,
  TRAINING_OPTIONS,
} from "@/lib/schools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/schools",
  title: "For secondary schools",
  description:
    "A robotics and AI lab for JSS1 to SS3, teacher training as a 3-day intensive or a ten-session academy, and tested kits with lab packs. From OKHub Technology, Ibadan.",
  ogSlug: "schools",
  ogAlt: "Secondary school students in a computer lab during an OKHub block-programming lesson",
});

const PROPOSAL_SUBJECT = "Secondary school robotics partnership";
const proposalMail = `mailto:${EMAIL}?subject=${encodeURIComponent(PROPOSAL_SUBJECT)}`;
const proposalWhatsapp = whatsappLink(
  "Hello OKHub, I would like a proposal for the secondary school robotics partnership.",
);

const card =
  "rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5";
const kicker = "text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50";
const body = "text-black/70 dark:text-white/70";
const heading = "font-display text-xl font-semibold text-black dark:text-white";

function lineLabel(line: PackLine): string {
  const kit = kitBySlug(line.kit);
  const name = kit?.name ?? line.kit;
  return line.variant === undefined ? name : `${name} (${line.variant.toLowerCase()})`;
}

function PackTable({ lines }: { lines: readonly PackLine[] }) {
  const t = packTotal(lines);
  return (
    <dl className="mt-4 space-y-1.5 text-sm">
      {lines.map((l) => (
        <div key={`${l.kit}-${l.variant ?? ""}`} className="flex justify-between gap-4">
          <dt className={body}>
            {l.qty} x{" "}
            <Link href={`/kits#${l.kit}`} className="underline underline-offset-4 hover:opacity-70">
              {lineLabel(l)}
            </Link>
          </dt>
          <dd className="text-black/70 dark:text-white/70">{naira(unitPrice(l) * l.qty)}</dd>
        </div>
      ))}
      {t.rate > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="text-gold-ink">School discount, {Math.round(t.rate * 100)}%</dt>
          <dd className="text-gold-ink">-{naira(t.saving)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-black/10 pt-2 dark:border-white/10">
        <dt className="font-medium text-black dark:text-white">Total</dt>
        <dd className="font-display text-lg font-semibold text-black dark:text-white">{naira(t.net)}</dd>
      </div>
    </dl>
  );
}

export default function SchoolsPage() {
  const [heroClip, ...moreClips] = SECONDARY_CLIPS;

  return (
    <main className="pb-16">
      {/* ---------------------------------------------------------------- hero */}
      <section className="container-default grid gap-10 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
            For secondary schools, JSS1 to SS3
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-black dark:text-white sm:text-5xl">
            A robotics lab for your students. Training for your staff. The kits to run it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-black/80 dark:text-white/80">
            Most school robotics programmes buy kits and hope. This one trains the people who will
            teach, equips the room, and runs the first terms alongside your staff until they can run
            it alone. It is built from the material OKHub already teaches with.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={proposalMail} className="btn-primary">
              <Mail className="h-4 w-4" /> Request a proposal
            </a>
            <a href={proposalWhatsapp} target="_blank" rel="noreferrer" className="btn-secondary">
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
        {heroClip !== undefined && (
          <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-black/10 dark:border-white/10">
            <VideoLoop item={heroClip} />
            <figcaption className="border-t border-black/10 bg-white px-4 py-3 text-xs text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              A secondary class in the computer lab, block-programming an Arduino.
            </figcaption>
          </figure>
        )}
      </section>

      {/* --------------------------------------------------------- three parts */}
      <section className="container-default section-shell">
        <p className="section-heading">One school, three parts</p>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {PARTS.map((p) => (
            <li key={p.n} className={card}>
              <span className="font-display text-sm text-gold-ink">Part {p.n}</span>
              <h2 className={`mt-3 ${heading}`}>{p.title}</h2>
              <p className={`mt-3 ${body}`}>{p.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------ student builds */}
      <section className="container-default section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-heading">What students build</p>
            <h2 className="section-title mt-3 text-black dark:text-white">Six working systems. Not six worksheets.</h2>
          </div>
          <p className="max-w-sm text-sm text-black/60 dark:text-white/60">
            The same module list our current{" "}
            <Link href="/bootcamp" className="underline underline-offset-4">
              4IR Bootcamp
            </Link>{" "}
            cohort runs. Every module ends with a wired, running system.
          </p>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOOTCAMP_PROJECTS.map((p, i) => (
            <li key={p.id} className={card}>
              <div className="flex items-center justify-between">
                <span className="font-display text-sm text-black/40 dark:text-white/40">
                  Module {String(i + 1).padStart(2, "0")}
                </span>
                {p.board !== undefined && <span className={kicker}>{p.board}</span>}
              </div>
              <h3 className={`mt-3 ${heading}`}>{p.title}</h3>
              <p className={`mt-2 text-sm ${body}`}>{p.summary}</p>
            </li>
          ))}
        </ol>

        <h3 className="mt-14 font-display text-2xl font-semibold text-black dark:text-white">
          JSS1 to SS3, mapped to the book and to the kits
        </h3>
        <ol className="mt-6 space-y-3">
          {PATHWAY.map((s, i) => (
            <li key={s.stage} className={`${card} grid gap-3 md:grid-cols-[200px_1fr_220px] md:items-start`}>
              <div>
                <span className="font-display text-sm text-gold-ink">Stage {i + 1}</span>
                <p className="font-display text-lg font-semibold text-black dark:text-white">{s.stage}</p>
                <p className="text-sm text-black/55 dark:text-white/55">{s.level}</p>
              </div>
              <p className={body}>{s.detail}</p>
              <div className="text-sm">
                <p className="text-black/55 dark:text-white/55">Book: {s.chapters}</p>
                <p className="mt-1 text-black/55 dark:text-white/55">
                  Kit:{" "}
                  {s.kits.length === 0
                    ? "any lab kit"
                    : s.kits.map((slug, j) => (
                        <span key={slug}>
                          {j > 0 && ", "}
                          <Link href={`/kits#${slug}`} className="text-black underline underline-offset-4 hover:opacity-70 dark:text-white">
                            {kitBySlug(slug)?.name ?? slug}
                          </Link>
                        </span>
                      ))}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.tool} className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-black dark:text-white">{t.tool}</span>
                <span className="shrink-0 text-xs text-black/50 dark:text-white/50">{t.level}</span>
              </p>
              <p className={`mt-1 text-sm ${body}`}>{t.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ staff training */}
      <section className="container-default section-shell">
        <p className="section-heading">Staff training</p>
        <h2 className="section-title mt-3 max-w-3xl text-black dark:text-white">
          Train the teachers first. The programme outlives us.
        </h2>
        <p className={`mt-4 max-w-3xl text-lg ${body}`}>
          A lab run by visiting instructors stops when they leave. Training puts the capability in
          your building: teachers who have built each project themselves, passed a safety gate, and
          led a class with support. ICT, Physics, Basic Technology and Maths teachers fit best. No
          electronics or programming background is needed.
        </p>

        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {TRACKS.map((t) => (
            <li key={t.track} className={card}>
              <span className="font-display text-sm text-gold-ink">Track {t.track}</span>
              <h3 className={`mt-2 ${heading}`}>{t.title}</h3>
              <p className={`mt-2 text-sm ${body}`}>{t.detail}</p>
            </li>
          ))}
        </ul>

        <h3 className="mt-14 font-display text-2xl font-semibold text-black dark:text-white">
          Teacher training: two ways in
        </h3>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {TRAINING_OPTIONS.map((o) => (
            <article key={o.key} className={card}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-2xl font-semibold text-black dark:text-white">{o.name}</h4>
                <span className="text-sm text-gold-ink">{o.hours} contact hours</span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["When", o.when],
                  ["Teachers build", o.builds],
                  ["After", o.after],
                  ["Best for", o.bestFor],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3">
                    <dt className="text-black/50 dark:text-white/50">{k}</dt>
                    <dd className="text-black/80 dark:text-white/80">{v}</dd>
                  </div>
                ))}
              </dl>

              <details className="group mt-5 border-t border-black/10 pt-4 dark:border-white/10">
                <summary className="cursor-pointer text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white">
                  {o.key === "intensive" ? "See the three days" : "See the ten sessions"}
                </summary>
                {o.key === "intensive" ? (
                  <ol className="mt-4 space-y-5">
                    {THREE_DAY.map((d) => (
                      <li key={d.day}>
                        <p className="font-medium text-black dark:text-white">
                          Day {d.day}: {d.title}
                        </p>
                        <ul className="mt-2 space-y-2">
                          {d.blocks.map((b) => (
                            <li key={b.start} className="grid grid-cols-[52px_1fr] gap-3 text-sm">
                              <span className="font-mono text-black/50 dark:text-white/50">{b.start}</span>
                              <span className={body}>{b.activity}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="mt-4 space-y-4">
                    {SESSIONS.map((s) => (
                      <li key={s.n} className="text-sm">
                        <p className="font-medium text-black dark:text-white">
                          {s.n}. {s.title}{" "}
                          <span className="font-normal text-black/50 dark:text-white/50">
                            (Ch. {s.chapters.join(", ")})
                          </span>
                        </p>
                        <p className={`mt-1 ${body}`}>{s.activity}</p>
                        <p className="mt-1 text-black/55 dark:text-white/55">Leaves with: {s.outcome}</p>
                      </li>
                    ))}
                    {OPTIONAL_CHAPTERS.map((o) => (
                      <li key={o.chapter} className="text-sm text-black/55 dark:text-white/55">
                        Optional, Chapter {o.chapter}: {o.note}
                      </li>
                    ))}
                  </ol>
                )}
              </details>
            </article>
          ))}
        </div>

        <h3 className="mt-14 font-display text-2xl font-semibold text-black dark:text-white">
          Observe, co-teach, lead
        </h3>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {HANDOVER.map((h) => (
            <li key={h.term} className={card}>
              <span className={kicker}>{h.term}</span>
              <p className={`mt-2 ${heading}`}>{h.title}</p>
              <p className={`mt-2 text-sm ${body}`}>{h.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ the book */}
      <section className="container-default section-shell">
        <div className={`${card} grid gap-8 p-8 lg:grid-cols-[1fr_1fr]`}>
          <div>
            <p className="section-heading">The textbook</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-black dark:text-white">
              <BookOpen className="mr-2 inline h-7 w-7 align-[-4px] text-gold-ink" />
              {BOOK.title}
            </h2>
            <p className="mt-1 text-black/60 dark:text-white/60">
              {BOOK.subtitle}. By {BOOK.author}, founder of OKHub Technology.
            </p>
            <p className={`mt-4 ${body}`}>
              Written for people with no degree and no programming background, and tested on real
              beginners with simple kits. Teachers work through it in training; students then meet
              the same projects in the same order. Every chapter ends with a review and an answer
              key, so each stage has an assessment ready.
            </p>
            <p className="mt-4 text-sm text-gold-ink">
              {BOOK.pages} pages, {BOOK.chapters} chapters, {BOOK.projects} hands-on projects
            </p>
          </div>
          <ol className="columns-1 gap-6 text-sm sm:columns-2">
            {CHAPTERS.map(([n, title]) => (
              <li key={n} className="mb-1.5 break-inside-avoid text-black/70 dark:text-white/70">
                <span className="inline-block w-6 font-mono text-black/40 dark:text-white/40">{n}</span>
                {title}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- lab packs */}
      <section id="lab-packs" className="container-default section-shell scroll-mt-28">
        <p className="section-heading">Lab packs</p>
        <h2 className="section-title mt-3 text-black dark:text-white">Kits sized for one class of 30.</h2>
        <p className={`mt-4 max-w-3xl text-lg ${body}`}>
          Ten groups of three. The catalogue&apos;s school discount (5% off at 5 or more kits, 10%
          off at 10 or more) is applied to each pack&apos;s own kit count. Prices are confirmed on
          your invoice; training and instruction are quoted per school.
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {LAB_PACKS.map((p) => (
            <li key={p.key} className={`${card} flex flex-col`}>
              <span className={kicker}>{p.level}</span>
              <h3 className={`mt-2 ${heading}`}>{p.title}</h3>
              <p className={`mt-2 text-sm ${body}`}>{p.blurb}</p>
              <p className="mt-2 text-xs text-black/50 dark:text-white/50">{p.chapters}</p>
              <div className="mt-auto">
                <PackTable lines={p.lines} />
              </div>
            </li>
          ))}
        </ul>
        <div className={`${card} mt-5 max-w-xl`}>
          <span className={kicker}>Teachers</span>
          <h3 className={`mt-2 ${heading}`}>Kits for the 3-day intensive</h3>
          <p className={`mt-2 text-sm ${body}`}>Six teachers, two to a kit set: a starter kit and a robot car per pair.</p>
          <PackTable lines={THREE_DAY_KIT_LINES} />
        </div>
      </section>

      {/* -------------------------------------------------------- who does what */}
      <section className="container-default section-shell">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { title: "OKHub provides", items: OKHUB_PROVIDES },
            { title: "The school provides", items: SCHOOL_PROVIDES },
          ].map((col) => (
            <div key={col.title} className={card}>
              <h2 className={heading}>{col.title}</h2>
              <ul className="mt-4 space-y-2">
                {col.items.map((it) => (
                  <li key={it} className={`flex gap-2 text-sm ${body}`}>
                    <span aria-hidden className="text-gold-ink">&bull;</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-2xl font-semibold text-black dark:text-white">
          What changes, and how you will see it
        </h3>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {MILESTONES.map((m) => (
            <li key={m.when} className={card}>
              <span className="font-display text-sm text-gold-ink">{m.when}</span>
              <p className={`mt-2 text-sm ${body}`}>{m.what}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-black/50 dark:text-white/50">
          Proposed targets. Each school&apos;s are fixed in writing in its own proposal.
        </p>
      </section>

      {/* ------------------------------------------------------------- footage */}
      {moreClips.length > 0 && (
        <section className="container-default section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-heading">In the classroom</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-black dark:text-white">
                Unstaged footage from our secondary sessions.
              </h2>
            </div>
            <Link href="/studio" className="btn-secondary">
              More in the studio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {moreClips.map((clip) => (
              <li key={clip.asset.id} className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
                <VideoLoop item={clip} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------------- CTA */}
      <section className="container-default">
        <div className={`${card} flex flex-wrap items-center justify-between gap-6 p-8`}>
          <div className="max-w-xl">
            <p className="font-display text-2xl text-black dark:text-white">
              Get a proposal written for your school.
            </p>
            <p className={`mt-2 ${body}`}>
              Tell us your class sizes, how many teachers you can release, and when you want to
              start. We will come back with a plan, a timetable and a quote.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={proposalMail} className="btn-primary">
              <Mail className="h-4 w-4" /> {EMAIL}
            </a>
            <Link href="/kits" className="btn-secondary">
              See the kits
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
