"use client";

import { motion } from "framer-motion";

interface SpotlightProps {
  className?: string;
  size?: number;
  color?: string;
}

const Spotlight = ({
  className,
  size = 420,
  color = "rgba(247, 184, 1, 0.7)",
}: SpotlightProps) => (
  <motion.div
    className={`pointer-events-none absolute -z-10 blur-[120px] ${className ?? ""}`}
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
    }}
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 0.8, scale: 1 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
  />
);

export default Spotlight;
