// frontend/src/components/profile/portfolio-wizard/step-income.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

export function StepIncome({ form, onChange }: Props) {
  const income   = form.monthly_gross_income;
  const expenses = form.monthly_expenses;
  const surplus  = income - expenses;
  const efMonths = expenses > 0 ? (form.emergency_fund / expenses).toFixed(1) : "0";
  const efOk     = expenses > 0 && form.emergency_fund >= expenses * 6;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Income & Cash Flow</h3>
        <p className="text-xs text-muted-foreground">Used for savings rate, FIRE corpus, and tax calculations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-inc">Monthly Gross Income (₹) <span className="text-destructive">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input id="p-inc" type="number" placeholder="75,000" className="pl-7"
              value={income || ""}
              onChange={(e) => onChange({ monthly_gross_income: Number(e.target.value) || 0 })} />
          </div>
          <p className="text-xs text-muted-foreground">Pre-tax (CTC / 12)</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-exp">Monthly Expenses (₹) <span className="text-destructive">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input id="p-exp" type="number" placeholder="45,000" className="pl-7"
              value={expenses || ""}
              onChange={(e) => onChange({ monthly_expenses: Number(e.target.value) || 0 })} />
          </div>
          <p className="text-xs text-muted-foreground">All spending incl. rent, food, bills, EMIs</p>
        </div>
      </div>

      {/* Live surplus pill */}
      {income > 0 && expenses > 0 && (
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium",
          surplus >= 0
            ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
            : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
        )}>
          <span className="text-muted-foreground text-xs">Monthly surplus</span>
          <div className="text-right">
            <span className={surplus >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600"}>
              {surplus >= 0 ? "+" : "−"}₹{Math.abs(surplus).toLocaleString("en-IN")}
            </span>
            {income > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({((Math.abs(surplus) / income) * 100).toFixed(0)}% of income)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Emergency Fund */}
      <div className="space-y-1.5">
        <Label htmlFor="p-ef">Emergency Fund (₹)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
          <Input id="p-ef" type="number" placeholder="2,70,000" className="pl-7"
            value={form.emergency_fund || ""}
            onChange={(e) => onChange({ emergency_fund: Number(e.target.value) || 0 })} />
        </div>
        {expenses > 0 && (
          <div className="space-y-1">
            <p className={cn("text-xs", efOk ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
              {efOk
                ? `✓ ${efMonths} months covered — great!`
                : `${efMonths} months covered · Recommended: ₹${(expenses * 6).toLocaleString("en-IN")} (6 months)`}
            </p>
            {form.emergency_fund > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", efOk ? "bg-green-500" : "bg-amber-400")}
                  style={{ width: `${Math.min((form.emergency_fund / (expenses * 6)) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}