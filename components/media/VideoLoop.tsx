"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { aspectRatio, type Captioned } from "@/lib/media";
import type { VideoAsset } from "@/lib/media.generated";

type VideoLoopProps = {
  readonly item: Captioned<VideoAsset>;
  readonly className?: string;
  /** Fill the parent instead of sizing to the asset's own aspect ratio. */
  readonly fill?: boolean;
};

/**
 * A muted, looping background clip.
 *
 * Three things it does that a bare <video autoPlay loop> does not:
 *
 *  - Honours `prefers-reduced-motion`. Readers who ask for stillness get the
 *    poster frame and no playback at all.
 *  - Only plays while on screen, via IntersectionObserver. Seven autoplaying
 *    clips decoding off-screen is what makes a media-heavy page stutter.
 *  - Renders the poster as a real <Image> underneath, so there is something to
 *    look at before the first frame decodes and if playback is blocked.
 */
export function VideoLoop({ item, className = "", fill = false }: VideoLoopProps) {
  const { asset, alt } = item;
  const ref = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (el === null || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        if (entry.isIntersecting) {
          // Autoplay can still be refused (low power mode); the poster stays up.
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // `fill` must actually take the element out of flow. Emitting both `relative`
  // and `absolute` does not work: Tailwind defines `.relative` after
  // `.absolute`, so `relative` wins, the element stays in flow, and `h-full`
  // against an auto-height parent resolves to zero. That rendered the showreel
  // banner as a plain black bar with no footage behind it.
  const positioning = fill ? "absolute inset-0 h-full w-full" : "relative";
  const style = fill ? undefined : { aspectRatio: aspectRatio(asset) };

  return (
    <div className={`${positioning} overflow-hidden ${className}`} style={style}>
      <Image
        src={asset.poster}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {!reduceMotion && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={asset.poster}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={asset.src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

export default VideoLoop;
