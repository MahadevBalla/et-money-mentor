// frontend/src/components/fire/steps/step-money.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FIREFormState } from "@/lib/fire-types";

interface Props {
  form: FIREFormState;
  onChange: (patch: Partial<FIREFormState>) => void;
}

const ASSET_FIELDS: {
  key: keyof FIREFormState["assets"];
  label: string;
  hint: string;
}[] = [
  { key: "equity",      label: "Equity",          hint: "MF, stocks, ETFs"          },
  { key: "debt",        label: "Debt",             hint: "FDs, bonds, debt MF"        },
  { key: "ppf_epf",     label: "PPF / EPF",        hint: "Provident fund balance"     },
  { key: "gold",        label: "Gold",             hint: "Physical + SGB"             },
  { key: "real_estate", label: "Real Estate",      hint: "Market value (excl. home)"  },
  { key: "cash",        label: "Cash / Savings",   hint: "Savings A/C, liquid cash"   },
  { key: "other",       label: "Other",            hint: "Crypto, angel, alternatives"},
];

export function StepMoney({ form, onChange }: Readonly<Props>) {
  const [assetsExpanded, setAssetsExpanded] = useState(false);
  const [hasEMI, setHasEMI] = useState(Number(form.total_emi) > 0);

  const income     = Number(form.monthly_gross_income) || 0;
  const expenses   = Number(form.monthly_expenses) || 0;
  const emi        = Number(form.total_emi) || 0;
  const surplus    = income - expenses;
  const investable = Math.max(0, surplus - emi);

  const totalCorpus = Object.values(form.assets).reduce((s, v) => s + v, 0);

  function patchAsset(key: keyof FIREFormState["assets"], val: string) {
    onChange({ assets: { ...form.assets, [key]: Number(val) || 0 } });
  }

  return (
    <div className="space-y-6">
      {/* Income & Expenses */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Income & Expenses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fire-income">
              Monthly Income (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="fire-income"
                type="number"
                placeholder="1,00,000"
                className="pl-7"
                value={form.monthly_gross_income}
                onChange={(e) => onChange({ monthly_gross_income: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">Gross monthly (pre-tax)</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fire-expenses">
              Monthly Expenses (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="fire-expenses"
                type="number"
                placeholder="60,000"
                className="pl-7"
                value={form.monthly_expenses}
                onChange={(e) => onChange({ monthly_expenses: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              All spending — rent, food, bills, lifestyle
            </p>
          </div>
        </div>

        {/* Live surplus chips */}
        {income > 0 && expenses > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div
              className={cn(
                "flex flex-col px-3 py-2 rounded-lg text-xs",
                surplus >= 0
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-red-50 dark:bg-red-950/20"
              )}
            >
              <span className="text-muted-foreground">Monthly surplus</span>
              <span
                className={cn(
                  "font-bold text-sm mt-0.5",
                  surplus >= 0 ? "text-green-600" : "text-destructive"
                )}
              >
                ₹{Math.abs(surplus).toLocaleString("en-IN")}
                {surplus < 0 ? " deficit" : ""}
              </span>
            </div>
            <div className="flex flex-col px-3 py-2 rounded-lg text-xs bg-primary/5">
              <span className="text-muted-foreground">Investable (after EMIs)</span>
              <span className="font-bold text-sm mt-0.5 text-primary">
                ₹{investable.toLocaleString("en-IN")}/mo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* EMI toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Monthly EMIs</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total of all loan EMIs you currently pay
            </p>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {[
              { val: false, label: "None" },
              { val: true, label: "I have EMIs" },
            ].map(({ val, label }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setHasEMI(val);
                  if (!val) onChange({ total_emi: "0" });
                }}
                className={cn(
                  "px-3 py-1 rounded-md text-sm font-medium transition-all",
                  hasEMI === val
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {hasEMI && (
          <div className="space-y-1.5">
            <Label htmlFor="fire-emi" className="text-xs">
              Total monthly EMI (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="fire-emi"
                type="number"
                placeholder="15,000"
                className="pl-7"
                value={form.total_emi === "0" ? "" : form.total_emi}
                onChange={(e) => onChange({ total_emi: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Combined EMI across all loans (home, car, personal, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Assets accordion */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAssetsExpanded(!assetsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
        >
          <div>
            <span className="text-sm font-semibold">Current Investments & Assets</span>
            <span className="text-xs text-muted-foreground ml-2">
              {totalCorpus > 0
                ? `₹${totalCorpus.toLocaleString("en-IN")} entered`
                : "enter your existing corpus — required for projections"}
            </span>
          </div>
          {assetsExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {assetsExpanded && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ASSET_FIELDS.map(({ key, label, hint }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="pl-6 h-9 text-sm"
                      value={
                        form.assets[key] === 0 ? "" : form.assets[key]
                      }
                      onChange={(e) => patchAsset(key, e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              ))}
            </div>

            {/* Live total */}
            {totalCorpus > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-primary/5 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Total current corpus
                </span>
                <span className="text-sm font-bold text-primary">
                  ₹{totalCorpus.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}