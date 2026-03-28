// frontend/src/components/profile/portfolio-wizard/step-tax-goals.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile, Goal, GoalType, TaxDeductions } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

const TAX_FIELDS: { key: keyof TaxDeductions; label: string; hint: string; max?: number; isBoolean?: boolean }[] = [
  { key: "section_80c",              label: "80C Investments",          hint: "ELSS, PPF, LIC, EPF, NSC…",       max: 150000 },
  { key: "nps_80ccd_1b",             label: "NPS (80CCD-1B)",           hint: "Additional NPS over 80C limit",   max: 50000  },
  { key: "section_80d_self",         label: "Health Insurance (80D)",   hint: "Premium for self / family",       max: 50000  },
  { key: "section_80d_parents",      label: "Health Ins. — Parents",    hint: "Premium paid for parents",        max: 50000  },
  { key: "hra_claimed",              label: "HRA",                      hint: "House Rent Allowance claimed"                 },
  { key: "home_loan_interest",       label: "Home Loan Interest (24b)", hint: "Annual interest paid",            max: 200000 },
  { key: "other_deductions",         label: "Other Deductions",         hint: "Any other eligible deductions"               },
];

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "house",       label: "🏠 House"       },
  { value: "education",   label: "🎓 Education"   },
  { value: "marriage",    label: "💍 Marriage"    },
  { value: "retirement",  label: "🏖 Retirement"  },
  { value: "vacation",    label: "✈️ Vacation"    },
  { value: "custom",      label: "📌 Custom"      },
];

function emptyGoal(): Goal {
  return { type: "house", label: "", target_amount: 0, target_year: new Date().getFullYear() + 5 };
}

export function StepTaxGoals({ form, onChange }: Props) {
  const [taxExpanded,   setTaxExpanded]   = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const tax = form.tax_deductions;

  function patchTax(key: keyof TaxDeductions, val: string | boolean) {
    onChange({ tax_deductions: { ...tax, [key]: typeof val === "boolean" ? val : Number(val) || 0 } });
  }
  function addGoal()    { onChange({ goals: [...form.goals, emptyGoal()] }); }
  function removeGoal(idx: number) { onChange({ goals: form.goals.filter((_, i) => i !== idx) }); }
  function patchGoal(idx: number, patch: Partial<Goal>) {
    onChange({ goals: form.goals.map((g, i) => i === idx ? { ...g, ...patch } : g) });
  }

  const total80C = tax.section_80c;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Tax & Goals</h3>
        <p className="text-xs text-muted-foreground">Used for tax regime recommendation and SIP goal planning</p>
      </div>

      <div className="flex items-start gap-2 p-3 bg-muted rounded-xl">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Both sections are optional. Our AI will flag missing deductions as savings opportunities.
        </p>
      </div>

      {/* Tax deductions accordion */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button type="button" onClick={() => setTaxExpanded(!taxExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors">
          <span className="text-sm font-semibold">Tax Deductions (FY 2025-26)</span>
          {taxExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {taxExpanded && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TAX_FIELDS.map(({ key, label, hint, max }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-medium">{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                    <Input type="number" placeholder="0"
                      className={cn("pl-6 h-9 text-sm", max && (Number(tax[key]) || 0) > max ? "border-destructive" : "")}
                      value={(tax[key] as number) === 0 ? "" : (tax[key] as number)}
                      onChange={(e) => patchTax(key, e.target.value)} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hint}{max ? ` · Max ₹${max.toLocaleString("en-IN")}` : ""}
                  </p>
                </div>
              ))}
            </div>

            {/* 80C bar */}
            {total80C > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>80C utilisation</span>
                  <span>₹{total80C.toLocaleString("en-IN")} / ₹1,50,000</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", total80C >= 150000 ? "bg-green-500" : "bg-primary")}
                    style={{ width: `${Math.min((total80C / 150000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Senior citizen toggles */}
            <div className="flex flex-wrap gap-3">
              {[
                { key: "section_80d_self_is_senior" as const,       label: "I am a senior citizen (≥60 yrs)" },
                { key: "section_80d_parents_are_senior" as const,   label: "My parents are senior citizens"  },
              ].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => patchTax(key, !tax[key])}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    tax[key] ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  <span className={cn("h-3.5 w-3.5 rounded-sm border flex items-center justify-center", tax[key] ? "border-primary bg-primary" : "border-current")}>
                    {tax[key] && <span className="text-white text-[8px] leading-none">✓</span>}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Goals accordion */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button type="button" onClick={() => setGoalsExpanded(!goalsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors">
          <div className="text-left">
            <span className="text-sm font-semibold">Financial Goals</span>
            <span className="text-xs text-muted-foreground ml-2">
              {form.goals.length > 0 ? `${form.goals.length} added` : "optional"}
            </span>
          </div>
          {goalsExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {goalsExpanded && (
          <div className="p-4 space-y-3">
            {form.goals.map((goal, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goal {idx + 1}</span>
                  <button type="button" onClick={() => removeGoal(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {GOAL_TYPES.map((gt) => (
                    <button key={gt.value} type="button" onClick={() => patchGoal(idx, { type: gt.value })}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                        goal.type === gt.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      )}>
                      {gt.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Target Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <Input type="number" placeholder="50,00,000" className="pl-5 h-9 text-sm"
                        value={goal.target_amount || ""}
                        onChange={(e) => patchGoal(idx, { target_amount: Number(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Target Year</Label>
                    <Input type="number" placeholder="2032" className="h-9 text-sm"
                      min={new Date().getFullYear() + 1} max={2075}
                      value={goal.target_year}
                      onChange={(e) => patchGoal(idx, { target_year: Number(e.target.value) || 2031 })} />
                  </div>
                </div>
                {goal.type === "custom" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Goal Label</Label>
                    <Input placeholder="e.g. World tour" className="h-9 text-sm"
                      value={goal.label}
                      onChange={(e) => patchGoal(idx, { label: e.target.value })} />
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addGoal} className="w-full">
              <Plus className="h-4 w-4 mr-1.5" /> Add a goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}