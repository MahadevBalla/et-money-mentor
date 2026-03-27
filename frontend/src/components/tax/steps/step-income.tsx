// frontend/src/components/tax/steps/step-income.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FY_LABEL, type TaxFormState } from "@/lib/tax-types";
import type { EmploymentType } from "@/lib/health-score-types";

interface Props {
  form: TaxFormState;
  onChange: (patch: Partial<TaxFormState>) => void;
}

const EMPLOYMENT_OPTIONS: {
  value: EmploymentType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { value: "salaried",      label: "Salaried",      desc: "Full-time employee", icon: "💼" },
  { value: "self_employed", label: "Self-Employed",  desc: "Freelancer / consultant", icon: "🧑‍💻" },
  { value: "business",      label: "Business Owner", desc: "Proprietor / partner", icon: "🏢" },
];

export function StepIncome({ form, onChange }: Props) {
  const annualGross = Number(form.annual_gross_income) || 0;
  const monthlyEquiv = annualGross > 0
    ? `≈ ₹${Math.round(annualGross / 12).toLocaleString("en-IN")}/mo`
    : null;

  // Derive income band label for context
  let incomeBand = "";
  if (annualGross > 0 && annualGross <= 7_00_000)
    incomeBand = "Low tax bracket — likely ₹0 under new regime";
  else if (annualGross <= 12_00_000)
    incomeBand = "Standard bracket — new regime usually wins";
  else if (annualGross <= 15_00_000)
    incomeBand = "Mid bracket — depends on your deductions";
  else
    incomeBand = "High bracket — deductions matter a lot";

  return (
    <div className="space-y-6">
      {/* FY label */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
        📅 {FY_LABEL}
      </div>

      {/* Age + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tax-age">
            Age <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tax-age"
            type="number"
            placeholder="32"
            min={18}
            max={80}
            value={form.age}
            onChange={(e) => onChange({ age: e.target.value })}
          />
          {Number(form.age) >= 60 && (
            <p className="text-xs text-amber-600 font-medium">
              ℹ️ Senior citizen — 80D limit auto-set to ₹50,000
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tax-city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tax-city"
            placeholder="Mumbai"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>
      </div>

      {/* Employment type */}
      <div className="space-y-2">
        <Label>
          Employment Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const isSelected = form.employment_type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ employment_type: opt.value })}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground"
                )}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className={cn(
                  "font-semibold text-xs",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {opt.label}
                </span>
                <span className="text-[10px] opacity-70 leading-tight">{opt.desc}</span>
              </button>
            );
          })}
        </div>
        {form.employment_type !== "salaried" && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            ℹ️ HRA deduction is not available for self-employed / business owners
          </p>
        )}
      </div>

      {/* Annual income */}
      <div className="space-y-1.5">
        <Label htmlFor="tax-income">
          Annual Gross Income (₹) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            ₹
          </span>
          <Input
            id="tax-income"
            type="number"
            placeholder="24,00,000"
            className="pl-7 text-base"
            value={form.annual_gross_income}
            onChange={(e) => onChange({ annual_gross_income: e.target.value })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your total gross CTC / annual income before any deductions
        </p>

        {/* Live chips */}
        {annualGross > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {monthlyEquiv && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                📆 {monthlyEquiv}
              </div>
            )}
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              💡 {incomeBand}
            </div>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="bg-muted rounded-xl px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-foreground">What happens next?</p>
        <p className="text-xs text-muted-foreground">
          In Step 2 you can optionally enter your tax-saving investments and
          deductions. We&apos;ll then compute the exact tax under both regimes
          and tell you which one saves you more.
        </p>
      </div>
    </div>
  );
}