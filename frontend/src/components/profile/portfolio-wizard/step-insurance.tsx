// frontend/src/components/profile/portfolio-wizard/step-insurance.tsx
"use client";

import { Shield, Heart, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserProfile, InsuranceCoverage } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

function patchIns(form: UserProfile, onChange: Props["onChange"], patch: Partial<InsuranceCoverage>) {
  onChange({ insurance: { ...form.insurance, ...patch } });
}

function YesNoToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {[{ val: false, label: "No" }, { val: true, label: "Yes" }].map(({ val, label }) => (
        <button key={label} type="button" onClick={() => onChange(val)}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-all",
            value === val ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function StepInsurance({ form, onChange }: Props) {
  const ins    = form.insurance;
  const income = form.monthly_gross_income;
  const recTermCover = income * 12 * 10;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Insurance Coverage</h3>
        <p className="text-xs text-muted-foreground">Insurance gaps are the most common reason for a low health score</p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          This section is optional but quick to fill and significantly affects your financial health score.
        </p>
      </div>

      {/* Term Life */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">Term Life Insurance</p>
              <p className="text-xs text-muted-foreground">Pure protection plan</p>
            </div>
          </div>
          <YesNoToggle value={ins.has_term_life}
            onChange={(v) => patchIns(form, onChange, { has_term_life: v, term_cover: v ? ins.term_cover : 0 })} />
        </div>

        {ins.has_term_life && (
          <div className="space-y-1.5">
            <Label htmlFor="p-term" className="text-xs">Sum Assured (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input id="p-term" type="number" placeholder="1,00,00,000" className="pl-7"
                value={ins.term_cover || ""}
                onChange={(e) => patchIns(form, onChange, { term_cover: Number(e.target.value) || 0 })} />
            </div>
            {income > 0 && (
              <p className="text-xs text-muted-foreground">
                Recommended: ₹{recTermCover.toLocaleString("en-IN")} (10× annual income)
                {ins.term_cover > 0 && ins.term_cover < recTermCover && (
                  <span className="text-amber-600 ml-1">⚠ Below recommended</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Health Insurance */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Health Insurance</p>
              <p className="text-xs text-muted-foreground">Mediclaim / floater plan</p>
            </div>
          </div>
          <YesNoToggle value={ins.has_health}
            onChange={(v) => patchIns(form, onChange, { has_health: v, health_cover: v ? ins.health_cover : 0 })} />
        </div>

        {ins.has_health && (
          <div className="space-y-1.5">
            <Label htmlFor="p-health" className="text-xs">Cover Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input id="p-health" type="number" placeholder="5,00,000" className="pl-7"
                value={ins.health_cover || ""}
                onChange={(e) => patchIns(form, onChange, { health_cover: Number(e.target.value) || 0 })} />
            </div>
            <p className="text-xs text-muted-foreground">
              Min recommended: ₹5,00,000 for metro cities
              {ins.health_cover > 0 && ins.health_cover < 500000 && (
                <span className="text-amber-600 ml-1">⚠ Consider increasing</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Critical Illness */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Critical Illness Cover</p>
            <p className="text-xs text-muted-foreground">Lump-sum on diagnosis of cancer, heart attack, etc.</p>
          </div>
          <YesNoToggle value={ins.has_critical_illness}
            onChange={(v) => patchIns(form, onChange, { has_critical_illness: v })} />
        </div>
      </div>
    </div>
  );
}