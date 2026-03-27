// frontend/src/components/fire/results/sip-cards.tsx
"use client";

import { TrendingUp, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FIREResult } from "@/lib/fire-types";

interface Props {
  result: FIREResult;
  monthlyInvestable: number;
}

export function SIPCards({ result, monthlyInvestable }: Readonly<Props>) {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const flatSIP   = result.required_monthly_sip;
  const stepupSIP = result.required_stepup_sip;
  const stepupRate = result.stepup_rate * 100;

  // Recommend step-up if it's meaningfully cheaper to start
  const recommendStepup = stepupSIP < flatSIP * 0.8;
  const savingsByStepup = flatSIP - stepupSIP;

  const flatVsSurplus  = monthlyInvestable - flatSIP;
  const stepupVsSurplus = monthlyInvestable - stepupSIP;

  function surplusTag(diff: number) {
    if (diff >= 0)
      return (
        <span className="text-xs text-green-600 font-medium">
          ✓ Within your ₹{Math.round(monthlyInvestable).toLocaleString("en-IN")}/mo investable
        </span>
      );
    return (
      <span className="text-xs text-amber-600 font-medium">
        ⚠ ₹{Math.abs(Math.round(diff)).toLocaleString("en-IN")} more than current investable surplus
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flat SIP */}
        <div
          className={cn(
            "rounded-xl border-2 p-5 space-y-3 relative overflow-hidden",
            recommendStepup
              ? "border-border bg-card"
              : "border-primary bg-primary/5"
          )}
        >
          {!recommendStepup && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              RECOMMENDED
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Minus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Flat SIP</p>
              <p className="text-xs text-muted-foreground">
                Same amount every month
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">{fmt(flatSIP)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">per month, forever</p>
          </div>
          {monthlyInvestable > 0 && surplusTag(flatVsSurplus)}
        </div>

        {/* Step-up SIP */}
        <div
          className={cn(
            "rounded-xl border-2 p-5 space-y-3 relative overflow-hidden",
            recommendStepup
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
          )}
        >
          {recommendStepup && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              RECOMMENDED
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Step-up SIP</p>
              <p className="text-xs text-muted-foreground">
                +{stepupRate.toFixed(0)}% increase every year
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">{fmt(stepupSIP)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              starting amount · grows with your salary
            </p>
          </div>
          {monthlyInvestable > 0 && surplusTag(stepupVsSurplus)}
        </div>
      </div>

      {/* Step-up benefit explainer */}
      {recommendStepup && savingsByStepup > 0 && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Info className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>Step-up saves you {fmt(savingsByStepup)}/mo to start.</strong> As your
            income grows each year, your SIP grows too — easier on your current
            budget while still hitting the same corpus target.
          </p>
        </div>
      )}

      {/* Retirement expense info */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-muted rounded-xl">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          At retirement you&apos;ll need approximately{" "}
          <strong className="text-foreground">
            {fmt(result.monthly_retirement_expense)}/mo
          </strong>{" "}
          (today&apos;s expenses inflation-adjusted at ~6% p.a.). Your FIRE
          corpus is sized to fund this indefinitely using the 4% Safe Withdrawal
          Rate.
        </p>
      </div>
    </div>
  );
}