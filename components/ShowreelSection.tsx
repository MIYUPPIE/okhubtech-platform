import MediaFrame from "@/components/media/MediaFrame";
import VideoLoop from "@/components/media/VideoLoop";
import { SHOWREEL, WORKBENCH_LOOP } from "@/lib/media";

/**
 * Footage from actual classes. Nothing autoplays here — each clip has burned-in
 * captions worth reading, so they wait for a click. The workbench strip behind
 * the heading is the only moving thing, and it stops when it scrolls away.
 */
const ShowreelSection = () => (
  <section className="section-shell">
    <div className="container-default">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10">
        <VideoLoop item={WORKBENCH_LOOP} fill />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/70" aria-hidden />
        <div className="relative px-6 py-14 text-center sm:px-10">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/60">In the classroom</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
            Taught with hardware in hand.
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHOWREEL.map((item) => (
          <MediaFrame
            key={item.asset.id}
            item={item}
            aspect="4 / 3"
            sizes="(max-width: 640px) 100vw, 25vw"
            className="rounded-2xl border border-black/10 dark:border-white/10"
          />
        ))}
      </div>
    </div>
  </section>
);

export default ShowreelSection;
