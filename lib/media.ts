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
  DOCS,
  PHOTOS,
  PORTFOLIO_IMAGES,
  PROJECT_MEDIA,
  VIDEOS,
  type DocAsset,
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
export type ProjectSlug = keyof typeof PROJECT_MEDIA;
export type DocId = (typeof DOCS)[number]["id"];

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

/** One engineering artefact from a project folder, by project and file id. */
export function artifact<S extends ProjectSlug>(
  project: S,
  id: (typeof PROJECT_MEDIA)[S][number]["id"],
): ImageAsset {
  const found = PROJECT_MEDIA[project].find((a) => a.id === id);
  if (found === undefined) {
    throw new Error(`artifact "${id}" is not in project "${project}"`);
  }
  return found;
}

export const doc = (id: DocId): DocAsset => {
  const found = DOCS.find((d) => d.id === id);
  if (found === undefined) throw new Error(`doc "${id}" is not in the manifest`);
  return found;
};

/** Human-readable file size for a download link. */
export const fileSize = (bytes: number): string =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

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

/**
 * The one clip OKHub actually produced as marketing: branded, narrated, and
 * covering four projects. It keeps its audio (see VIDEO_POLICY in
 * scripts/build_media.py) and leads the showreel because of it.
 */
export const BRANDED_SHOWREEL: Captioned<VideoAsset> = captionedVideo(
  "okhub-showreel",
  "OKHub showreel covering the ChatGPT IoT assistant, restaurant serving robot, Yoruba IoT and multi-navigation robot",
  // No caption: the poster is a branded card that already carries its own
  // title, and an overlay would sit straight on top of the wordmark.
);

// ---------------------------------------------------------------------------
// Project artefacts
// ---------------------------------------------------------------------------

/**
 * Schematics, flowcharts, CAD and firmware from the actual build files, with
 * captions written against what each drawing shows. These are what make a
 * portfolio page credible: anyone technical can read a circuit and tell whether
 * the project is real.
 */
const art = (
  project: ProjectSlug,
  id: string,
  alt: string,
  caption: string,
): Captioned<ImageAsset> => ({
  // The per-project id union is not narrowable through this helper, so the
  // lookup is checked at runtime; artifact() throws on a bad id and
  // scripts/verify-media.mjs fails the build before that can ship.
  asset: PROJECT_MEDIA[project].find((a) => a.id === id) ??
    (() => { throw new Error(`artifact "${id}" is not in project "${project}"`); })(),
  alt,
  caption,
});

export const SERVING_ROBOT_ARTIFACTS: readonly Captioned<ImageAsset>[] = [
  art("serving-robot", "05-assembled-robot",
      "Four photographs of the assembled robot: two circular decks on posts, with an HC-SR04 ultrasonic sensor and antenna mounted on the lower deck",
      "The robot, assembled and wired"),
  art("serving-robot", "02-circuit-and-uml",
      "Circuit diagram: Arduino Mega 2560 with an L298 motor driver, HC-SR04 ultrasonic sensor, servo, buzzer and speaker, alongside an ESP32; below it a UML sequence diagram of the HTTP request flow between diner, ESP32 server and navigation",
      "Arduino Mega 2560, L298 driver, ESP32 web server"),
  art("serving-robot", "01-cad-concept",
      "Isometric CAD concept of the robot, shown shaded and as a wireframe",
      "CAD concept: tray deck, column, drive base"),
  art("serving-robot", "06-cad-assembly",
      "Five CAD views of the chassis: wireframe, shaded, the drive base alone and the full two-deck assembly",
      "Chassis modelled before anything was cut"),
  art("serving-robot", "07-laser-cut-layout",
      "The chassis parts nested on a sheet in Thunder Laser cutting software, cut layer set to 30% power at 100mm per second",
      "Nested for the laser cutter"),
  art("serving-robot", "10-navigation-flow",
      "Flowchart: scan area for obstacles, check for obstacle, navigate around it, move to table, play selected language, return to base",
      "Navigation loop"),
  art("serving-robot", "09-motion-firmware",
      "Robot firmware: a weight check triggers movement to the table, and removing the tray plays the voice file for that table and sends the robot back to base",
      "Tray on, it goes. Tray off, it speaks and returns"),
  art("serving-robot", "03-order-flow",
      "Flowchart: IP address, display HTML form, handle form submit, store form data, redirect to chef page, display submitted data",
      "Order flow, diner to kitchen"),
  art("serving-robot", "08-esp32-web-firmware",
      "ESP32 firmware in the Arduino IDE building the order form, with language options for Yoruba, English, Igbo and Hausa and table numbers 1a, 1b, 2a and 2b",
      "The form is served by the ESP32 itself"),
  art("serving-robot", "04-order-and-chef-pages",
      "The order form at 192.168.4.1 with Yoruba selected, and the chef page at 192.168.4.1/chef showing the submitted name, phone, language, table and food type",
      "What the diner sees, and what the kitchen sees"),
  art("serving-robot", "11-yoruba-order-form",
      "The restaurant order form rendered with Yoruba as the selected language",
      "Ordering in Yoruba"),
  art("yoruba-nlp", "01-lstm-architecture",
      "Model diagram: Yoruba text sequence, word embedding, LSTM cell, prediction or correction, with a training loop and evaluation metrics",
      "LSTM behind the Yoruba text handling"),
];

export const HEALTH_MONITOR_ARTIFACTS: readonly Captioned<ImageAsset>[] = [
  art("health-monitor", "02-block-diagram",
      "Block diagram: temperature, heart rate and ECG sensors into an Arduino, out to an LCD and an ESP8266 that sends a Twilio SMS",
      "Sensors in, LCD and SMS out"),
  art("health-monitor", "01-circuit",
      "Circuit diagram: heartbeat sensor and I2C LCD wired to an ESP8266 on a 5V supply",
      "Heartbeat sensor, ESP8266, I2C LCD"),
  art("health-monitor", "03-arduino-flow",
      "Flowchart: initialise components, read sensors, update temperature, heart rate and ECG readings, display on LCD, send to ESP8266",
      "Arduino loop"),
  art("health-monitor", "04-esp8266-flow",
      "Flowchart: initialise WiFi, check serial data over UART, update web server data, check abnormal condition, send SMS notification",
      "ESP8266 loop, SMS on abnormal reading"),
];

export const HYDROPONICS_ARTIFACTS: readonly Captioned<ImageAsset>[] = [
  art("hydroponics", "01-schematic",
      "Schematic: SMPS power supply, Arduino Nano, pH meter, water sensor, MQ-2 gas sensor, LM35 temperature sensor, LDR, water pump, grow light and a SIM900D GSM module",
      "pH, water, gas, temperature and light on one Arduino Nano, with GSM alerts"),
];

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------

export const ROBOTICS_GUIDE = doc("beginners-guide-to-autonomous-robots");

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
