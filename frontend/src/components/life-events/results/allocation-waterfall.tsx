// frontend/src/components/life-events/results/allocation-waterfall.tsx
import {
  AlertTriangle, Shield, TrendingDown, TrendingUp,
  Umbrella, GraduationCap, Home, FileText, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_META, type LifeEventResult } from "@/lib/life-event-types";

interface Props { result: LifeEventResult; }

const CATEGORY_ICON_MAP: { match: string; icon: LucideIcon }[] = [
  { match: "debt", icon: AlertTriangle },
  { match: "emergency", icon: Shield },
  { match: "tax", icon: TrendingDown },
  { match: "equity", icon: TrendingUp },
  { match: "wealth", icon: TrendingUp },
  { match: "insurance", icon: Umbrella },
  { match: "education", icon: GraduationCap },
  { match: "down", icon: Home },
  { match: "stamp", icon: FileText },
  { match: "term", icon: Umbrella },
];

function getCategoryIcon(category: string): LucideIcon {
  const lower = category.toLowerCase();
  return CATEGORY_ICON_MAP.find((m) => lower.includes(m.match))?.icon ?? Wallet;
}

// Data-viz identity colors — intentionally kept as raw colors (not semantic tokens)
const CATEGORY_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500",
  "bg-purple-500", "bg-amber-500", "bg-indigo-500",
];

const DONUT_HEX: Record<string, string> = {
  "bg-red-500": "#ef4444",
  "bg-blue-500": "#3b82f6",
  "bg-green-500": "#22c55e",
  "bg-purple-500": "#a855f7",
  "bg-amber-500": "#f59e0b",
  "bg-indigo-500": "#6366f1",
};

export function AllocationWaterfall({ result }: Readonly<Props>) {
  if (!result.allocations.length) return null;

  const meta = EVENT_META[result.event_type];
  const EventIcon = meta.icon;
  const total = result.allocations.reduce((s, a) => s + a.amount, 0);
  const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  let cumulativePct = 0;
  const donutSegments = result.allocations.map((a, i) => {
    const pct = (a.amount / total) * 100;
    const start = cumulativePct;
    cumulativePct += pct;
    return { ...a, pct, start, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
  });

  const donutGradient = donutSegments
    .map((s) => `${DONUT_HEX[s.color] ?? "#94a3b8"} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(", ");

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <EventIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Recommended Allocation</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total: {fmt(total)}
            {result.tax_impact > 0 && (
              <span className="ml-2 text-destructive">
                · After tax: {fmt(total - result.tax_impact)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Donut + legend */}
      <div className="px-5 py-4 flex items-center gap-6">
        <div className="shrink-0 relative h-20 w-20">
          <div className="h-20 w-20 rounded-full"
            style={{ background: `conic-gradient(${donutGradient})` }} />
          <div className="absolute inset-[22%] rounded-full bg-card flex items-center justify-center">
            <span className="text-[10px] font-bold text-muted-foreground">
              {result.allocations.length}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {donutSegments.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={cn("h-2 w-2 rounded-sm shrink-0", s.color)} />
              <span className="text-muted-foreground truncate flex-1">{s.category}</span>
              <span className="font-semibold text-foreground shrink-0">{s.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waterfall rows */}
      <div className="divide-y divide-border">
        {donutSegments.map((alloc, i) => {
          const pct = (alloc.amount / total) * 100;
          const Icon = getCategoryIcon(alloc.category);
          return (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{alloc.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alloc.rationale}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(alloc.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">{pct.toFixed(0)}%</p>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-700", alloc.color)}
                  style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
