import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import OfficeStage from "@/components/office3d/OfficeStage";
import ReelsSection from "@/components/ReelsSection";
import { STATIONS } from "@/components/office3d/stations";
import { LOCATION_SHORT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "OKHub Technology — AI, robotics and data systems, built in Ibadan",
  description:
    "Step into the OKHub office: the training floor, the robotics bench, the project wall, the data rack, the dev pod and the front desk. AI, robotics, data and the people we train to build them.",
  alternates: { canonical: "/" },
};

/**
 * The front door.
 *
 * The old home page was the robotics and training floor and nothing else -
 * good work, badly placed, because it made a company that also ships data
 * systems and software products read as a robotics school. That page moved to
 * /studio unchanged. This one is the whole office, and every part of it is a
 * door into the part of the business that lives there.
 *
 * The headline lives here, in ordinary page flow, not layered on top of the
 * canvas. It used to sit over the 3D room behind a legibility scrim, which
 * meant either the text or the room was always somewhat compromised for the
 * other. Splitting them lets the headline read at full contrast against the
 * page background, and lets the room render undimmed as its own thing below.
 *
 * `OfficeStage` is a client component: the WebGL canvas mounts inside it with
 * ssr:false, but the station links and everything else in it are ordinary
 * server-rendered markup in the static export.
 */

const elsewhere = [
  {
    label: "About OKHub",
    href: "/about",
    detail: "Who is in the building, and what we are trying to build for the continent.",
  },
  {
    label: "Services",
    href: "/services",
    detail: "Twelve practices, from robotics and automation to networking and renewable energy.",
  },
  {
    label: "Expertise",
    href: "/expertise/ai-ml",
    detail: "The four disciplines the work is actually made of: AI/ML, data, web, robotics.",
  },
];

export default function Home() {
  return (
    <>
      <section className="container-default pb-8 pt-10 sm:pt-14">
        <div className="max-w-2xl">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/50 dark:text-white/45">
            Ibadan, Nigeria · AI · Robotics · Data
          </p>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] tracking-tight text-[#050505] dark:text-white sm:text-[3.4rem] lg:text-[4rem]">
            This is the room
            <br />
            <span className="text-gradient">the work comes out of.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-black/65 dark:text-white/65">
            OKHub Technology builds AI, robotics and data systems, and trains the
            people who will build the next ones. Six stations below. Open any of them.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/services" className="btn-primary">
              What we do <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-secondary">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <OfficeStage />

      <section className="container-default section-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-heading">The floor plan</p>
            <h2 className="section-title mt-3">Six places, six answers.</h2>
          </div>
          <p className="max-w-xs text-sm text-black/60 dark:text-white/60">
            Everything in the room above is a real part of the business in {LOCATION_SHORT}.
            Here it is as a list, for anyone who would rather read than walk.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATIONS.map((station, i) => (
            <Link
              key={station.id}
              href={station.href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/12 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-black/25 hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-black/60 dark:hover:border-white/30"
            >
              <div>
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-gold-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-black dark:text-white">
                  {station.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black/65 dark:text-white/65">
                  {station.blurb}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-black/70 transition group-hover:gap-3 group-hover:text-black dark:text-white/70 dark:group-hover:text-white">
                {station.cta}
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ReelsSection heading="What came off the bench lately." />

      <section className="container-default pb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {elsewhere.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-black/12 bg-gradient-to-br from-white to-gray-50 p-6 transition hover:border-black/25 dark:border-white/10 dark:from-black dark:to-[#080808] dark:hover:border-white/30"
            >
              <p className="font-display text-lg font-semibold text-black dark:text-white">
                {item.label}
              </p>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="container-default section-shell">
        <div className="rounded-3xl border border-black/15 bg-gradient-to-br from-white via-gray-50 to-white p-10 text-center shadow-lg dark:border-white/10 dark:from-black dark:via-black dark:to-[#050505] dark:shadow-none">
          <h2 className="font-display text-3xl font-semibold text-black dark:text-white">
            Start something.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-black/65 dark:text-white/65">
            Tell us what you are building or who you need trained. One inbox, one number,
            and somebody who answers both.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Talk to us <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/studio" className="btn-secondary">
              See the build log
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
