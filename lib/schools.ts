/**
 * The secondary-school partnership: student lab, staff training, kits.
 *
 * Single source of truth for /schools. The same programme is sold as a PDF
 * built from docs/secondary-school-partnership/content.py; the session plan,
 * three-day timetable and chapter list here mirror that file, and
 * scripts/verify-kits.mjs fails the build if they drift (chapter coverage,
 * hours per day, session count, chapter titles).
 *
 * Kept off this page on purpose:
 *
 *  - No school is named. A named school in the PDF is a proposal to that
 *    school, not a client reference we have permission to publish.
 *  - No third-party statistics. The PDF cites them with sources; a web page
 *    that quotes them loses the footnotes and turns them into our claims.
 *  - No training fee. Training is quoted per school; kit prices come from
 *    lib/kits.ts.
 *
 * Import-free so the gate can run it directly under Node's type stripping.
 */

export const BOOK = {
  title: "Robotics for Everyone",
  subtitle: "A Practical Guide for Beginners",
  author: "Okanlawon Olayemi",
  pages: 331,
  chapters: 20,
  projects: 18,
} as const;

/** Chapter number and title, exactly as printed in the book's contents. */
export const CHAPTERS: readonly (readonly [number, string])[] = [
  [1, "What Is a Robot?"],
  [2, "The Building Blocks of a Robot"],
  [3, "Thinking Like a Robotics Engineer"],
  [4, "Electronics Essentials"],
  [5, "Your First Microcontroller Boards"],
  [6, "Programming Robots in C, C++ and Python"],
  [7, "Sensing the World"],
  [8, "Distance, Motion and Position Sensors"],
  [9, "Identification, Switching, Displays and Wireless"],
  [10, "Motors, Servos and Actuators"],
  [11, "Introduction to Control Systems"],
  [12, "Practical Motor Control"],
  [13, "Wheeled Robots"],
  [14, "Legged Robots and the Hexapod"],
  [15, "Adding Computer Vision to Your Robot"],
  [16, "ROS 2 Basics"],
  [17, "Physical AI, Language Models and Humanoid Robots"],
  [18, "Simulation and Testing Before You Build"],
  [19, "Safety, Ethics and Real-World Considerations"],
  [20, "Where to Go From Here"],
];

/** The partnership in one line each. */
export const PARTS = [
  {
    n: 1,
    title: "Student robotics and AI lab",
    detail:
      "Six working builds, sequenced from JSS1 to SS3. Block coding first, then C and C++, simulation, and AI running on the device.",
  },
  {
    n: 2,
    title: "Staff training",
    detail:
      "A 3-day intensive to start fast, or ten sessions through all 20 chapters of Robotics for Everyone. Both carry a safety gate and a copy of the book per teacher.",
  },
  {
    n: 3,
    title: "Tested kits for the lab",
    detail:
      "Eight catalogue kits mapped to the chapters and class levels they serve, with ready lab packs and the school discount worked out.",
  },
] as const;

/** JSS1 to SS3, mapped to the book and to the kits. Kit names must match lib/kits.ts. */
export const PATHWAY = [
  {
    stage: "Foundations",
    level: "JSS1 to JSS2",
    detail: "Circuits, sensors and logic on a breadboard through block programming. No soldering iron yet.",
    chapters: "Ch. 4 to 6",
    kits: ["ignite-genesis"],
  },
  {
    stage: "Builders",
    level: "JSS3",
    detail: "CAD in Tinkercad, a laser-cut chassis, then assembly and wiring of a first rolling robot.",
    chapters: "Ch. 2, 12, 13",
    kits: ["rover-m2", "sensorverse-22"],
  },
  {
    stage: "Systems",
    level: "SS1 to SS2",
    detail: "The six capstone builds: sensing, decisions, actuation, closed loop. Proven in Webots, then built.",
    chapters: "Ch. 7 to 11, 18",
    kits: ["sentinel-rfid-lab", "picode-lab"],
  },
  {
    stage: "AI integration",
    level: "SS2 to SS3",
    detail: "Vision, voice and language running on the hardware itself.",
    chapters: "Ch. 15, 17",
    kits: ["rover-sense-iot", "rover-ultimate-x"],
  },
  {
    stage: "Competition and portfolio",
    level: "Any stage past Systems",
    detail: "WRO and FIRST LEGO League style entries. A published build, and a CV line that is real.",
    chapters: "Ch. 20",
    kits: [],
  },
] as const;

