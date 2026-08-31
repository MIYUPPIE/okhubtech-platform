/**
 * The six places you can stand in the OKHub office, and where each one goes.
 *
 * This is the single source of truth shared by three consumers that must not
 * drift apart:
 *
 *   1. `OfficeStage` renders one <a> per station into the static HTML, so the
 *      page has real content and real links with WebGL, without WebGL, and
 *      with JavaScript switched off entirely.
 *   2. `CameraRig` flies to `camera`/`target` when a station is selected.
 *   3. `scripts/verify-home.mjs` parses this file and fails the build if any
 *      href stops resolving to a directory in out/.
 *
 * Coordinates are metres in the room's own space: X runs -9..9 (left to
 * right), Z runs -5.5..5.5 (back wall to open front edge), Y is up from the
 * floor at 0 to the ceiling at 3.4. `camera` is an absolute eye position, not
 * an offset - authoring an explicit eye point is far easier to reason about
 * than spherical angles, and CameraRig converts it on selection.
 */

export type Vec3 = readonly [number, number, number];

export type Station = {
  /** Stable id. Used for keyboard order, DOM ids and the URL hash. */
  readonly id: string;
  /** Two or three words, shown on the floor marker and the rail chip. */
  readonly label: string;
  /** The room word for it, shown above the panel title. */
  readonly eyebrow: string;
  /** One sentence. No adjectives that a photograph could not prove. */
  readonly blurb: string;
  /** Where the chip and the panel button link to. Must exist in the export. */
  readonly href: string;
  /** Text on the panel's call to action. */
  readonly cta: string;
  /** Eye position for this station's framing. */
  readonly camera: Vec3;
  /** Point the camera looks at, and the point the rig orbits around. */
  readonly target: Vec3;
  /** Floor marker position - the glowing ring you click in the scene. */
  readonly marker: Vec3;
  /** Half-extents of the invisible click volume around `marker`. */
  readonly hit: Vec3;
};

/**
 * The establishing shot: the whole floor, seen from past the open front edge.
 *
 * The target sits left of the room's visual mass on purpose. lookAt centres
 * the target, so aiming left of centre pushes the benches, the data wall and
 * the dev pod into the right half of the frame - which is the half the hero
 * copy does not sit on.
 */
export const OVERVIEW = {
  camera: [-1.5, 5.6, 15.0] as Vec3,
  target: [-2.0, 0.9, -1.2] as Vec3,
} as const;

/**
 * Typed as a non-empty tuple, not `Station[]`, so `cycle()` and `ORDER[0]`
 * are provably safe under `noUncheckedIndexedAccess` without an assertion.
 */
export const STATIONS: readonly [Station, ...Station[]] = [
  {
    id: "training",
    label: "Training floor",
    eyebrow: "Training floor",
    blurb:
      "Two rows of benches and a whiteboard. The current 4IR Bootcamp cohort ships six working systems, not six slide decks.",
    href: "/bootcamp",
    cta: "See the bootcamp",
    camera: [-4.2, 2.0, 3.4],
    target: [-5.4, 1.1, -2.0],
    marker: [-5.4, 0.02, -1.6],
    hit: [2.6, 1.2, 2.2],
  },
  {
    id: "workbench",
    label: "Robotics bench",
    eyebrow: "Robotics bench",
    blurb:
      "The arm, the rover chassis and the tool board. Everything on the build log left this bench before it left the building.",
    href: "/studio",
    cta: "Open the build log",
    camera: [1.6, 1.75, 0.6],
    target: [1.0, 1.0, -3.7],
    marker: [1.0, 0.02, -3.3],
    hit: [2.2, 1.2, 1.2],
  },
  {
    id: "gallery",
    label: "Project wall",
    eyebrow: "Project wall",
    blurb:
      "Twelve delivered projects on one wall - agriculture, health, fraud detection, campus systems, and the robots.",
    href: "/portfolio",
    cta: "Browse the portfolio",
    camera: [-4.6, 1.8, 2.4],
    target: [-8.7, 1.7, 2.0],
    marker: [-8.5, 0.02, 2.0],
    hit: [0.9, 1.6, 2.4],
  },
  {
    id: "datawall",
    label: "Data wall",
    eyebrow: "Data wall",
    blurb:
      "Rack, pipelines and the boards that read off them. Data that stays in the country it was collected in.",
    href: "/data",
    cta: "See the data practice",
    camera: [4.6, 1.9, -0.9],
    target: [7.2, 1.4, -3.6],
    marker: [7.3, 0.02, -3.4],
    hit: [1.6, 1.4, 1.3],
  },
  {
    id: "devpod",
    label: "Dev pod",
    eyebrow: "Dev pod",
    blurb:
      "Where LogSME and the rest of the catalogue get written, reviewed and shipped.",
    href: "/products",
    cta: "See the products",
    camera: [2.6, 1.9, 4.4],
    target: [5.8, 1.15, 2.4],
    marker: [5.8, 0.02, 2.4],
    hit: [2.0, 1.2, 1.8],
  },
  {
    id: "frontdesk",
    label: "Front desk",
    eyebrow: "Front desk",
    blurb:
      "Ibadan, Oyo State. One inbox, one number, and somebody who answers both.",
    href: "/contact",
    cta: "Talk to us",
    camera: [-1.4, 1.7, 8.6],
    target: [-1.2, 1.1, 4.3],
    // Off to the side of the counter, not in front of the sign it stands next
    // to: at x -1.2 the floating label sat directly over the "OKHub" sign
    // panel from the establishing shot, and the two ran their text together.
    marker: [0.6, 0.02, 3.75],
    hit: [1.3, 1.2, 0.9],
  },
] as const;

export const stationById = (id: string | null): Station | null =>
  id === null ? null : (STATIONS.find((s) => s.id === id) ?? null);

export const stationIndex = (id: string | null): number =>
  id === null ? -1 : STATIONS.findIndex((s) => s.id === id);
