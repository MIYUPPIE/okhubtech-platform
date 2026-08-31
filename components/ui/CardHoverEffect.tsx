"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

export interface HoverCardItem {
  title: string;
  description: string;
  icon: LucideIcon;
  tag?: string;
  stats?: string;
}

interface CardHoverEffectProps {
  items: HoverCardItem[];
}

const CardHoverEffect = ({ items }: CardHoverEffectProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          className="relative rounded-2xl border border-black/15 dark:border-white/10 bg-white shadow-sm dark:bg-black/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)]"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background:
                "linear-gradient(130deg, rgba(255,215,0,0.18), rgba(204,153,0,0.1))",
              boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
            }}
          />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-black/[0.06] p-3 dark:bg-white/10" style={{ color: "var(--gold-ink)" }}>
                <item.icon className="h-5 w-5" />
              </div>
              {item.tag && (
                <span className="rounded-full border border-black/15 dark:border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-black/70 dark:text-white/70">
                  {item.tag}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">{item.description}</p>
            </div>
            {item.stats && (
              <p
                className="text-sm font-medium"
                style={{ color: "var(--gold-ink)" }}
              >
                {item.stats}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CardHoverEffect;
