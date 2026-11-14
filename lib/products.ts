/**
 * The product catalogue: the software OKHub has actually built.
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
 *  - `url` is only set where the domain was actually resolved and answered.
 *    A link to a dead domain is the okhub.tech mailbox failure again.
 *  - `stack` lists what the project actually depends on, read off its own
 *    manifest or README, not what would sound good.
 *  - No third-party client is named without their permission.
 */

export type Product = {
  /** URL segment under /products/. */
  slug: string;
  name: string;
  /** One line, shown on the index card. */
  tagline: string;
  /** The domain it serves, used to group the index. */
  sector: string;
  /** Public URL. Only set where the domain was checked and answered. */
  url?: string;
  /** Instagram shortcode of a reel showing this working: see REELS in lib/contact.ts. */
  reel?: string;
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
      "Marketplace ranking is organic: view and complaint signals, with promotion kept separate and visible.",
      "Paystack-backed subscriptions and per-tenant feature flags for staged rollout.",
    ],
    stack: ["Django 6", "Next.js 16", "PostgreSQL 15", "Redis", "Celery", "Docker", "Paystack", "WhatsApp Business API"],
  },
  {
    slug: "parsil",
    name: "PARSIL",
    tagline: "The exact entrance, not just the building. A last-mile address layer on top of the official postcode.",
    sector: "Mapping",
    url: "https://parsilmap.com",
    summary: [
      "A postcode gets you to a building. PARSIL gets you to the right gate of it. Built on top of NIPOST's Digital Postcode in Nigeria and the Eircode in Ireland, every place gets an ID such as PR-OY-IB-08421-EN-A that also names the entrance and the facility, so a visitor, a rider or an ambulance can be sent to the door that matters.",
      "Navigation follows real streets for walking, car, okada or keke, speaks each turn before it comes in English, Yoruba, Hausa, Igbo or Irish, and re-routes when you leave the route. The last metres that maps do not have, the compound gate or the market row, are walked by agents on site and confirmed by the people who use them.",
      "Around the address sits what people on the ground need right now: live reports of traffic, power, fuel prices and queues that expire on their own, two-way walk sharing with chat, and the same service over WhatsApp by text or voice note with no app to install.",
    ],
    highlights: [
      "AR walk to the entrance, with the phone's compass corrected from the route as you walk.",
      "Street routing on OpenStreetMap for Nigeria and Ireland; your position is used for that one route and never stored.",
      "Live updates are truthful by construction: newer reports replace contradicting ones nearby, and implausible prices are refused.",
      "Where am I? answers with the PARSIL ID of the place you stand at, and asks rather than guesses on a dense street.",
      "3D guides that greet visitors at a place's entrance and answer only from approved facts, never a guess.",
      "Works on WhatsApp too: ask by voice note and get the entrance back as a location pin.",
    ],
    stack: ["Elixir", "Phoenix", "PostGIS", "Next.js", "MapLibre", "Three.js", "Valhalla"],
  },
  {
    slug: "alajapa",
    name: "Alajapa",
    tagline: "B2B agricultural aggregation and export, run through field agents.",
    sector: "Agriculture",
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
    summary: [
      "A cross-platform RPA studio for Windows and Linux: build, save and run workflows that drive other desktop applications through mouse, keyboard, window management, screenshots and native UI element interaction.",
      "The point of difference is that it does not lead with fixed-coordinate scripting. Elements are found through Windows UI Automation and Linux AT-SPI first, with OCR and template matching as fallbacks, so a workflow survives a window moving.",
      "Everything runs offline, including the optional AI. Intent classification and workflow generation use a local Qwen2.5 model through llama.cpp bindings: no hosted API, no network call.",
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
      "Runs with no configuration: no account, no Firebase project, no API key needed to start it.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase"],
  },
  {
    slug: "logod",
    name: "LOGOD",
    tagline: "Local government revenue collection that works with no signal in the field.",
    sector: "Public sector",
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
    slug: "tosaadecworld",
    name: "TosaadecWorld Foundation",
    tagline: "A donation platform for the Zero Out-of-School Children initiative.",
    sector: "Nonprofit",
    url: "https://tosaadecworld.org",
    summary: [
      "The public site and donation platform for a Nigerian foundation working to get children out of the street and into school, through education, work, food, water and a healthy environment.",
      "Giving is the whole point of the build, so it takes money three ways (Paystack, PayPal and Flutterwave) rather than betting the foundation's income on one processor being up and one card working. Around that sit donor tracking, sponsorships, volunteer sign-up, a newsletter and a CMS the foundation runs itself.",
      "The API and the site are separate applications that agree on a shared contract, so the public site can be redeployed without touching the machinery that handles donations.",
    ],
    highlights: [
      "Three payment processors side by side, so a failing gateway is not a failed donation.",
      "Donor tracking and recurring sponsorships, not just one-off payments.",
      "A CMS the foundation edits directly, so campaign copy does not need a developer.",
      "Volunteer and newsletter capture on the same contract as donations.",
      "API and web app deploy independently against a shared contract.",
    ],
    stack: ["Elixir", "Phoenix", "Next.js", "TypeScript", "PostgreSQL", "Paystack", "PayPal", "Flutterwave"],
  },
  {
    slug: "lamiuk",
    name: "LAMIUK Portal",
    tagline: "A private portal and calling platform for African migrants in the UK.",
    sector: "Community",
    summary: [
      "A secure portal for legal African migrants in the UK: registration with email verification, profiles, support groups, scheduled meetings, direct chat with administrators, and audio and video calls that run in the browser.",
      "Support groups are the reason the calling is in-browser rather than a link to somewhere else. Asking people in a vulnerable position to install an app, make an account somewhere new and trust a third party with who they are talking to is a barrier; opening a tab is not.",
      "Calls are peer-to-peer over WebRTC with a TURN relay behind them, because the networks people actually use (mobile data, shared housing, public wifi) are exactly the ones that block direct connections.",
    ],
    highlights: [
      "In-browser audio and video calls, with nothing to install and no third-party account.",
      "A self-hosted TURN relay so calls still connect on restrictive mobile and shared networks.",
      "Real-time chat and presence over Phoenix Channels rather than polling.",
      "Support groups and scheduled meetings as first-class objects, not calendar links.",
      "Email-verified registration, with administrator chat kept separate from group channels.",
    ],
    stack: ["Elixir", "Phoenix", "Phoenix Channels", "PostgreSQL", "Next.js", "TypeScript", "WebRTC", "Coturn"],
  },
  {
    slug: "unc",
    name: "UNC",
    tagline: "A turn-based tactical RPG that is played entirely inside a group chat.",
    sector: "Gaming",
    summary: [
      "UNC is a chat-native tactical RPG with a real rulebook behind it: clans, ranks, skill trees, item economy and a two-turn action-reaction battle cycle where an attack, the defence against it and the counter-attack are three distinct moves.",
      "It grew as a play-by-post game moderated by people, and the moderators became the bottleneck. The backend exists to take the mechanical work off them (validating decks, enforcing cooldowns, resolving randomness and calculating damage) while leaving the human moderators to judge the things that need judgement.",
      "It runs where the players already are. The game is played through WhatsApp messages, with battles held in a supervisor process per match so a long fight keeps its state without holding a connection open.",
    ],
    highlights: [
      "A two-turn action-reaction battle cycle, so defending is a real move rather than a stat check.",
      "Battles run as supervised processes, one per match, holding state across a fight that spans hours.",
      "Automatic deck validation, cooldown enforcement and damage resolution, so moderators only judge edge cases.",
      "Randomness resolved through several mechanics (rolls, spins and tie-break games) rather than one dice call.",
      "Played through WhatsApp, with background jobs driving scheduled events and the economy.",
    ],
    stack: ["Elixir", "Phoenix 1.7", "PostgreSQL 15", "Oban", "Cachex", "Guardian", "WhatsApp Business API"],
  },
  {
    slug: "gamblealert",
    name: "GambleAlert",
    tagline: "Gambling-harm prevention: a tracker, a counselling AI, and a way out into tech.",
    sector: "Social impact",
    url: "https://gamblealert.org",
    summary: [
      "GambleAlert works on underage and problem gambling in Oyo State. The software side is a set of tools that support that work rather than one app: a phone tracker that logs betting behaviour and can lock the apps a user is trying to stay away from, a counselling assistant that handles the conversations no one has capacity to staff around the clock, and a scanner that turns paper field questionnaires into data.",
      "The financial side matters as much as the clinical one. Problem gambling is a money problem before it is anything else, so the assistant carries its own financial models and prompts rather than treating spending as a footnote to the counselling.",
      "Around the tools sit the programme's public surfaces: the Responsible Gaming Symposium site, an attendee directory, and a registration platform for a regional capacity-building programme run with a state gaming authority.",
    ],
    highlights: [
      "A tracker that both records betting behaviour and locks the apps behind it, so the intervention is not only a report.",
      "A counselling assistant with dedicated financial reasoning, because the harm shows up in money first.",
      "Field questionnaires scanned into structured data, with offline storage in the browser for use away from a desk.",
      "Programme registration and attendee search built as their own deployable sites.",
      "A Tech Prevention Academy pilot that moves children caught betting into software, robotics and AI training: the intervention OKHub is actually equipped to run.",
    ],
    stack: ["Flutter", "Dart", "Python", "FastAPI", "Next.js", "PostgreSQL", "Docker"],
  },
  {
    slug: "voting-kiosk",
    name: "Hands-Free Voting Kiosk",
    tagline: "Biometric registration and a ballot you cast with your face and your hand.",
    sector: "Civic tech",
    reel: "DbjAWTsgMuh",
    summary: [
      "A biometric voter registration desk and a voting kiosk with no keyboard and no mouse, built around Nigeria's actual election structure. You pick a language (English, Yoruba, Igbo or Hausa), look at the camera, point at the party you want, hold for a second, confirm, and move to the next office. A full review screen comes before anything is submitted.",
      "Face recognition and hand tracking do the input. Every voice prompt is pre-rendered rather than synthesised on demand, which means the kiosk needs no internet connection at any point during voting.",
      "This is a prototype and not election infrastructure, and it is not affiliated with INEC. Building it was a way to think hard about ballot secrecy, accessibility, language and lighting, and about how easily you can build something that looks impressive and still fails the people who need it most.",
    ],
    highlights: [
      "No keyboard and no mouse: registration and voting run on face recognition and hand tracking alone.",
      "Four languages at the point of use, chosen by the voter before anything else happens.",
      "Voice prompts pre-rendered, so the kiosk is fully offline while a vote is being cast.",
      "A review screen before submission, with each office voted separately.",
      "Built as a prototype to interrogate ballot secrecy and accessibility, not as a product to sell to anyone.",
    ],
    stack: ["Python", "InsightFace", "MediaPipe", "Computer vision", "Offline TTS"],
  },
  {
    slug: "nilera",
    name: "NILERA",
    tagline: "Healthcare you can speak to: a voice-first health companion on WhatsApp, in four Nigerian languages.",
    sector: "Health",
    url: "https://nilera.nurpat.com",
    summary: [
      "A mother sends a voice note in Yoruba: her child is very hot and cannot breastfeed. NILERA transcribes it, recognises a WHO danger sign, tells her in Yoruba, by text and voice, to go to a hospital now, and lists the nearest hospitals when she shares her location.",
      "It works in English, Yoruba, Hausa and Igbo, on WhatsApp, where families already are. Built by OKHub on NURPAT for the NAIC 2026 Voice-First Access problem statement.",
    ],
    highlights: [
      "Triage is decided by deterministic rules (WHO IMCI child danger signs, maternal danger signs, adult red flags). The language model can only escalate, never downgrade.",
      "Finds the nearest appropriate facility among 51,022 in the national facility registry; emergencies go only to secondary or tertiary care.",
      "29 health topics with cited sources from WHO, NCDC and the Federal Ministry of Health.",
      "Replies spoken back in a Nigerian-accented voice, pre-rendered so they play instantly.",
      "Consent first, no names stored, and DELETE erases everything.",
      "A browser version for demos, and a 3D family-health game that follows a pregnancy to the child's second birthday.",
    ],
    stack: ["Elixir", "Phoenix LiveView", "N-ATLAS", "YarnGPT2", "WhatsApp", "Three.js"],
  },
  {
    slug: "nurpat",
    name: "NURPAT",
    tagline: "Nurse-led telehealth, built to Nigeria's scope-of-practice rules.",
    sector: "Health",
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
    url: "https://nurseprep.com.ng",
    summary: [
      "Exam preparation for Nigerian nursing licensure candidates: untimed practice with instant feedback, timed mock exams in the real NMCN format, a daily quiz delivered over WhatsApp, and an AI tutor.",
      "The output that matters is a readiness score with a weak-area breakdown, so a candidate knows where they actually stand rather than how many questions they have answered.",
    ],
    highlights: [
      "Timed mocks that reproduce the real NMCN exam format rather than a generic quiz shell.",
      "Daily quiz pushed over WhatsApp, where the candidates already are.",
      "Login is WhatsApp OTP: no password, no email round trip.",
      "Readiness scoring with a weak-area breakdown instead of a raw percentage.",
    ],
    stack: ["Phoenix", "Elixir", "PostgreSQL", "WhatsApp API"],
  },
  {
    slug: "okrobo",
    name: "OKROBO",
    tagline: "A robotics studio that runs with the network off, built for schools where internet is unreliable or expensive.",
    sector: "Education",
    summary: [
      "Students build robot programs in blocks or in real Python, run them against a simulated robot in 3D, and follow lessons, all offline. It installs as a desktop app any laptop can double-click, with its own bundled Python, so no setup and no internet are needed in the classroom.",
      "The same student program that drives the simulator drives the real robot: the ESP32 car speaks the same serial contract, and the code on the robot is tested on a workstation against what the studio sends.",
    ],
    highlights: [
      "Blocks or Python, over the same robot API.",
      "A C++ simulation engine compiled to WebAssembly, with MuJoCo physics for grasping.",
      "Lessons, worlds and robots shipped as packs.",
      "Flash the real robot's firmware from inside the studio.",
      "Desktop app with bundled offline Python: no system install, no network.",
    ],
    stack: ["React", "TypeScript", "C++", "WebAssembly", "MuJoCo", "Blockly", "Tauri"],
  },
  {
    slug: "edugate-os",
    name: "EduGate OS",
    tagline: "An operating system for schools: one platform, and a device at the gate. In development.",
    sector: "Education",
    summary: [
      "EduGate OS joins the school portal to the school gate. A student taps an RFID card or is recognised at the gate, and the parent gets an entry or exit alert in real time; the same platform runs timetables, results, fees, computer-based exams and the library, with schools building their own pages and forms without a developer.",
      "It is in development. The foundation is built: a multi-tenant core where each school's data is isolated at the database, authentication and identity, the academic base, the gate-node and bus-tracker firmware, and service contracts for face recognition and the language model.",
    ],
    highlights: [
      "Multi-tenant from the start, with each school isolated by Postgres row-level security.",
      "Hardware and software as one system: an ESP32 gate node and a bus tracker on the same platform.",
      "Roles for school admin, teacher, student, parent, accountant and gate security, each with its own view.",
      "Parents reached on a web app or by USSD.",
    ],
    stack: ["Elixir", "Phoenix", "PostgreSQL", "Next.js", "ESP32", "Python"],
  },
  {
    slug: "loeko",
    name: "Loeko",
    tagline: "Speech-first Yoruba learning that scores your tones.",
    sector: "Language",
    summary: [
      "Yoruba is tonal, so a learning app that only reads and writes teaches the wrong half of the language. Every Loeko lesson is built around speaking: the app listens, scores pronunciation on tone, fluency and accuracy, gives specific feedback, and repeats the exercise until it is right.",
      "The speech stack is purpose-built for the language rather than borrowed: a Whisper model fine-tuned for Yoruba on the way in, YarnGPT on the way out.",
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
    tagline: "An idea in, a narrated video out, in your language.",
    sector: "Media",
    summary: [
      "A griot is a West African storyteller. GriotVid takes a topic or a script and returns a finished, narrated, captioned video: the script and scene plan are written in the chosen language, footage is pulled from Pexels and Pixabay, narration is generated as one continuous take, music is picked by mood, and FFmpeg assembles the result on the GPU.",
      "Narration uses Edge-TTS for English and several African languages, and YarnGPT for Yoruba, Igbo and Hausa. Paste your own script and it is narrated word for word: the model only picks footage and a title, and never rewrites your words.",
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
    tagline: "An edge-AI layer that makes the CCTV you already own actually think.",
    sector: "Computer vision",
    reel: "DaSXdAOitWP",
    summary: [
      "Security cameras are everywhere in Nigeria. Intelligence is not. The cameras most businesses already own record problems rather than prevent them: by the time anyone reviews the footage, the theft has happened and the intruder is gone.",
      "SmartEyes is the layer that closes that gap, and it plugs into the cameras that are already on the wall. No rip-and-replace, no new hardware bill: intrusion, loitering and unusual movement are detected as they happen, and the alert reaches a phone in the moment rather than hours later.",
      "It runs on affordable edge hardware rather than streaming everything to a cloud, which is what makes it viable on the bandwidth an estate, a warehouse or a retail shop actually has. Underneath, detection holds a person's identity across frames and can record their visit as its own clip, so reviewing an incident means opening one file instead of scrubbing an hour of floor.",
    ],
    highlights: [
      "Retrofits existing CCTV: the business keeps the cameras it already paid for.",
      "Real-time detection of intrusion, loitering and unusual movement, not after-the-fact review.",
      "Alerts pushed to a phone the moment something happens.",
      "Runs on affordable edge hardware, so it does not depend on upload bandwidth.",
      "Per-person identity held across frames, with entry and exit times logged and a clip recorded per visit.",
    ],
    stack: ["Python", "YOLO", "OpenCV", "Edge inference", "SQLite"],
  },
  {
    slug: "oics",
    name: "OICS",
    tagline: "A guard box for the CCTV you already have. It sees, warns the intruder in their language, and calls you.",
    sector: "Security",
    summary: [
      "The OkhubTech Intelligent Camera System sits next to an existing DVR or NVR and turns 1 to 8 ordinary cameras (Hikvision, Dahua, Uniview, Reolink, any RTSP or ONVIF camera) into an active guard. Nothing is replaced.",
      "It detects a person behind the counter, a person in a restricted area at night, fire and smoke, and camera tampering: a covered or smeared lens, a camera pushed aside, a cut cable. Then it acts: it shouts at the intruder through a horn speaker in Yoruba, Igbo, Hausa, Pidgin or English, switches a siren or light through a relay, and alerts the owner by Telegram, WhatsApp or a phone call.",
      "It is the hardware sibling of SmartEyes: a Raspberry Pi 4 box powered from the CCTV's own UPS, so it stays up through a power cut.",
    ],
    highlights: [
      "Voice deterrence in five Nigerian languages, through a speaker at the scene.",
      "Tamper detection: lens covered, smeared, camera moved or cable cut.",
      "Alerts raised while the internet is down are kept and delivered when it returns.",
      "A start-up message on every boot, so the owner knows about power cuts, and a daily report each morning.",
      "Owner commands from Telegram: status, arm, disarm, silence, snapshot.",
    ],
    stack: ["Elixir", "Frigate", "MQTT", "Raspberry Pi 4", "Coral TPU"],
  },
  {
    slug: "in-store-vision",
    name: "In-Store CV Tracking",
    tagline: "Shelf and shopper, watched together: who took what, and who needs help.",
    sector: "Retail",
    summary: [
      "A camera system for shops that watches the shelf and the shopper together. It tracks each person through the store and keeps their identity when they step out of view, counts the products on each shelf, and when a count drops it attributes the missing item to whoever reached into that shelf just before. An unmatched drop is still raised for a person to review rather than thrown away.",
      "The same camera feed watches for safety: a fall, a weapon or a fire. Alerts go over MQTT to small ESP8266 nodes in each zone, routed by urgency, and every shelf removal is written out as a running, POS-ready item list. It is a working prototype, and it needs no labelled dataset to start counting new products.",
    ],
    highlights: [
      "Grab detection from pose: fires once when a wrist enters a shelf zone, not on every frame it stays there.",
      "Fall detection that waits for the torso to stay horizontal over several frames, so tying a shoelace does not trigger it.",
      "Open-vocabulary shelf counting: name the products and it counts them, with no training run.",
      "Theft fusion links a shelf count drop to the person who grabbed in that zone moments before.",
      "Alerts routed by type: weapon and fire to critical, falls to staff, theft to review.",
      "Each part is tested on its own, from re-identification to the POS feed.",
    ],
    stack: ["Python", "YOLO26", "YOLOE", "StrongSORT", "MQTT", "ESP8266"],
  },
  {
    slug: "yoruba-live-voice",
    name: "Yoruba Live Voice",
    tagline: "An always-on Yoruba speech pipeline that never stops listening.",
    sector: "Language",
    reel: "DbdIjVDlIxe",
    summary: [
      "Speak Yoruba into a microphone and the system either captions what you said with correct accents, or answers you as a voice assistant and speaks the reply aloud.",
      "The engineering problem is that cloud calls are slow and microphones are not patient. Five stages run concurrently so a slow network round trip never blocks capture or live decoding: voice activity detection and speech-to-text stay local, and only correction and speech synthesis leave the machine.",
    ],
    highlights: [
      "Five concurrent stages, so the microphone is never deaf while a slow stage is working.",
      "Streaming voice-activity detection emits live partial snapshots and finalises on a pause.",
      "Speech-to-text runs locally; only the correction and synthesis steps are remote.",
      "Two modes from the same pipeline: accented captioning, or spoken conversation.",
      "Now drives hardware: wired to an ESP32-S3 with motor drivers, spoken Yoruba becomes movement with no English step in between.",
      "A ROS 2 digital twin: one spoken command drives the real robot on the floor and a matching robot in Gazebo at the same time, both shown in RViz.",
      "Speech recognition now runs on N-ATLAS, Nigeria's Yoruba ASR model, built once from a local cache so nothing downloads at run time.",
    ],
    stack: ["Python", "N-ATLAS", "faster-whisper", "Silero VAD", "YarnGPT", "ROS 2", "Gazebo", "ESP32"],
  },
  {
    slug: "transcriber",
    name: "Transcriber",
    tagline: "Any audio, any video, any language, transcribed locally.",
    sector: "Language",
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
    summary: [
      "A marker-based augmented reality web app that animates artwork. Tracking is natural-feature based, so it locks onto the artwork itself rather than a printed QR code, and it runs in a browser, so there is nothing to install.",
      "The camera is only requested when someone taps to launch, never on page load. With the optional backend running, an uploaded artwork can be saved and shared as a link with a QR code that pins any phone to that piece.",
    ],
    highlights: [
      "Natural-feature tracking on the artwork itself: no markers or QR codes in the frame.",
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
    summary: [
      "A browser document editor that recreates the familiar ribbon interface and page-based layout: rich text, formatting, image insertion, zoom controls and keyboard shortcuts.",
      "The page-based layout is the hard part: most browser editors are one long scroll, which is fine until someone needs to know what will be on page three.",
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
    slug: "pdf-studio",
    name: "PDF Studio",
    tagline: "A full PDF editor that runs in the browser. Your files never leave your device.",
    sector: "Productivity",
    url: "https://pdf-studio.yemokanlawon.workers.dev",
    summary: [
      "Click any line in an existing PDF and retype it; only the changed characters are rewritten, in the line's own fonts and spacing. Add text, images, ink, shapes, notes and signatures, fill and create forms, reorder, merge and split pages, and convert Word, Excel, PowerPoint, images and more into one PDF.",
      "The editing engine is C++ on MuPDF, compiled to WebAssembly, so every file is processed on the user's own device and nothing is uploaded. Hosting is a static site.",
    ],
    highlights: [
      "Edits existing text in place, not by pasting a box over it.",
      "Redaction that removes the text, pixels and vector graphics underneath, rather than covering them.",
      "AES-256 password protection, compression, metadata editing and undo that survives saving.",
      "55 engine gate tests, also run under AddressSanitizer, 63 browser tests, and a text-edit fidelity eval checked by an independent PDF reader.",
    ],
    stack: ["C++", "MuPDF", "WebAssembly", "Emscripten", "JavaScript", "Cloudflare"],
  },
  {
    slug: "whatsapp-game",
    name: "WhatsApp Game",
    tagline: "A game platform that lives entirely inside a chat thread.",
    sector: "Education",
    summary: [
      "A gaming platform played through WhatsApp messages: four game types, clan assignment, player profiles with levels and points, and a global leaderboard. No app, no website, no download: the whole thing is a conversation.",
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

/** Declaration order is the curated order: edit PRODUCTS_DATA to reorder. */
export const PRODUCTS: readonly Product[] = PRODUCTS_DATA;

export const PRODUCT_SLUGS: readonly string[] = PRODUCTS.map((p) => p.slug);

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);
