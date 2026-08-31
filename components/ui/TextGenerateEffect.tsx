"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface TextGenerateEffectProps {
  text: string;
  className?: string;
  delayPerChar?: number;
}

const TextGenerateEffect = ({
  text,
  className,
  delayPerChar = 0.04,
}: TextGenerateEffectProps) => {
  const characters = useMemo(() => text.split(""), [text]);

  return (
    <span className={`inline-flex flex-wrap font-display ${className ?? ""}`}>
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * delayPerChar, duration: 0.4 }}
          className="inline-block"
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </span>
  );
};

export default TextGenerateEffect;
