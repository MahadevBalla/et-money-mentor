// frontend/src/components/mf-xray/results/category-chart.tsx
// Pure CSS conic-gradient donut — zero extra dependencies.
import { BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryColor, fmtShort, type MFXRayResult } from "@/lib/mf-xray-types";

interface Props { result: MFXRayResult }

export function CategoryChart({ result }: Readonly<Props>) {
  const { category_breakdown, rebalancing_suggestions, total_current_value } = result;

  const entries = Object.entries(category_breakdown).sort(([, a], [, b]) => b - a);
  if (!entries.length) return null;

  // Build conic-gradient segments
  let cursor = 0;
  const segments = entries.map(([cat, val]) => {
    const pct = total_current_value > 0 ? (val / total_current_value) * 100 : 0;
    const from = cursor;
    cursor += pct;
    return { cat, val, pct, from, to: cursor, color: categoryColor(cat) };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.from.toFixed(1)}% ${s.to.toFixed(1)}%`)
    .join(", ");

  // Inline warnings from rebalancing_suggestions
  const debtWarning = rebalancing_suggestions.find((s) => s.toLowerCase().includes("debt"));
  const overFundWarning = rebalancing_suggestions.find((s) => s.toLowerCase().includes("funds —"));

  const equityPct =
    entries
      .filter(([c]) => !["Debt", "Liquid", "Hybrid"].includes(c))
      .reduce((sum, [, v]) => sum + v, 0) /
    (total_current_value || 1) * 100;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Portfolio Allocation</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              By current value · {entries.length} categories
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Equity exposure</p>
          <p className={cn(
            "text-sm font-bold",
            equityPct > 90 ? "text-warning" : "text-foreground"
          )}>
            {equityPct.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Donut — raw hex colors are data-viz identity, kept as inline style */}
        <div className="shrink-0 relative">
          <div
            className="h-36 w-36 rounded-full"
            style={{ background: `conic-gradient(${gradientStops})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-card flex flex-col items-center justify-center">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-xs font-bold text-foreground">
                {fmtShort(total_current_value)}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {segments.map(({ cat, val, pct, color }) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground truncate">{cat}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{fmtShort(val)}</span>
                    <span className="text-[11px] font-bold text-foreground w-10 text-right">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Mini bar — raw hex for data-viz identity, inline style intentional */}
                <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline warnings */}
      {(debtWarning || overFundWarning) && (
        <div className="px-5 pb-4 space-y-2">
          {[debtWarning, overFundWarning].filter(Boolean).map((msg, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/30 rounded-lg"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
              <p className="text-xs text-warning">{msg}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
