// frontend/src/components/life-events/results/priority-timeline.tsx
import { Zap, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_META, type LifeEventType } from "@/lib/life-event-types";

interface Props {
  actions: string[];
  eventType: LifeEventType;
}

export function PriorityTimeline({ actions, eventType }: Readonly<Props>) {
  if (!actions.length) return null;

  const meta = EVENT_META[eventType];
  const isCrisis = meta.isCrisis;

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",
      isCrisis ? "border-destructive/30" : "border-border"
    )}>
      {/* Header */}
      <div className={cn(
        "px-5 py-4 border-b flex items-center gap-2",
        isCrisis
          ? "bg-destructive/10 border-destructive/30"
          : "bg-muted/40 border-border"
      )}>
        {isCrisis
          ? <Zap className="h-4 w-4 text-destructive shrink-0" />
          : <ListChecks className="h-4 w-4 text-muted-foreground shrink-0" />
        }
        <div>
          <p className={cn(
            "text-sm font-bold",
            isCrisis ? "text-destructive" : "text-foreground"
          )}>
            {isCrisis ? "Crisis Playbook — Do these NOW" : "Your Action Plan — Next 30 Days"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {actions.length} prioritised step{actions.length > 1 ? "s" : ""} · Do them in this order
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-2 bg-card">
        {actions.map((action, i) => {
          const isLast = i === actions.length - 1;
          return (
            <div key={i} className="flex gap-4 py-3">
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isCrisis
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                )}>
                  {i + 1}
                </div>
                {!isLast && (
                  <div className={cn(
                    "w-0.5 flex-1 mt-1",
                    isCrisis ? "bg-destructive/20" : "bg-border"
                  )} style={{ minHeight: "1.5rem" }} />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5 pb-1">
                <p className="text-sm text-foreground leading-relaxed">{action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
