import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import OfficeStage from "@/components/office3d/OfficeStage";
import ProjectCarousel from "@/components/ProjectCarousel";
import ReelsSection from "@/components/ReelsSection";

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s | OKHub Technology" title
  // template: the homepage is the one page where a brand-first title (rather
  // than topic-first) is the right SEO convention, and appending the suffix
  // would duplicate the brand name at both ends of the string.
  title: { absolute: "OKHub Technology — AI, robotics and data systems, built in Ibadan" },
  description:
    "Step into the OKHub office: the training floor, the robotics bench, the project wall, the data rack, the dev pod and the front desk. AI, robotics, data and the people we train to build them.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "OKHub Technology — AI, robotics and data systems, built in Ibadan",
    description:
      "Step into the OKHub office: the training floor, the robotics bench, the project wall, the data rack, the dev pod and the front desk.",
    url: "/",
    siteName: "OKHub Technology",
    images: [{ url: "/media/brand/og-image.png", width: 1200, height: 630, alt: "OKHub Technology" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OKHub Technology — AI, robotics and data systems, built in Ibadan",
    description:
      "Step into the OKHub office: the training floor, the robotics bench, the project wall, the data rack, the dev pod and the front desk.",
    images: ["/media/brand/og-image.png"],
  },
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
 * No marketing copy sits above or on the 3D room - the office and the
 * project carousel carry the page on their own, station chips and project
 * cards doing the talking instead of a headline. The `<h1>` below is
 * `sr-only`: a page still needs exactly one for accessibility and search,
 * it just does not have to be the first thing a sighted visitor reads.
 *
 * `OfficeStage` is a client component: the WebGL canvas mounts inside it with
 * ssr:false, but the station links and everything else in it are ordinary
 * server-rendered markup in the static export. `ProjectCarousel` follows the
 * same pattern with a lighter-weight CSS 3D ring instead of WebGL - the same
 * twelve project links render before it hydrates as a plain scrollable row.
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
      <h1 className="sr-only">OKHub Technology — AI, robotics and data systems in Ibadan, Nigeria</h1>

      <OfficeStage />

      <ProjectCarousel />

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
