"use client";

import { useEffect } from "react";
import { Instagram } from "lucide-react";

import { INSTAGRAM, INSTAGRAM_REELS } from "@/lib/contact";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT = "https://www.instagram.com/embed.js";

/**
 * The three most recent reels, rendered through Instagram's own embed.
 *
 * Instagram serves captions behind a login wall, so writing our own titles for
 * these would be inventing them. The embed shows the real video with the real
 * caption instead. If the script is blocked — an ad blocker, a strict network,
 * JavaScript off — the blockquote degrades to a plain link to the post, which
 * is why the markup is a <blockquote> with a real <a> inside rather than an
 * empty div waiting to be filled.
 */
const ReelsSection = () => {
  useEffect(() => {
    // Already loaded (a client-side nav back to this page): just re-process.
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => window.instgrm?.Embeds.process(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = EMBED_SCRIPT;
    script.async = true;
    script.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(script);
  }, []);

  return (
    <section className="container-default section-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
            From the workshop
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-black dark:text-white">
            Recent builds, on video.
          </h2>
        </div>
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-gold-ink underline underline-offset-4 hover:opacity-80"
        >
          <Instagram className="h-4 w-4" />
          Follow on Instagram
        </a>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {INSTAGRAM_REELS.map((permalink) => (
          <div
            key={permalink}
            className="overflow-hidden rounded-2xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5"
          >
            <blockquote
              className="instagram-media w-full"
              data-instgrm-permalink={permalink}
              data-instgrm-version="14"
              style={{ margin: 0, width: "100%", minWidth: 0 }}
            >
              <a
                href={permalink}
                target="_blank"
                rel="noreferrer"
                className="block p-5 text-black/70 underline underline-offset-4 hover:text-black dark:text-white/70 dark:hover:text-white"
              >
                Watch this reel on Instagram
              </a>
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReelsSection;
