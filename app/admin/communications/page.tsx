import { Suspense } from "react";
import { getContactSubmissions, resolveSubmission } from "@/server/admin/communications";
import { revalidatePath } from "next/cache";

async function handleResolve(id: string) {
  // "use server";
  // await resolveSubmission(id);
  // revalidatePath("/admin/communications");
}

function SubmissionCard({
  submission,
}: {
  submission: Awaited<ReturnType<typeof getContactSubmissions>>[number];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">{submission.type}</p>
        <p className="text-xs text-white/50">{new Date(submission.createdAt).toLocaleString()}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{submission.name}</p>
      <p className="text-sm text-white/60">{submission.email}</p>
      {submission.organization && <p className="text-sm text-white/60">{submission.organization}</p>}
      <p className="mt-3 text-white/80">{submission.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
        {submission.phone && <span>Phone: {submission.phone}</span>}
        <span>Status: {submission.resolved ? "Resolved" : "Open"}</span>
        {!submission.resolved && (
          <form action="">
            <button
              type="submit"
              className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-[var(--gold-primary)] hover:text-white"
            >
              Mark resolved
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

async function CommunicationsContent() {
  const submissions = await getContactSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Contact & collaboration requests</h1>
      </div>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <SubmissionCard key={submission.id} submission={submission} />
        ))}
        {submissions.length === 0 && (
          <p className="text-white/60">No submissions yet. Forms feed into this view automatically.</p>
        )}
      </div>
    </div>
  );
}

export default function CommunicationsPage() {
  return (
    <Suspense fallback={<div>Loading submissions...</div>}>
      <CommunicationsContent />
    </Suspense>
  );
}
