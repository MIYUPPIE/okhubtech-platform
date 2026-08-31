/**
 * Editorial layer over the generated media manifest.
 *
 * `lib/media.generated.ts` knows what files exist and how big they are.
 * This module knows what they *mean*: which shot goes where, and what each one
 * says to a screen reader. Keeping the two apart means re-running the asset
 * pipeline never clobbers hand-written alt text.
 *
 * Every id below is checked at compile time against the manifest's literal
 * union, so deleting a master and rebuilding turns every stale reference into a
 * type error rather than a broken image in production.
 */

import {
  BRAND,
  PHOTOS,
  PORTFOLIO_IMAGES,
  VIDEOS,
  type ImageAsset,
  type MediaAsset,
  type VideoAsset,
} from "./media.generated";

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export type PhotoId = (typeof PHOTOS)[number]["id"];
export type VideoId = (typeof VIDEOS)[number]["id"];
export type PortfolioImageId = (typeof PORTFOLIO_IMAGES)[number]["id"];
export type BrandId = keyof typeof BRAND;

const byId = <T extends { readonly id: string }>(
  items: readonly T[],
  label: string,
): ((id: T["id"]) => T) => {
  const index = new Map(items.map((item) => [item.id, item]));
  return (id) => {
    const found = index.get(id);
    if (found === undefined) {
      // Unreachable while ids come from the manifest's literal union; this
      // catches a manifest regenerated out from under a stale build.
      throw new Error(`${label} "${id}" is not in the media manifest`);
    }
    return found;
  };
};

export const photo: (id: PhotoId) => ImageAsset = byId(PHOTOS, "photo");
export const video: (id: VideoId) => VideoAsset = byId(VIDEOS, "video");
export const portfolioImage: (id: PortfolioImageId) => ImageAsset = byId(
  PORTFOLIO_IMAGES,
  "portfolio image",
);
export const brand = (id: BrandId): ImageAsset => BRAND[id];

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export const isImage = (asset: MediaAsset): asset is ImageAsset => asset.kind === "image";
export const isVideo = (asset: MediaAsset): asset is VideoAsset => asset.kind === "video";

/** Aspect ratio as a CSS `aspect-ratio` value, so slots reserve space pre-load. */
export function aspectRatio(asset: MediaAsset): string {
  switch (asset.kind) {
    case "image":
    case "video":
      return `${asset.width} / ${asset.height}`;
    default: {
      const exhaustive: never = asset;
      throw new Error(`unhandled media kind: ${String(exhaustive)}`);
    }
  }
}

export const isPortrait = (asset: MediaAsset): boolean => asset.height > asset.width;

// ---------------------------------------------------------------------------
// Captioned media
// ---------------------------------------------------------------------------

export type Captioned<A extends MediaAsset = MediaAsset> = {
  readonly asset: A;
  /** Required. Every asset here is content, not decoration. */
  readonly alt: string;
  readonly caption?: string;
};

const captionedPhoto = (id: PhotoId, alt: string, caption?: string): Captioned<ImageAsset> =>
  caption === undefined ? { asset: photo(id), alt } : { asset: photo(id), alt, caption };

const captionedVideo = (id: VideoId, alt: string, caption?: string): Captioned<VideoAsset> =>
  caption === undefined ? { asset: video(id), alt } : { asset: video(id), alt, caption };

// ---------------------------------------------------------------------------
// Curated placements
// ---------------------------------------------------------------------------

/**
 * Hero. A 4.9s clip of students wiring an actuator - the shortest master, so it
 * loops without a visible seam and costs 0.5MB.
 */
export const HERO_LOOP: Captioned<VideoAsset> = captionedVideo(
  "students-actuator-class",
  "Students wiring an actuator circuit during a practical robotics class",
);

/** The offline AI assistant build, shown as proof rather than described in prose. */
export const ASSISTANT_PROOF: readonly Captioned<ImageAsset>[] = [
  captionedPhoto(
    "img-20230703-112603",
    "OLED display reading WIFI IS CONNECTED, ASK YOUR QUESTIONS, with a local IP address",
    "Boots, joins the network, waits.",
  ),
  captionedPhoto(
    "img-20230703-135608",
    "OLED display showing a question about the world's surface area and the assistant's answer",
    "Answers on-device.",
  ),
];

/** Robotics build log. Wide shots first so the grid opens on something legible. */
export const BUILD_LOG: readonly Captioned<ImageAsset>[] = [
  captionedPhoto("img-20230629-151725", "Three-wheeled robot chassis lit by green indicator LEDs"),
  captionedPhoto("img-20230606-084628", "Laser-cut acrylic chassis parts laid out before assembly"),
  captionedPhoto("img-20221108-174224", "Breadboard prototype with ultrasonic sensors under green light"),
  captionedPhoto("img-20230629-151748", "Robot chassis from above, showing motor driver and battery pack"),
  captionedPhoto("img-20230702-060318", "ESP32 microcontroller wired to an OLED display on a breadboard"),
  captionedPhoto("img-20230612-205328", "Robot base plate with geared motors and wheels fitted"),
  captionedPhoto("img-20230629-151758", "Assembled rover with drive wheel and control boards in place"),
  captionedPhoto("img-20230701-231249", "OLED wired to a microcontroller mid-test on a breadboard"),
];

/** Training clips. Poster-first; nothing autoplays except the hero. */
export const SHOWREEL: readonly Captioned<VideoAsset>[] = [
  captionedVideo(
    "computer-vision-class",
    "Computer vision class: live object detection drawing labelled boxes around a room",
    "Computer vision",
  ),
  captionedVideo(
    "school-robotics-class",
    "School robotics session with a student-built rover driving across the floor",
    "Robotics in schools",
  ),
  captionedVideo(
    "actuator-serial-test",
    "Servo actuator under test with live readings on a serial monitor",
    "Actuator testing",
  ),
  captionedVideo(
    "why-children-learn-tech",
    "Training session explaining why children learn robotics and sensor programming",
    "Why we teach",
  ),
];

export const WORKBENCH_LOOP: Captioned<VideoAsset> = captionedVideo(
  "components-workbench",
  "Sensors, servos and controller boards laid out across a workbench",
);

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const LOGO = {
  light: brand("wordmark-light"),
  dark: brand("wordmark-dark"),
  markLight: brand("mark-light"),
  markDark: brand("mark-dark"),
  og: brand("og"),
} as const satisfies Record<string, ImageAsset>;

export const LOGO_ALT = "OKHub Technology";
