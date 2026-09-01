import type { Metadata } from "next";
import Image from "next/image";

import ProjectArtifacts from "@/components/ProjectArtifacts";
import { HEALTH_MONITOR_ARTIFACTS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Patient Vitals Monitor | OKHub",
  description:
    "An Arduino and ESP8266 vitals monitor reading temperature, heart rate and ECG, showing them on an LCD and sending an SMS when a reading goes abnormal.",
};

const specs = [
  { label: "Controller", value: "Arduino + ESP8266" },
  { label: "Sensors", value: "Temperature, heart rate, ECG" },
  { label: "Local readout", value: "I2C character LCD" },
  { label: "Alerting", value: "Twilio SMS on abnormal reading" },
] as const;

export default function VitalsMonitorPortfolioPage() {
  return (
    <main className="container-default py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
        Health · Embedded
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-black dark:text-white">
        Patient Vitals Monitor
      </h1>

      <div className="relative mt-8 mb-10 h-[24rem] w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 sm:h-[32rem]">
        <Image
          src="/media/projects/health-monitor/02-block-diagram.webp"
          alt="Block diagram: temperature, heart rate and ECG sensors into an Arduino, out to an LCD and an ESP8266 that sends a Twilio SMS"
          fill
          sizes="100vw"
          priority
          className="bg-white object-contain p-6"
        />
      </div>

      <section className="mb-10 max-w-3xl">
        <p className="text-lg text-black/80 dark:text-white/80">
          A bedside monitor built from parts a clinic can actually source. An
          Arduino reads temperature, heart rate and ECG and puts them on an LCD.
          An ESP8266 takes the same readings over serial, publishes them to a
          small web server, and sends an SMS the moment a reading goes out of
          range, so nobody has to be standing at the bedside to know.
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
          <li>Readings shown locally, so the device is useful with no network</li>
          <li>Sensor loop and network loop split across two controllers</li>
          <li>Abnormal-condition check runs before the alert is sent, not after</li>
        </ul>
      </section>

      <ProjectArtifacts
        heading="How it was built"
        note="Click any drawing to enlarge"
        items={HEALTH_MONITOR_ARTIFACTS}
      />
    </main>
  );
}
