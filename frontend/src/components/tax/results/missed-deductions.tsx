// frontend/src/components/tax/results/missed-deductions.tsx
import { AlertCircle, IndianRupee, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaxResult } from "@/lib/tax-types";

interface Props { result: TaxResult; }

function getActionHint(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("80c")) return "Invest in PPF, ELSS, EPF top-up, or LIC premium";
  if (t.includes("80d") && t.includes("self")) return "Pay health insurance premium for yourself & family";
  if (t.includes("80d") && t.includes("parent")) return "Pay parents' health insurance premium";
  if (t.includes("nps")) return "Open NPS account — best additional deduction available";
  if (t.includes("hra")) return "Submit rent receipts to your employer or claim at ITR filing";
  if (t.includes("24") || t.includes("home loan")) return "Enter interest certificate from your lender";
  return "Consult your CA for this deduction";
}

function extractUnusedAmount(text: string): number | null {
  const match = text.match(/₹([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

export function MissedDeductions({ result }: Readonly<Props>) {
  if (!result.missing_deductions.length) return null;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const potentialTaxSaved = result.recommended_regime === "old"
    ? Math.round(result.deduction_potential * 0.30 * 1.04)
    : 0;

  return (
    <div className="bg-card border border-warning/40 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-warning/10 px-5 py-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-warning/20 flex items-center justify-center shrink-0 mt-0.5">
          <IndianRupee className="h-4 w-4 text-warning" />
        </div>
        <div>
          <p className="text-sm font-bold text-warning">
            Money left on the table — {fmt(result.deduction_potential)} in unused deductions
          </p>
          {potentialTaxSaved > 0 && (
            <p className="text-xs text-warning/80 mt-0.5">
              Claiming these could save approximately {fmt(potentialTaxSaved)} in additional tax
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border">
        {result.missing_deductions.map((text, i) => {
          const unusedAmt = extractUnusedAmount(text);
          const actionHint = getActionHint(text);
          const isHighPriority = unusedAmt !== null && unusedAmt >= 25_000;

          return (
            <div key={i} className="px-5 py-4 flex items-start gap-3">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                isHighPriority ? "bg-warning/20" : "bg-muted"
              )}>
                <AlertCircle className={cn(
                  "h-3.5 w-3.5",
                  isHighPriority ? "text-warning" : "text-muted-foreground"
                )} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isHighPriority ? "text-warning" : "text-foreground"
                )}>
                  {text}
                </p>
                <p className="text-xs text-muted-foreground">
                  → {actionHint}
                </p>
              </div>
              {isHighPriority && unusedAmt && (
                <div className="shrink-0 text-right ml-auto">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/10 text-warning">
                    High Priority
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 bg-muted/50 border-t border-border flex items-start gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          These deductions only reduce tax under the{" "}
          <strong className="text-foreground">Old Regime</strong>.
          If the New Regime is already recommended, claiming deductions may further increase
          Old Regime savings — run a recalculation after investing.
        </p>
      </div>
    </div>
  );
}
