"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  words: string;
  className?: string;
  /** Duration per word in seconds. Default 0.05 */
  wordDuration?: number;
  /** Initial delay before first word appears. Default 0.2 */
  delay?: number;
}

/**
 * Reveals text word-by-word with a staggered fade-in.
 * Pure framer-motion — no additional Aceternity deps required.
 */
export function TextGenerateEffect({
  words,
  className,
  wordDuration = 0.05,
  delay = 0.2,
}: Readonly<Props>) {
  const wordList = words.trim().split(/\s+/);

  return (
    <p className={cn("text-sm leading-relaxed text-foreground", className)}>
      {wordList.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + i * wordDuration,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
