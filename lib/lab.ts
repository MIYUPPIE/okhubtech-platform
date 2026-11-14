/**
 * The lab: research, papers, prototypes, tools and teaching material.
 *
 * /products is for things a customer can use today. Everything else OKHub
 * has built or written lives here, labelled for what it is, so a research
 * plan never reads as a shipped product and a prototype never reads as a
 * service on sale. scripts/verify-lab.mjs enforces the rules below.
 *
 * Rules:
 *
 *  - OKHub-authored only. Third-party toolkits and courses we work with
 *    (competition toolkits, vendor tutorials, forks) are not listed as ours.
 *  - `status` says plainly how far each item has got.
 *  - Papers are listed as submitted, with their authors, never as published.
 *  - No client is named. The WhatsApp gateway runs in production for a client;
 *    the client is not on this page.
 *  - Links are internal routes or files we host, checked by the gate.
 *
 * Import-free so Node can load it directly in the gate.
 */

export type LabKind = "research" | "paper" | "prototype" | "tool" | "teaching";

export type LabLink = { readonly label: string; readonly href: string };

export type LabItem = {
  /** Anchor on /lab. */
  readonly slug: string;
  readonly kind: LabKind;
  readonly title: string;
  /** One line under the title. */
  readonly tagline: string;
  /** How far it has got, in a few words. */
  readonly status: string;
  readonly summary: string;
  readonly points: readonly string[];
  /** Papers only. */
  readonly authors?: readonly string[];
  readonly stack: readonly string[];
  readonly links: readonly LabLink[];
};

export const LAB_KINDS: readonly { readonly kind: LabKind; readonly title: string; readonly intro: string }[] = [
  {
    kind: "research",
    title: "Research",
    intro: "Long-horizon questions we are working on, with the plan or the code to show for it.",
  },
  {
    kind: "paper",
    title: "Papers",
    intro: "Write-ups of systems we have built and deployed, submitted for publication.",
  },
  {
    kind: "prototype",
    title: "Prototypes",
    intro: "Working builds that prove one idea. Some grow into products; the rest teach us something.",
  },
  {
    kind: "tool",
    title: "Tools",
    intro: "Things we built for our own work and keep using.",
  },
  {
    kind: "teaching",
    title: "Teaching material",
    intro: "Guides we wrote for the students and teachers we train.",
  },
];

