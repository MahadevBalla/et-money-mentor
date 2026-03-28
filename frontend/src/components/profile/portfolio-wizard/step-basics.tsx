// frontend/src/components/profile/portfolio-wizard/step-basics.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserProfile, EmploymentType, RiskProfile } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string; desc: string }[] = [
  { value: "salaried",      label: "Salaried",      desc: "Full-time employee" },
  { value: "self_employed", label: "Self-Employed",  desc: "Freelancer / consultant" },
  { value: "business",      label: "Business",       desc: "Business owner" },
  { value: "freelancer",    label: "Freelancer",     desc: "Project-based" },
  { value: "retired",       label: "Retired",        desc: "No active income" },
];

const RISK_OPTIONS: { value: RiskProfile; label: string; desc: string; active: string }[] = [
  { value: "conservative", label: "Conservative", desc: "Safety over returns",       active: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300" },
  { value: "moderate",     label: "Moderate",     desc: "Balanced risk & returns",   active: "border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300" },
  { value: "aggressive",   label: "Aggressive",   desc: "Can handle volatility",     active: "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300" },
];

export function StepBasics({ form, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">About You</h3>
        <p className="text-xs text-muted-foreground">Basic info used across all 6 planning tools</p>
      </div>

      {/* Age + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-age">Age <span className="text-destructive">*</span></Label>
          <Input
            id="p-age" type="number" placeholder="28" min={18} max={70}
            value={form.age || ""}
            onChange={(e) => onChange({ age: Number(e.target.value) || 0 })}
          />
          <p className="text-xs text-muted-foreground">Between 18 and 70</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-city">City <span className="text-destructive">*</span></Label>
          <Input
            id="p-city" placeholder="Mumbai"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>
      </div>

      {/* Retirement Age + Dependents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-ret">Retirement Age</Label>
          <Input
            id="p-ret" type="number" placeholder="60" min={30} max={70}
            value={form.retirement_age || ""}
            onChange={(e) => onChange({ retirement_age: Number(e.target.value) || 60 })}
          />
          <p className="text-xs text-muted-foreground">Must be greater than current age</p>
        </div>
        <div className="space-y-1.5">
          <Label>Dependents</Label>
          <p className="text-xs text-muted-foreground">Family members depending on you</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => onChange({ dependents: Math.max(0, form.dependents - 1) })}
              className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center text-lg font-medium transition-colors"
            >−</button>
            <span className="text-lg font-semibold w-8 text-center">{form.dependents}</span>
            <button
              type="button"
              onClick={() => onChange({ dependents: Math.min(10, form.dependents + 1) })}
              className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center text-lg font-medium transition-colors"
            >+</button>
          </div>
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <Label>Employment Type <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value} type="button"
              onClick={() => onChange({ employment_type: opt.value })}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all text-sm",
                form.employment_type === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground"
              )}
            >
              <span className="font-semibold text-xs">{opt.label}</span>
              <span className="text-xs mt-0.5 leading-tight opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Appetite */}
      <div className="space-y-2">
        <Label>Risk Appetite <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.value} type="button"
              onClick={() => onChange({ risk_profile: opt.value })}
              className={cn(
                "flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all",
                form.risk_profile === opt.value ? `border-2 ${opt.active}` : "border-border hover:border-primary/30"
              )}
            >
              <span className="font-semibold text-sm">{opt.label}</span>
              <span className="text-xs mt-0.5 text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}