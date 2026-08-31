/**
 * The product catalogue — the software OKHub has actually built.
 *
 * Single source of truth for /products and every product detail page, in the
 * same spirit as lib/contact.ts: one place to change a fact, and a gate test
 * (scripts/verify-products.test.mjs) that keeps the routes, the sitemap and
 * this file from drifting apart.
 *
 * Rules for what belongs here, because getting these wrong misrepresents
 * someone:
 *
 *  - OKHub-authored only. Forks and clones of other people's projects do not
 *    go on the site as our work.
 *  - `live` is only set where the URL was checked and answered. Everything
 *    else is honest about being in development.
 *  - `stack` lists what the project actually depends on, read off its own
 *    manifest or README, not what would sound good.
 *  - No third-party client is named without their permission.
 */

export type ProductStatus = "live" | "in-development" | "internal";

export type Product = {
  /** URL segment under /products/. */
  slug: string;
  name: string;
  /** One line, shown on the index card. */
  tagline: string;
  /** The domain it serves, used to group the index. */
  sector: string;
  status: ProductStatus;
  /** Public URL, only where it was verified to respond. */
  url?: string;
  /** Two or three paragraphs for the detail page. */
  summary: string[];
  /** The engineering decisions worth reading about. */
  highlights: string[];
  stack: string[];
};

