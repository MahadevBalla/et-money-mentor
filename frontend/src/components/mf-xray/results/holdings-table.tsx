// frontend/src/components/mf-xray/results/holdings-table.tsx
"use client";

import { useState } from "react";
import { ArrowUpDown, List, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fmtShort, holdingGain, holdingGainPct, expenseDrag,
  categoryColor, type MFHolding,
} from "@/lib/mf-xray-types";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface Props {
  holdings: MFHolding[];
  highExpenseFunds: string[];
}

type SortKey = "gain" | "invested" | "current" | "name";

interface SortBtnProps { col: SortKey; sortKey: SortKey; onToggle: (key: SortKey) => void; }

function SortBtn({ col, sortKey, onToggle }: Readonly<SortBtnProps>) {
  return (
    <button type="button" onClick={() => onToggle(col)}
      className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors">
      <ArrowUpDown className={cn("h-3 w-3",
        sortKey === col ? "text-primary" : "text-muted-foreground")} />
    </button>
  );
}

export function HoldingsTable({ holdings, highExpenseFunds }: Readonly<Props>) {
  const [sortKey, setSortKey] = useState<SortKey>("gain");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...holdings].sort((a, b) => {
    let diff = 0;
    if (sortKey === "gain") diff = holdingGainPct(a) - holdingGainPct(b);
    if (sortKey === "invested") diff = a.invested_amount - b.invested_amount;
    if (sortKey === "current") diff = a.current_value - b.current_value;
    if (sortKey === "name") diff = a.scheme_name.localeCompare(b.scheme_name);
    return sortDir === "desc" ? -diff : diff;
  });

  const isHighExpense = (name: string) =>
    highExpenseFunds.some((f) => f.startsWith(name.split(" ")[0]));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <List className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Fund Holdings</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {holdings.length} fund{holdings.length === 1 ? "" : "s"}
              {highExpenseFunds.length > 0 && ` · ${highExpenseFunds.length} high-cost`}
            </p>
          </div>
        </div>
        {highExpenseFunds.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>TER &gt; 1%</span>
          </div>
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-[38%]">
                <div className="flex items-center gap-1">
                  Fund <SortBtn col="name" sortKey={sortKey} onToggle={toggleSort} />
                </div>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Category
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                <div className="flex items-center justify-end gap-1">
                  Invested <SortBtn col="invested" sortKey={sortKey} onToggle={toggleSort} />
                </div>
              </th>
              <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">
                <div className="flex items-center justify-end gap-1">
                  Current <SortBtn col="current" sortKey={sortKey} onToggle={toggleSort} />
                </div>
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                <div className="flex items-center justify-end gap-1">
                  Gain <SortBtn col="gain" sortKey={sortKey} onToggle={toggleSort} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((h, i) => {
              const gain = holdingGain(h);
              const gainPct = holdingGainPct(h);
              const isPos = gain >= 0;
              const isHigh = isHighExpense(h.scheme_name);
              const drag = expenseDrag(h);

              return (
                <tr key={h.isin || i} className={cn(
                  "transition-colors",
                  isHigh
                    ? "bg-warning/5 hover:bg-warning/10"
                    : "hover:bg-muted/30"
                )}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {isHigh && (
                        <span title="High expense ratio">
                          <AlertTriangle
                            className="mt-0.5 h-3.5 w-3.5 text-warning shrink-0"
                          />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                          {h.scheme_name}
                        </p>
                        {h.expense_ratio != null && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            TER: {h.expense_ratio.toFixed(2)}%
                            {drag != null && (
                              <span className="text-warning">
                                {" "}· drag ₹{drag.toLocaleString("en-IN")}/yr
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Raw hex — data-viz identity color, inline style intentional */}
                      <div className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: categoryColor(h.category) }} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {h.category || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="text-xs text-foreground font-medium">{fmtShort(h.invested_amount)}</p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <p className="text-xs text-foreground font-medium">{fmtShort(h.current_value)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className={cn("text-xs font-bold",
                      isPos ? "text-success" : "text-destructive")}>
                      {isPos ? "+" : "-"}
                      <AnimatedNumber value={Math.abs(gain)} format={fmtShort} duration={0.8} />
                    </p>
                    <p className={cn("text-[10px] font-semibold mt-0.5",
                      isPos ? "text-success" : "text-destructive")}>
                      {gainPct >= 0 ? "+" : ""}
                      <AnimatedNumber value={gainPct} format={(n) => `${n.toFixed(1)}%`} duration={0.8} />
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="sm:hidden divide-y divide-border">
        {sorted.map((h, i) => {
          const gain = holdingGain(h);
          const gainPct = holdingGainPct(h);
          const isPos = gain >= 0;
          const isHigh = isHighExpense(h.scheme_name);
          return (
            <div key={h.isin || i} className={cn(
              "px-4 py-3.5",
              isHigh ? "bg-warning/5" : ""
            )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {/* Raw hex — data-viz identity color */}
                    <div className="h-2 w-2 rounded-sm shrink-0"
                      style={{ backgroundColor: categoryColor(h.category) }} />
                    <span className="text-[10px] text-muted-foreground">{h.category}</span>
                    {isHigh && <AlertTriangle className="h-3 w-3 text-warning" />}
                  </div>
                  <p className="text-xs font-medium text-foreground leading-snug">
                    {h.scheme_name}
                  </p>
                  {h.expense_ratio != null && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      TER: {h.expense_ratio.toFixed(2)}%
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-bold",
                    isPos ? "text-success" : "text-destructive")}>
                    {isPos ? "+" : "-"}
                    <AnimatedNumber value={Math.abs(gain)} format={fmtShort} duration={0.8} />
                  </p>
                  <p className={cn("text-[10px] font-semibold",
                    isPos ? "text-success" : "text-destructive")}>
                    {gainPct >= 0 ? "+" : ""}
                    <AnimatedNumber value={gainPct} format={(n) => `${n.toFixed(1)}%`} duration={0.8} />
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {fmtShort(h.current_value)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
