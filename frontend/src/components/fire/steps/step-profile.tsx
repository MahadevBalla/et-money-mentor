// frontend/src/components/fire/steps/step-profile.tsx
"use client";

import { Target, Briefcase, Laptop, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RATE_MAP } from "@/lib/fire-types";
import type { FIREFormState } from "@/lib/fire-types";

interface Props {
  form: FIREFormState;
  onChange: (patch: Partial<FIREFormState>) => void;
}

const FIRE_AGE_PRESETS = [40, 45, 50, 55, 60];

const RISK_OPTIONS: {
  value: FIREFormState["risk_profile"]; label: string; desc: string;
}[] = [
    {
      value: "conservative",
      label: "Conservative",
      desc: "FDs, debt funds, PPF-heavy portfolio",
    },
    {
      value: "moderate",
      label: "Moderate",
      desc: "Balanced equity + debt mix",
    },
    {
      value: "aggressive",
      label: "Aggressive",
      desc: "Equity-heavy — stocks, equity MFs",
    },
  ];

const EMPLOYMENT_OPTIONS: {
  value: FIREFormState["employment_type"]; icon: LucideIcon; label: string; desc: string;
}[] = [
    { value: "salaried", icon: Briefcase, label: "Salaried", desc: "Full-time employee" },
    { value: "self_employed", icon: Laptop, label: "Self-Employed", desc: "Freelancer/consultant" },
    { value: "business", icon: Building2, label: "Business", desc: "Business owner" },
  ];

export function StepProfile({ form, onChange }: Readonly<Props>) {
  const age = Number(form.age) || 0;
  const retAge = Number(form.retirement_age) || 0;
  const yearsAway = retAge > age ? retAge - age : null;

  return (
    <div className="space-y-6">
      {/* Age + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fire-age">Age <span className="text-destructive">*</span></Label>
          <Input id="fire-age" type="number" placeholder="30" min={18} max={70}
            value={form.age} onChange={(e) => onChange({ age: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fire-city">City <span className="text-destructive">*</span></Label>
          <Input id="fire-city" placeholder="Mumbai"
            value={form.city} onChange={(e) => onChange({ city: e.target.value })} />
        </div>
      </div>

      {/* Employment type */}
      <div className="space-y-2">
        <Label>Employment Type <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-3 gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = form.employment_type === opt.value;
            return (
              <button key={opt.value} type="button"
                onClick={() => onChange({ employment_type: opt.value })}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                </div>
                <span className={cn(
                  "font-semibold text-xs",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-muted-foreground opacity-70 leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target FIRE age */}
      <div className="space-y-2">
        <Label>Target FIRE Age <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">
          The age at which you want to be Financially Independent
        </p>

        <div className="flex flex-wrap gap-2">
          {FIRE_AGE_PRESETS.map((preset) => (
            <button key={preset} type="button"
              onClick={() => onChange({ retirement_age: String(preset) })}
              className={cn(
                "px-4 py-1.5 rounded-full border-2 text-sm font-semibold transition-all",
                Number(form.retirement_age) === preset
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              )}>
              {preset}
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">or enter:</span>
            <Input type="number" placeholder="52" min={age + 1} max={70}
              className="w-20 h-8 text-sm"
              value={FIRE_AGE_PRESETS.includes(Number(form.retirement_age)) ? "" : form.retirement_age}
              onChange={(e) => onChange({ retirement_age: e.target.value })} />
          </div>
        </div>

        {yearsAway !== null && yearsAway > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <Target className="h-3 w-3 shrink-0" />
            <span>
              That&apos;s <strong>{yearsAway} years</strong> from now — you&apos;d retire in{" "}
              {new Date().getFullYear() + yearsAway}
            </span>
          </div>
        )}
        {yearsAway !== null && yearsAway <= 0 && (
          <p className="text-xs text-destructive">
            FIRE age must be greater than your current age.
          </p>
        )}
      </div>

      {/* Risk profile */}
      <div className="space-y-2">
        <Label>Investment Risk Profile <span className="text-destructive">*</span></Label>
        <p className="text-xs text-muted-foreground">
          This sets the expected return rate used in all projections
        </p>
        <div className="space-y-2">
          {RISK_OPTIONS.map((opt) => {
            const isSelected = form.risk_profile === opt.value;
            return (
              <button key={opt.value} type="button"
                onClick={() => onChange({ risk_profile: opt.value })}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div>
                  <span className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {opt.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <div className={cn(
                  "text-right shrink-0 ml-4",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  <p className="text-lg font-bold">{RATE_MAP[opt.value]}%</p>
                  <p className="text-[10px]">p.a. assumed</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
