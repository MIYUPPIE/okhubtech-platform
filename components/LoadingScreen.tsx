"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  active: boolean;
}

const LoadingScreen = ({ active }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 100);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative flex w-64 flex-col items-center gap-6 text-center">
            <motion.div
              className="h-32 w-32 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 40px rgba(255,215,0,0.4)",
                  "0 0 60px rgba(247,184,1,0.6)",
                  "0 0 40px rgba(255,215,0,0.4)",
                ],
                rotate: [0, 360],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                background:
                  "radial-gradient(circle, rgba(247,184,1,0.4), transparent 60%)",
              }}
            />
            <div>
              <p className="font-display text-lg text-black dark:text-white">
                Calibrating Innovation Stack
              </p>
              <p className="text-xs uppercase tracking-[0.4em] text-black/65 dark:text-white/50">
                OKHub Technology
              </p>
            </div>
            <div className="w-full">
              <div className="h-1.5 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#FFD700,#F7B801)" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="mt-2 text-xs text-black/60 dark:text-white/60">{progress}%</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
