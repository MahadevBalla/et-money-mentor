// frontend/src/components/profile/portfolio-wizard/step-debts.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile, DebtItem } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

const LOAN_PRESETS: { label: string; is_secured: boolean; rate: number }[] = [
  { label: "Home Loan",        is_secured: true,  rate: 8.5  },
  { label: "Car Loan",         is_secured: true,  rate: 9.0  },
  { label: "Education Loan",   is_secured: true,  rate: 8.0  },
  { label: "Personal Loan",    is_secured: false, rate: 14.0 },
  { label: "Credit Card Dues", is_secured: false, rate: 36.0 },
  { label: "Gold Loan",        is_secured: true,  rate: 10.0 },
  { label: "Other",            is_secured: false, rate: 12.0 },
];

function emptyDebt(): DebtItem {
  return { name: "Home Loan", outstanding: 0, emi: 0, interest_rate: 8.5, is_secured: true };
}

export function StepDebts({ form, onChange }: Props) {
  const [hasDebts, setHasDebts] = useState(form.debts.length > 0);

  const totalEMI = form.debts.reduce((s, d) => s + d.emi, 0);
  const income   = form.monthly_gross_income;
  const dtiRatio = income > 0 ? ((totalEMI / income) * 100).toFixed(0) : null;

  function addDebt()   { onChange({ debts: [...form.debts, emptyDebt()] }); }
  function removeDebt(idx: number) { onChange({ debts: form.debts.filter((_, i) => i !== idx) }); }
  function patchDebt(idx: number, patch: Partial<DebtItem>) {
    onChange({ debts: form.debts.map((d, i) => i === idx ? { ...d, ...patch } : d) });
  }
  function handlePreset(idx: number, name: string) {
    const preset = LOAN_PRESETS.find(p => p.label === name);
    if (preset) patchDebt(idx, { name, is_secured: preset.is_secured, interest_rate: preset.rate });
    else patchDebt(idx, { name });
  }
  function handleToggle(val: boolean) {
    setHasDebts(val);
    if (!val) onChange({ debts: [] });
    else if (form.debts.length === 0) onChange({ debts: [emptyDebt()] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Loans & EMIs</h3>
        <p className="text-xs text-muted-foreground">Affects debt-to-income ratio, health score, and FIRE planning</p>
      </div>

      {/* Yes / No toggle */}
      <div className="flex items-center justify-between">
        <Label>Do you have any active loans?</Label>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {[{ val: false, label: "No" }, { val: true, label: "Yes" }].map(({ val, label }) => (
            <button key={label} type="button" onClick={() => handleToggle(val)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                hasDebts === val ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {!hasDebts && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm font-medium">Debt-free! That's great for your financial health.</p>
        </div>
      )}

      {hasDebts && (
        <div className="space-y-4">
          {/* DTI indicator */}
          {totalEMI > 0 && dtiRatio && (
            <div className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl text-sm border",
              Number(dtiRatio) > 40
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                : Number(dtiRatio) > 25
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
            )}>
              <span className="text-xs text-muted-foreground">Total EMI / month</span>
              <div className="text-right">
                <span className="font-medium">₹{totalEMI.toLocaleString("en-IN")}</span>
                {income > 0 && (
                  <span className={cn("text-xs ml-2",
                    Number(dtiRatio) > 40 ? "text-red-600" : Number(dtiRatio) > 25 ? "text-amber-600" : "text-green-600"
                  )}>
                    {dtiRatio}% of income {Number(dtiRatio) > 40 ? "⚠ High" : Number(dtiRatio) > 25 ? "· Moderate" : "· Healthy"}
                  </span>
                )}
              </div>
            </div>
          )}

          {form.debts.map((debt, idx) => (
            <div key={idx} className="border border-border rounded-xl p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Loan {idx + 1}</span>
                <button type="button" onClick={() => removeDebt(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-1.5">
                {LOAN_PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => handlePreset(idx, p.label)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                      debt.name === p.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}>
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Outstanding (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                    <Input type="number" placeholder="30,00,000" className="pl-5 h-9 text-sm"
                      value={debt.outstanding || ""}
                      onChange={(e) => patchDebt(idx, { outstanding: Number(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Monthly EMI (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                    <Input type="number" placeholder="25,000" className="pl-5 h-9 text-sm"
                      value={debt.emi || ""}
                      onChange={(e) => patchDebt(idx, { emi: Number(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Interest Rate (%)</Label>
                  <Input type="number" placeholder="8.5" step="0.1" className="h-9 text-sm"
                    value={debt.interest_rate || ""}
                    onChange={(e) => patchDebt(idx, { interest_rate: Number(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Loan type:</span>
                {[{ val: true, label: "Secured" }, { val: false, label: "Unsecured" }].map(({ val, label }) => (
                  <button key={label} type="button" onClick={() => patchDebt(idx, { is_secured: val })}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                      debt.is_secured === val
                        ? val
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20"
                          : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                        : "border-border text-muted-foreground"
                    )}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addDebt} className="w-full">
            <Plus className="h-4 w-4 mr-1.5" /> Add another loan
          </Button>
        </div>
      )}
    </div>
  );
}