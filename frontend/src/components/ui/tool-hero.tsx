// frontend/src/components/ui/tool-hero.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToolHeroFeature {
  icon: LucideIcon;
  label: string;       // short pill text e.g. "Year-by-year projection"
}

export interface ToolHeroProps {
  icon: LucideIcon;
  badge?: string;      // e.g. "AI-Powered" — optional top badge
  title: string;       // e.g. "FIRE Planner"
  subtitle: string;    // one sentence description
  features: ToolHeroFeature[];   // 3 feature pills
  accentClass?: string;  // tailwind text colour for icon e.g. "text-orange-500"
  bgClass?: string;      // tailwind bg for icon container e.g. "bg-orange-500/10"
}

// ── Animated floating orb background ─────────────────────────────────────────
// Uses --primary and --muted tokens — no hardcoded colour
function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl opacity-[0.07] pointer-events-none",
        className
      )}
      animate={{
        y: [0, -18, 0],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// ── Feature pill ──────────────────────────────────────────────────────────────
function FeaturePill({
  feature,
  index,
}: {
  feature: ToolHeroFeature;
  index: number;
}) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-xl",
        "bg-muted/60 border border-border/60",
        "text-xs text-muted-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="font-medium">{feature.label}</span>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ToolHero({
  icon: Icon,
  badge,
  title,
  subtitle,
  features,
  accentClass = "text-primary",
  bgClass = "bg-primary/10",
}: ToolHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 pt-8 pb-6 mb-1">
      {/* Decorative orbs — use primary token */}
      <FloatingOrb className="w-64 h-64 bg-primary -top-16 -right-16" delay={0} />
      <FloatingOrb className="w-48 h-48 bg-primary -bottom-12 -left-12" delay={2.5} />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[11px] font-semibold text-primary tracking-wide uppercase">
              {badge}
            </span>
          </motion.div>
        )}

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className={cn(
            "h-16 w-16 rounded-2xl flex items-center justify-center",
            "shadow-lg border border-border/40",
            bgClass
          )}
        >
          <Icon className={cn("h-8 w-8", accentClass)} />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="space-y-1.5"
        >
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          {features.map((f, i) => (
            <FeaturePill key={f.label} feature={f} index={i} />
          ))}
        </div>

        {/* Get Started divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex items-center gap-3 w-full mt-2"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
            Get Started
          </span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

      </div>
    </div>
  );
}