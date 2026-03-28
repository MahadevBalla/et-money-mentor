// frontend/src/components/profile/portfolio-wizard/portfolio-wizard.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updatePortfolioProfile, DEFAULT_PROFILE, type UserProfile } from "@/lib/portfolio";
import { StepBasics    } from "./step-basics";
import { StepIncome    } from "./step-income";
import { StepAssets    } from "./step-assets";
import { StepDebts     } from "./step-debts";
import { StepInsurance } from "./step-insurance";
import { StepTaxGoals  } from "./step-tax-goals";

const STEPS = [
  { id: 1, label: "About You",    shortLabel: "You"      },
  { id: 2, label: "Income",       shortLabel: "Income"   },
  { id: 3, label: "Assets",       shortLabel: "Assets"   },
  { id: 4, label: "Debts",        shortLabel: "Debts"    },
  { id: 5, label: "Insurance",    shortLabel: "Insurance"},
  { id: 6, label: "Tax & Goals",  shortLabel: "Tax"      },
];

interface Props {
  initialData?: Partial<UserProfile>;
  onSuccess: (updated: UserProfile) => void;
  onCancel:  () => void;
}

export function PortfolioWizard({ initialData, onSuccess, onCancel }: Props) {
  const [step,   setStep]   = useState(1);
  const [form,   setForm]   = useState<UserProfile>({ ...DEFAULT_PROFILE, ...initialData });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  function patch(p: Partial<UserProfile>) { setForm(f => ({ ...f, ...p })); }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const result = await updatePortfolioProfile(form);
      onSuccess(result.profile as UserProfile);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isFirst = step === 1;
  const isLast  = step === STEPS.length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* ── Step progress bar ── */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-0">
          {STEPS.map((s, idx) => {
            const done   = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                {/* Circle */}
                <button
                  type="button"
                  onClick={() => done && setStep(s.id)}
                  className={cn("flex-shrink-0 flex flex-col items-center", done ? "cursor-pointer" : "cursor-default")}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    done   ? "bg-primary border-primary text-primary-foreground"
                    : active ? "border-primary text-primary bg-background"
                    :          "border-border text-muted-foreground bg-background"
                  )}>
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                  </div>
                  <p className={cn(
                    "text-[9px] mt-1 font-medium hidden sm:block whitespace-nowrap",
                    active ? "text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/50"
                  )}>
                    {s.shortLabel}
                  </p>
                </button>
                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-1 transition-colors", step > s.id ? "bg-primary" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pb-4 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Step {step} of {STEPS.length} — <span className="text-foreground font-medium">{STEPS[step - 1].label}</span>
          </p>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="px-6 py-6 min-h-[380px]">
        {step === 1 && <StepBasics    form={form} onChange={patch} />}
        {step === 2 && <StepIncome    form={form} onChange={patch} />}
        {step === 3 && <StepAssets    form={form} onChange={patch} />}
        {step === 4 && <StepDebts     form={form} onChange={patch} />}
        {step === 5 && <StepInsurance form={form} onChange={patch} />}
        {step === 6 && <StepTaxGoals  form={form} onChange={patch} />}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-6 mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={isFirst ? onCancel : () => setStep(s => s - 1)} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          {isFirst ? "Cancel" : "Back"}
        </Button>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div key={s.id} className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === s.id ? "w-4 bg-primary" : step > s.id ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
            )} />
          ))}
        </div>
        {isLast ? (
          <Button onClick={handleSave} disabled={saving} className="px-6 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Portfolio"}
          </Button>
        ) : (
          <Button onClick={() => setStep(s => s + 1)} className="gap-1.5">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}