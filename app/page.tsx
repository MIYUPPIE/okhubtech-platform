import Link from "next/link";

import HeroSection from "@/components/HeroSection";
import BuildLogSection from "@/components/BuildLogSection";
import ShowreelSection from "@/components/ShowreelSection";
import ServicesSection from "@/components/ServicesSection";
import ImpactSection from "@/components/ImpactSection";
import ContactSection from "@/components/ContactSection";

/**
 * Server component, six sections.
 *
 * It previously stacked thirteen sections and ~1,665 rendered words, behind a
 * 2,800ms loading screen. The seven sections that were mostly capability lists
 * now live on /about and /services, where someone reading about capabilities
 * has already asked for them. Nothing was deleted.
 */
export default function Home() {
  return (
    <section className="relative pb-20">
      <div className="mx-auto mt-10 w-full max-w-[1300px] px-4 sm:px-6 lg:px-8">
        <HeroSection />
      </div>

      <BuildLogSection />
      <ShowreelSection />
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
