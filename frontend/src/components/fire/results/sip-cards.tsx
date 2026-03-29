"use client";
import NumberFlow from "@number-flow/react";
import { TrendingUp, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FIREResult } from "@/lib/fire-types";

interface Props {
  result: FIREResult;
  monthlyInvestable: number;
}

// ─── Surplus tag component ───────────────────────────────────────────────────
function SurplusTag({ diff, investable }: { diff: number; investable: number }) {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  if (diff >= 0)
    return (
      <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
        ✓ Within your {fmt(investable)}/mo investable
      </span>
    );
  return (
    <span className="text-xs font-medium" style={{ color: "var(--warning)" }}>
      ⚠ {fmt(Math.abs(Math.round(diff)))} more than current investable surplus
    </span>
  );
}

// ─── SIP Cards component ─────────────────────────────────────────────────────
export function SIPCards({ result, monthlyInvestable }: Readonly<Props>) {
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const flatSIP = result.required_monthly_sip;
  const stepupSIP = result.required_stepup_sip;
  const stepupRate = result.stepup_rate * 100;

  const recommendStepup = stepupSIP < flatSIP * 0.8;
  const savingsByStepup = flatSIP - stepupSIP;
  const flatVsSurplus = monthlyInvestable - flatSIP;
  const stepupVsSurplus = monthlyInvestable - stepupSIP;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Flat SIP ── */}
        <div
          className={cn(
            "rounded-xl border-2 p-5 space-y-3 relative overflow-hidden transition-all duration-200",
            recommendStepup ? "border-border" : "border-primary",
          )}
          style={
            !recommendStepup
              ? { background: "linear-gradient(145deg, var(--primary-subtle), var(--surface-2))" }
              : { background: "var(--card)" }
          }
        >
          {!recommendStepup && (
            <div
              className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              RECOMMENDED
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
            >
              <Minus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Flat SIP</p>
              <p className="text-xs text-muted-foreground">Same amount every month</p>
            </div>
          </div>

          <div>
            <div
              className="font-bold tabular-nums leading-none"
              style={{ fontSize: "1.75rem", letterSpacing: "-0.04em" }}
            >
              <NumberFlow
                value={flatSIP}
                format={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }}
                transformTiming={{ duration: 900, easing: "cubic-bezier(0.16,1,0.3,1)" }}
                spinTiming={{ duration: 900 }}
                opacityTiming={{ duration: 250 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">per month, forever</p>
          </div>

          {monthlyInvestable > 0 && (
            <SurplusTag diff={flatVsSurplus} investable={monthlyInvestable} />
          )}
        </div>

        {/* ── Step-up SIP ── */}
        <div
          className={cn(
            "rounded-xl border-2 p-5 space-y-3 relative overflow-hidden transition-all duration-200",
            recommendStepup ? "border-primary" : "border-border",
          )}
          style={
            recommendStepup
              ? { background: "linear-gradient(145deg, var(--primary-subtle), var(--surface-2))" }
              : { background: "var(--card)" }
          }
        >
          {recommendStepup && (
            <div
              className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              RECOMMENDED
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
            >
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Step-up SIP</p>
              <p className="text-xs text-muted-foreground">
                +{stepupRate.toFixed(0)}% increase every year
              </p>
            </div>
          </div>

          <div>
            <div
              className="font-bold tabular-nums leading-none"
              style={{ fontSize: "1.75rem", letterSpacing: "-0.04em" }}
            >
              <NumberFlow
                value={stepupSIP}
                format={{ style: "currency", currency: "INR", maximumFractionDigits: 0 }}
                transformTiming={{ duration: 900, easing: "cubic-bezier(0.16,1,0.3,1)" }}
                spinTiming={{ duration: 900 }}
                opacityTiming={{ duration: 250 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              starting amount · grows with your salary
            </p>
          </div>

          {monthlyInvestable > 0 && (
            <SurplusTag diff={stepupVsSurplus} investable={monthlyInvestable} />
          )}
        </div>
      </div>

      {/* Step-up benefit explainer */}
      {recommendStepup && savingsByStepup > 0 && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: "var(--success-subtle)",
            border: "1px solid oklch(0.60 0.21 145 / 0.20)",
          }}
        >
          <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
          <p className="text-xs" style={{ color: "var(--success)" }}>
            <strong>Step-up saves you {fmt(savingsByStepup)}/mo to start.</strong> As your
            income grows each year, your SIP grows too — easier on your current budget
            while still hitting the same corpus target.
          </p>
        </div>
      )}

      {/* Retirement expense info */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
        style={{ background: "var(--surface-3)", border: "1px solid var(--border-subtle)" }}
      >
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          At retirement you&apos;ll need approximately{" "}
          <strong className="text-foreground">
            {fmt(result.monthly_retirement_expense)}/mo
          </strong>{" "}
          (today&apos;s expenses inflation-adjusted at ~6% p.a.). Your FIRE corpus is sized
          to fund this indefinitely using the 4% Safe Withdrawal Rate.
        </p>
      </div>
    </div>
  );
}
