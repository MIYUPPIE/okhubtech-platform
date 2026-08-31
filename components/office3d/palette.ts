/**
 * Two lighting states for one room.
 *
 * The office is the same geometry day and night; only the light and the
 * surface colours change, so the whole look lives in this table rather than
 * being scattered through the mesh components. `day` matches the site's
 * #fafafa ground, `night` matches #000. Both keep the brand gold as the only
 * saturated colour in the room, which is what makes the emissive strips and
 * the marker rings read as OKHub rather than as generic sci-fi.
 */

export type Palette = {
  /** Clear colour behind the open front edge and past the window. */
  readonly background: string;
  readonly fog: readonly [string, number, number];
  readonly floor: string;
  readonly floorRoughness: number;
  readonly rug: string;
  readonly wall: string;
  readonly ceiling: string;
  readonly trim: string;
  /** Desk tops, shelves, bench top. */
  readonly wood: string;
  /** Frames, legs, rack, arm castings. */
  readonly metal: string;
  readonly metalRoughness: number;
  readonly fabric: string;
  readonly glass: string;
  readonly glassOpacity: number;
  /** Screen face when a screen is dark. */
  readonly screenOff: string;
  readonly screenGlow: number;
  /** Sky seen through the right-hand window band. */
  readonly skyTop: string;
  readonly skyBottom: string;
  readonly sun: { readonly color: string; readonly intensity: number };
  readonly hemi: { readonly sky: string; readonly ground: string; readonly intensity: number };
  readonly ambient: number;
  /** Emissive strength of the ceiling coves and the gold accent lines. */
  readonly coveIntensity: number;
  readonly goldIntensity: number;
  readonly envIntensity: number;
  readonly bloom: { readonly strength: number; readonly threshold: number };
};

export const GOLD = "#ffd700";
export const GOLD_DEEP = "#f7b801";

export const PALETTES: Readonly<Record<"day" | "night", Palette>> = {
  day: {
    background: "#dfe3ea",
    // Near/far are pushed well past the far wall on purpose. At 22/46 the fog
    // sat on every surface in the room and turned the whole shot into grey
    // milk; it is here for depth beyond the window, not for atmosphere inside.
    fog: ["#dfe3ea", 38, 96],
    floor: "#bdb6ab",
    floorRoughness: 0.5,
    rug: "#a89f91",
    // Deliberately not near-white. #f0eeea under a 2.5-intensity sun and ACES
    // tone mapping clips to flat white and the room loses every edge it has.
    wall: "#e2dfd8",
    ceiling: "#eeece7",
    trim: "#cbc6bc",
    wood: "#c09468",
    metal: "#8f959d",
    metalRoughness: 0.34,
    fabric: "#535b66",
    glass: "#cfe0ea",
    glassOpacity: 0.16,
    screenOff: "#1d2128",
    screenGlow: 0.5,
    skyTop: "#9ec5e8",
    skyBottom: "#f6e7c8",
    sun: { color: "#fff2d8", intensity: 2.3 },
    hemi: { sky: "#eaf1f8", ground: "#b5aa98", intensity: 0.8 },
    ambient: 0.2,
    coveIntensity: 0.8,
    goldIntensity: 0.7,
    envIntensity: 0.85,
    bloom: { strength: 0.15, threshold: 0.9 },
  },
  night: {
    background: "#050608",
    fog: ["#05070a", 34, 88],
    floor: "#15171c",
    floorRoughness: 0.42,
    rug: "#1b1e24",
    wall: "#1a1d23",
    ceiling: "#131519",
    trim: "#262a31",
    wood: "#7a5f3c",
    metal: "#7c828b",
    metalRoughness: 0.28,
    fabric: "#2a2f38",
    glass: "#16222c",
    glassOpacity: 0.22,
    screenOff: "#0a0c10",
    // Every one of these used to be roughly double. Emissive surfaces that
    // skip tone mapping feed the bloom pass raw, and at the old values the
    // coves, the gold lines and eleven screens summed to a white smear with
    // the furniture lost inside it.
    screenGlow: 0.85,
    skyTop: "#050810",
    skyBottom: "#1d2436",
    sun: { color: "#9fb6d8", intensity: 0.4 },
    hemi: { sky: "#1b2230", ground: "#08090c", intensity: 0.3 },
    ambient: 0.14,
    coveIntensity: 1.15,
    goldIntensity: 1.2,
    envIntensity: 0.35,
    bloom: { strength: 0.34, threshold: 0.78 },
  },
};

export type Mode = keyof typeof PALETTES;
