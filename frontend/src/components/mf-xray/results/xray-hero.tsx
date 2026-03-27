// frontend/src/components/mf-xray/results/xray-hero.tsx
import { Microscope, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtShort, type MFXRayResult } from "@/lib/mf-xray-types";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface Props { result: MFXRayResult }

export function XRayHero({ result }: Readonly<Props>) {
  const {
    total_invested, total_current_value,
    absolute_return_pct, overall_xirr,
    xirr_vs_benchmark, benchmark_conservative,
    benchmark_base, benchmark_optimistic,
  } = result;

  const gain = total_current_value - total_invested;
  const isPositive = gain >= 0;
  const hasXirr = overall_xirr != null;
  const beatMarket = (xirr_vs_benchmark ?? 0) > 0;

  const scale = benchmark_optimistic + 4;
  const xirrPct = hasXirr
    ? Math.min(Math.max((overall_xirr! / scale) * 100, 2), 98)
    : null;
  const conservativePct = (benchmark_conservative / scale) * 100;
  const basePct = (benchmark_base / scale) * 100;
  const optimisticPct = (benchmark_optimistic / scale) * 100;

  return (
    <div className={cn(
      "rounded-xl border-2 p-6 space-y-5",
      isPositive
        ? "bg-gradient-to-br from-success/5 to-success/10 border-success/30"
        : "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30"
    )}>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
            <Microscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Portfolio X-Ray</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {result.holdings.length} fund{result.holdings.length !== 1 ? "s" : ""} ·{" "}
              <AnimatedNumber value={total_invested} format={fmtShort} /> invested
            </p>
          </div>
        </div>

        {/* Alpha badge */}
        {hasXirr && (
          <div className={cn(
            "shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold",
            beatMarket
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}>
            {beatMarket
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            }
            <AnimatedNumber
              value={Math.abs(xirr_vs_benchmark!)}
              format={(n) => `${n.toFixed(1)}%`}
            /> vs Nifty
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current value */}
        <div className="bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Current Value
          </p>
          <p className="text-base font-bold text-foreground mt-1">
            <AnimatedNumber value={total_current_value} format={fmtShort} />
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Invested: <AnimatedNumber value={total_invested} format={fmtShort} />
          </p>
        </div>

        {/* P&L */}
        <div className={cn(
          "rounded-xl p-3 border",
          isPositive
            ? "bg-success/10 border-success/30"
            : "bg-destructive/10 border-destructive/30"
        )}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Total Gain / Loss
          </p>
          <p className={cn("text-base font-bold mt-1",
            isPositive ? "text-success" : "text-destructive")}>
            {isPositive ? "+" : "-"}
            <AnimatedNumber value={Math.abs(gain)} format={fmtShort} />
          </p>
          <p className={cn("text-[10px] font-semibold mt-0.5",
            isPositive ? "text-success" : "text-destructive")}>
            {absolute_return_pct >= 0 ? "+" : ""}
            <AnimatedNumber value={absolute_return_pct} format={(n) => `${n.toFixed(1)}%`} />
          </p>
        </div>

        {/* XIRR */}
        <div className={cn(
          "rounded-xl p-3 border",
          hasXirr && beatMarket
            ? "bg-success/10 border-success/30"
            : "bg-white/60 dark:bg-white/10 border-white/40 dark:border-white/20"
        )}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            XIRR p.a.
          </p>
          <p className="text-base font-bold text-foreground mt-1">
            {hasXirr
              ? <AnimatedNumber value={overall_xirr!} format={(n) => `${n.toFixed(1)}%`} />
              : "N/A"
            }
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {hasXirr ? `Nifty base: ${benchmark_base}%` : "Need purchase dates"}
          </p>
        </div>

        {/* Alpha */}
        <div className="bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            Alpha vs Nifty
          </p>
          <p className={cn("text-base font-bold mt-1",
            !hasXirr
              ? "text-muted-foreground"
              : beatMarket ? "text-success" : "text-destructive"
          )}>
            {hasXirr ? (
              <>
                {(xirr_vs_benchmark ?? 0) >= 0 ? "+" : ""}
                <AnimatedNumber value={xirr_vs_benchmark ?? 0} format={(n) => `${n.toFixed(1)}%`} />
              </>
            ) : "N/A"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            {hasXirr && beatMarket && <TrendingUp className="h-3 w-3 text-success" />}
            {hasXirr
              ? (beatMarket ? "Outperforming" : "Underperforming")
              : "XIRR unavailable"
            }
          </p>
        </div>
      </div>

      {/* Benchmark band bar */}
      {hasXirr && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground font-medium">
            Nifty 50 XIRR Benchmark Band
          </p>
          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-destructive/20 rounded-l-full"
              style={{ width: `${conservativePct}%` }} />
            <div className="absolute inset-y-0 bg-warning/20"
              style={{ left: `${conservativePct}%`, width: `${basePct - conservativePct}%` }} />
            <div className="absolute inset-y-0 bg-success/20"
              style={{ left: `${basePct}%`, width: `${optimisticPct - basePct}%` }} />
            {xirrPct != null && (
              <div
                className="absolute inset-y-0 w-1 bg-primary rounded-full shadow"
                style={{ left: `calc(${xirrPct}% - 2px)` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Below {benchmark_conservative}%</span>
            <span>{benchmark_conservative}–{benchmark_base}%</span>
            <span>{benchmark_base}–{benchmark_optimistic}%</span>
            <span>Above {benchmark_optimistic}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
