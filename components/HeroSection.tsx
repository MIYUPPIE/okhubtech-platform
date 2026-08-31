import Link from "next/link";
import { ArrowRight } from "lucide-react";

import VideoLoop from "@/components/media/VideoLoop";
import { HERO_LOOP } from "@/lib/media";

const stats = [
  { value: "500+", label: "Trained" },
  { value: "120", label: "Projects" },
  { value: "10", label: "Partners" },
] as const;

/**
 * The old hero ran ~200 words across two paragraphs, three "pillars", a
 * three-step journey and a logo marquee, over a generic three.js backdrop.
 * It now leads with a real clip of a real class and gets out of the way.
 */
const HeroSection = () => (
  <section className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white dark:border-white/10 dark:bg-black">
    <div className="grid lg:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col justify-center gap-8 px-6 py-14 sm:px-10 lg:py-20">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/50 dark:text-white/45">
          AI · Robotics · Engineering
        </p>

        <h1 className="font-display text-[2.6rem] leading-[1.05] tracking-tight text-[#050505] dark:text-white sm:text-[3.4rem] lg:text-[4rem]">
          We train minds and
          <br />
          <span className="text-gradient">build the machines.</span>
        </h1>

        <p className="max-w-md text-lg text-black/65 dark:text-white/65">
          Hands-on AI and robotics training, and the systems to go with it.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="btn-primary">
            See what we do <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-secondary">
            Talk to us
          </Link>
        </div>

        <dl className="flex gap-10 border-t border-black/10 pt-7 dark:border-white/10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-semibold text-black dark:text-white">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.25em] text-black/50 dark:text-white/45">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative min-h-[340px] lg:min-h-full">
        <VideoLoop item={HERO_LOOP} fill />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/20 lg:to-transparent dark:lg:from-black dark:lg:via-black/20"
          aria-hidden
        />
      </div>
    </div>
  </section>
);

export default HeroSection;
