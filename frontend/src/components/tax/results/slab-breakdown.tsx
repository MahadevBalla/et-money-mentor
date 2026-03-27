// frontend/src/components/tax/results/slab-breakdown.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildBreakdown } from "@/lib/tax-slabs";
import type { TaxResult, TaxDeductions } from "@/lib/tax-types";

interface Props {
  result: TaxResult;
  deductions: TaxDeductions;
}

export function SlabBreakdown({ result, deductions }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  const regime    = result.recommended_regime;
  const breakdown = buildBreakdown(result.gross_income, deductions, regime);
  const fmt       = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const pct       = (r: number) => `${(r * 100).toFixed(0)}%`;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-semibold">How was this calculated?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step breakdown for {regime === "old" ? "Old" : "New"} Regime
            (recommended)
          </p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 py-4 space-y-4 bg-card font-mono text-sm">
          {/* Income & deductions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Annual gross income</span>
              <span className="font-semibold text-foreground">{fmt(breakdown.grossIncome)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Standard deduction</span>
              <span className="text-destructive">− {fmt(breakdown.standardDeduction)}</span>
            </div>
            {breakdown.otherDeductions > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Other deductions (80C, 80D, NPS…)</span>
                <span className="text-destructive">− {fmt(breakdown.otherDeductions)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-1">
              <span>Taxable Income</span>
              <span>{fmt(breakdown.taxableIncome)}</span>
            </div>
          </div>

          {/* Slab table */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Tax by slab
            </p>
            {breakdown.slabLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between py-1.5 px-3 rounded-lg text-xs",
                  line.tax > 0
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground"
                )}
              >
                <span>{line.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{pct(line.rate)}</span>
                  <span className={cn(
                    "font-semibold w-24 text-right",
                    line.tax > 0 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {line.tax === 0 ? "₹0" : fmt(line.tax)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-border pt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Base tax (before cess)</span>
              <span>{fmt(breakdown.baseTax)}</span>
            </div>
            {breakdown.surcharge > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Surcharge</span>
                <span>{fmt(breakdown.surcharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Health & Education Cess (4%)</span>
              <span>{fmt(breakdown.cess)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-border pt-2">
              <span>Total Tax Payable</span>
              <span className="text-primary">{fmt(breakdown.totalTax)}</span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            * Computed client-side using FY 2025-26 Finance Act constants.
            Actual tax may vary based on exact Form 16 figures, LTCG, perquisites, etc.
          </p>
        </div>
      )}
    </div>
  );
}