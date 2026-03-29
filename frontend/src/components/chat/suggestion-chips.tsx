// frontend/src/components/chat/suggestion-chips.tsx
"use client";

import { motion } from "framer-motion";
import {
  Sparkles, Flame, Receipt, HeartPulse,
  TrendingUp, Clock3, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    label: "What's my FIRE status?",
    sub: "Corpus gap & projected FI age",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/8 group-hover:bg-orange-500/15",
  },
  {
    label: "How can I save more tax?",
    sub: "Old vs new regime analysis",
    icon: Receipt,
    color: "text-blue-500",
    bg: "bg-blue-500/8 group-hover:bg-blue-500/15",
  },
  {
    label: "Review my health score",
    sub: "Across 6 financial dimensions",
    icon: HeartPulse,
    color: "text-rose-500",
    bg: "bg-rose-500/8 group-hover:bg-rose-500/15",
  },
  {
    label: "What SIP amount do I need?",
    sub: "Based on your FIRE corpus goal",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/8 group-hover:bg-emerald-500/15",
  },
  {
    label: "Am I on track to retire early?",
    sub: "Surplus vs required SIP delta",
    icon: Clock3,
    color: "text-violet-500",
    bg: "bg-violet-500/8 group-hover:bg-violet-500/15",
  },
  {
    label: "Where am I overspending?",
    sub: "Expense vs income breakdown",
    icon: Search,
    color: "text-amber-500",
    bg: "bg-amber-500/8 group-hover:bg-amber-500/15",
  },
];

interface Props {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-8">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center space-y-3 mt-10"
      >
        <div className="relative mx-auto w-fit">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background" />
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Your Money Mentor</h2>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Powered by your financial data
          </p>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          I know your FIRE plan, health score, and tax situation.
          Ask me anything specific to <em>your</em> numbers.
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex items-center gap-3 w-full max-w-lg"
      >
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Suggested
        </span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      {/* 2×3 grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="grid grid-cols-2 gap-2.5 w-full max-w-lg"
      >
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.06, ease: "easeOut" }}
              onClick={() => onSelect(s.label)}
              disabled={disabled}
              className={cn(
                "group flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border",
                "bg-card text-left cursor-pointer",
                "hover:border-primary/40 hover:shadow-sm",
                "transition-all duration-200 active:scale-[0.98]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <div className={cn(
                "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                s.bg
              )}>
                <Icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors duration-150">
                  {s.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {s.sub}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

    </div>
  );
}