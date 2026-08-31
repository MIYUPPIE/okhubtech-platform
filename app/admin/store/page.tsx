import { Suspense } from "react";
import { getStoreOverview } from "@/server/admin/store";

async function StoreContent() {
  const data = await getStoreOverview();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Commerce</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Store overview</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-black/60 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/60 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">Products</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {data.products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">{product.title}</p>
                <span className="text-sm text-white/50">{product.type}</span>
              </div>
              <p className="text-sm text-white/60">{product.description}</p>
              <p className="mt-2 text-sm text-white/50">
                Inventory: {product.inventory} • Price: {product.currency} {String(product.price)}
              </p>
            </div>
          ))}
          {data.products.length === 0 && <p className="text-white/60">No products yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div>Loading store...</div>}>
      <StoreContent />
    </Suspense>
  );
}
