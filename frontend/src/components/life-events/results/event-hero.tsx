// frontend/src/components/life-events/results/event-hero.tsx
import { cn } from "@/lib/utils";
import { EVENT_META, type LifeEventResult } from "@/lib/life-event-types";

interface Props { result: LifeEventResult; }

const EVENT_HEADLINES: Record<string, (r: LifeEventResult) => string> = {
  bonus: (r) => `₹${r.event_amount.toLocaleString("en-IN")} Bonus — Here's how to deploy it`,
  inheritance: (r) => `₹${r.event_amount.toLocaleString("en-IN")} Inheritance — Optimised allocation plan`,
  marriage: () => "Marriage Financial Plan — Let's combine your finances right",
  new_baby: () => "New Baby Plan — Financial security for your family",
  job_loss: () => "Crisis Playbook — Survive and recover fast",
  home_purchase: (r) => r.event_amount > 0
    ? `Home Purchase — ₹${(r.event_amount / 1e5).toFixed(1)}L property plan`
    : "Home Purchase Financial Plan",
};

export function EventHero({ result }: Readonly<Props>) {
  const meta = EVENT_META[result.event_type];
  const EventIcon = meta.icon;
  const headline = EVENT_HEADLINES[result.event_type]?.(result) ?? meta.label;

  const statsRows = [];
  if (result.event_amount > 0)
    statsRows.push({ label: "Event Amount", value: `₹${Math.round(result.event_amount).toLocaleString("en-IN")}`, warn: false });
  if (result.tax_impact > 0)
    statsRows.push({ label: "Tax Impact", value: `₹${Math.round(result.tax_impact).toLocaleString("en-IN")}`, warn: true });
  if (result.allocations.length > 0)
    statsRows.push({ label: "Allocation Buckets", value: `${result.allocations.length} categories`, warn: false });
  if (result.insurance_gaps.length > 0)
    statsRows.push({ label: "Insurance Gaps", value: `${result.insurance_gaps.length} detected`, warn: true });
  statsRows.push({ label: "Priority Actions", value: `${result.priority_actions.length} steps`, warn: false });

  return (
    <div className={cn(
      "rounded-xl border-2 p-6 space-y-4 bg-linear-to-br",
      meta.heroBg, meta.heroBorder,
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
          meta.isCrisis ? "bg-destructive/10" : "bg-white/60 dark:bg-white/10"
        )}>
          <EventIcon className={cn(
            "h-7 w-7",
            meta.isCrisis ? "text-destructive" : "text-primary"
          )} />
        </div>
        <div>
          <p className={cn("text-lg font-bold leading-tight", meta.heroText)}>{headline}</p>
          <p className="text-xs text-muted-foreground mt-1">Personalised plan · Generated now</p>
        </div>
      </div>

      {/* Stats chips */}
      {statsRows.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statsRows.map((s, i) => (
            <div key={i} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
              s.warn
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-white/60 dark:bg-white/10 border-white/40 dark:border-white/20 text-foreground"
            )}>
              <span className="text-muted-foreground">{s.label}:</span>
              <span className="font-bold">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
