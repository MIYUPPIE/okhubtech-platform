import { Instagram } from "lucide-react";

import { INSTAGRAM, REELS, reelEmbed, reelPermalink, type Reel } from "@/lib/contact";

const runtime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Reels from the Instagram account, played inline.
 *
 * This deliberately does not use Instagram's embed.js. That script rewrites a
 * <blockquote> into an iframe on the client, which means the players only
 * appear if the script loads — an ad blocker, a strict network or a slow
 * connection and the section renders as three empty boxes. The /reel/<id>/embed/
 * iframe is Instagram's own player and is plain markup, so it ships in the
 * static export and works with no JavaScript of ours at all.
 *
 * `loading="lazy"` keeps three third-party players off the critical path, and
 * the title and caption below each one are real text on the page rather than
 * pixels inside someone else's iframe, so they are readable, searchable and
 * translatable even if Instagram is blocked entirely.
 */
const ReelCard = ({ reel }: { reel: Reel }) => (
  <figure className="flex flex-col overflow-hidden rounded-2xl border border-black/15 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-white/5">
    <div className="relative w-full bg-black/5 dark:bg-white/5" style={{ aspectRatio: "9 / 14" }}>
      <iframe
        src={reelEmbed(reel.id, reel.kind)}
        title={reel.title}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
    <figcaption className="flex flex-1 flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg text-black dark:text-white">{reel.title}</h3>
        <span className="shrink-0 text-xs tabular-nums text-black/50 dark:text-white/50">
          {runtime(reel.seconds)}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm text-black/70 dark:text-white/70">{reel.blurb}</p>
      <a
        href={reelPermalink(reel.id, reel.kind)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 text-sm text-gold-ink underline underline-offset-4 hover:opacity-80"
      >
        Open on Instagram ↗
      </a>
    </figcaption>
  </figure>
);

const ReelsSection = ({ heading = "Recent builds, on video." }: { heading?: string }) => (
  <section className="container-default section-shell">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-black/50 dark:text-white/50">
          From the workshop
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-black dark:text-white">
          {heading}
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

    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {REELS.map((reel) => (
        <ReelCard key={reel.id} reel={reel} />
      ))}
    </div>
  </section>
);

export { ReelCard };
export default ReelsSection;
