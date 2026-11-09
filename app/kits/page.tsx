import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/contact";
import { DISCOUNT_TIERS, KIT_PROMISES, KITS, naira, type Kit } from "@/lib/kits";
import { kitImage } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/kits",
  title: "Kits",
  description:
    "Arduino, ESP32, Raspberry Pi Pico, RFID and robot car kits from OKHub, from ₦38,000. Every component tested, with a free tutorial, code and a year of WhatsApp support.",
  ogSlug: "kits",
  ogAlt: "An OKHub electronics starter kit laid out on white",
});

const orderMessage = (kit: Kit) =>
  `Hello OKHub, I would like to order the ${kit.name} kit (${naira(kit.price)}).`;

function KitCard({ kit, index }: { kit: Kit; index: number }) {
  const photo = kitImage(kit.slug);
  const saving = kit.listPrice - kit.price;

  return (
    <li
      id={kit.slug}
      className="flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition hover:border-black/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/40"
    >
      {/* The photographs are shot on white; the frame stays white in both themes so they sit on their own ground. */}
      <div className="relative aspect-[4/3] bg-white">
        <Image
          src={photo.src}
          alt={`Contents of the ${kit.name} kit laid out on white`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          priority={index < 2}
          className="object-contain"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/85 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#fafafa]">
            {kit.badge}
          </span>
          {kit.isNew && (
            <span className="rounded-full bg-gold-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-black">
              New
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">{kit.name}</h2>
        <p className="mt-2 text-black/70 dark:text-white/70">{kit.tagline}</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-3xl font-bold text-black dark:text-white">{naira(kit.price)}</span>
          <s className="text-black/45 dark:text-white/45">{naira(kit.listPrice)}</s>
          <span className="text-sm font-medium text-gold-ink">Save {naira(saving)}</span>
        </div>
        {kit.variants.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-sm text-black/65 dark:text-white/65">
            {kit.variants.map((v) => (
              <li key={v.label}>
                {v.label}: <span className="font-medium text-black dark:text-white">{naira(v.price)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">In the box</p>
        <ul className="mt-2 space-y-1.5">
          {kit.contents.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-black/75 dark:text-white/75">
              <span aria-hidden className="text-gold-ink">&bull;</span>
              {line}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">Build</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {kit.builds.map((b) => (
            <li
              key={b}
              className="rounded-lg border border-black/10 px-2.5 py-1 text-xs text-black/70 dark:border-white/15 dark:text-white/70"
            >
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <p className="border-t border-black/10 pt-4 text-xs text-black/55 dark:border-white/10 dark:text-white/55">
            Schools: {kit.level}. Robotics for Everyone, chapter{kit.chapters.length > 1 ? "s" : ""}{" "}
            {kit.chapters.join(", ")}.
          </p>
          <a
            href={whatsappLink(orderMessage(kit))}
            target="_blank"
            rel="noreferrer"
            className="btn-primary mt-4 w-full justify-center"
          >
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </li>
  );
}

export default function KitsPage() {
  const from = Math.min(...KITS.map((k) => k.price));

  return (
    <main className="pb-16">
      <section className="container-default pt-12">
        <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">Kits</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-black dark:text-white sm:text-5xl">
          Electronics and robotics kits, tested before they ship.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-black/80 dark:text-white/80">
          {KITS.length} kits, from {naira(from)}: a first Arduino, a 22-sensor box, robot cars, and
          WiFi robots you drive from your phone. Each one ships with a tutorial, the code, and a year
          of help from the engineers who run our robotics classes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink("Hello OKHub, I would like to ask about your kits.")}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
          </a>
          <Link href="/schools#lab-packs" className="btn-secondary">
            Lab packs for schools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KIT_PROMISES.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5"
            >
              <dt className="text-xs uppercase tracking-[0.2em] text-gold-ink">{p.title}</dt>
              <dd className="mt-2 text-sm text-black/75 dark:text-white/75">{p.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-default section-shell">
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {KITS.map((kit, i) => (
            <KitCard key={kit.slug} kit={kit} index={i} />
          ))}
        </ul>
      </section>

      <section className="container-default">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="max-w-xl">
            <p className="section-heading">Buying for a school or a lab</p>
            <p className="mt-3 font-display text-2xl text-black dark:text-white">
              {DISCOUNT_TIERS.slice()
                .reverse()
                .map((t) => `${Math.round(t.rate * 100)}% off ${t.minQty} or more kits`)
                .join(", ")}
              .
            </p>
            <p className="mt-2 text-black/65 dark:text-white/65">
              Counted across the whole order. We also train the teachers who will use them, and can
              run the lab with your staff until they take it over.
            </p>
          </div>
          <Link href="/schools" className="btn-primary">
            The schools programme <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
