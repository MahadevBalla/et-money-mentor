// frontend/src/components/tax/results/tax-bar.tsx

import type { TaxResult } from "@/lib/tax-types";
import { cn } from "@/lib/utils";

interface Props { result: TaxResult; }

export function TaxBar({ result }: Readonly<Props>) {
  const gross   = result.gross_income;
  const oldPct  = Math.min((result.old_regime_tax / gross) * 100, 100);
  const newPct  = Math.min((result.new_regime_tax / gross) * 100, 100);
  const fmt     = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  const rows = [
    {
      label: "Old Regime",
      tax: result.old_regime_tax,
      rate: result.effective_rate_old,
      pct: oldPct,
      isWinner: result.recommended_regime === "old",
      barColor: "bg-blue-500",
      trackColor: "bg-blue-100 dark:bg-blue-950/40",
    },
    {
      label: "New Regime",
      tax: result.new_regime_tax,
      rate: result.effective_rate_new,
      pct: newPct,
      isWinner: result.recommended_regime === "new",
      barColor: "bg-purple-500",
      trackColor: "bg-purple-100 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold">Tax as % of Gross Income</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          What portion of your ₹{(gross / 1e5).toFixed(1)}L annual income goes to tax
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-sm shrink-0", row.barColor)} />
                <span className={cn(
                  "font-medium",
                  row.isWinner ? "text-foreground" : "text-muted-foreground"
                )}>
                  {row.label}
                  {row.isWinner && (
                    <span className="ml-1.5 text-[10px] text-primary font-bold">RECOMMENDED</span>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground">{fmt(row.tax)}</span>
                <span className="text-muted-foreground ml-1">({row.rate.toFixed(1)}%)</span>
              </div>
            </div>
            {/* Bar */}
            <div className={cn("h-6 rounded-lg overflow-hidden relative", row.trackColor)}>
              <div
                className={cn(
                  "h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700",
                  row.barColor
                )}
                style={{ width: `${row.pct}%`, minWidth: row.pct > 0 ? "2rem" : "0" }}
              >
                {row.pct > 12 && (
                  <span className="text-white text-[10px] font-bold">
                    {row.rate.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Difference callout */}
      {result.savings_by_switching > 0 && (
        <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tax difference</span>
          <span className="text-xs font-bold text-foreground">
            {fmt(result.savings_by_switching)} / year
          </span>
        </div>
      )}
    </div>
  );
}