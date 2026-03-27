// frontend/src/components/fire/fire-page.tsx
"use client";

import { useState } from "react";
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, ArrowRight, HeartPulse,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { AdvicePanel } from "@/components/ui/advice-panel";
import { cn } from "@/lib/utils";
import { getFIREPlan } from "@/lib/finance";
import {
  DEFAULT_FIRE_FORM,
  type FIREFormState,
  type FIREApiResponse,
  type FIREPayload,
} from "@/lib/fire-types";
import { StepProfile } from "./steps/step-profile";
import { StepMoney }   from "./steps/step-money";
import { StepGoals }   from "./steps/step-goals";
import { FireHero }    from "./results/fire-hero";
import { CorpusChart } from "./results/corpus-chart";
import { SIPCards }    from "./results/sip-cards";
import { GoalSIPTable } from "./results/goal-sip-table";

// ─── Steps config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Profile",  desc: "Age & risk"        },
  { id: 2, label: "Money",    desc: "Income & assets"   },
  { id: 3, label: "Goals",    desc: "Optional"          },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(step: number, form: FIREFormState): string | null {
  if (step === 1) {
    const age = Number(form.age);
    const ret = Number(form.retirement_age);
    if (!form.age || age < 18 || age > 70)
      return "Please enter a valid age between 18 and 70.";
    if (!form.city || form.city.trim().length < 2)
      return "Please enter your city.";
    if (!form.retirement_age || ret <= age)
      return "Target FIRE age must be greater than your current age.";
  }
  if (step === 2) {
    if (!form.monthly_gross_income || Number(form.monthly_gross_income) <= 0)
      return "Please enter your monthly income.";
    if (!form.monthly_expenses || Number(form.monthly_expenses) <= 0)
      return "Please enter your monthly expenses.";
    if (Number(form.monthly_expenses) > Number(form.monthly_gross_income))
      return "Monthly expenses cannot exceed income.";
  }
  return null;
}

// ─── Payload builder ──────────────────────────────────────────────────────────

function buildPayload(form: FIREFormState): FIREPayload {
  const totalEMI = Number(form.total_emi) || 0;

  // Build a single synthetic DebtItem from total EMI so the backend
  // can compute profile.total_emi correctly
  const debts =
    totalEMI > 0
      ? [
          {
            name: "Combined EMIs",
            outstanding: 0,
            emi: totalEMI,
            interest_rate: 0,
            is_secured: true,
          },
        ]
      : [];

  return {
    age:                  Number(form.age),
    city:                 form.city.trim(),
    employment_type:      form.employment_type,
    dependents:           0,
    monthly_gross_income: Number(form.monthly_gross_income),
    monthly_expenses:     Number(form.monthly_expenses),
    emergency_fund:       0,
    risk_profile:         form.risk_profile,
    retirement_age:       Number(form.retirement_age),
    assets:               form.assets,
    debts,
    insurance: {
      has_term_life: false, term_cover: 0,
      has_health: false, health_cover: 0,
      has_critical_illness: false,
    },
    tax_deductions: {
      section_80c: 0, section_80d_self: 0,
      section_80d_self_is_senior: false, section_80d_parents: 0,
      section_80d_parents_are_senior: false, nps_80ccd_1b: 0,
      hra_claimed: 0, home_loan_interest: 0, other_deductions: 0,
    },
    goals: form.goals,
  };
}

// ─── Stepper header ───────────────────────────────────────────────────────────

