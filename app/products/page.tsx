import type { Metadata } from "next";
import Link from "next/link";

import { PRODUCTS } from "@/lib/products";
import ReelsSection from "@/components/ReelsSection";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/products",
  title: "Products",
  description:
    "Software OKHub has built: LogSME, Alajapa, VASIDAS, TeenBuddy, LOGOD, NURPAT, LAMIUK, UNC, Loeko, GriotVid and more, across commerce, agriculture, health, language, automation and the public sector.",
  ogSlug: "products",
  ogAlt: "Software OKHub has built",
});

const sectors = [...new Set(PRODUCTS.map((p) => p.sector))];

export default function ProductsPage() {
  return (
    <main className="container-default py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
        Products
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-black dark:text-white sm:text-5xl">
        Software we have built and shipped.
      </h1>
      <p className="mt-6 max-w-3xl text-lg text-black/80 dark:text-white/80">
        {PRODUCTS.length} products across {sectors.length} sectors: commerce,
        agriculture, health, language, automation, media and the public sector.
        Most were built for conditions the usual tooling assumes away: no signal
        in the field, no broadband in the building, no GPU worth the name, and a
        customer who is already on WhatsApp and not coming to your website.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/contact" className="btn-primary">
          Talk to us about a build
        </Link>
        <Link href="/portfolio" className="btn-secondary">
          Hardware &amp; research work
        </Link>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <li key={product.slug}>
            <Link
              href={`/products/${product.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-black/15 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-colors hover:border-black/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/40"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                {product.sector}
              </span>

              <h2 className="mt-4 font-display text-2xl text-black dark:text-white">
                {product.name}
              </h2>
              <p className="mt-2 flex-1 text-black/70 dark:text-white/70">
                {product.tagline}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {product.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-black/10 px-2 py-0.5 text-xs text-black/60 dark:border-white/10 dark:text-white/60"
                  >
                    {tech}
                  </span>
                ))}
                {product.stack.length > 4 && (
                  <span className="px-1 py-0.5 text-xs text-black/45 dark:text-white/45">
                    +{product.stack.length - 4}
                  </span>
                )}
              </div>

              <span className="mt-5 text-sm font-medium text-black underline underline-offset-4 group-hover:opacity-70 dark:text-white">
                Read more
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <ReelsSection heading="A few of them, on video." />
    </main>
  );
}
