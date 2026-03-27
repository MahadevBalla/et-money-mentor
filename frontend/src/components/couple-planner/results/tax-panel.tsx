// frontend/src/components/couple-planner/results/tax-panel.tsx
import { FileText, Landmark, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fmt, type CoupleResult } from "@/lib/couple-types";

interface Props {
  result: CoupleResult;
  nameA: string;
  nameB: string;
}

export function TaxPanel({ result, nameA, nameB }: Readonly<Props>) {
  const { joint_tax_saving, nps_matching_benefit } = result;
  if (joint_tax_saving <= 0 && nps_matching_benefit <= 0) return null;

  const items = [
    joint_tax_saving > 0 && {
      icon: FileText as LucideIcon,
      title: "Deduction Headroom",
      value: fmt(joint_tax_saving),
      sub: "If both partners fully utilise 80C · 80D · NPS",
      detail: `${nameA} and ${nameB} can save ${fmt(joint_tax_saving)} more per year by maxing available deductions under old regime.`,
    },
    nps_matching_benefit > 0 && {
      icon: Landmark as LucideIcon,
      title: "NPS 80CCD(1B) Benefit",
      value: fmt(nps_matching_benefit),
      sub: "₹50,000 extra deduction each · 31.2% tax saving",
      detail: `If both ${nameA} and ${nameB} each contribute ₹50,000 to NPS under 80CCD(1B), combined saving is ${fmt(nps_matching_benefit)}/year.`,
    },
  ].filter(Boolean) as {
    icon: LucideIcon; title: string; value: string;
    sub: string; detail: string;
  }[];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-semibold">Joint Tax Optimisation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total potential saving:{" "}
            <strong className="text-success">
              {fmt(joint_tax_saving + nps_matching_benefit)}/year
            </strong>
          </p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="px-5 py-4 space-y-2">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-primary">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">/year</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