/** Tools, by the stage students meet them. */
export const TOOLS = [
  { tool: "Block programming", level: "JSS1 to JSS2", detail: "A drag-and-drop editor drives real Arduino hardware before any text code." },
  { tool: "Tinkercad and Wokwi", level: "JSS2 to JSS3", detail: "Circuits and ESP32 projects simulated before anything is wired." },
  { tool: "Laser-cut and 3D-printed CAD", level: "JSS3", detail: "A chassis is drawn first, then cut." },
  { tool: "Arduino and ESP32 firmware", level: "JSS3 up", detail: "C and C++ for motor drivers, sensor arrays and WiFi boards." },
  { tool: "Webots", level: "SS1 to SS2", detail: "Obstacle avoidance proven in simulation, then run on the real build." },
  { tool: "On-device AI", level: "SS2 to SS3", detail: "Vision and language models running on the hardware, not a cloud API." },
] as const;

/** Three training tracks. Track B is the core. */
export const TRACKS = [
  {
    track: "A",
    title: "Leadership briefing",
    detail: "Half a day for the principal and heads of department: lab layout, safety policy, timetable, budget, and how to read the termly evidence.",
  },
  {
    track: "B",
    title: "Teacher training",
    detail: "The core, in two options: a 3-day intensive or a ten-session academy. Three to six teachers, using the book.",
  },
  {
    track: "C",
    title: "Lab technician and safety",
    detail: "Two sessions: battery handling and charging, soldering rules, kit audit and repair, storage. Built from the book's Safety Notes and Chapter 19.",
  },
] as const;

/** Observe, co-teach, lead. */
export const HANDOVER = [
  {
    term: "Term 1",
    title: "Observe",
    detail: "OKHub teaches the student lab. Teachers sit in, run a bench each, and finish their training.",
  },
  {
    term: "Term 2",
    title: "Co-teach",
    detail: "Teachers lead with an OKHub instructor beside them. The practical assessment happens here, in front of a real class.",
  },
  {
    term: "Term 3",
    title: "Lead",
    detail: "Teachers run the lab. OKHub visits for check-ins, reviews student builds, and supports the demo day.",
  },
] as const;

export type Session = {
  readonly n: number;
  readonly title: string;
  readonly chapters: readonly number[];
  readonly activity: string;
  readonly outcome: string;
};

/** The ten-session academy. Three hours each. Every chapter 1 to 20 is in exactly one session or in OPTIONAL_CHAPTERS. */
export const SESSIONS: readonly Session[] = [
  { n: 1, title: "What a robot is, and what it is made of", chapters: [1, 2],
    activity: "Sort real machines into robot and not-robot. Draw the sense, think, act loop for a school object.",
    outcome: "A shared definition and a block diagram teachers can reuse in class." },
  { n: 2, title: "Safety first, then the engineering mindset", chapters: [3, 19],
    activity: "Run the Safety Notes checklist on your own lab. Write a power budget and a test plan.",
    outcome: "A signed-off lab safety routine. No teacher takes student kits until this is passed." },
  { n: 3, title: "Electronics and your first boards", chapters: [4, 5],
    activity: "Ohm's law on a breadboard with a multimeter. Blink an LED on the Uno and on the ESP32.",
    outcome: "Confidence to wire, measure and flash a board without help." },
  { n: 4, title: "Programming in C, C++ and Python", chapters: [6],
    activity: "Write, break and debug sketches. Run the same idea in MicroPython on the ESP32.",
    outcome: "A debugging routine teachers can model aloud to a class." },
  { n: 5, title: "Sensing the world", chapters: [7],
    activity: "Sensor projects 1 to 8: temperature, rain, soil, gas, light, touch, sound.",
    outcome: "Eight working sensor builds and the classroom version of each." },
  { n: 6, title: "Distance, motion, identification and wireless", chapters: [8, 9],
    activity: "Sensor projects 9 to 18: ultrasonic, PIR, tilt, reed, MPU-6050, RFID, relay, LCD, radio, ESP-NOW.",
    outcome: "All eighteen projects done once, by the teacher, before any student does them." },
  { n: 7, title: "Motors, feedback and PID", chapters: [10, 11],
    activity: "Drive DC motors, servos and a stepper. Tune a simple controller and watch it settle.",
    outcome: "A plain-language way to explain feedback to a JSS3 or SS1 class." },
  { n: 8, title: "Practical motor control", chapters: [12],
    activity: "Motor driver wiring, speed control, encoders. Make a chassis drive straight.",
    outcome: "A chassis that drives straight, and the reason it did not at first." },
  { n: 9, title: "Wheeled robots and robot vision", chapters: [13, 15],
    activity: "Build the line follower and obstacle avoider. Stream video from an ESP32-CAM and track a colour.",
    outcome: "The two capstone builds students will attempt in Term 2." },
  { n: 10, title: "Simulate, think about AI, plan the term", chapters: [17, 18, 20],
    activity: "Obstacle avoidance in Webots. Connect a language model to a robot through an allowed-commands list. Draft the Term 1 plan.",
    outcome: "A teaching plan for the term and the practical assessment." },
];

