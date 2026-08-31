import type { Metadata } from "next";
import Image from "next/image";

import ProjectArtifacts from "@/components/ProjectArtifacts";
import { HYDROPONICS_ARTIFACTS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Hydroponics Automation | OKHub",
  description:
    "An Arduino Nano hydroponics controller reading pH, water level, gas, temperature and light, driving a pump and grow light, and reporting over GSM where there is no broadband.",
};

const specs = [
  { label: "Controller", value: "Arduino Nano" },
  { label: "Sensing", value: "pH, water level, MQ-2 gas, LM35, LDR" },
  { label: "Actuation", value: "Water pump, grow light" },
  { label: "Reporting", value: "SIM900D GSM, no broadband needed" },
] as const;

export default function HydroponicsPortfolioPage() {
  return (
    <main className="container-default py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
        Agriculture · Embedded
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-black dark:text-white">
        Hydroponics Automation
      </h1>

      <div className="relative mt-8 mb-10 h-[24rem] w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 sm:h-[32rem]">
        <Image
          src="/media/portfolio/hydroponics.webp"
          alt="Hydroponics automation system"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <section className="mb-10 max-w-3xl">
        <p className="text-lg text-black/80 dark:text-white/80">
          A grow controller for places without reliable internet. One Arduino
          Nano watches pH, water level, air quality, temperature and light, runs
          the pump and the grow light against those readings, and reports out
          over GSM rather than assuming there is a router in the building.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
          {specs.map((spec) => (
            <div key={spec.label} className="bg-white p-4 dark:bg-black">
              <dt className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                {spec.label}
              </dt>
              <dd className="mt-1 text-black dark:text-white">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-8 list-disc space-y-2 pl-5 text-black/75 dark:text-white/75">
          <li>Runs the water cycle from live pH and water-level readings</li>
          <li>Grow light driven by the ambient light sensor, not a timer</li>
          <li>Dedicated SMPS rail so sensors and pump do not fight for power</li>
          <li>GSM alerts, designed for sites with no broadband</li>
        </ul>
      </section>

      <ProjectArtifacts
        heading="How it was built"
        note="Click to enlarge"
        items={HYDROPONICS_ARTIFACTS}
      />
    </main>
  );
}
