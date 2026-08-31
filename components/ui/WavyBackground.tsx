"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface WavyBackgroundProps {
  className?: string;
  children: ReactNode;
}

const WavyBackground = ({ className, children }: WavyBackgroundProps) => (
  <div
    className={`relative overflow-hidden rounded-3xl border border-black/15 dark:border-white/10 bg-white/50 dark:bg-black/50 p-8 sm:p-12 ${className ?? ""}`}
  >
    <motion.div
      className="absolute inset-[-40%] -z-10"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(247,184,1,0.4), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,215,0,0.35), transparent 40%), radial-gradient(circle at 60% 80%, rgba(204,153,0,0.4), transparent 40%)",
      }}
    />
    <motion.div
      className="absolute inset-0 -z-10 opacity-60"
      animate={{
        filter: ["hue-rotate(0deg)", "hue-rotate(45deg)", "hue-rotate(0deg)"],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      }}
    />
    {children}
  </div>
);

export default WavyBackground;
