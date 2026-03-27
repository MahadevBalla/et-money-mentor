// frontend/src/components/tax/steps/step-deductions.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TAX_LIMITS, FY_LABEL, type TaxFormState } from "@/lib/tax-types";

interface Props {
  form: TaxFormState;
  onChange: (patch: Partial<TaxFormState>) => void;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function DeductionBar({
  value, limit, urgent,
}: { value: number; limit: number; urgent?: boolean }) {
  const pct = Math.min((value / limit) * 100, 100);
  const unused = limit - Math.min(value, limit);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          ₹{value.toLocaleString("en-IN")} entered
        </span>
        <span className={cn(
          "font-medium",
          unused > 20_000 && urgent ? "text-amber-500" : "text-muted-foreground"
        )}>
          {unused > 0
            ? `₹${unused.toLocaleString("en-IN")} unused`
            : "✓ Fully utilized"}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            pct >= 100
              ? "bg-green-500"
              : unused > 20_000 && urgent
              ? "bg-amber-400"
              : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Accordion section wrapper ────────────────────────────────────────────────
function DeductionSection({
  id, title, limit, limitLabel, value, children, defaultOpen = false,
}: {
  id: string; title: string; limit?: string; limitLabel?: string;
  value: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasValue = value > 0;

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all",
      hasValue ? "border-primary/40" : "border-border"
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
          open ? "bg-muted/60" : "bg-card hover:bg-muted/30"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasValue && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
          )}
          <span className={cn(
            "text-sm font-semibold truncate",
            !hasValue && "pl-[18px]"
          )}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {limit && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {limitLabel ?? "Limit"}: {limit}
            </span>
          )}
          {hasValue && (
            <span className="text-xs font-semibold text-primary">
              ₹{value.toLocaleString("en-IN")}
            </span>
          )}
          {open
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>
      {open && <div className="px-4 py-4 space-y-4 bg-card">{children}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function StepDeductions({ form, onChange }: Props) {
  const isSeniorSelf = Number(form.age) >= 60 || form.section_80d_self_is_senior;
  const selfLimit    = isSeniorSelf ? TAX_LIMITS.SEC_80D_SELF_SENIOR   : TAX_LIMITS.SEC_80D_SELF;
  const parentsLimit = form.section_80d_parents_are_senior
    ? TAX_LIMITS.SEC_80D_PARENTS_SENIOR : TAX_LIMITS.SEC_80D_PARENTS;

  // Quick-fill presets for 80C
  const EIGHTY_C_PRESETS = [
    { label: "EPF",  amount: 46_800 },
    { label: "PPF",  amount: 1_50_000 },
    { label: "ELSS", amount: 1_50_000 },
    { label: "LIC",  amount: 18_000 },
  ];

  function num(v: string) { return Number(v) || 0; }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Enter your tax-saving investments & deductions
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {FY_LABEL} · Leave blank if you don&apos;t have a deduction
          </p>
        </div>
      </div>

      {/* 80C */}
      <DeductionSection
        id="80c"
        title="Section 80C"
        limit="₹1,50,000"
        value={num(form.section_80c)}
        defaultOpen
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            EPF, PPF, ELSS mutual funds, LIC premium, NSC, ULIP, 5-yr FD, tuition fees
          </p>
          {/* Quick-fill chips */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Quick fill →</p>
            <div className="flex flex-wrap gap-1.5">
              {EIGHTY_C_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    onChange({
                      section_80c: String(
                        Math.min(num(form.section_80c) + p.amount, TAX_LIMITS.SEC_80C)
                      ),
                    })
                  }
                  className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  + {p.label} ₹{(p.amount / 1000).toFixed(0)}k
                </button>
              ))}
              {num(form.section_80c) > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ section_80c: "" })}
                  className="px-3 py-1 rounded-full border border-destructive/40 text-xs text-destructive hover:bg-destructive/10 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              placeholder="0"
              className="pl-7"
              max={TAX_LIMITS.SEC_80C}
              value={form.section_80c}
              onChange={(e) => onChange({ section_80c: e.target.value })}
            />
          </div>
          <DeductionBar value={num(form.section_80c)} limit={TAX_LIMITS.SEC_80C} urgent />
        </div>
      </DeductionSection>

      {/* 80D */}
      <DeductionSection
        id="80d"
        title="Section 80D — Health Insurance"
        limit={`₹${selfLimit.toLocaleString("en-IN")} self + ₹${parentsLimit.toLocaleString("en-IN")} parents`}
        value={num(form.section_80d_self) + num(form.section_80d_parents)}
      >
        <div className="space-y-4">
          {/* Self */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Self & Family Health Premium
              <span className="ml-1 font-normal text-muted-foreground">
                (limit: ₹{selfLimit.toLocaleString("en-IN")})
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                placeholder="0"
                className="pl-7"
                max={selfLimit}
                value={form.section_80d_self}
                onChange={(e) => onChange({ section_80d_self: e.target.value })}
              />
            </div>

            {/* Senior toggle — auto-checked if age >= 60 */}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div
                onClick={() =>
                  onChange({
                    section_80d_self_is_senior: !form.section_80d_self_is_senior,
                  })
                }
                className={cn(
                  "h-4 w-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                  (isSeniorSelf)
                    ? "bg-primary border-primary"
                    : "border-border bg-background"
                )}
              >
                {isSeniorSelf && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                I / family member is a senior citizen (60+) — raises limit to ₹50,000
              </span>
            </label>

            <DeductionBar value={num(form.section_80d_self)} limit={selfLimit} urgent />
          </div>

          {/* Parents */}
          <div className="space-y-2 border-t border-border pt-3">
            <Label className="text-xs font-semibold">
              Parents&apos; Health Premium
              <span className="ml-1 font-normal text-muted-foreground">
                (limit: ₹{parentsLimit.toLocaleString("en-IN")})
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                placeholder="0"
                className="pl-7"
                max={parentsLimit}
                value={form.section_80d_parents}
                onChange={(e) => onChange({ section_80d_parents: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div
                onClick={() =>
                  onChange({
                    section_80d_parents_are_senior: !form.section_80d_parents_are_senior,
                  })
                }
                className={cn(
                  "h-4 w-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                  form.section_80d_parents_are_senior
                    ? "bg-primary border-primary"
                    : "border-border bg-background"
                )}
              >
                {form.section_80d_parents_are_senior && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Parents are senior citizens (60+) — raises limit to ₹50,000
              </span>
            </label>

            <DeductionBar value={num(form.section_80d_parents)} limit={parentsLimit} urgent />
          </div>
        </div>
      </DeductionSection>

      {/* NPS 80CCD(1B) */}
      <DeductionSection
        id="nps"
        title="NPS — Section 80CCD(1B)"
        limit="₹50,000"
        limitLabel="Extra limit"
        value={num(form.nps_80ccd_1b)}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            <Info className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-800 dark:text-green-200">
              <strong>Over and above 80C.</strong> This is an additional ₹50,000 deduction
              exclusively for NPS contributions — one of the best tax-saving instruments.
            </p>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              placeholder="0"
              className="pl-7"
              max={TAX_LIMITS.NPS_80CCD_1B}
              value={form.nps_80ccd_1b}
              onChange={(e) => onChange({ nps_80ccd_1b: e.target.value })}
            />
          </div>
          <DeductionBar value={num(form.nps_80ccd_1b)} limit={TAX_LIMITS.NPS_80CCD_1B} urgent />
        </div>
      </DeductionSection>

      {/* HRA — salaried only */}
      {form.employment_type === "salaried" && (
        <DeductionSection
          id="hra"
          title="HRA — House Rent Allowance"
          limitLabel="Actual exemption"
          value={num(form.hra_claimed)}
        >
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter the HRA exemption amount as calculated by your employer / Form 16.
              If you pay rent but haven&apos;t submitted receipts, this can be reclaimed at filing.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                placeholder="0"
                className="pl-7"
                value={form.hra_claimed}
                onChange={(e) => onChange({ hra_claimed: e.target.value })}
              />
            </div>
          </div>
        </DeductionSection>
      )}

      {/* Home Loan Interest — Sec 24(b) */}
      <DeductionSection
        id="homeloan"
        title="Home Loan Interest — Section 24(b)"
        limit="₹2,00,000"
        value={num(form.home_loan_interest)}
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Interest component of your home loan EMI for a self-occupied property.
            Check your lender&apos;s annual interest certificate (Form 16A).
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              placeholder="0"
              className="pl-7"
              max={TAX_LIMITS.HOME_LOAN_INTEREST}
              value={form.home_loan_interest}
              onChange={(e) => onChange({ home_loan_interest: e.target.value })}
            />
          </div>
          <DeductionBar value={num(form.home_loan_interest)} limit={TAX_LIMITS.HOME_LOAN_INTEREST} />
        </div>
      </DeductionSection>

      {/* Other deductions */}
      <DeductionSection
        id="other"
        title="Other Deductions"
        limitLabel="No limit"
        value={num(form.other_deductions)}
      >
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Education loan interest (80E), donations (80G), disability (80U),
            savings account interest (80TTA), etc.
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              placeholder="0"
              className="pl-7"
              value={form.other_deductions}
              onChange={(e) => onChange({ other_deductions: e.target.value })}
            />
          </div>
        </div>
      </DeductionSection>

      {/* Note */}
      <div className="flex items-start gap-2 px-3 py-2 bg-muted rounded-xl">
        <Info className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Deductions only apply to the
          Old Regime. Under New Regime, only the ₹75,000 standard deduction applies.
          We compare both automatically.
        </p>
      </div>
    </div>
  );
}