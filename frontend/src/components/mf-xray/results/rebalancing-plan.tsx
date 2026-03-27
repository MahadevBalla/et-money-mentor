// frontend/src/components/mf-xray/results/rebalancing-plan.tsx
import {
  Wrench, Package, ArrowLeftRight, TrendingDown,
  Shield, TrendingUp, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props { suggestions: string[] }

function getSuggestionIcon(s: string): LucideIcon {
  const t = s.toLowerCase();
  if (t.includes("funds —") || t.includes("simplify")) return Package;
  if (t.includes("overlap") || t.includes("consolidate")) return ArrowLeftRight;
  if (t.includes("expense") || t.includes("direct plan") ||
    t.includes("regular plan") || t.includes("direct")) return TrendingDown;
  if (t.includes("debt") || t.includes("short-duration")) return Shield;
  if (t.includes("index") || t.includes("nifty")) return TrendingUp;
  return CheckCircle2;
}

export function RebalancingPlan({ suggestions }: Readonly<Props>) {
  if (!suggestions.length) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-muted/40 border-b border-border flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Wrench className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Rebalancing Action Plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {suggestions.length} action{suggestions.length === 1 ? "" : "s"} · Do them in this order
          </p>
        </div>
      </div>

      <div className="px-5 py-2">
        {suggestions.map((s, i) => {
          const isLast = i === suggestions.length - 1;
          const Icon = getSuggestionIcon(s);
          return (
            <div key={i} className="flex gap-4 py-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                {!isLast && (
                  <div className="w-0.5 bg-border flex-1 mt-1" style={{ minHeight: "1.5rem" }} />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5 pb-1">
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{s}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
