import { Suspense } from "react";
import { getProgramsWithTracks } from "@/server/admin/programs";

async function ProgramsContent() {
  const programs = await getProgramsWithTracks();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Education</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Programs & tracks</h1>
      </div>
      <div className="space-y-4">
        {programs.map((program) => (
          <div key={program.id} className="rounded-3xl border border-white/10 bg-black/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">{program.isPaid ? "Paid" : "Free"}</p>
                <h2 className="text-2xl font-semibold text-white">{program.title}</h2>
                {program.summary && <p className="text-sm text-white/60">{program.summary}</p>}
              </div>
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60">
                {program.tracks.length} tracks
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {program.tracks.map((track:any) => (
                <div key={track.id} className="rounded-2xl border border-white/5 bg-black/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{track.level}</p>
                  <p className="text-lg font-semibold text-white">{track.name}</p>
                  {track.description && <p className="text-sm text-white/60">{track.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {programs.length === 0 && (
          <p className="text-white/60">No programs yet. Add entries via Prisma or upcoming admin forms.</p>
        )}
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<div>Loading programs...</div>}>
      <ProgramsContent />
    </Suspense>
  );
}
