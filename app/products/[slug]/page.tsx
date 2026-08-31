import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PRODUCTS, STATUS_LABEL, productBySlug } from "@/lib/products";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = productBySlug((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} | OKHub`,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: Params) {
  const product = productBySlug((await params).slug);
  if (!product) notFound();

  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <main className="container-default py-12">
      <Link
        href="/products"
        className="text-sm text-black/60 underline underline-offset-4 hover:text-black dark:text-white/60 dark:hover:text-white"
      >
        ← All products
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
          {product.sector}
        </span>
        <span
          className={
            product.status === "live"
              ? "rounded-full bg-gold-primary/15 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-gold-ink"
              : "rounded-full border border-black/15 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-black/55 dark:border-white/15 dark:text-white/55"
          }
        >
          {STATUS_LABEL[product.status]}
        </span>
      </div>

      <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold text-black dark:text-white sm:text-5xl">
        {product.name}
      </h1>
      <p className="mt-4 max-w-3xl text-xl text-black/80 dark:text-white/80">
        {product.tagline}
      </p>

      {product.url && (
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex text-gold-ink underline underline-offset-4 hover:opacity-80"
        >
          {product.url.replace(/^https:\/\//, "")} ↗
        </a>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          <section className="max-w-3xl space-y-5">
            {product.summary.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-lg text-black/80 dark:text-white/80">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
              How it is built
            </h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-black/75 dark:text-white/75">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-black/15 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
              Built with
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {product.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded border border-black/10 px-2 py-1 text-xs text-black/70 dark:border-white/10 dark:text-white/70"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn-primary mt-6 w-full justify-center">
              Build something like this
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-16 border-t border-black/10 pt-10 dark:border-white/10">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">
          Other products
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug}>
              <Link
                href={`/products/${other.slug}`}
                className="group block h-full rounded-2xl border border-black/15 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-colors hover:border-black/40 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/40"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                  {other.sector}
                </p>
                <p className="mt-2 font-display text-lg text-black dark:text-white">
                  {other.name}
                </p>
                <p className="mt-1 text-sm text-black/70 dark:text-white/70">
                  {other.tagline}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