function StepperHeader({
  current,
  onStepClick,
}: Readonly<{
  current: number;
  onStepClick: (n: number) => void;
}>) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = current > step.id;
        const isActive    = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => isCompleted && onStepClick(step.id)}
              className={cn(
                "flex flex-col items-center",
                isCompleted ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "border-primary text-primary bg-background"
                    : "border-border text-muted-foreground bg-background"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </div>
              <div className="mt-1.5 text-center hidden sm:block">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{step.desc}</p>
              </div>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 transition-all",
                  current > step.id ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

const LOADING_STAGES = [
  { label: "Validating your financial profile..." },
  { label: "Running FIRE projection engine..."    },
  { label: "Generating AI recommendations..."     },
];

function LoadingOverlay() {
  const [stageIdx, setStageIdx] = useState(0);

  useState(() => {
    const t1 = setTimeout(() => setStageIdx(1), 1500);
    const t2 = setTimeout(() => setStageIdx(2), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  });

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-primary/20 animate-ping absolute" />
        <div className="h-16 w-16 rounded-full border-2 border-primary/40 flex items-center justify-center relative">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        {LOADING_STAGES.map((stage, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 text-sm transition-all",
              i > stageIdx ? "opacity-30" : ""
            )}
          >
            {i < stageIdx ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            ) : i === stageIdx ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-border shrink-0" />
            )}
            <span
              className={cn(
                "text-sm",
                i === stageIdx
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Projecting your corpus year by year — takes ~5 seconds
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function FIREPage() {
  const [step,    setStep   ] = useState(1);
  const [form,    setForm   ] = useState<FIREFormState>(DEFAULT_FIRE_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState("");
  const [result,  setResult ] = useState<FIREApiResponse | null>(null);

  function patch(p: Partial<FIREFormState>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function goNext() {
    const err = validate(step, form);
    if (err) { setError(err); return; }
    setError("");
    if (step < 3) { setStep((s) => s + 1); return; }
    handleSubmit();
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const payload = buildPayload(form);
      const res = await getFIREPlan(payload);
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setForm(DEFAULT_FIRE_FORM);
    setStep(1);
    setError("");
  }

  const monthlyInvestable = Math.max(
    0,
    (Number(form.monthly_gross_income) || 0) -
      (Number(form.monthly_expenses) || 0) -
      (Number(form.total_emi) || 0)
  );

  const stepTitles = ["Your Profile", "Money & Assets", "Financial Goals"];

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Page header */}
        {!result && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FIRE Planner</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Find your exact Financial Independence date and the SIP needed to get there.
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Your FIRE Plan
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Based on your profile — projected year by year
              </p>
            </div>

            {/* Block 1: Hero */}
            <FireHero
              result={result.result}
              targetAge={Number(form.retirement_age)}
            />

            {/* Block 2: Corpus chart */}
            <div>
              <h2 className="text-base font-semibold mb-3">
                Corpus Growth Projection
              </h2>
              <CorpusChart
                projections={result.result.yearly_projections}
                targetAge={Number(form.retirement_age)}
                fiAge={result.result.projected_fi_age}
              />
            </div>

            {/* Block 3: SIP cards */}
            <div>
              <h2 className="text-base font-semibold mb-3">
                How Much SIP Do You Need?
              </h2>
              <SIPCards
                result={result.result}
                monthlyInvestable={monthlyInvestable}
              />
            </div>

            {/* Block 4: Goal SIP table */}
            {result.result.sip_goals.length > 0 && (
              <GoalSIPTable
                sipGoals={result.result.sip_goals}
                fireSIP={result.result.required_monthly_sip}
              />
            )}

            {/* Block 5: AI advice */}
            <div>
              <h2 className="text-base font-semibold mb-3">
                AI Recommendations
              </h2>
              <AdvicePanel advice={result.advice} />
            </div>

            {/* Cross-feature CTA */}
            <div className="flex items-center justify-between bg-muted rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Check your overall financial health
                  </p>
                  <p className="text-xs text-muted-foreground">
                    See if your insurance & debt support this FIRE plan
                  </p>
                </div>
              </div>
              <a href="/health-score">
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  Health Score <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>

            {/* Recalculate */}
            <Button variant="outline" onClick={reset} className="w-full" size="lg">
              Recalculate with new data
            </Button>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && !result && (
          <div className="bg-card border border-border rounded-xl px-8">
            <LoadingOverlay />
          </div>
        )}

        {/* ── Wizard ── */}
        {!result && !loading && (
          <div className="bg-card border border-border rounded-xl p-6">
            <StepperHeader
              current={step}
              onStepClick={(n) => {
                setStep(n);
                setError("");
              }}
            />

            {/* Step title */}
            <div className="mb-6">
              <h2 className="text-base font-semibold">
                Step {step}: {stepTitles[step - 1]}
                {step === 3 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                )}
              </h2>
            </div>

            {/* Step content */}
            {step === 1 && <StepProfile form={form} onChange={patch} />}
            {step === 2 && <StepMoney   form={form} onChange={patch} />}
            {step === 3 && <StepGoals   form={form} onChange={patch} />}

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 1}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-3">
                {step === 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setError(""); handleSubmit(); }}
                    className="text-muted-foreground"
                  >
                    Skip & Calculate
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={goNext}
                  size={step === 3 ? "lg" : "default"}
                  className="gap-1.5"
                >
                  {step === 3
                    ? "Calculate FIRE Path"
                    : <>Next <ChevronRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}