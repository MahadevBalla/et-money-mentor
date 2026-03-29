"use client";
import { motion } from "motion/react";
import { Flag, TrendingUp, Landmark, Star, MapPin } from "lucide-react";
import { Timeline } from "@/components/ui/timeline";
import type { YearlyProjection } from "@/lib/fire-types";
import { cn } from "@/lib/utils";

interface Props {
    projections: YearlyProjection[];
    currentAge: number;
    fiAge: number | null;
    targetAge: number;
}

// ─── Milestone definition ─────────────────────────────────────────────────────
interface Milestone {
    age: number;
    label: string;
    sublabel: string;
    corpus: number;
    isFI: boolean;
    isStart: boolean;
}

const CORPUS_TARGETS = [
    { amount: 1_000_000, label: "₹10 Lakh", shortLabel: "₹10L milestone" },
    { amount: 5_000_000, label: "₹50 Lakh", shortLabel: "₹50L milestone" },
    { amount: 10_000_000, label: "₹1 Crore", shortLabel: "₹1Cr milestone" },
];

function computeMilestones(
    projections: YearlyProjection[],
    currentAge: number,
    fiAge: number | null,
    targetAge: number,
): Milestone[] {
    const milestones: Milestone[] = [];

    // 1. You Today
    const startCorpus = projections[0]?.corpus ?? 0;
    milestones.push({
        age: currentAge,
        label: "You Today",
        sublabel: startCorpus > 0
            ? `Starting corpus ₹${(startCorpus / 100000).toFixed(1)}L`
            : "Starting your FIRE journey",
        corpus: startCorpus,
        isFI: false,
        isStart: true,
    });

    // 2–4. Corpus threshold milestones
    for (const target of CORPUS_TARGETS) {
        const hit = projections.find((p) => p.corpus >= target.amount);
        if (hit) {
            milestones.push({
                age: hit.age,
                label: target.label,
                sublabel: `${target.shortLabel} reached at age ${hit.age}`,
                corpus: hit.corpus,
                isFI: false,
                isStart: false,
            });
        }
    }

    // 5. FI Achieved / Target Age
    const fiProjection = projections.find(
        (p) => p.age === (fiAge ?? targetAge)
    );
    milestones.push({
        age: fiAge ?? targetAge,
        label: fiAge ? "FI Achieved 🎉" : `Target Age ${targetAge}`,
        sublabel: fiProjection
            ? `Corpus: ₹${(fiProjection.corpus / 10_000_000).toFixed(2)} Cr`
            : fiAge
                ? `Projected financial independence at ${fiAge}`
                : `Your target retirement age`,
        corpus: fiProjection?.corpus ?? 0,
        isFI: true,
        isStart: false,
    });

    // De-dupe by age, keep highest priority (isFI > corpus > start), sort ascending
    const seen = new Set<number>();
    return milestones
        .filter((m) => {
            if (seen.has(m.age)) return false;
            seen.add(m.age);
            return true;
        })
        .sort((a, b) => a.age - b.age);
}

function computeFallbackMilestones(
    currentAge: number,
    fiAge: number | null,
    targetAge: number,
): Milestone[] {
    const yearsToFI = (fiAge ?? targetAge) - currentAge;
    return [
        {
            age: currentAge,
            label: "You Today",
            sublabel: "Starting your FIRE journey",
            corpus: 0,
            isFI: false,
            isStart: true,
        },
        {
            age: currentAge + Math.round(yearsToFI * 0.35),
            label: "~₹10 Lakh",
            sublabel: `Approx. at age ${currentAge + Math.round(yearsToFI * 0.35)}`,
            corpus: 0,
            isFI: false,
            isStart: false,
        },
        {
            age: currentAge + Math.round(yearsToFI * 0.65),
            label: "~₹50 Lakh",
            sublabel: `Approx. at age ${currentAge + Math.round(yearsToFI * 0.65)}`,
            corpus: 0,
            isFI: false,
            isStart: false,
        },
        {
            age: fiAge ?? targetAge,
            label: fiAge ? "FI Achieved 🎉" : `Target Age ${targetAge}`,
            sublabel: fiAge ? `~${yearsToFI} years from now` : `Your target retirement age`,
            corpus: 0,
            isFI: true,
            isStart: false,
        },
    ];
}

// ─── Milestone Card ───────────────────────────────────────────────────────────
function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
    const Icon = milestone.isStart
        ? MapPin
        : milestone.isFI
            ? Star
            : milestone.corpus >= 10_000_000
                ? Landmark
                : TrendingUp;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "relative rounded-xl px-4 py-4 mb-3",
                "border transition-all duration-200",
                milestone.isFI
                    ? "border-primary/40"
                    : "border-border",
            )}
            style={{
                background: milestone.isFI
                    ? "linear-gradient(135deg, var(--primary-subtle), var(--surface-2))"
                    : "var(--surface-2)",
                boxShadow: milestone.isFI ? "var(--shadow-glow)" : "var(--shadow-xs)",
            }}
        >
            {/* Top accent for FI card */}
            {milestone.isFI && (
                <div
                    className="absolute top-0 inset-x-0 h-px rounded-t-xl"
                    style={{
                        background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
                    }}
                />
            )}

            <div className="flex items-start gap-3">
                {/* Icon badge */}
                <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                        background: milestone.isFI ? "var(--primary-subtle)" : "var(--surface-3)",
                        border: `1px solid ${milestone.isFI ? "var(--primary-muted)" : "var(--border-subtle)"}`,
                    }}
                >
                    <Icon
                        className="h-4 w-4"
                        style={{ color: milestone.isFI ? "var(--primary)" : "var(--muted-foreground)" }}
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p
                            className={cn(
                                "text-sm font-semibold",
                                milestone.isFI ? "text-primary" : "text-foreground",
                            )}
                        >
                            {milestone.label}
                        </p>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                                background: "var(--primary-subtle)",
                                color: "var(--primary)",
                                border: "1px solid var(--primary-muted)",
                            }}
                        >
                            Age {milestone.age}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {milestone.sublabel}
                    </p>
                    {milestone.corpus > 0 && (
                        <p className="text-xs font-semibold mt-1.5" style={{ color: "var(--success)" }}>
                            ₹{milestone.corpus >= 10_000_000
                                ? `${(milestone.corpus / 10_000_000).toFixed(2)} Cr`
                                : `${(milestone.corpus / 100_000).toFixed(1)} L`}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function FIRETimeline({ projections, currentAge, fiAge, targetAge }: Readonly<Props>) {
    const milestones =
        projections.length > 0
            ? computeMilestones(projections, currentAge, fiAge, targetAge)
            : computeFallbackMilestones(currentAge, fiAge, targetAge);

    const timelineData = milestones.map((m, i) => ({
        title: `Age ${m.age}`,
        content: <MilestoneCard milestone={m} index={i} />,
    }));

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <p className="text-eyebrow whitespace-nowrap">Your FIRE Journey</p>
                <div className="flex-1 divider-gradient" />
                {projections.length === 0 && (
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                            background: "var(--warning-subtle)",
                            color: "var(--warning)",
                            border: "1px solid oklch(0.72 0.17 78 / 0.20)",
                        }}
                    >
                        Approximate
                    </span>
                )}
            </div>
            <div
                className="rounded-2xl border border-border px-6 pt-4 pb-2 overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, var(--surface-1), var(--surface-2))",
                    boxShadow: "var(--shadow-sm)",
                }}
            >
                <Timeline data={timelineData} />
            </div>
        </div>
    );
}