const PRODUCTS_DATA: Product[] = [
  {
    slug: "logsme",
    name: "LogSME",
    tagline: "A business operating system for small and medium enterprises, driven from WhatsApp.",
    sector: "Commerce",
    status: "live",
    url: "https://logsme.ng",
    summary: [
      "Most small businesses in Nigeria run on a notebook and a phone. LogSME replaces the notebook without asking anyone to stop using the phone: sales, inventory, production, procurement, services, bookings, customers and finances all live in one dashboard, and every one of them can be driven from WhatsApp instead.",
      "The WhatsApp side accepts guided menus or free text in English or Pidgin, and puts a confirm-before-write gate in front of every action, so a mistyped message never silently changes stock or books a slot. Entry elsewhere is voice-first, with receipt scanning for the paperwork that arrives as paper.",
      "Beyond the back office, every vendor gets a hosted storefront on its own subdomain and a listing in a merit-ranked marketplace, so the same records that run the business are also what customers browse.",
    ],
    highlights: [
      "Inventory is dual-layer: raw materials tracked by batch, finished goods derived from production runs.",
      "FIFO cost allocation through production, so profit per item is calculated rather than estimated.",
      "Multi-tenant with full data isolation per business, plus store and branch support.",
      "Marketplace ranking is organic — view and complaint signals, with promotion kept separate and visible.",
      "Paystack-backed subscriptions and per-tenant feature flags for staged rollout.",
    ],
    stack: ["Django 6", "Next.js 16", "PostgreSQL 15", "Redis", "Celery", "Docker", "Paystack", "WhatsApp Business API"],
  },
  {
    slug: "alajapa",
    name: "Alajapa",
    tagline: "B2B agricultural aggregation and export, run through field agents.",
    sector: "Agriculture",
    status: "live",
    url: "https://alajapa.com",
    summary: [
      "Alajapa connects smallholder farmers in Oyo State to exporters, processors and Lagos traders through a lean agent-driven model. Field agents buy produce at farm-gate prices; the platform converts local units to the metric bag, applies markup, and lists verified stock for buyers.",
      "The margin in this business is eaten by logistics, so shipments are consolidated into groups rather than moved per order. That single decision is what the pricing and stock model are built around.",
    ],
    highlights: [
      "Local-unit to metric-bag conversion at the point of purchase, so stock is comparable across agents.",
      "Consolidated group shipments to bring down per-bag logistics cost.",
      "Verified stock listings, so a buyer is bidding on produce an agent has physically seen.",
      "Containerised end to end and deployed behind Nginx Proxy Manager on a single VPS.",
    ],
    stack: ["Next.js 16", "React 19", "Django 6", "Django REST Framework", "PostgreSQL 16", "Redis 7", "Celery", "Docker"],
  },
  {
    slug: "vasidas",
    name: "VASIDAS",
    tagline: "Desktop automation that runs entirely offline, including the language model.",
    sector: "Automation",
    status: "in-development",
    summary: [
      "A cross-platform RPA studio for Windows and Linux: build, save and run workflows that drive other desktop applications through mouse, keyboard, window management, screenshots and native UI element interaction.",
      "The point of difference is that it does not lead with fixed-coordinate scripting. Elements are found through Windows UI Automation and Linux AT-SPI first, with OCR and template matching as fallbacks, so a workflow survives a window moving.",
      "Everything runs offline, including the optional AI. Intent classification and workflow generation use a local Qwen2.5 model through llama.cpp bindings — no hosted API, no network call.",
    ],
    highlights: [
      "Native element finding via Windows UI Automation and Linux AT-SPI before any coordinate fallback.",
      "PaddleOCR through ONNX Runtime with a Tesseract CLI fallback for text recognition.",
      "OpenCV template matching as the last-resort visual fallback.",
      "Local speech-to-text through whisper.cpp bindings, with cross-platform microphone capture.",
      "The Windows-only automation assembly is loaded by reflection at runtime, so the project still builds on Linux.",
    ],
    stack: [".NET 10", "C#", "Avalonia UI 12", "SQLite", "PaddleOCR", "OpenCvSharp4", "Whisper.net", "LLamaSharp", "Qwen2.5"],
  },
  {
    slug: "teenbuddy",
    name: "TeenBuddy",
    tagline: "A daily companion for teenagers, with the safety system designed in first.",
    sector: "Health",
    status: "in-development",
    summary: [
      "TeenBuddy helps teenagers manage emotions, resist unhealthy impulses, build habits and ask for help. Six screens: home, check-in, help now, learn, journal and profile.",
      "The interesting constraint is that an AI coach talking to teenagers about their worst days cannot be allowed to improvise. The model is kept inside deterministic rails, risk is classified in two tiers, and crisis responses come from reviewed templates with region-aware resources rather than from generation.",
      "Safety was built from the first commit rather than bolted on, and it is measured: a labelled safety corpus and a model-judged coach rubric run alongside the ordinary test suite.",
    ],
    highlights: [
      "Two-tier risk classification with reviewed crisis templates, not generated crisis text.",
      "440 deterministic gate tests that run in about two seconds at zero cost.",
      "A 42-case labelled safety corpus plus a model-judged rubric for the coach.",
      "25 lessons, a 28-day challenge rotation and 8 coping interventions as structured content.",
      "Runs with no configuration — no account, no Firebase project, no API key needed to start it.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase"],
  },
  {
    slug: "logod",
    name: "LOGOD",
    tagline: "Local government revenue collection that works with no signal in the field.",
    sector: "Public sector",
    status: "in-development",
    summary: [
      "An agent registers a market seller with GPS and a photo, collects a levy, and the seller gets an SMS and a digital receipt. All of it works offline in the field and syncs when connectivity returns. Supervisors and administrators watch it happen live from a web dashboard.",
      "The mobile app and the backend share nothing but an OpenAPI contract, so the two halves can be built and deployed independently.",
    ],
    highlights: [
      "Offline-first capture: registration and payment complete with no connection, then reconcile on sync.",
      "GPS and photo captured at registration, so a seller record is tied to a place.",
      "Live supervisor and admin dashboards over LiveView, no separate frontend build.",
      "PDF receipts rendered server-side through headless Chrome.",
      "A single OpenAPI contract as the only coupling between the Flutter app and the Phoenix API.",
    ],
    stack: ["Phoenix 1.8", "Elixir", "LiveView", "Flutter", "PostgreSQL", "MinIO", "OpenAPI"],
  },
  {
    slug: "nurpat",
    name: "NURPAT",
    tagline: "Nurse-led telehealth, built to Nigeria's scope-of-practice rules.",
    sector: "Health",
    status: "in-development",
    summary: [
      "A telehealth platform connecting licensed Nigerian nurses with patients for remote consultations over text, audio and video. It is built around the Nursing & Midwifery Act's scope-of-practice requirements rather than retrofitted to them.",
      "Consultations run peer-to-peer over WebRTC with a TURN server for the networks where that does not work, and an AI triage step sorts intake before a nurse's time is spent on it.",
    ],
    highlights: [
      "Scope-of-practice constraints encoded in the consultation flow, not left to policy documents.",
      "WebRTC video with a Coturn TURN relay for restrictive mobile networks.",
      "Real-time presence and messaging over Phoenix-style channels on Django Channels and Redis.",
      "Paystack for payment and Africa's Talking for SMS, so both sides work on Nigerian rails.",
      "AI triage on intake to prioritise consultations.",
    ],
    stack: ["Django 5", "Django REST Framework", "Django Channels", "Celery", "PostgreSQL 16", "Next.js 15", "WebRTC", "Coturn", "Paystack"],
  },
  {
    slug: "nurseprep",
    name: "NursePrep",
    tagline: "NMCN licensure exam preparation, delivered partly over WhatsApp.",
    sector: "Education",
    status: "in-development",
    summary: [
      "Exam preparation for Nigerian nursing licensure candidates: untimed practice with instant feedback, timed mock exams in the real NMCN format, a daily quiz delivered over WhatsApp, and an AI tutor.",
      "The output that matters is a readiness score with a weak-area breakdown, so a candidate knows where they actually stand rather than how many questions they have answered.",
    ],
    highlights: [
      "Timed mocks that reproduce the real NMCN exam format rather than a generic quiz shell.",
      "Daily quiz pushed over WhatsApp, where the candidates already are.",
      "Login is WhatsApp OTP — no password, no email round trip.",
      "Readiness scoring with a weak-area breakdown instead of a raw percentage.",
    ],
    stack: ["Phoenix", "Elixir", "PostgreSQL", "WhatsApp API"],
  },
  {
    slug: "loeko",
    name: "Loeko",
    tagline: "Speech-first Yoruba learning that scores your tones.",
    sector: "Language",
    status: "in-development",
    summary: [
      "Yoruba is tonal, so a learning app that only reads and writes teaches the wrong half of the language. Every Loeko lesson is built around speaking: the app listens, scores pronunciation on tone, fluency and accuracy, gives specific feedback, and repeats the exercise until it is right.",
      "The speech stack is purpose-built for the language rather than borrowed — a Whisper model fine-tuned for Yoruba on the way in, YarnGPT on the way out.",
    ],
    highlights: [
      "Pronunciation scored on tone as a first-class dimension, not just word accuracy.",
      "Whisper speech-to-text fine-tuned for Yoruba rather than used off the shelf.",
      "YarnGPT text-to-speech for native-quality Yoruba output.",
      "Exercises repeat to mastery instead of advancing on a single pass.",
    ],
    stack: ["Elixir", "Phoenix", "Next.js", "Whisper", "YarnGPT"],
  },
  {
    slug: "griotvid",
    name: "GriotVid",
    tagline: "An idea in, a narrated video out — in your language.",
    sector: "Media",
    status: "in-development",
    summary: [
      "A griot is a West African storyteller. GriotVid takes a topic or a script and returns a finished, narrated, captioned video: the script and scene plan are written in the chosen language, footage is pulled from Pexels and Pixabay, narration is generated as one continuous take, music is picked by mood, and FFmpeg assembles the result on the GPU.",
      "Narration uses Edge-TTS for English and several African languages, and YarnGPT for Yoruba, Igbo and Hausa. Paste your own script and it is narrated word for word — the model only picks footage and a title, and never rewrites your words.",
    ],
    highlights: [
      "Narration rendered as one continuous take rather than stitched per scene, so the pacing holds.",
      "Word-by-word karaoke captions burned in, with the music ducked under the voice.",
      "Ken Burns motion fitted to the narration length rather than to fixed clip durations.",
      "Audience context switches both the script framing and the footage search terms.",
      "Final render on the GPU through NVENC, in 16:9, 9:16 or 1:1.",
    ],
    stack: ["Python", "FFmpeg", "NVENC", "Edge-TTS", "YarnGPT", "Pexels", "Pixabay", "Jamendo"],
  },
  {
    slug: "agora",
    name: "Agora",
    tagline: "Live gatherings with captions as they happen and a transcript when they end.",
    sector: "Media",
    status: "in-development",
    summary: [
      "A gatherings platform where every broadcast carries live captions while it is running, and produces an accurate final transcript, downloadable as an SRT file, once it ends.",
      "The two are deliberately different jobs: the live pass optimises for latency and the final pass for accuracy, rather than compromising on one model for both.",
    ],
    highlights: [
      "Live captions during broadcast and a separate accurate pass afterwards.",
      "Final transcripts downloadable as SRT.",
      "Transcription served by a dedicated Whisper process rather than inline in the request path.",
    ],
    stack: ["Elixir", "Phoenix", "Whisper"],
  },
  {
    slug: "smarteyes",
    name: "SmartEyes",
    tagline: "Retail floor surveillance that follows people, not frames.",
    sector: "Computer vision",
    status: "in-development",
    summary: [
      "A real-time surveillance system for supermarkets. YOLO detects people and objects, a tracker assigns and holds a unique identity across frames, and the system writes a separate video file per tracked person alongside entry and exit times in a database.",
      "Recording per person rather than per camera is what makes the footage reviewable — you look up someone's visit instead of scrubbing an hour of floor.",
    ],
    highlights: [
      "Per-person identity held across frames, with a video file recorded per person.",
      "Entry and exit times, video paths and activity logged to a database.",
      "AI analysis of frames layered on top of detection for higher-level insight.",
      "Clean resource teardown on shutdown, so recordings are never left truncated.",
    ],
    stack: ["Python", "YOLO", "OpenCV", "SQLite"],
  },
  {
    slug: "yoruba-live-voice",
    name: "Yoruba Live Voice",
    tagline: "An always-on Yoruba speech pipeline that never stops listening.",
    sector: "Language",
    status: "in-development",
    summary: [
      "Speak Yoruba into a microphone and the system either captions what you said with correct accents, or answers you as a voice assistant and speaks the reply aloud.",
      "The engineering problem is that cloud calls are slow and microphones are not patient. Five stages run concurrently so a slow network round trip never blocks capture or live decoding — voice activity detection and speech-to-text stay local, and only correction and speech synthesis leave the machine.",
    ],
    highlights: [
      "Five concurrent stages, so the microphone is never deaf while a slow stage is working.",
      "Streaming voice-activity detection emits live partial snapshots and finalises on a pause.",
      "Speech-to-text runs locally; only the correction and synthesis steps are remote.",
      "Two modes from the same pipeline: accented captioning, or spoken conversation.",
    ],
    stack: ["Python", "faster-whisper", "Silero VAD", "YarnGPT", "PortAudio"],
  },
  {
    slug: "transcriber",
    name: "Transcriber",
    tagline: "Any audio, any video, any language, transcribed locally.",
    sector: "Language",
    status: "internal",
    summary: [
      "A local transcription tool built on faster-whisper. FFmpeg normalises every input to 16 kHz mono before the model sees it, so codec and container stop mattering, and voice-activity filtering removes the text Whisper otherwise hallucinates over silence.",
      "A backend ladder means a small GPU degrades to a slower path instead of crashing, which is the difference between a tool that works on the hardware you have and one that does not.",
    ],
    highlights: [
      "FFmpeg normalisation up front, so any container or codec is accepted.",
      "Voice-activity filtering on by default to cut hallucinated text over silence.",
      "A backend ladder so a 6 GB GPU falls back rather than failing.",
      "Writes text, SRT and JSON from a single run.",
      "Fully offline after the first model download.",
    ],
    stack: ["Python", "faster-whisper", "FFmpeg", "CTranslate2"],
  },
  {
    slug: "ar-art-gallery",
    name: "AR Art Gallery",
    tagline: "Point a phone at a painting and watch it move. No app, no QR code.",
    sector: "Immersive",
    status: "in-development",
    summary: [
      "A marker-based augmented reality web app that animates artwork. Tracking is natural-feature based, so it locks onto the artwork itself rather than a printed QR code, and it runs in a browser, so there is nothing to install.",
      "The camera is only requested when someone taps to launch, never on page load. With the optional backend running, an uploaded artwork can be saved and shared as a link with a QR code that pins any phone to that piece.",
    ],
    highlights: [
      "Natural-feature tracking on the artwork itself — no markers or QR codes in the frame.",
      "Runs in the browser on a phone or a laptop webcam, with no app install.",
      "Camera permission requested on tap, not on page load.",
      "Degrades cleanly: without the backend the share features hide themselves and the app is otherwise unchanged.",
    ],
    stack: ["MindAR", "Three.js", "JavaScript"],
  },
  {
    slug: "flowtoit",
    name: "FlowToIt",
    tagline: "Messaging across a room with no internet involved.",
    sector: "Networking",
    status: "in-development",
    summary: [
      "A peer-to-peer communication app for a local network. Peers are discovered automatically, messages travel over WebSockets, and none of it needs an internet connection or a server anyone else controls.",
      "It installs as a progressive web app, and generates its own certificates so the secure-context requirements are met without a public domain.",
    ],
    highlights: [
      "Automatic peer discovery on the local network.",
      "Self-signed certificates generated at startup, so HTTPS and WSS work with no domain.",
      "Installable as a PWA on mobile and desktop.",
      "Works with the internet connection completely down.",
    ],
    stack: ["Node.js", "Express 5", "WebSocket", "PWA"],
  },
  {
    slug: "word-web-clone",
    name: "Word Web Clone",
    tagline: "A document editor in the browser, ribbon and all.",
    sector: "Productivity",
    status: "in-development",
    summary: [
      "A browser document editor that recreates the familiar ribbon interface and page-based layout: rich text, formatting, image insertion, zoom controls and keyboard shortcuts.",
      "The page-based layout is the hard part — most browser editors are one long scroll, which is fine until someone needs to know what will be on page three.",
    ],
    highlights: [
      "Page-based layout rather than a single scrolling document.",
      "Ribbon interface with the tab structure people already know.",
      "Rich text, font and colour control, alignment, images and zoom.",
      "Keyboard shortcuts matched to the desktop application.",
    ],
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui"],
  },
  {
    slug: "whatsapp-game",
    name: "WhatsApp Game",
    tagline: "A game platform that lives entirely inside a chat thread.",
    sector: "Education",
    status: "in-development",
    summary: [
      "A gaming platform played through WhatsApp messages: four game types, clan assignment, player profiles with levels and points, and a global leaderboard. No app, no website, no download — the whole thing is a conversation.",
      "It is a teaching vehicle as much as a game. Reaching people where they already are, on the network they already pay for, is the same constraint most of our other work is built around.",
    ],
    highlights: [
      "Four game types: riddles, mental arithmetic, word scramble and trivia.",
      "Players assigned to clans, with a global leaderboard across them.",
      "Persistent profiles tracking level, points and game history.",
      "Integration-tested against the messaging API rather than only unit-tested.",
    ],
    stack: ["Python", "Flask", "SQLAlchemy", "SQLite", "WhatsApp API"],
  },
];

/** Ordered: live work first, then the rest as listed. */
export const PRODUCTS: readonly Product[] = [...PRODUCTS_DATA].sort((a, b) => {
  const rank = (p: Product) => (p.status === "live" ? 0 : 1);
  return rank(a) - rank(b);
});

export const PRODUCT_SLUGS: readonly string[] = PRODUCTS.map((p) => p.slug);

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const STATUS_LABEL: Record<ProductStatus, string> = {
  live: "Live",
  "in-development": "In development",
  internal: "Internal tool",
};
