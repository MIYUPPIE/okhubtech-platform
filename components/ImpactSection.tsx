"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type ImpactMetric = {
  label: string;
  value: number;
};

const fallbackMetrics: ImpactMetric[] = [
  { label: "Solutions deployed", value: 84 },
  { label: "Institutions served", value: 136 },
  { label: "Communities impacted", value: 420 },
  { label: "Jobs enabled", value: 5200 },
];

const ImpactSection = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [metrics, setMetrics] = useState<ImpactMetric[]>(fallbackMetrics);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadMetrics() {
      try {
        const response = await fetch("/api/impact", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Failed to load impact metrics");
        }
        const data = (await response.json()) as { metrics: ImpactMetric[] };
        if (!cancelled && Array.isArray(data.metrics) && data.metrics.length > 0) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Impact metrics fetch failed", error);
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section className="container-default section-shell" id="impact">
      <div className="space-y-4">
        <p className="section-heading">Impact Metrics</p>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-black/15 dark:border-white/10 bg-white shadow-md dark:bg-black/70 p-8"
        >
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-black/65 dark:text-white/50">{metric.label}</p>
                <p className="mt-3 text-4xl font-semibold text-[var(--gold-primary)]">
                  {isInView ? metric.value.toLocaleString() : "--"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-black/65 dark:text-white/65">
            Admin teams update metrics directly from the dashboard, ensuring real-time storytelling across regions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;
