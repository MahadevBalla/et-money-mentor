// src/app/page.tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";
import { TerminalDemo } from "@/components/ui/terminal-demo";
import { WobbleCard } from "@/components/ui/wobble-card";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { MovingBorderButton } from "@/components/ui/moving-border";
import {
  ArrowRight,
  Sparkles,
  Calculator,
  Flame,
  ScanLine,
  Users,
  CalendarClock,
  MessageCircle,
  Upload,
  Cpu,
  BarChart3,
  Lightbulb,
  IndianRupee,
} from "lucide-react";

// ─── STAT COUNTER ─────────────────────────────────────────────────────────────
function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  sublabel,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold tabular-nums flex items-baseline justify-center gap-0.5">
        {prefix && <span className="text-primary">{prefix}</span>}
        {inView ? (
          <NumberFlow
            value={value}
            format={{ notation: "compact", maximumFractionDigits: 1 }}
            transformTiming={{
              duration: 1400,
              easing: "ease-out",
            }}
          />
        ) : (
          <span>0</span>
        )}
        {suffix && <span className="text-primary text-2xl">{suffix}</span>}
      </div>
      <p className="text-sm font-semibold text-foreground mt-0.5">{label}</p>
      {sublabel && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}

// ─── WOBBLE CARD MINI VISUALS ─────────────────────────────────────────────────
function TaxVisual() {
  return (
    <div className="mt-6 flex flex-col gap-3 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between text-[11px] font-mono text-foreground/50">
        <span>Old Regime</span>
        <span className="text-success font-bold">Save ₹47,200 →</span>
        <span>New Regime</span>
      </div>
      <div className="flex gap-1.5 items-end h-30">
        {[65, 55, 48, 40, 32].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            style={{
              background:
                i < 3
                  ? "oklch(0.52 0.17 168 / 0.3)"
                  : "oklch(0.52 0.17 168 / 0.8)",
            }}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px]">
        <span className="text-foreground/30">₹1.84L tax</span>
        <span className="text-success font-semibold">₹1.37L tax ✓</span>
      </div>
    </div>
  );
}

