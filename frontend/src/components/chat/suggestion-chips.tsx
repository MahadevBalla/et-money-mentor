// frontend/src/components/chat/suggestion-chips.tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { label: "What's my FIRE status?", emoji: "🔥" },
  { label: "How can I save more tax?", emoji: "💰" },
  { label: "Review my health score", emoji: "❤️" },
  { label: "What SIP amount do I need?", emoji: "📈" },
  { label: "Am I on track to retire early?", emoji: "⏱️" },
  { label: "Where am I overspending?", emoji: "🔍" },
];

interface Props {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-8">
      {/* Hero icon + copy */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3"
      >
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Your Money Mentor
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          I know your FIRE plan, health score, and tax situation.
          Ask me anything specific to <em>your</em> numbers.
        </p>
      </motion.div>

      {/* Chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-2.5 justify-center max-w-md"
      >
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            onClick={() => onSelect(s.label)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full border border-border",
              "bg-background text-sm text-foreground",
              "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
              "transition-all duration-150 active:scale-95",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}