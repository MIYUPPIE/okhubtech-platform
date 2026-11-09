/**
 * The kit catalogue: electronics and robotics kits OKHub sells.
 *
 * Single source of truth for /kits, the kit packs on /schools, and the kit
 * cards anywhere else on the site. Every price here is checked by
 * scripts/verify-kits.mjs against two things it cannot drift from:
 *
 *  - docs/secondary-school-partnership/content.py, the data behind the schools
 *    sales document, which is itself tested against the customer catalogue;
 *  - assets/OkhubTech-CUSTOMER-Catalog-2024.pdf, when it is present.
 *
 * Rules for what goes in here:
 *
 *  - Prices are naira, exactly as printed in the catalogue. `price` is the
 *    selling price, `listPrice` the struck-through one.
 *  - Contents and builds are the catalogue's own bullets, reworded only for
 *    plain English. Nothing is added that the catalogue does not say.
 *  - No guarantees or popularity claims. The catalogue prints "High Marks
 *    Guaranteed" and "Bestseller"; neither is something we can stand behind
 *    on a public page, so neither is here. The gate rejects both.
 *
 * Deliberately import-free: Node runs this file directly (type stripping) in
 * the gate, so it cannot reach for the "@/" alias.
 */

export type KitVariant = {
  readonly label: string;
  readonly price: number;
};

export type Kit = {
  /** URL fragment on /kits and the photo id in public/media/kits/. */
  readonly slug: string;
  readonly name: string;
  /** One line under the name. */
  readonly tagline: string;
  /** Short label on the card, from the catalogue's corner badge. */
  readonly badge: string;
  /** Marked [NEW] in the current catalogue. */
  readonly isNew: boolean;
  readonly price: number;
  readonly listPrice: number;
  /** Other configurations printed against this kit. */
  readonly variants: readonly KitVariant[];
  /** What is in the box. */
  readonly contents: readonly string[];
  /** What you can build with it. */
  readonly builds: readonly string[];
  /** Class levels the schools programme uses it for. */
  readonly level: string;
  /** Chapters of Robotics for Everyone it supports. */
  readonly chapters: readonly number[];
};