const LAB_DATA: LabItem[] = [
  {
    slug: "openbridge",
    kind: "research",
    title: "OPENBRIDGE",
    tagline: "Can a machine translate meaning between speech, sign, text and touch, in real time?",
    status: "Research programme, in planning",
    summary:
      "A long-term programme for people who are kept apart by language, hearing or sight. Instead of four separate apps, OPENBRIDGE plans one shared communication engine that takes in speech, sign language, text or touch, works out what was meant, and gives it back in whichever of those the other person uses.",
    points: [
      "African language intelligence: speech and text in Nigerian languages.",
      "Sign language intelligence: hand, body and face tracking from an ordinary camera, modelled over time.",
      "Deafblind communication: meaning encoded as touch, through assistive hardware.",
      "One semantic engine in the middle, so each new input or output does not mean rebuilding the rest.",
    ],
    stack: ["Speech recognition", "Pose and hand tracking", "Language models", "Assistive hardware"],
    links: [
      { label: "Yoruba Live Voice", href: "/products/yoruba-live-voice" },
      { label: "Sign language educator", href: "/portfolio/sign-language-educator" },
    ],
  },
  {
    slug: "minifab-scheduling",
    kind: "research",
    title: "Wafer fab scheduling",
    tagline: "Exact optimisation against learned dispatching on the Intel/ASU Minifab benchmark.",
    status: "Research code, with tests",
    summary:
      "A semiconductor fab sends each wafer lot back through the same machines several times, which makes scheduling hard. This study models the Intel/ASU Minifab (5 machines, 3 workstations, 3 products, a 6-step re-entrant route) and compares three ways of minimising total weighted lateness: an exact mixed-integer model, classic dispatching rules, and a graph neural network trained with reinforcement learning.",
    points: [
      "Exact MILP solution as the lower bound, solved with CBC or Gurobi.",
      "FIFO, EDD and SPT dispatching rules as baselines, deterministic and with random events.",
      "A GNN policy trained with PPO, benchmarked on identical instances.",
      "A published corrections log: six bugs that changed results were found, fixed and guarded by tests, and earlier numbers were withdrawn.",
    ],
    stack: ["Python", "Gymnasium", "PyTorch", "MILP", "PPO"],
    links: [],
  },
  {
    slug: "logsme-paper",
    kind: "paper",
    title: "LogSME: an AI-powered inventory, production and analytics platform for Nigerian manufacturing SMEs",
    tagline: "The design and build of LogSME, from raw-material intake to finished-goods sales.",
    status: "Submitted, April 2025",
    summary:
      "Most Nigerian manufacturing SMEs still run inventory and production on paper. The paper sets out the needs assessment behind LogSME, its architecture, the embedded AI business adviser that turns operating data into plain-language advice, and the voice interface built for owners who work from a phone.",
    points: [
      "End-to-end production-cycle tracking with automatic stock monitoring.",
      "An AI adviser that explains business performance from structured data.",
      "A voice interface for low digital literacy, mobile-first users.",
    ],
    authors: ["Okanlawon Olayemi Micheal"],
    stack: ["React", "Node.js", "MongoDB", "LLM"],
    links: [{ label: "LogSME", href: "/products/logsme" }],
  },
  {
    slug: "gamblealert-paper",
    kind: "paper",
    title: "GambleAlert: an AI psychologist chatbot for real-time gambling intervention and risk classification in Sub-Saharan Africa",
    tagline: "Design, deployment and first evaluation of the GambleAlert chatbot.",
    status: "Submitted, April 2026",
    summary:
      "Problem gambling is rising fast across Sub-Saharan Africa while support is almost absent. The paper describes GambleAlert, a chatbot with conversational memory and a sentiment and risk module that sorts conversations into low, moderate and high risk, and reports on its deployment.",
    points: [
      "A three-tier risk classification running alongside every conversation.",
      "Conversational memory, so support builds over a session instead of restarting.",
      "Deployed publicly, with interactions logged for evaluation.",
    ],
    authors: ["Okanlawon Olayemi Micheal", "Fisayo Oke"],
    stack: ["LLM", "LangChain", "Sentiment analysis"],
    links: [{ label: "GambleAlert", href: "/products/gamblealert" }],
  },
  {
    slug: "light-compensation",
    kind: "prototype",
    title: "Light compensation",
    tagline: "A webcam feed that keeps its brightness when the room's lights go off.",
    status: "Prototype, with tests",
    summary:
      "The camera learns what the room looks like with the lights on, notices when they go off, and corrects the video so the picture keeps roughly the same brightness. It restores how the feed looks, not the light in the room: in near-darkness there is only so much a webcam can recover.",
    points: [
      "Learns and keeps a reference brightness for the room.",
      "Detects light changes from frame luminance, with smoothing and hysteresis so it does not flicker.",
      "Adaptive gamma and CLAHE contrast correction.",
      "Logs light level and correction over time; every module has its own tests, plus synthetic-scene evals.",
    ],
    stack: ["Python", "OpenCV"],
    links: [],
  },
  {
    slug: "camguard",
    kind: "prototype",
    title: "CamGuard",
    tagline: "A Raspberry Pi that sounds a buzzer the moment a camera is covered.",
    status: "Prototype, calibrated on site",
    summary:
      "A covered or blinded lens loses detail and goes flat. CamGuard reads a small, low-frame-rate copy of the camera stream, measures sharpness and brightness spread on every frame, and sounds a buzzer when both drop, with delays so a passing shadow does not set it off.",
    points: [
      "Two plain measurements, sharpness and spread, with thresholds calibrated on the real camera.",
      "Debounced: it must stay covered for 1.5 s to fire and clear for 2 s to stop.",
      "Runs as a system service on the Pi, driving a buzzer from a GPIO pin.",
    ],
    stack: ["Python", "ffmpeg", "Raspberry Pi", "GPIO"],
    links: [{ label: "OICS, with full tamper detection", href: "/products/oics" }],
  },
  {
    slug: "nfctool",
    kind: "tool",
    title: "nfctool",
    tagline: "Read, write, lock and password-protect NFC tags from a laptop, with an Arduino and an RC522.",
    status: "In use",
    summary:
      "The Arduino only moves bytes; everything else runs on the laptop, so adding a new record type never means reflashing. It also issues and checks signed access-control cards for your own doors.",
    points: [
      "NDEF encoding, memory maps, locking and passwords for NTAG213, 215 and 216.",
      "Signed access-control cards, issued and checked from the same tool.",
      "MIFARE Classic block access on cards you hold the key for.",
    ],
    stack: ["Python", "Arduino", "MFRC522"],
    links: [{ label: "NFC cards", href: "/nfc" }],
  },
  {
    slug: "whatsapp-gateway",
    kind: "tool",
    title: "WhatsApp gateway",
    tagline: "One HTTPS API for contacts, tags, messages, campaigns and webhooks on WhatsApp.",
    status: "In production for a client",
    summary:
      "Apps call one documented API instead of talking to WhatsApp directly. Every outbound message passes the same bulk-sending rules, written down and enforced in code, so a campaign does not get the number banned. It runs on the open-source Evolution API, unmodified, behind our own gateway.",
    points: [
      "OpenAPI contract, so a typed client can be generated in any language.",
      "Bulk-sending rules enforced in code, with a campaign scheduler.",
      "Signed webhooks for inbound messages and delivery events.",
    ],
    stack: ["Node.js", "PostgreSQL", "Redis", "Docker", "Caddy"],
    links: [],
  },
  {
    slug: "pybullet-for-kids",
    kind: "teaching",
    title: "PyBullet for young learners",
    tagline: "Robot physics in ten small Python steps, written for children.",
    status: "Teaching guide",
    summary:
      "A friendly guide that treats physics simulation as a toy box: start a world, drop objects into it, then add a robot and make it move. Each of the ten steps is a short script a student can run and change.",
    points: [
      "Ten scripts that build on each other, from an empty world to a moving robot.",
      "Every line of code explained in plain language.",
    ],
    stack: ["Python", "PyBullet"],
    links: [{ label: "The schools programme", href: "/schools" }],
  },
];

/** Declaration order is the curated order within each kind. */
export const LAB: readonly LabItem[] = LAB_DATA;
