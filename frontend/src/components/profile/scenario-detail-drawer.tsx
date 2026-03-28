"use client";

import { useState } from "react";
import {
  X, RefreshCw, Trash2, ChevronDown, ChevronUp,
  Sparkles, AlertTriangle, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScenarioDetail } from "@/lib/portfolio";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtINR(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

const TOOL_HREF: Record<string, string> = {
  health:     "/health-score",
  fire:       "/fire",
  tax:        "/tax",
  life_event: "/life-events",
  couple:     "/couple-planner",
  mf:         "/portfolio",
};

// ─── Feature-specific result renderers ───────────────────────────────────────

function HealthResult({ r }: { r: Record<string, unknown> }) {
  const score = r.overall_score as number;
  const grade = r.grade as string;
  const dims  = (r.dimensions as Array<{ name: string; score: number; label: string }>) ?? [];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-black text-primary">{score ?? "—"}</span>
        </div>
        <div>
          <p className="text-2xl font-black">{grade ?? "—"}</p>
          <p className="text-xs text-muted-foreground">Overall Financial Health</p>
        </div>
      </div>
      {dims.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {dims.map((d) => (
            <div key={d.name} className="bg-muted rounded-lg px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.name}</p>
              <p className="text-sm font-semibold">
                {d.score}<span className="text-xs font-normal text-muted-foreground">/100</span>
              </p>
              <p className={cn("text-[10px] font-medium",
                d.label === "Excellent" ? "text-green-600"
                : d.label === "Good"    ? "text-blue-600"
                : d.label === "Fair"    ? "text-amber-600"
                :                        "text-red-600"
              )}>{d.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FIREResult({ r }: { r: Record<string, unknown> }) {
  const onTrack = r.on_track as boolean;
  const metrics = [
    { label: "FI Corpus Required",  value: r.fi_corpus_required  != null ? fmtINR(r.fi_corpus_required as number)  : "—" },
    { label: "Corpus Gap",          value: r.corpus_gap          != null ? fmtINR(r.corpus_gap as number)          : "—" },
    { label: "Required SIP/mo",     value: r.required_monthly_sip != null ? `${fmtINR(r.required_monthly_sip as number)}/mo` : "—" },
    { label: "Projected FI Age",    value: r.projected_fi_age    != null ? String(r.projected_fi_age)               : "Not achievable" },
  ];
  return (
    <div className="space-y-3">
      <div className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border",
        onTrack
          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
          : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
      )}>
        {onTrack
          ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          : <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />}
        <p className={cn("text-sm font-semibold",
          onTrack ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"
        )}>
          {onTrack ? "On track for FIRE!" : "Additional SIP needed to reach FIRE"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxResult({ r }: { r: Record<string, unknown> }) {
  const regime  = r.recommended_regime as string;
  const savings = r.savings_by_switching as number;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Recommended Regime</p>
          <p className="text-base font-black text-primary">{regime?.toUpperCase()} REGIME</p>
        </div>
        {savings > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">You save</p>
            <p className="text-sm font-bold text-green-600">{fmtINR(savings)}</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Old Regime Tax", value: r.old_regime_tax != null ? fmtINR(r.old_regime_tax as number) : "—" },
          { label: "New Regime Tax", value: r.new_regime_tax != null ? fmtINR(r.new_regime_tax as number) : "—" },
          { label: "Effective Rate (Old)", value: r.effective_rate_old != null ? `${((r.effective_rate_old as number) * 100).toFixed(1)}%` : "—" },
          { label: "Effective Rate (New)", value: r.effective_rate_new != null ? `${((r.effective_rate_new as number) * 100).toFixed(1)}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericResult({ r }: { r: Record<string, unknown> }) {
  const entries = Object.entries(r)
    .filter(([, v]) => typeof v === "number" || typeof v === "string" || typeof v === "boolean")
    .slice(0, 6);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No result data available.</p>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {entries.map(([k, v]) => (
        <div key={k} className="bg-muted rounded-lg px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.replace(/_/g, " ")}</p>
          <p className="text-sm font-semibold truncate">{String(v)}</p>
        </div>
      ))}
    </div>
  );
}

const RENDERERS: Record<string, React.ComponentType<{ r: Record<string, unknown> }>> = {
  health:     HealthResult,
  fire:       FIREResult,
  tax:        TaxResult,
};

// ─── Inputs snapshot (collapsible) ───────────────────────────────────────────

function InputsSnapshot({ inputs }: { inputs: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  // Try to pull the nested profile object if present
  const profile = (inputs.profile as Record<string, unknown>) ?? inputs;
  const rows = [
    { label: "Age",         value: profile.age },
    { label: "City",        value: profile.city },
    { label: "Income/mo",   value: typeof profile.monthly_gross_income === "number" ? fmtINR(profile.monthly_gross_income) : null },
    { label: "Expenses/mo", value: typeof profile.monthly_expenses     === "number" ? fmtINR(profile.monthly_expenses)     : null },
    { label: "Risk",        value: profile.risk_profile },
    { label: "Ret. age",    value: profile.retirement_age },
  ].filter((r) => r.value != null && r.value !== "");

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="text-xs font-semibold">Inputs used in this run</span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && rows.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2">
          {rows.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className="text-xs font-medium">{String(value)}</p>
            </div>
          ))}
        </div>
      )}
      {open && rows.length === 0 && (
        <p className="px-4 py-3 text-xs text-muted-foreground">No input snapshot available.</p>
      )}
    </div>
  );
}

// ─── Advice section ───────────────────────────────────────────────────────────

interface Advice {
  summary?:     string;
  key_actions?: string[];
  risks?:       string[];
}

function AdviceSection({ advice }: { advice: Advice }) {
  if (!advice?.summary) return null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">{advice.summary}</p>
      {(advice.key_actions?.length ?? 0) > 0 && (
        <ul className="space-y-1.5">
          {advice.key_actions!.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      )}
      {(advice.risks?.length ?? 0) > 0 && (
        <ul className="space-y-1.5 mt-2">
          {advice.risks!.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

interface Props {
  scenario: ScenarioDetail;
  onClose:  () => void;
  onDelete: (id: string) => void;
}

export function ScenarioDetailDrawer({ scenario, onClose, onDelete }: Props) {
  const ResultComponent = RENDERERS[scenario.feature] ?? GenericResult;
  const href = TOOL_HREF[scenario.feature] ?? "/";
  const advice = scenario.result?.advice as Advice | undefined;
  const result = scenario.result as Record<string, unknown>;

  const relTime = (() => {
    const diff  = Date.now() - new Date(scenario.created_at).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  <  1) return "just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  <  7) return `${days}d ago`;
    return new Date(scenario.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-background border-l border-border z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{scenario.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {relTime} · {new Date(scenario.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Results</h3>
            <ResultComponent r={result} />
          </div>

          {advice?.summary && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">AI Advice</h3>
              <AdviceSection advice={advice} />
            </div>
          )}

          <InputsSnapshot inputs={scenario.input_data ?? {}} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center gap-3">
          <Link href={href} className="flex-1">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Re-run this scenario
            </button>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(scenario.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}