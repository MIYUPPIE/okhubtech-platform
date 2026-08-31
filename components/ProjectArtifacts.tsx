"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";

import { aspectRatio, type Captioned } from "@/lib/media";
import type { ImageAsset } from "@/lib/media.generated";

type ProjectArtifactsProps = {
  readonly heading: string;
  readonly items: readonly Captioned<ImageAsset>[];
  readonly note?: string;
};

/**
 * Schematics, flowcharts and CAD from a project's build files.
 *
 * Two constraints drive the design:
 *
 *  - These are line drawings on white. They are `object-contain` on a white
 *    card, never `object-cover`, because cropping a circuit diagram destroys
 *    it, and they keep a white ground in both themes so the strokes stay black.
 *  - A schematic at grid size is unreadable, so every tile opens full size.
 */
export function ProjectArtifacts({ heading, items, note }: ProjectArtifactsProps) {
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : items[open] ?? null;

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the overlay.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active, close]);

  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-black dark:text-white">{heading}</h2>
        {note !== undefined && (
          <p className="text-sm text-black/55 dark:text-white/55">{note}</p>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.asset.id}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group block w-full overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:border-black/30 dark:border-white/15 dark:hover:border-white/40"
              aria-label={`Enlarge: ${item.caption ?? item.alt}`}
            >
              <div className="relative bg-white" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={item.asset.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  loading="lazy"
                  className="object-contain p-3"
                />
                <span
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 opacity-0 transition group-hover:opacity-100"
                  aria-hidden
                >
                  <ZoomIn className="h-4 w-4 text-white" />
                </span>
              </div>
              <p className="border-t border-black/10 px-4 py-3 text-sm text-black/75 dark:border-white/10 dark:bg-black/40 dark:text-white/75">
                {item.caption ?? item.alt}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full border border-white/25 p-2 text-white transition hover:border-white/60"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-5xl overflow-auto rounded-2xl bg-white"
          >
            <div className="relative w-full" style={{ aspectRatio: aspectRatio(active.asset) }}>
              <Image
                src={active.asset.src}
                alt={active.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="border-t border-black/10 px-5 py-4 text-sm text-black/80">
              {active.caption ?? active.alt}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

export default ProjectArtifacts;
