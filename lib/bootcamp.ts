/**
 * The current 4IR Bootcamp cohort and what it builds.
 *
 * Single source of truth for /bootcamp and anything that links to it, in the
 * same spirit as lib/contact.ts and lib/products.ts: one place to change a
 * fact, and a gate test (scripts/verify-bootcamp.test.mjs) that keeps this
 * file, the route and the sitemap from drifting apart.
 *
 * Rules for what belongs here:
 *
 *  - Only projects the cohort actually builds. This is a live list; when the
 *    cohort changes, this file changes, not the page.
 *  - Describe the behaviour, not the bill of materials. "Temperature and
 *    humidity monitoring" is what was specified; naming a DHT22 would be
 *    inventing a part number nobody confirmed.
 *  - `board` is only set where the controller was actually named.
 */

import type { LucideIcon } from "lucide-react";
import { Bot, Car, Droplets, Hand, School, TrainFront } from "lucide-react";

export type BootcampProject = {
  /** Stable key, also used as the React key and the anchor id. */
  readonly id: string;
  readonly title: string;
  /** One sentence on what the thing does. */
  readonly summary: string;
  /** The specific behaviours the build has to demonstrate. */
  readonly capabilities: readonly string[];
  /** Set only where the controller was named. */
  readonly board?: string;
  readonly icon: LucideIcon;
};

export const BOOTCAMP_PROJECTS: readonly BootcampProject[] = [
  {
    id: "dual-mode-robotic-car",
    title: "Dual-Mode Robotic Car",
    summary:
      "A car you can drive yourself, or leave to drive itself around whatever is in the way.",
    capabilities: [
      "Manual control mode",
      "Autonomous mode",
      "Obstacle detection and avoidance",
    ],
    board: "ESP32-S3",
    icon: Car,
  },
  {
    id: "obstacle-avoidance-robot",
    title: "Obstacle-Avoidance Robot",
    summary:
      "An autonomous robot that senses what is in front of it and decides which way to go.",
    capabilities: ["Obstacle detection", "Direction decision-making"],
    board: "Arduino",
    icon: Bot,
  },
  {
    id: "smart-classroom",
    title: "Smart Classroom Automation",
    summary:
      "A classroom that watches its own conditions and reacts without anyone getting up.",
    capabilities: [
      "Temperature and humidity monitoring",
      "Automatic fan control",
      "Automated door on a limit switch",
    ],
    icon: School,
  },
  {
    id: "deaf-blind-alert",
    title: "Deaf-Blind Communication & Obstacle Alert",
    summary:
      "Assistive hardware that reports obstacles through touch, for someone who can use neither sight nor sound.",
    capabilities: ["Tactile feedback", "Obstacle identification"],
    icon: Hand,
  },
  {
    id: "smart-water-pump",
    title: "Smart Water Pump",
    summary:
      "A pump that knows when the tank is full and stops on its own.",
    capabilities: ["Water-level sensing", "Automatic pump cut-off at level"],
    icon: Droplets,
  },
  {
    id: "railway-crossing-safety",
    title: "Smart Railway Crossing Safety",
    summary:
      "A crossing that feels the train coming and closes itself down before it arrives.",
    capabilities: [
      "Train vibration detection",
      "Barrier control",
      "Warning system",
      "Traffic lights and junction lighting",
    ],
    icon: TrainFront,
  },
];

/**
 * The channel the cohort's work is published to. Verified to resolve, unlike
 * the placeholder linkedin.com and twitter.com links that shipped alongside it.
 */
export const YOUTUBE_CHANNEL = "https://www.youtube.com/@okhubtech";
export const YOUTUBE_HANDLE = "@okhubtech";

export const BOOTCAMP_NAME = "4IR Bootcamp";
export const BOOTCAMP_ROUTE = "/bootcamp";
