"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import type { PortfolioSlug } from "@/lib/site";

/**
 * The twelve delivered projects, on a ring you spin instead of a grid you
 * scroll past.
 *
 * The DOM never changes between "no JavaScript" and "fully interactive": it
 * is always the same twelve `<li><Link>` elements. Before the component
 * mounts on the client they lay out as an ordinary horizontal scroll-snap
 * row - real content, real links, no 3D required to use it. Once mounted, an
 * inline 3D transform is layered onto those same elements to arrange them
 * around a circle; nothing is duplicated or swapped out. Same split as the
 * homepage's WebGL office: the interactive layer sits over content that
 * already stands on its own.
 *
 * Titles and blurbs are compressed from each project's own page copy under
 * app/portfolio/<slug>/, not invented for this carousel.
 */

type Project = {
  slug: PortfolioSlug;
  title: string;
  blurb: string;
  image: string;
};

const PROJECTS: readonly Project[] = [
  {
    slug: "ai-agriculture",
    title: "AI-Powered Agriculture Platform",
    blurb: "Soil and weather sensors feed AI yield predictions for African farmers.",
    image: "/media/portfolio/agriculture.webp",
  },
  {
    slug: "ai-health-assistant",
    title: "Patient Vitals Monitor",
    blurb: "A bedside monitor built from parts a clinic can source: an Arduino reads temperature, heart rate and ECG.",
    image: "/media/portfolio/ai-health-assistant.webp",
  },
  {
    slug: "credit-card-fraud",
    title: "Credit Card Fraud Detection",
    blurb: "A risk platform using ANN and LSTM networks to catch fraud as it happens.",
    image: "/media/portfolio/credit-card-fraud.webp",
  },
  {
    slug: "ecommerce-transformation",
    title: "E-Commerce Transformation",
    blurb: "A storefront with integrated payments and logistics, built for local businesses moving online.",
    image: "/media/portfolio/ecommerce.webp",
  },
  {
    slug: "firefighting-robot",
    title: "Firefighting Robot",
    blurb: "A ruggedized robot that finds and tracks fire hazards with thermal imaging and AI.",
    image: "/media/portfolio/firefighting-robot.webp",
  },
  {
    slug: "hydroponics",
    title: "Hydroponics Automation",
    blurb: "A grow controller for places without reliable internet: one Arduino Nano watches pH, water and light.",
    image: "/media/portfolio/hydroponics.webp",
  },
  {
    slug: "iot-home",
    title: "IoT Home Automation",
    blurb: "A smart home ecosystem in Python centralizing lighting, security and thermostat control.",
    image: "/media/portfolio/iot-home.webp",
  },
  {
    slug: "serving-robot",
    title: "Restaurant Serving Robot",
    blurb: "Diners order from the robot's own web page; the kitchen sends it rolling to the table.",
    image: "/media/portfolio/serving-robot.webp",
  },
  {
    slug: "sign-language-educator",
    title: "Sign Language Educator",
    blurb: "A computer-vision tutor using YOLO and CNNs to recognize sign language in real time.",
    image: "/media/portfolio/sign-language-educator.webp",
  },
  {
    slug: "smart-campus",
    title: "Smart Campus Automation",
    blurb: "End-to-end automation and a digital twin for a university campus: security, energy and more.",
    image: "/media/portfolio/smart-campus.webp",
  },
  {
    slug: "speech-emotion",
    title: "Speech Emotion Recognition",
    blurb: "A GRU-based audio model that reads emotional signal directly out of speech.",
    image: "/media/portfolio/speech-emotion.webp",
  },
  {
    slug: "utme-career-advisor",
    title: "UTME Career Advisor",
    blurb: "A Django and LLM platform that turns UTME scores into a personalized career path.",
    image: "/media/portfolio/utme-career-advisor.webp",
  },
] as const;

const COUNT = PROJECTS.length;
const STEP_DEG = 360 / COUNT;
/** Card width plus the gap the ring math assumes between neighbours. */
const CARD_W = 232;
/** Radius that puts adjacent cards edge-to-edge: w / (2 * tan(pi/n)). */
const RADIUS = Math.round(CARD_W / (2 * Math.tan(Math.PI / COUNT)));
const AUTOPLAY_MS = 4200;
const DRAG_STEP_PX = 90; // horizontal drag distance that advances one card

/** Shortest angular distance between two card indices around the ring. */
const ringDistance = (a: number, b: number) => {
  const raw = Math.abs(a - b);
  return Math.min(raw, COUNT - raw);
};

