import MediaFrame from "@/components/media/MediaFrame";
import VideoLoop from "@/components/media/VideoLoop";
import { BRANDED_SHOWREEL, WORKBENCH_LOOP } from "@/lib/media";

/**
 * The branded showreel leads: it is the one clip OKHub produced as marketing,
 * it is narrated, and it covers four projects in under a minute.
 *
 * The class clips that used to sit in a flat strip beneath it now live in
 * TrainingLevelsSection, split out by school level instead of lumped
 * together - see that component for why.
 *
 * Nothing here autoplays. The branded reel carries burned-in captions and a
 * voice track, so it waits for a click. Only the workbench strip behind the
 * heading moves, and it stops when it scrolls out of view.
 */
const ShowreelSection = () => (
  <section className="section-shell">
    <div className="container-default">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10">
          <VideoLoop item={WORKBENCH_LOOP} fill />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/70"
            aria-hidden
          />
          <div className="relative flex h-full flex-col justify-center px-6 py-14 sm:px-10">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60">
              In the classroom
            </p>
            <h2 className="mt-4 max-w-md font-display text-3xl font-semibold text-white sm:text-4xl">
              Taught with hardware in hand.
            </h2>
            <p className="mt-4 max-w-sm text-white/70">Sound on for the showreel.</p>
          </div>
        </div>

        <MediaFrame
          item={BRANDED_SHOWREEL}
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="rounded-3xl border border-black/10 dark:border-white/10"
        />
      </div>
    </div>
  </section>
);

export default ShowreelSection;