const KITS_DATA: Kit[] = [
  {
    slug: "ignite-genesis",
    name: "Ignite Genesis",
    tagline: "The most complete starter kit. Where most people should begin.",
    badge: "Best for beginners",
    isNew: false,
    price: 65500,
    listPrice: 78000,
    variants: [],
    contents: [
      "Arduino UNO R3 and a Mega2560-compatible board",
      "LCD 1602, DHT11 temperature sensor, IR remote, joystick",
      "Servo, stepper motor and driver, 7-segment display, buzzer",
      "LEDs, resistors, buttons, breadboard and power module",
    ],
    builds: [
      "50+ projects, each with a tutorial, code and video",
      "First circuits, first sketches, first sensors and motors",
    ],
    level: "JSS1 to JSS2",
    chapters: [4, 5, 6],
  },
  {
    slug: "sentinel-rfid-lab",
    name: "Sentinel RFID Lab",
    tagline: "A smart security kit built around card and keypad access.",
    badge: "Final year project",
    isNew: false,
    price: 60500,
    listPrice: 72000,
    variants: [],
    contents: [
      "RFID RC522 reader with 2 cards and a key fob",
      "4x4 keypad, relay module and a servo for the door lock",
      "LCD 1602 display, IR remote and buzzer",
      "Project code and circuit diagrams",
    ],
    builds: [
      "Door access system",
      "Attendance system",
      "Smart safe",
      "RFID car park",
    ],
    level: "SS1 to SS2",
    chapters: [9],
  },
  {
    slug: "sensorverse-22",
    name: "Sensorverse 22",
    tagline: "Twenty-two sensor modules in one box.",
    badge: "22 sensors",
    isNew: false,
    price: 38000,
    listPrice: 45000,
    variants: [{ label: "With an Arduino UNO", price: 58500 }],
    contents: [
      "PIR, ultrasonic, soil, flame, touch, rain and sound sensors",
      "Hall effect, vibration, IR tracking, laser and buzzer modules",
      "DS18B20 temperature, water level and tilt sensors",
      "Dupont cables",
    ],
    builds: ["Weather station", "Smart farm", "Intruder alarm"],
    level: "JSS2 to JSS3",
    chapters: [7, 8],
  },
  {
    slug: "rover-m2",
    name: "Rover M2",
    tagline: "A 2WD smart robot car: the first robot that moves.",
    badge: "Robotics",
    isNew: false,
    price: 45500,
    listPrice: 55000,
    variants: [
      { label: "With an Arduino UNO", price: 68000 },
      { label: "WiFi version", price: 80000 },
    ],
    contents: [
      "2WD acrylic chassis, TT motors and wheels",
      "L298N motor driver and ultrasonic sensor",
      "IR line-tracking and obstacle-avoidance modules",
      "Battery box, screws and cables",
    ],
    builds: ["Line follower", "Obstacle avoider", "Bluetooth car"],
    level: "JSS3 to SS1",
    chapters: [12, 13],
  },
  {
    slug: "picode-lab",
    name: "PiCode Lab",
    tagline: "Python on real hardware, with the Raspberry Pi Pico RP2040.",
    badge: "Python",
    isNew: false,
    price: 40500,
    listPrice: 48000,
    variants: [],
    contents: [
      "RP2040 board: dual core, MicroPython and C++",
      "LCD 1602, DHT11, IR receiver, buttons and buzzer",
      "LEDs, resistors, potentiometer, breadboards and jumper box",
    ],
    builds: [
      "MicroPython projects in the Thonny IDE",
      "The same chip as the Pico W, so the code carries over to WiFi",
    ],
    level: "SS1 to SS2",
    chapters: [6],
  },
  {
    slug: "rover-sense-iot",
    name: "Rover Sense IoT",
    tagline: "A WiFi robot that streams what its sensors read to your phone.",
    badge: "IoT",
    isNew: true,
    price: 95000,
    listPrice: 112000,
    variants: [],
    contents: [
      "2WD robot car with 22 sensors",
      "ESP32 WiFi board for control and data streaming",
      "Arduino UNO, so the robot runs on two boards",
      "Blynk app dashboard to read the sensors on a phone",
    ],
    builds: [
      "Environmental monitoring robot",
      "Temperature, soil and distance readings streamed to the cloud",
    ],
    level: "SS2 to SS3",
    chapters: [9, 13],
  },
  {
    slug: "rover-guard-iot",
    name: "Rover Guard IoT",
    tagline: "An RFID security robot you unlock from your phone.",
    badge: "Security robot",
    isNew: true,
    price: 117000,
    listPrice: 138000,
    variants: [],
    contents: [
      "2WD robot car with the RFID kit",
      "ESP32 WiFi board for phone unlock and cloud logging",
      "RFID RC522 with cards, keypad, servo gate and LCD",
    ],
    builds: [
      "RFID patrol robot",
      "Attendance bot",
      "Phone unlock over WiFi",
    ],
    level: "SS2 to SS3",
    chapters: [9, 13],
  },
  {
    slug: "rover-ultimate-x",
    name: "Rover Ultimate-X",
    tagline: "The everything kit. One box covers a whole semester lab.",
    badge: "Flagship",
    isNew: false,
    price: 158999,
    listPrice: 195000,
    variants: [{ label: "Invoiced to schools and labs", price: 175000 }],
    contents: [
      "2WD car, 22 sensors and the full RFID kit",
      "ESP32 and ESP32-CAM for live video and vision",
      "2 Arduino UNO boards, breadboards, every module and an OLED display",
    ],
    builds: [
      "Surveillance robot with a live camera feed",
      "RFID security gate",
      "Sensor dashboard",
      "Object detection on the camera",
    ],
    level: "SS2 to SS3, and staff training",
    chapters: [9, 13, 15],
  },
];

/** Catalogue order is the curated order. */
export const KITS: readonly Kit[] = KITS_DATA;

export const kitBySlug = (slug: string): Kit | undefined => KITS.find((k) => k.slug === slug);

