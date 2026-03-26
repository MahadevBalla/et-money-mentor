// frontend/src/components/fire/steps/step-profile.tsx
"use client";

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
  value: FIREFormState["risk_profile"];
  label: string;
  color: string;
  ring: string;
}[] = [
  {
    value: "conservative",
    label: "Conservative",
    color: "text-blue-700 dark:text-blue-300",
    ring: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    value: "moderate",
    label: "Moderate",
    color: "text-purple-700 dark:text-purple-300",
    ring: "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    color: "text-orange-700 dark:text-orange-300",
    ring: "border-orange-400 bg-orange-50 dark:bg-orange-950/30",
  },
];

const EMPLOYMENT_OPTIONS: {
  value: FIREFormState["employment_type"];
  label: string;
  desc: string;
}[] = [
  { value: "salaried",      label: "Salaried",     desc: "Full-time employee"   },
  { value: "self_employed", label: "Self-Employed", desc: "Freelancer/consultant"},
  { value: "business",      label: "Business",      desc: "Business owner"       },
];

export function StepProfile({ form, onChange }: Props) {
  const age = Number(form.age) || 0;
  const retAge = Number(form.retirement_age) || 0;
  const yearsAway = retAge > age ? retAge - age : null;

  return (
    <div className="space-y-6">
      {/* Age + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fire-age">
            Age <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fire-age"
            type="number"
            placeholder="30"
            min={18}
            max={70}
            value={form.age}
            onChange={(e) => onChange({ age: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fire-city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fire-city"
            placeholder="Mumbai"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>
      </div>

      {/* Employment type */}
      <div className="space-y-2">
        <Label>Employment Type <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-3 gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ employment_type: opt.value })}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all",
                form.employment_type === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground"
              )}
            >
              <span className="font-semibold text-xs">{opt.label}</span>
              <span className="text-[10px] mt-0.5 opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target FIRE age */}
      <div className="space-y-2">
        <Label>
          Target FIRE Age <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          The age at which you want to be Financially Independent
        </p>

        {/* Preset pills */}
        <div className="flex flex-wrap gap-2">
          {FIRE_AGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange({ retirement_age: String(preset) })}
              className={cn(
                "px-4 py-1.5 rounded-full border-2 text-sm font-semibold transition-all",
                Number(form.retirement_age) === preset
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              )}
            >
              {preset}
            </button>
          ))}
          {/* Custom input */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">or enter:</span>
            <Input
              type="number"
              placeholder="52"
              min={age + 1}
              max={70}
              className="w-20 h-8 text-sm"
              value={
                FIRE_AGE_PRESETS.includes(Number(form.retirement_age))
                  ? ""
                  : form.retirement_age
              }
              onChange={(e) => onChange({ retirement_age: e.target.value })}
            />
          </div>
        </div>

        {/* Live "years away" chip */}
        {yearsAway !== null && yearsAway > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            <span>🎯</span>
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
        <Label>
          Investment Risk Profile <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          This sets the expected return rate used in all projections
        </p>
        <div className="space-y-2">
          {RISK_OPTIONS.map((opt) => {
            const isSelected = form.risk_profile === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ risk_profile: opt.value })}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all",
                  isSelected ? opt.ring : "border-border hover:border-primary/30"
                )}
              >
                <div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? opt.color : "text-foreground"
                    )}
                  >
                    {opt.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {opt.value === "conservative" && "FDs, debt funds, PPF-heavy portfolio"}
                    {opt.value === "moderate" && "Balanced equity + debt mix"}
                    {opt.value === "aggressive" && "Equity-heavy — stocks, equity MFs"}
                  </p>
                </div>
                <div
                  className={cn(
                    "text-right flex-shrink-0 ml-4",
                    isSelected ? opt.color : "text-muted-foreground"
                  )}
                >
                  <p className="text-lg font-bold">
                    {RATE_MAP[opt.value]}%
                  </p>
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