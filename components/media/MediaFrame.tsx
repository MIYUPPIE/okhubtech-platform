"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

import { aspectRatio, type Captioned } from "@/lib/media";
import type { MediaAsset } from "@/lib/media.generated";

type MediaFrameProps = {
  readonly item: Captioned<MediaAsset>;
  readonly sizes?: string;
  readonly className?: string;
  /** Prefer the small derivative. Grids should; feature slots should not. */
  readonly thumb?: boolean;
  readonly priority?: boolean;
  /**
   * Override the asset's own ratio, e.g. "4 / 3". Needed wherever a grid mixes
   * square and vertical sources and the row has to line up.
   */
  readonly aspect?: string;
};

/**
 * Renders whichever kind of media it is handed.
 *
 * The `kind` discriminant drives an exhaustive switch, so adding a third media
 * kind to the manifest fails the build here instead of silently rendering
 * nothing.
 */
export function MediaFrame({
  item,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className = "",
  thumb = false,
  priority = false,
  aspect,
}: MediaFrameProps) {
  const { asset } = item;
  const ratio = aspect ?? aspectRatio(asset);

  switch (asset.kind) {
    case "image":
      return (
        <figure
          className={`relative overflow-hidden ${className}`}
          style={{ aspectRatio: ratio }}
        >
          <Image
            src={thumb && asset.thumb !== null ? asset.thumb : asset.src}
            alt={item.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
          {item.caption !== undefined && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-xs text-white">
              {item.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <PlayableVideo
          item={item as Captioned<typeof asset>}
          className={className}
          sizes={sizes}
          ratio={ratio}
        />
      );

    default: {
      const exhaustive: never = asset;
      throw new Error(`unhandled media kind: ${String(exhaustive)}`);
    }
  }
}

type PlayableVideoProps = {
  readonly item: Captioned<Extract<MediaAsset, { kind: "video" }>>;
  readonly className: string;
  readonly sizes: string;
  readonly ratio: string;
};

/**
 * Poster until asked. Nothing here autoplays: these clips carry burned-in
 * captions and are meant to be watched, not used as wallpaper.
 */
function PlayableVideo({ item, className, sizes, ratio }: PlayableVideoProps) {
  const [playing, setPlaying] = useState(false);
  const { asset, alt, caption } = item;

  return (
    <figure
      className={`group relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {playing ? (
        <video
          src={asset.src}
          controls
          autoPlay
          loop
          playsInline
          aria-label={alt}
          className="absolute inset-0 h-full w-full bg-black object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`Play: ${alt}`}
        >
          <Image src={asset.poster} alt={alt} fill sizes={sizes} className="object-cover" />
          <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
          <span
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/55 backdrop-blur transition group-hover:scale-110"
            aria-hidden
          >
            <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
          </span>
        </button>
      )}
      {caption !== undefined && !playing && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-sm font-medium text-white">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default MediaFrame;