/** What every kit ships with, from the catalogue's footer line and "Why OKHub". */
export const KIT_PROMISES = [
  { title: "Tested", detail: "Every component is tested before it ships." },
  { title: "Tutorial", detail: "A free PDF tutorial with video, Arduino code and MicroPython code." },
  { title: "Support", detail: "One year of WhatsApp support. We help you build it." },
  { title: "Delivery", detail: "Lagos in 24 hours. Elsewhere in Nigeria in 2 to 3 days, by GIG or DHL." },
  { title: "Payment", detail: "Bank transfer, or pay on delivery in Lagos and Ibadan." },
] as const;

// ------------------------------------------------------------ school discount

/** "Buy 5+ kits - 5% off | Buy 10+ - 10% off". Counted across the whole order. */
export const DISCOUNT_TIERS = [
  { minQty: 10, rate: 0.1 },
  { minQty: 5, rate: 0.05 },
] as const;

export function discountRate(qty: number): number {
  for (const tier of DISCOUNT_TIERS) {
    if (qty >= tier.minQty) return tier.rate;
  }
  return 0;
}

export type PackLine = {
  /** Kit slug. */
  readonly kit: string;
  /** Which configuration: undefined for the base kit, else a variant label. */
  readonly variant?: string;
  readonly qty: number;
};

export type PackTotal = {
  readonly qty: number;
  readonly gross: number;
  readonly rate: number;
  readonly net: number;
  readonly saving: number;
};

/** Unit price of one pack line. Throws on an unknown kit or variant, so a typo fails the build. */
export function unitPrice(line: PackLine): number {
  const kit = kitBySlug(line.kit);
  if (kit === undefined) throw new Error(`unknown kit "${line.kit}"`);
  if (line.variant === undefined) return kit.price;
  const variant = kit.variants.find((v) => v.label === line.variant);
  if (variant === undefined) throw new Error(`${kit.name} has no variant "${line.variant}"`);
  return variant.price;
}

/** Same rounding as content.py's pack_total, so the site and the PDF agree to the naira. */
export function packTotal(lines: readonly PackLine[]): PackTotal {
  const qty = lines.reduce((n, l) => n + l.qty, 0);
  const gross = lines.reduce((n, l) => n + unitPrice(l) * l.qty, 0);
  const rate = discountRate(qty);
  const net = Math.round(gross * (1 - rate));
  return { qty, gross, rate, net, saving: gross - net };
}

export type LabPack = {
  readonly key: string;
  readonly title: string;
  readonly level: string;
  readonly blurb: string;
  readonly lines: readonly PackLine[];
  readonly chapters: string;
};

/** Ready-made lab packs, sized for one class of 30 in ten groups of three. */
export const LAB_PACKS: readonly LabPack[] = [
  {
    key: "foundations",
    title: "Foundations Lab",
    level: "JSS1 to JSS2",
    blurb: "Ten groups of three learn circuits, sensors and block-to-text coding on the same board.",
    lines: [{ kit: "ignite-genesis", qty: 10 }],
    chapters: "Chapters 4 to 6",
  },
  {
    key: "builders",
    title: "Builders Lab",
    level: "JSS3 to SS1",
    blurb: "Ten groups each build, wire and drive their own rolling robot, then run the line follower and obstacle avoider.",
    lines: [{ kit: "rover-m2", variant: "With an Arduino UNO", qty: 10 }],
    chapters: "Chapters 12 and 13",
  },
  {
    key: "systems",
    title: "Systems and AI Lab",
    level: "SS2 to SS3",
    blurb: "Five senior teams build connected robots with WiFi, RFID and an on-board camera for vision work.",
    lines: [{ kit: "rover-ultimate-x", qty: 5 }],
    chapters: "Chapters 9, 13 and 15",
  },
  {
    key: "staff",
    title: "Staff Training Kits",
    level: "Teachers",
    blurb: "One Ultimate-X for every two teachers on the ten-session academy, so every pair builds each project in the book.",
    lines: [{ kit: "rover-ultimate-x", qty: 3 }],
    chapters: "All build chapters",
  },
];

/** Kits for the three-day teacher intensive: six teachers, two to a kit set. */
export const THREE_DAY_KIT_LINES: readonly PackLine[] = [
  { kit: "ignite-genesis", qty: 3 },
  { kit: "rover-m2", variant: "With an Arduino UNO", qty: 3 },
];

/** "₦65,500". Plain regex rather than toLocaleString, so the output never depends on the ICU build. */
export const naira = (n: number): string => `₦${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
