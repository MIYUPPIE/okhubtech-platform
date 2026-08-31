"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ArrowRight, Minus, Plus, Play, RotateCcw, Square } from "lucide-react";

import type { OfficeControls } from "./CameraRig";
import { cycle } from "./cycle";
import { STATIONS, stationById, stationIndex } from "./stations";
import { useCapabilities } from "./useCapabilities";

/**
 * The homepage stage: a WebGL office behind, real HTML in front.
 *
 * The important structural decision is that the overlay is the content, not a
 * caption for it. Every station chip and every link in this component is in
 * the exported HTML whether or not the canvas ever starts, so the page works
 * with JavaScript off, with WebGL blocked, in a text browser and in a crawler.
 * The 3D is the presentation layer over content that stands on its own -
 * `scripts/verify-home.mjs` asserts exactly that against the built file.
 *
 * The headline and the pitch are not part of this component. They render in
 * app/page.tsx as ordinary text above the stage, not layered on the canvas,
 * so neither the copy nor the room has to compromise legibility for the
 * other. What is left here is the room itself, the six station chips, the
 * zoom/tour HUD, and the info panel a station opens.
 *
 * The canvas is loaded through next/dynamic with ssr:false because R3F cannot
 * render on the server. That is allowed here, and only here, because this
 * component is already a client component.
 */

const OfficeScene = dynamic(() => import("./OfficeScene"), { ssr: false });

const TOUR_INTERVAL = 6000;


