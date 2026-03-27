// frontend/src/components/tax/results/tax-verdict.tsx
"use client";

import { Trophy, Zap, TrendingDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxResult } from "@/lib/tax-types";

interface Props { result: TaxResult; }

export function TaxVerdict({ result }: Readonly<Props>) {
  const isOldBetter = result.recommended_regime === "old";
  const savings = result.savings_by_switching;
  const monthlySaved = Math.round(savings / 12);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const fmtCr = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr`
      : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L`
        : fmt(n);

  return (
    <div className={cn(
      "rounded-xl border-2 p-6 space-y-5",
      isOldBetter
        ? "border-blue-300 dark:border-blue-700 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20"
        : "border-purple-300 dark:border-purple-700 bg-linear-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20"
    )}>
      {/* Top line */}
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
          isOldBetter
            ? "bg-blue-100 dark:bg-blue-900/40"
            : "bg-purple-100 dark:bg-purple-900/40"
        )}>
          {isOldBetter
            ? <Trophy className="h-6 w-6 text-blue-600" />
            : <Zap className="h-6 w-6 text-purple-600" />
          }
        </div>
        <div>
          <p className={cn(
            "text-lg font-bold",
            isOldBetter
              ? "text-blue-800 dark:text-blue-200"
              : "text-purple-800 dark:text-purple-200"
          )}>
            {isOldBetter ? "Stick with Old Regime" : "Switch to New Regime"}
            {" "}— you save {fmtCr(savings)}/year
          </p>
          <p className={cn(
            "text-sm mt-1",
            isOldBetter
              ? "text-blue-700 dark:text-blue-300"
              : "text-purple-700 dark:text-purple-300"
          )}>
            That&apos;s {fmt(monthlySaved)}/month extra in your pocket
          </p>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Old Regime",
            tax: result.old_regime_tax,
            rate: result.effective_rate_old,
            isWinner: isOldBetter,
            color: isOldBetter
              ? "border-blue-400 bg-blue-50/80 dark:bg-blue-950/40"
              : "border-border bg-background/60",
            badgeColor: "bg-blue-600",
          },
          {
            label: "New Regime",
            tax: result.new_regime_tax,
            rate: result.effective_rate_new,
            isWinner: !isOldBetter,
            color: isOldBetter
              ? "border-border bg-background/60"
              : "border-purple-400 bg-purple-50/80 dark:bg-purple-950/40",
            badgeColor: "bg-purple-600",
          },
        ].map((r) => (
          <div
            key={r.label}
            className={cn("rounded-xl border-2 p-4 space-y-2 relative overflow-hidden", r.color)}
          >
            {r.isWinner && (
              <div className={cn(
                "absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5",
                r.badgeColor
              )}>
                <Check className="h-2.5 w-2.5" />
                BETTER
              </div>
            )}
            <p className="text-xs font-semibold text-muted-foreground">{r.label}</p>
            <p className="text-2xl font-bold">{fmt(r.tax)}</p>
            <p className="text-xs text-muted-foreground">
              Effective rate:{" "}
              <span className="font-semibold text-foreground">{r.rate.toFixed(2)}%</span>
            </p>
          </div>
        ))}
      </div>

      {/* Gross income footer */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/40 dark:border-white/10">
        <TrendingDown className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Gross Income:{" "}
          <strong className="text-foreground">{fmtCr(result.gross_income)}</strong>
          {" "}· FY 2025-26 · 4% Health & Education Cess included
        </p>
      </div>
    </div>
  );
}
