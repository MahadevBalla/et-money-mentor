// frontend/src/components/profile/portfolio-summary.tsx
"use client";

import { Edit, TrendingUp, Shield, Target, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile, PortfolioResponse } from "@/lib/portfolio";

interface Props {
  portfolio: PortfolioResponse;
  onEdit: () => void;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function PortfolioSummary({ portfolio, onEdit }: Props) {
  const p = portfolio.profile as UserProfile;

  const totalAssets = p.assets
    ? Object.values(p.assets).reduce((s, v) => s + (v as number), 0)
    : 0;

  const totalEMI = p.debts?.reduce((s, d) => s + d.emi, 0) ?? 0;

  const insuranceStatus = [
    p.insurance?.has_term_life   && "Term",
    p.insurance?.has_health      && "Health",
    p.insurance?.has_critical_illness && "Critical",
  ].filter(Boolean).join(" · ") || "None setup";

  const riskColor: Record<string, string> = {
    conservative: "text-blue-600",
    moderate:     "text-purple-600",
    aggressive:   "text-orange-600",
  };

  const lastRunCount = [
    Object.keys(portfolio.fire).length > 0,
    Object.keys(portfolio.health).length > 0,
    Object.keys(portfolio.tax).length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Your Financial Portfolio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {p.age} yrs · {p.city} ·{" "}
            <span className={cn("font-medium capitalize", riskColor[p.risk_profile] || "")}>
              {p.risk_profile} risk
            </span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
          <Edit className="h-3.5 w-3.5" /> Edit
        </Button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          icon={TrendingUp} label="Monthly Income"
          value={`₹${p.monthly_gross_income?.toLocaleString("en-IN") ?? "—"}`}
          sub={`Expenses ₹${p.monthly_expenses?.toLocaleString("en-IN") ?? "—"} · Surplus ₹${((p.monthly_gross_income ?? 0) - (p.monthly_expenses ?? 0)).toLocaleString("en-IN")}`}
          color="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Target} label="Total Assets"
          value={`₹${totalAssets.toLocaleString("en-IN")}`}
          sub={`Retirement at ${p.retirement_age}`}
          color="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={CreditCard} label="Active EMIs"
          value={totalEMI > 0 ? `₹${totalEMI.toLocaleString("en-IN")}/mo` : "None"}
          sub={p.debts?.length ? `${p.debts.length} loan${p.debts.length > 1 ? "s" : ""}` : "Debt-free 🎉"}
          color="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={Shield} label="Insurance"
          value={insuranceStatus}
          sub={p.goals?.length ? `${p.goals.length} goal${p.goals.length > 1 ? "s" : ""} saved` : "No goals set"}
          color="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Tool results hint */}
      {lastRunCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 flex-shrink-0" />
          {lastRunCount} tool{lastRunCount > 1 ? "s have" : " has"} results saved from your last run. Visit each tool to see them.
        </div>
      )}
    </div>
  );
}