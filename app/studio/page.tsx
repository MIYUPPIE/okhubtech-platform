import type { Metadata } from "next";
import Link from "next/link";

import HeroSection from "@/components/HeroSection";
import BuildLogSection from "@/components/BuildLogSection";
import ShowreelSection from "@/components/ShowreelSection";
import BootcampSection from "@/components/BootcampSection";
import ServicesSection from "@/components/ServicesSection";
import ImpactSection from "@/components/ImpactSection";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "The Studio | OKHub Technology",
  description:
    "The robotics and training floor at OKHub: the build log, the showreel, the current bootcamp cohort, the services that come out of the bench, and the numbers behind them.",
  alternates: { canonical: "/studio" },
};

/**
 * The page this used to be the home page.
 *
 * It is a good page - real footage of a real class, photographs of things that
 * work, the current cohort, the numbers - and none of it changed on the way
 * here. What changed is that it was the *only* thing the front door said,
 * which made a company that also ships data systems, products and services
 * look like a robotics school. The front door is now the office; this is the
 * robotics and training floor, in full, at its own address.
 *
 * The homepage links here from the robotics bench station.
 *
 * One thing did not come along: the reels strip. It runs on /portfolio and now
 * on the home page, and a third copy of the same three Instagram players would
 * be three more third-party iframes for nothing.
 */
export default function StudioPage() {
  return (
    <section className="relative pb-20">
      <div className="container-default pt-10">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/50 dark:text-white/45">
          The studio
        </p>
      </div>

      <div className="mx-auto mt-6 w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <HeroSection />
      </div>

      <BuildLogSection />
      <ShowreelSection />
      <BootcampSection />
      <ServicesSection />
      <ImpactSection />
      <ContactSection />

      <div className="container-default section-shell">
        <div className="rounded-3xl border border-black/15 bg-gradient-to-br from-white via-gray-50 to-white p-10 text-center shadow-lg dark:border-white/10 dark:from-black dark:via-black dark:to-[#050505] dark:shadow-none">
          <h3 className="font-display text-3xl font-semibold text-black dark:text-white">
            Start something.
          </h3>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              Talk to us
            </Link>
            <Link href="/services" className="btn-secondary">
              See services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
