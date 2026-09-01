import Image from "next/image";

import { ASSISTANT_PROOF, BUILD_LOG } from "@/lib/media";

/**
 * Photographs instead of adjectives.
 *
 * Every frame here is a real build from the workshop, so the section carries
 * roughly thirty words. The two assistant shots lead because they show a thing
 * working rather than a thing existing.
 */
const BuildLogSection = () => (
  <section className="container-default section-shell">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="section-heading">Build log</p>
        <h2 className="section-title mt-3">What leaves the bench.</h2>
      </div>
      <p className="max-w-xs text-sm text-black/60 dark:text-white/60">
        Offline AI assistants, sensor rigs, and rovers, built and tested in house.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ASSISTANT_PROOF.map((item) => (
        <figure
          key={item.asset.id}
          className="group relative col-span-1 overflow-hidden rounded-3xl border border-black/10 bg-black sm:col-span-1 lg:col-span-2"
          style={{ aspectRatio: "4 / 3" }}
        >
          <Image
            src={item.asset.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 text-base font-medium text-white">
            {item.caption}
          </figcaption>
        </figure>
      ))}

      {BUILD_LOG.map((item) => (
        <figure
          key={item.asset.id}
          className="group relative overflow-hidden rounded-2xl border border-black/10 bg-black dark:border-white/10"
          style={{ aspectRatio: "1 / 1" }}
        >
          <Image
            src={item.asset.thumb ?? item.asset.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </figure>
      ))}
    </div>
  </section>
);

export default BuildLogSection;