function FIREVisual() {
  return (
    <div className="mt-6 space-y-3 p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <div className="text-4xl font-bold text-primary">48</div>
        <div className="flex-1">
          <div className="flex justify-between text-[11px] text-foreground/50 mb-1">
            <span>Corpus</span>
            <span className="text-primary">67%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary to-primary/60"
              initial={{ width: "0%" }}
              whileInView={{ width: "67%" }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[
          { v: "₹28K", l: "SIP/mo" },
          { v: "18 yrs", l: "To FIRE" },
          { v: "12.5%", l: "CAGR" },
        ].map((s) => (
          <div key={s.l} className="bg-card rounded-lg py-1.5">
            <div className="text-xs font-semibold text-primary">{s.v}</div>
            <div className="text-[9px] text-foreground/40">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function XRayVisual() {
  return (
    <div className="mt-6 p-4 rounded-xl bg-card border border-border space-y-2">
      <div className="flex justify-between text-[11px]">
        <span className="text-foreground/50">Overlap detected</span>
        <span className="text-destructive font-bold">⚠ 22%</span>
      </div>
      {[
        { label: "XIRR", val: "14.2%", color: "bg-primary", w: "70%" },
        { label: "Exp ratio", val: "0.89%", color: "bg-destructive", w: "30%" },
      ].map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-[10px] text-foreground/40 w-16 shrink-0">{r.label}</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${r.color}`}
              initial={{ width: 0 }}
              whileInView={{ width: r.w }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-[10px] text-primary font-semibold w-10 text-right shrink-0">
            {r.val}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChatVisual() {
  const msgs = [
    { role: "user", msg: "How close am I to FIRE?" },
    { role: "ai", msg: "At ₹42L you're 67% there — on track for 48 ✓" },
    { role: "user", msg: "Should I switch tax regime?" },
    { role: "ai", msg: "New Regime saves ₹47,200. Switch recommended." },
  ];
  return (
    <div className="mt-6 p-4 rounded-xl bg-card border border-border space-y-2">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          className={`flex text-[11px] ${m.role === "user" ? "justify-end" : "justify-start"}`}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15 }}
        >
          <div
            className={`px-2.5 py-1.5 rounded-lg max-w-[88%] leading-relaxed ${m.role === "user"
                ? "bg-primary/20 text-primary"
                : "bg-card text-muted-foreground"
              }`}
          >
            {m.msg}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── STICKY SCROLL STEPS ──────────────────────────────────────────────────────
const STICKY_STEPS = [
  {
    title: "Upload your data",
    description:
      "Drop your CAMS statement, Form 16, or fill in a few numbers. No bank login, no linking, no risk. Your data stays yours.",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-5 p-6">
        <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Upload className="h-8 w-8 text-primary" />
          <motion.div
            className="absolute inset-0 rounded-2xl border border-primary/40"
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
          />
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-sm font-semibold text-slate-200">CAMS statement</p>
          <p className="text-xs text-slate-400">PDF · 342 KB · uploaded</p>
        </div>
        <div className="w-full max-w-45 bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    ),
  },
  {
    title: "AI processes in seconds",
    description:
      "Our model runs XIRR calculations, tax regime comparisons, FIRE projections, and overlap analysis simultaneously — not rules, actual inference.",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Cpu className="h-8 w-8 text-primary" />
          <motion.div
            className="absolute -inset-2.5 rounded-3xl border border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5 w-full max-w-50 text-[11px]">
          {["Tax analysis", "FIRE projection", "Overlap scan", "XIRR calc"].map((t, i) => (
            <motion.div
              key={t}
              className="flex items-center gap-1.5 bg-card rounded-lg px-2 py-1.5"
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-muted-foreground">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Insights appear instantly",
    description:
      "Not a PDF you'll never read. Live charts, animated numbers, regime comparisons — everything at a glance.",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <div className="relative size-16 rounded-2xl bg-success/20 border border-emerald-500/30 flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-emerald-300" />
        </div>
        <div className="w-full max-w-50 space-y-1.5">
          {[
            { label: "Tax saved", val: "₹47,200", color: "bg-success" },
            { label: "XIRR", val: "14.2%", color: "bg-primary" },
            { label: "FIRE gap", val: "₹1.68Cr", color: "bg-warning" },
          ].map((r, i) => (
            <div
              key={r.label}
              className="flex items-center gap-2 bg-card rounded-lg px-2.5 py-1.5"
            >
              <div className={`size-1.5 rounded-full ${r.color} shrink-0`} />
              <span className="text-[11px] text-muted-foreground flex-1">{r.label}</span>
              <motion.span
                className="text-[11px] font-semibold text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                {r.val}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Your plan, generated",
    description:
      "Actionable next steps ranked by impact. Switch regime, increase SIP by ₹3K, rebalance two overlapping funds. No jargon, just tasks.",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>
        <div className="w-full max-w-55 space-y-1.5">
          {[
            "Switch to New Regime → save ₹47,200",
            "Increase SIP ₹3K/mo → retire 2 yrs earlier",
            "Exit Axis Bluechip — 22% overlap",
          ].map((action, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-1.5 text-[10px] text-muted-foreground bg-card rounded-lg px-2.5 py-1.5"
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.18 }}
            >
              <span className="text-success font-bold shrink-0 mt-px">{i + 1}.</span>
              {action}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
];

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-md bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
            <span>Money Mentor</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <HeroHighlight
        containerClassName="min-h-[92vh] !bg-background"
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Ambient glow */}
        <div className="absolute inset-x-0 -top-20 h-80 hero-glow pointer-events-none" />

        <div className="relative w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20 lg:py-0 min-h-[92vh]">

          {/* Copy */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold tracking-wide"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="h-3 w-3" />
              AI-Powered · Built for India
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.3rem] font-bold tracking-tight leading-[1.1]">
              Save{" "}
              <Highlight className="text-foreground whitespace-nowrap">
                ₹47,200 in taxes.
              </Highlight>
              <br />
              Retire by{" "}
              <span className="text-primary">48.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
              AI that analyses your taxes, FIRE path, and portfolio in seconds —
              no CA, no ₹25,000 fee, no jargon.
            </p>

            {/* CTAs */}
            <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
              {/* Primary — MovingBorder */}
              <Link href="/tax">
                <MovingBorderButton
                  duration={3200}
                  borderRadius="1.5rem"
                  containerClassName="h-12"
                  borderClassName="bg-[radial-gradient(var(--primary)_40%,transparent_60%)]"
                  className="px-6 text-sm font-semibold text-foreground gap-2"
                >
                  Find my tax savings
                  <ArrowRight className="h-4 w-4" />
                </MovingBorderButton>
              </Link>

              {/* Secondary */}
              <Link href="/fire">
                <Button size="lg" variant="outline" className="h-12 rounded-xl gap-2">
                  Calculate my FIRE
                  <Flame className="h-4 w-4 text-primary" />
                </Button>
              </Link>
            </div>

            <p className="text-[12px] text-muted-foreground/60 flex items-center gap-1.5 justify-center lg:justify-start">
              <span className="size-1.5 rounded-full bg-success inline-block" />
              Free forever · No credit card required
            </p>
          </motion.div>

          {/* Terminal */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.65, ease: "easeOut" }}
          >
            <TerminalDemo />
          </motion.div>
        </div>
      </HeroHighlight>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-3 gap-6">
          <StatCounter
            value={47200}
            prefix="₹"
            label="Avg tax savings"
            sublabel="per user on first run"
          />
          <StatCounter
            value={48}
            suffix=" yrs"
            label="Avg FIRE age"
            sublabel="for on-track users"
          />
          <StatCounter
            value={14.2}
            suffix="%"
            label="Avg portfolio XIRR"
            sublabel="vs 11% benchmark"
          />
        </div>
      </section>

      {/* ── WOBBLE FEATURES ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center space-y-3 mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything your CA should have told you
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Six tools, one platform — designed for Indian investors who want
            clarity, not jargon.
          </p>
        </motion.div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Tax Wizard — wide */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 min-h-[280px] bg-card"
            className=""
          >
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center">
                  <Calculator className="h-4 w-4 text-success" />
                </div>
                <span className="text-xs font-semibold text-success uppercase tracking-wider">
                  Tax Wizard
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Old vs New regime —{" "}
                <span className="text-success">with every rupee</span>
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Upload Form 16 or key in numbers. AI finds every deduction
                you&apos;re missing and shows the exact saving in seconds.
              </p>
            </div>
            <TaxVisual />
          </WobbleCard>

          {/* FIRE Planner — narrow */}
          <WobbleCard
            containerClassName="col-span-1 min-h-[280px] bg-card"
            className=""
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                FIRE Planner
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Your exact FIRE age & SIP roadmap
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Month-by-month plan to financial independence — not guesswork.
            </p>
            <FIREVisual />
          </WobbleCard>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Portfolio X-Ray — narrow */}
          <WobbleCard
            containerClassName="col-span-1 min-h-[260px] bg-card"
            className=""
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScanLine className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                MF X-Ray
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              XIRR, overlap & rebalancing in 10 s
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Upload CAMS statement — get true XIRR, fund overlap, and an
              AI rebalancing plan.
            </p>
            <XRayVisual />
          </WobbleCard>

          {/* AI Chat — wide */}
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 min-h-[260px] bg-card"
            className=""
          >
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  AI Money Chat
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Ask anything.{" "}
                <span className="text-primary">Context-aware.</span>
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Already knows your FIRE gap, tax situation, and portfolio.
                Ask follow-ups naturally — no re-entering data.
              </p>
            </div>
            <ChatVisual />
          </WobbleCard>
        </div>

        {/* More tools row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <WobbleCard
            containerClassName="min-h-[160px] bg-card"
            className=""
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Couple&apos;s Planner
                </p>
                <h3 className="text-lg font-bold text-foreground">
                  India&apos;s first AI joint planner
                </h3>
                <p className="text-xs text-foreground/50 mt-1">
                  Optimise HRA, NPS, SIP splits across two incomes.
                </p>
              </div>
            </div>
          </WobbleCard>

          <WobbleCard
            containerClassName="min-h-[160px] bg-card"
            className=""
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Life Events
                </p>
                <h3 className="text-lg font-bold text-foreground">
                  Bonus, baby, marriage — handled
                </h3>
                <p className="text-xs text-foreground/50 mt-1">
                  AI advisor for every financial turning point.
                </p>
              </div>
            </div>
          </WobbleCard>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 space-y-3">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            From data to plan in{" "}
            <span className="text-primary">60 seconds</span>
          </motion.h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No setup, no bank linking, no waiting for a report.
          </p>
        </div>
        <StickyScroll content={STICKY_STEPS} />
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 via-primary/4 to-transparent p-12 text-center space-y-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Free forever for core tools
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Take control of your money today
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No advisor. No ₹25,000 fee. Just your numbers, our AI, and a
              clear plan.
            </p>
            <div className="flex gap-3 justify-center flex-wrap pt-2">
              <Link href="/tax">
                <MovingBorderButton
                  duration={3200}
                  borderRadius="1.5rem"
                  containerClassName="h-12"
                  borderClassName="bg-[radial-gradient(var(--primary)_40%,transparent_60%)]"
                  className="px-6 text-sm font-semibold text-foreground gap-2"
                >
                  Find my tax savings
                  <ArrowRight className="h-4 w-4" />
                </MovingBorderButton>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="h-12 rounded-xl">
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 bg-muted/20 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee className="h-4 w-4 text-primary" />
            <span>© 2026 Money Mentor — Built for India</span>
          </div>
          <div className="flex gap-6 text-sm">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