const OfficeStage = () => {
  const caps = useCapabilities();
  const { resolvedTheme } = useTheme();
  const controlsRef = useRef<OfficeControls>({ zoom: () => {}, orbit: () => {} });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [touring, setTouring] = useState(false);
  const [visible, setVisible] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = stationById(activeId);
  const live = caps.webgl === true;

  // next-themes resolves on the client, so the first paint has no answer. Day
  // is the right guess: it matches the server-rendered body background.
  const mode = resolvedTheme === "dark" ? "night" : "day";

  const select = useCallback((id: string | null) => {
    setActiveId(id);
    setEngaged(true);
  }, []);

  const onEngage = useCallback(() => setEngaged(true), []);
  const onReady = useCallback(() => setReady(true), []);

  // --- guided tour ---------------------------------------------------------
  useEffect(() => {
    if (!touring || !live || caps.reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveId((current) => cycle(STATIONS, stationIndex(current) + 1).id);
    }, TOUR_INTERVAL);
    return () => window.clearInterval(timer);
  }, [touring, live, caps.reducedMotion]);

  // --- keyboard ------------------------------------------------------------
  useEffect(() => {
    if (!live) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Never steal a keystroke aimed at a field or at the header's menus.
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      if (event.key === "Escape") {
        setActiveId(null);
        setTouring(false);
        return;
      }
      if (event.key >= "1" && event.key <= String(STATIONS.length)) {
        setTouring(false);
        select(cycle(STATIONS, Number(event.key) - 1).id);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        // Arrows only drive the room once the visitor is clearly in it, so
        // they keep working as page navigation for everyone else.
        if (!engaged) return;
        event.preventDefault();
        setTouring(false);
        const step = event.key === "ArrowRight" ? 1 : -1;
        // From the wide shot, right enters at the first station and left at
        // the last, rather than both landing on the same one.
        const index = stationIndex(activeId);
        select(cycle(STATIONS, index === -1 ? (step === 1 ? 0 : -1) : index + step).id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live, engaged, activeId, select]);

  // --- pause the render loop when the stage is off screen ------------------
  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const chipClick = (event: React.MouseEvent, id: string) => {
    // Modified clicks belong to the browser: ctrl/cmd/shift/middle all open the
    // page, which is what the visitor asked for.
    if (!live || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    setTouring(false);
    select(id);
  };

  return (
    <div ref={stageRef} className="relative isolate">
      <div className="relative h-[calc(100svh-5rem)] min-h-[560px] w-full overflow-hidden rounded-b-[36px] bg-[#eceef2] dark:bg-[#050608]">
        {/* --- the room ---------------------------------------------------- */}
        <div className="absolute inset-0" aria-hidden>
          {live ? (
            <OfficeScene
              mode={mode}
              tier={caps.tier}
              reducedMotion={caps.reducedMotion}
              activeId={activeId}
              onSelect={select}
              controlsRef={controlsRef}
              visible={visible}
              onEngage={onEngage}
              onReady={onReady}
            />
          ) : (
            <StaticRoom />
          )}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
              live && !ready ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#0a0b0f] dark:to-black" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="inline-flex h-9 w-9 animate-spin rounded-full border-2 border-black/15 border-t-[var(--gold-primary)] dark:border-white/15" />
            </div>
          </div>
          {/* Legibility scrim behind the rail and the hint, nowhere else.
              There is no copy layered on the room any more - it moved to
              app/page.tsx as ordinary text above this stage - so this only
              has to carry the bottom edge. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/75 to-transparent dark:from-black/80" />
        </div>

        {/* --- the content -------------------------------------------------- */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-4 py-7 sm:px-8 lg:px-12">
          {live ? (
            <p
              className={`mb-3 text-[0.68rem] uppercase tracking-[0.22em] text-black/45 transition-opacity duration-500 dark:text-white/45 ${
                engaged ? "opacity-0" : "opacity-100"
              }`}
            >
              {caps.touch
                ? "Drag to look · pinch to zoom · tap a ring"
                : "Drag to look · shift + scroll to zoom · click a ring"}
            </p>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <StationRail
              activeId={activeId}
              live={live}
              onChipClick={chipClick}
            />
          </div>
        </div>

        {/* The HUD lives top-right, not bottom-right: FloatingContact pins two
            56px buttons to the bottom-right of every page and was sitting on
            top of the tour control. */}
        <div className="absolute right-4 top-4 z-20 lg:right-8">
          <div className="flex flex-col items-end gap-2">
            {live ? (
              <Hud
                controlsRef={controlsRef}
                touring={touring}
                onTour={() => {
                  if (touring) {
                    setTouring(false);
                    setActiveId(null);
                    return;
                  }
                  setTouring(true);
                  // Enter the tour on the first station rather than staring at
                  // the wide shot for a full interval before it moves.
                  setActiveId((current) => current ?? STATIONS[0].id);
                }}
                onReset={() => {
                  setTouring(false);
                  setActiveId(null);
                }}
              />
            ) : null}
          </div>
        </div>

        {/* --- the panel ---------------------------------------------------- */}
        {active ? (
          <div className="pointer-events-none absolute inset-x-4 bottom-32 z-20 sm:inset-x-auto sm:right-8 sm:top-1/2 sm:bottom-auto sm:w-[22rem] sm:-translate-y-1/2 lg:right-12">
            <div
              key={active.id}
              className="office-panel pointer-events-auto rounded-3xl border border-black/12 bg-white/92 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl dark:border-white/12 dark:bg-black/85 dark:shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
            >
              <p className="text-[0.62rem] uppercase tracking-[0.36em] text-gold-ink">
                {active.eyebrow}
              </p>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-black/75 dark:text-white/75">
                {active.blurb}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <Link href={active.href} className="btn-primary !px-5 !py-2.5 text-sm">
                  {active.cta} <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setTouring(false);
                    setActiveId(null);
                  }}
                  className="text-xs uppercase tracking-[0.2em] text-black/45 transition hover:text-black dark:text-white/45 dark:hover:text-white"
                >
                  Step back
                </button>
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

/**
 * The six links, in the DOM whether or not the room ever renders.
 *
 * They stay anchors on purpose. When the scene is live a plain click flies the
 * camera instead of navigating - the panel that opens carries the same link -
 * but ctrl-click, middle-click and "open in new tab" keep working, and with
 * JavaScript off they are simply six links.
 */
const StationRail = ({
  activeId,
  live,
  onChipClick,
}: {
  activeId: string | null;
  live: boolean;
  onChipClick: (event: React.MouseEvent, id: string) => void;
}) => (
  <nav aria-label="Places in the office" className="pointer-events-auto min-w-0 flex-1">
    <ul className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {STATIONS.map((station, i) => {
        const isActive = station.id === activeId;
        return (
          <li key={station.id} className="snap-start">
            <a
              href={station.href}
              onClick={(event) => onChipClick(event, station.id)}
              aria-current={isActive ? "true" : undefined}
              aria-describedby={live ? "office-rail-note" : undefined}
              className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-[var(--gold-primary)] bg-[var(--gold-primary)] text-black shadow-[0_8px_28px_rgba(247,184,1,0.4)]"
                  : "border-black/12 bg-white/80 text-black/75 backdrop-blur hover:border-black/30 hover:text-black dark:border-white/12 dark:bg-black/60 dark:text-white/75 dark:hover:border-white/35 dark:hover:text-white"
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-[0.6rem] font-semibold ${
                  isActive
                    ? "bg-black/15 text-black"
                    : "bg-black/8 text-black/50 dark:bg-white/10 dark:text-white/50"
                }`}
                aria-hidden
              >
                {i + 1}
              </span>
              {station.label}
            </a>
          </li>
        );
      })}
    </ul>
    <p id="office-rail-note" className="sr-only">
      With the 3D office running, these move the camera to that part of the room and
      open a panel containing the link. Press Escape to step back out.
    </p>
  </nav>
);

const Hud = ({
  controlsRef,
  touring,
  onTour,
  onReset,
}: {
  controlsRef: React.RefObject<OfficeControls>;
  touring: boolean;
  onTour: () => void;
  onReset: () => void;
}) => {
  const button =
    "grid h-9 w-9 place-items-center rounded-full border border-black/12 bg-white/80 text-black/70 backdrop-blur transition hover:border-black/30 hover:text-black dark:border-white/12 dark:bg-black/60 dark:text-white/70 dark:hover:border-white/35 dark:hover:text-white";

  return (
    <div className="pointer-events-auto hidden shrink-0 flex-col items-end gap-2 sm:flex">
      <button type="button" className={button} onClick={() => controlsRef.current.zoom(-1)} aria-label="Zoom in">
        <Plus className="h-4 w-4" />
      </button>
      <button type="button" className={button} onClick={() => controlsRef.current.zoom(1)} aria-label="Zoom out">
        <Minus className="h-4 w-4" />
      </button>
      <button type="button" className={button} onClick={onReset} aria-label="Back to the wide shot">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onTour}
        aria-pressed={touring}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
          touring
            ? "border-[var(--gold-primary)] bg-[var(--gold-primary)] text-black"
            : "border-black/12 bg-white/80 text-black/70 backdrop-blur hover:text-black dark:border-white/12 dark:bg-black/60 dark:text-white/70 dark:hover:text-white"
        }`}
      >
        {touring ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {touring ? "Stop" : "Tour"}
      </button>
    </div>
  );
};

/**
 * What stands in for the room when WebGL is unavailable or still being probed.
 *
 * A flat CSS approximation of the same space - perspective floor grid, a warm
 * window on the right, the gold datum line - so the page has a deliberate
 * backdrop rather than an empty rectangle. No canvas, no JavaScript.
 */
const StaticRoom = () => (
  <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#eceef2] to-[#dfe3ea] dark:from-[#0a0c11] dark:to-black">
    <div
      className="absolute inset-x-0 bottom-0 h-[62%] opacity-70"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.10) 1px, transparent 1px)",
        backgroundSize: "68px 68px",
        transform: "perspective(520px) rotateX(62deg)",
        transformOrigin: "bottom",
      }}
    />
    <div className="absolute right-0 top-[16%] h-[46%] w-[38%] rounded-l-3xl bg-gradient-to-br from-[#9ec5e8] via-[#cfe0ea] to-[#f6e7c8] opacity-70 blur-[1px] dark:from-[#0b1220] dark:via-[#16202f] dark:to-[#1d2436]" />
    <div className="absolute right-0 top-[16%] h-[46%] w-[38%] bg-[linear-gradient(90deg,transparent_calc(25%-2px),rgba(0,0,0,0.25)_25%,transparent_calc(25%+2px))] bg-[length:25%_100%]" />
    <div className="absolute left-0 top-[46%] h-px w-[64%] bg-[var(--gold-primary)] opacity-80 shadow-[0_0_24px_rgba(255,215,0,0.6)]" />
  </div>
);

export default OfficeStage;
