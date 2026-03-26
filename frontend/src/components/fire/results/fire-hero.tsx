// frontend/src/components/fire/results/fire-hero.tsx
"use client";

import { CheckCircle2, AlertTriangle, Target, Clock, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FIREResult } from "@/lib/fire-types";

interface Props {
  result: FIREResult;
  targetAge: number;
}

function StatChip({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-background/60 backdrop-blur rounded-xl p-3 flex items-start gap-2.5">
      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-bold mt-0.5", valueColor ?? "text-foreground")}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function FireHero({ result, targetAge }: Props) {
  const fmt = (n: number) =>
    n >= 1e7
      ? `₹${(n / 1e7).toFixed(2)} Cr`
      : n >= 1e5
      ? `₹${(n / 1e5).toFixed(1)} L`
      : `₹${n.toLocaleString("en-IN")}`;

  if (result.on_track && result.projected_fi_age !== null) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">
              You&apos;re on track for FIRE at age{" "}
              <span className="text-2xl">{result.projected_fi_age.toFixed(1)}</span>
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {result.projected_fi_age <= targetAge
                ? `${(targetAge - result.projected_fi_age).toFixed(1)} years ahead of your target age of ${targetAge} 🎉`
                : `${(result.projected_fi_age - targetAge).toFixed(1)} years after your target — increase SIP to close the gap`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatChip
            icon={Target}
            label="FI Corpus Required"
            value={fmt(result.fi_corpus_required)}
          />
          <StatChip
            icon={Wallet}
            label="Current Corpus"
            value={fmt(result.current_corpus)}
            valueColor="text-primary"
          />
          <StatChip
            icon={TrendingUp}
            label="Corpus Gap"
            value={fmt(result.corpus_gap)}
            valueColor={result.corpus_gap > 0 ? "text-amber-600" : "text-green-600"}
          />
          <StatChip
            icon={Clock}
            label="Years to FI"
            value={`${result.years_to_fi.toFixed(1)} yrs`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
            Adjustment needed to hit FIRE by age {targetAge}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            {result.projected_fi_age !== null
              ? `At current savings rate you&apos;ll reach FI at age ${result.projected_fi_age.toFixed(1)} — ${(result.projected_fi_age - targetAge).toFixed(1)} years late`
              : "FI is not reachable within 60 years at current savings rate"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatChip
          icon={Target}
          label="FI Corpus Required"
          value={fmt(result.fi_corpus_required)}
        />
        <StatChip
          icon={Wallet}
          label="Current Corpus"
          value={fmt(result.current_corpus)}
          valueColor="text-primary"
        />
        <StatChip
          icon={TrendingUp}
          label="Corpus Gap"
          value={fmt(result.corpus_gap)}
          valueColor="text-amber-600"
        />
        <StatChip
          icon={Clock}
          label="Years to FI"
          value={
            result.projected_fi_age !== null
              ? `${result.years_to_fi.toFixed(1)} yrs`
              : "60+ yrs"
          }
        />
      </div>
    </div>
  );
}