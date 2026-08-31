import { Suspense } from "react";
import { getAdminOverview } from "@/server/admin/overview";

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-white/10 bg-black/60 p-5">
    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </div>
);

async function OverviewContent() {
  const data = await getAdminOverview();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Studio overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Command dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white/70">
        <p>Coming soon: program pipeline, store performance, research tracker, contact queue.</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
