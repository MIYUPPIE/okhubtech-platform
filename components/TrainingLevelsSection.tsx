import MediaFrame from "@/components/media/MediaFrame";
import {
  BOOTCAMP_CLIPS,
  PRIMARY_CLIPS,
  SECONDARY_CLIPS,
  TRAINING_CLIPS,
} from "@/lib/media";
import type { Captioned } from "@/lib/media";
import type { VideoAsset } from "@/lib/media.generated";

type Level = {
  readonly id: string;
  readonly heading: string;
  readonly title: string;
  readonly blurb: string;
  readonly clips: readonly Captioned<VideoAsset>[];
  /** Most of these clips are vertical phone footage; the classroom archive is not. */
  readonly aspect: string;
};

const LEVELS: readonly Level[] = [
  {
    id: "primary",
    heading: "Primary",
    title: "Building the first robot.",
    blurb: "Motors, wheels and a chassis kit, assembled by hand.",
    clips: PRIMARY_CLIPS,
    aspect: "3 / 4",
  },
  {
    id: "secondary",
    heading: "Secondary",
    title: "Block code driving real hardware.",
    blurb: "From the editor to a breadboard that actually lights up.",
    clips: SECONDARY_CLIPS,
    aspect: "3 / 4",
  },
  {
    id: "bootcamp",
    heading: "Bootcamp",
    title: "The 4IR cohort's own builds.",
    blurb: "What the free 3-Saturday programme turns into by week three.",
    clips: BOOTCAMP_CLIPS,
    aspect: "3 / 4",
  },
  {
    id: "training",
    heading: "Training",
    title: "The wider archive.",
    blurb: "Vision, actuators and the case for teaching any of this at all.",
    clips: TRAINING_CLIPS,
    aspect: "4 / 3",
  },
];

/**
 * Every classroom clip OKHub has, split by who is on camera rather than
 * poured into one undifferentiated strip.
 *
 * lib/media.ts only puts a clip in Primary or Secondary when the shot itself
 * says so (a uniform, a caption on the export); anything level-agnostic
 * lands in Training. Bootcamp is the one section that is not a school level
 * at all - it is the 4IR cohort programme, flyer and independent builds
 * included.
 *
 * Poster-first, like the rest of the showreel: nothing here autoplays.
 */
const TrainingLevelsSection = () => (
  <section className="container-default section-shell">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="section-heading">The floor, by level</p>
        <h2 className="section-title mt-3">Who&apos;s in the footage.</h2>
      </div>
      <p className="max-w-sm text-sm text-black/60 dark:text-white/60">
        Primary and secondary classes, the 4IR bootcamp cohort, and the wider
        training archive underneath.
      </p>
    </div>

    <div className="mt-10 space-y-12">
      {LEVELS.map((level) => (
        <div key={level.id}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-black/50 dark:text-white/45">
                {level.heading}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-black dark:text-white sm:text-2xl">
                {level.title}
              </h3>
            </div>
            <p className="max-w-xs text-sm text-black/60 dark:text-white/60">{level.blurb}</p>
          </div>

          <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {level.clips.map((item) => (
              <MediaFrame
                key={item.asset.id}
                item={item}
                aspect={level.aspect}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="rounded-2xl border border-black/10 dark:border-white/10"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrainingLevelsSection;
