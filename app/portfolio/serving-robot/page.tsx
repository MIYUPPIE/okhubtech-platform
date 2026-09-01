import type { Metadata } from "next";
import Image from "next/image";

import ProjectArtifacts from "@/components/ProjectArtifacts";
import { SERVING_ROBOT_ARTIFACTS } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/portfolio/serving-robot",
  title: "Restaurant Serving Robot",
  description:
    "An Arduino Mega and ESP32 serving robot that takes orders from a browser form in Yoruba, English, Igbo or Hausa, navigates around obstacles to the table, and plays the order back in the diner's language.",
  ogSlug: "portfolio-serving-robot",
  ogAlt: "The assembled restaurant serving robot",
});

const specs = [
  { label: "Controller", value: "Arduino Mega 2560" },
  { label: "Connectivity", value: "ESP32 web server, 192.168.4.1" },
  { label: "Sensing", value: "Ultrasonic obstacle, tray weight" },
  { label: "Languages", value: "Yoruba, English, Igbo, Hausa" },
] as const;

export default function ServingRobotPortfolioPage() {
  return (
    <main className="container-default py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
        Robotics · Embedded
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-black dark:text-white">
        Restaurant Serving Robot
      </h1>

      <div className="relative mt-8 mb-10 h-[24rem] w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 sm:h-[32rem]">
        <Image
          src="/media/projects/serving-robot/05-assembled-robot.webp"
          alt="The assembled serving robot: two circular decks on posts, with an ultrasonic sensor mounted on the lower deck"
          fill
          sizes="100vw"
          priority
          className="object-contain bg-white p-4"
        />
      </div>

      <section className="mb-10 max-w-3xl">
        <p className="text-lg text-black/80 dark:text-white/80">
          A serving robot for restaurants. The diner opens the robot&rsquo;s own
          web page, fills the order form and picks a language. The kitchen sees
          it on a chef page. Put the tray on and the robot drives to the table,
          steering around whatever is in the way; lift the tray off and it plays
          the order back in the chosen language and returns to base.
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
          <li>Chassis modelled in CAD, nested for the laser cutter, assembled in house</li>
          <li>ESP32 serves the order form and the chef page from its own access point &mdash; no restaurant wifi needed</li>
          <li>Tray weight starts the delivery; removing it triggers the voice playback</li>
          <li>Ordering in Yoruba, English, Igbo or Hausa</li>
        </ul>
      </section>

      <ProjectArtifacts
        heading="How it was built"
        note="Click any drawing to enlarge"
        items={SERVING_ROBOT_ARTIFACTS}
      />
    </main>
  );
}