const ProjectCarousel = () => {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  // Two independent reasons autoplay might stop: the visitor pressed pause
  // (sticky, survives the pointer leaving), and the pointer is currently
  // over the ring (transient). Collapsing them into one boolean meant moving
  // the mouse off the carousel silently un-paused a deliberate pause.
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragRef = useRef<{ x: number; moved: number } | null>(null);
  const stageRef = useRef<HTMLUListElement>(null);

  const playing = mounted && !userPaused && !hovering && !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => {
      setMounted(true);
      setReducedMotion(query.matches);
    };
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  const step = useCallback((delta: number) => {
    setActive((current) => ((current + delta) % COUNT + COUNT) % COUNT);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, step]);

  const onPointerDown = (event: React.PointerEvent) => {
    dragRef.current = { x: event.clientX, moved: 0 };
    (event.target as Element).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current.moved = event.clientX - dragRef.current.x;
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.moved <= -DRAG_STEP_PX) step(1);
    else if (drag.moved >= DRAG_STEP_PX) step(-1);
  };

  const cardStyle = useMemo(
    () =>
      PROJECTS.map((_, i) => ({
        transform: `rotateY(${i * STEP_DEG}deg) translateZ(${RADIUS}px)`,
      })),
    [],
  );

  return (
    <section id="projects" className="container-default section-shell" aria-roledescription="carousel" aria-label="Delivered projects">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-heading">Project wall</p>
          <h2 className="section-title mt-3">Twelve builds. Spin through them.</h2>
        </div>
        {mounted ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous project"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/15 text-black/70 transition hover:border-black/35 hover:text-black dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-pressed={userPaused}
              aria-label={userPaused ? "Resume autoplay" : "Pause autoplay"}
              className="grid h-10 w-10 place-items-center rounded-full border border-black/15 text-black/70 transition hover:border-black/35 hover:text-black dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
            >
              {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next project"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/15 text-black/70 transition hover:border-black/35 hover:text-black dark:border-white/15 dark:text-white/70 dark:hover:border-white/40 dark:hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      {mounted ? (
        <p className="mt-2 text-sm text-black/50 dark:text-white/50">
          Drag to spin, or use the arrows.
        </p>
      ) : null}

      <div
        className={
          mounted
            ? "relative mt-10 h-[26rem] w-full select-none overflow-hidden [perspective:1400px] sm:h-[28rem]"
            : "mt-10 w-full"
        }
        onPointerDown={mounted ? onPointerDown : undefined}
        onPointerMove={mounted ? onPointerMove : undefined}
        onPointerUp={mounted ? onPointerUp : undefined}
        onPointerCancel={mounted ? onPointerUp : undefined}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <ul
          ref={stageRef}
          className={
            mounted
              ? "absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d] transition-transform duration-700 ease-out"
              : "flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          }
          style={mounted ? { transform: `rotateY(${-active * STEP_DEG}deg)` } : undefined}
        >
          {PROJECTS.map((project, i) => {
            const dist = ringDistance(i, active);
            const isActive = i === active;
            return (
              <li
                key={project.slug}
                className={
                  mounted
                    ? "absolute left-0 top-0 w-[232px] -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden] transition-[opacity,transform] duration-700 ease-out"
                    : "shrink-0 snap-start"
                }
                style={
                  mounted
                    ? {
                        ...cardStyle[i],
                        opacity: isActive ? 1 : Math.max(0.2, 1 - dist * 0.32),
                      }
                    : undefined
                }
              >
                <Link
                  href={`/portfolio/${project.slug}/`}
                  aria-hidden={mounted && !isActive ? true : undefined}
                  tabIndex={mounted && !isActive ? -1 : undefined}
                  className={`group block w-[220px] overflow-hidden rounded-2xl border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition dark:bg-black/70 sm:w-[232px] ${
                    mounted && isActive
                      ? "scale-[1.05] border-[var(--gold-primary)] shadow-[0_18px_50px_rgba(247,184,1,0.25)]"
                      : "border-black/10 dark:border-white/10"
                  }`}
                >
                  <div className="relative aspect-square w-full bg-black/5 dark:bg-white/5">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="232px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-black dark:text-white">
                      {project.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-black/60 dark:text-white/60">
                      {project.blurb}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold-ink">
                      See the build <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 text-center">
        <Link href="/portfolio" className="btn-secondary">
          Browse the full portfolio
        </Link>
      </div>
    </section>
  );
};

export default ProjectCarousel;