/** Not in a core session: for the teacher who will lead a club. */
export const OPTIONAL_CHAPTERS = [
  { chapter: 14, note: "The hexapod: a servo-heavy build for an after-school club lead." },
  { chapter: 16, note: "ROS 2 basics: for the teacher who will lead the SS2 to SS3 AI club." },
] as const;

export type Block = {
  readonly start: string;
  readonly hours: number;
  readonly activity: string;
  readonly chapters: readonly number[];
};

export type Day = { readonly day: number; readonly title: string; readonly blocks: readonly Block[] };

/** The three-day intensive. Six contact hours a day. */
export const THREE_DAY: readonly Day[] = [
  { day: 1, title: "Safe, wired and running", blocks: [
    { start: "09:00", hours: 1.5, activity: "What a robot is and what it is made of. Sense, think, act on real machines.", chapters: [1, 2] },
    { start: "10:45", hours: 1.5, activity: "Safety gate: Safety Notes, batteries, soldering, a stop switch on every robot. Gate 1 sign-off.", chapters: [3, 19] },
    { start: "13:15", hours: 1.75, activity: "Electronics on a breadboard: Ohm's law, multimeter, voltage divider.", chapters: [4] },
    { start: "15:15", hours: 1.25, activity: "First boards: blink an LED on the Uno and the ESP32, then write and debug a first sketch.", chapters: [5, 6] },
  ] },
  { day: 2, title: "Sense and move", blocks: [
    { start: "09:00", hours: 1.5, activity: "The sensors teachers use most: DHT11 temperature, HC-SR04 ultrasonic, PIR motion.", chapters: [7, 8] },
    { start: "10:45", hours: 1.5, activity: "Identify, switch, display: RFID reader, relay, LCD.", chapters: [9] },
    { start: "13:15", hours: 1.75, activity: "Motors, servos and an H-bridge driver. Drive a DC motor both ways.", chapters: [10] },
    { start: "15:15", hours: 1.25, activity: "Feedback in plain language, then motor control for a robot that drives straight.", chapters: [11, 12] },
  ] },
  { day: 3, title: "Build, teach, plan", blocks: [
    { start: "09:00", hours: 2, activity: "Build a wheeled robot from a Rover M2 kit: chassis, driver, ultrasonic obstacle avoider.", chapters: [13] },
    { start: "11:15", hours: 1, activity: "Test plan and simulation: test on the bench first, then see the same logic in Webots.", chapters: [18] },
    { start: "13:15", hours: 1.75, activity: "Teaching clinic: each teacher teaches a 10-minute segment to the group. Gate 2 knowledge check against the book's answer key.", chapters: [] },
    { start: "15:15", hours: 1.25, activity: "Plan the term, set the self-study route, choose the lab lead.", chapters: [20] },
  ] },
];

export const HOURS_PER_DAY = 6;
export const SESSION_HOURS = 3;

/** The two training options side by side. */
export const TRAINING_OPTIONS = [
  {
    key: "intensive",
    name: "3-day intensive",
    when: "Three consecutive days, in a holiday block or the first weeks of term.",
    hours: THREE_DAY.length * HOURS_PER_DAY,
    builds: "6 sensor projects and a wheeled robot",
    after: "Self-study with termly check-ins: the other 12 sensor projects, robot vision (Chapter 15) and Physical AI (Chapter 17).",
    bestFor: "Schools that want the lab running this term.",
  },
  {
    key: "academy",
    name: "Ten-session academy",
    when: "Ten sessions of three hours, weekly or in a holiday block.",
    hours: SESSIONS.length * SESSION_HOURS,
    builds: "All 18 sensor projects, a wheeled robot and a camera robot",
    after: "Two optional chapters for club leads: the hexapod and ROS 2.",
    bestFor: "Schools that want every teacher through the whole book.",
  },
] as const;

export const OKHUB_PROVIDES = [
  "Curriculum, module sequence and lesson plans for JSS1 to SS3",
  "An instructor in the room for every student session in Term 1",
  "Teacher training, assessment and a copy of the book per teacher",
  "Kits from the OKHub catalogue, tested before delivery, with tutorials, code and a year of support",
  "Termly check-ins until your staff lead on their own",
] as const;

export const SCHOOL_PROVIDES = [
  "A room with tables, power and storage that locks",
  "One or two timetable slots a week for the student lab",
  "Three to six teachers released for training: ICT, Physics, Basic Technology, Maths",
  "One named lead teacher and one lab technician",
  "A school head who attends the leadership briefing",
] as const;

/** Proposed targets. Each school's are fixed in writing in its own proposal. */
export const MILESTONES = [
  { when: "Before Term 1", what: "Every participating teacher passes the safety gate and builds the sensor projects set for their option." },
  { when: "Term 2", what: "Teachers lead sessions with an OKHub instructor beside them. Students hold working builds from the first three modules." },
  { when: "Term 3", what: "Your teachers run the lab. A demo day shows all six modules, and the school decides on a competition entry." },
] as const;
