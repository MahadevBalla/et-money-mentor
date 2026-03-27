// frontend/src/components/life-events/steps/step-event-picker.tsx
"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import {
  EVENT_META,
  type LifeEventType,
  type LifeEventFormState,
} from "@/lib/life-event-types";

interface Props {
  form: LifeEventFormState;
  onChange: (patch: Partial<LifeEventFormState>) => void;
}

const EVENT_ORDER: LifeEventType[] = [
  "bonus", "home_purchase", "marriage",
  "new_baby", "job_loss", "inheritance",
];

export function StepEventPicker({ form, onChange }: Readonly<Props>) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">
          What&apos;s happening in your life?
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          We&apos;ll build a personalised financial action plan for your specific situation.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {EVENT_ORDER.map((type) => {
          const meta = EVENT_META[type];
          const Icon = meta.icon;
          const isSelected = form.event_type === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ event_type: type })}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? meta.colorClass + " shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              )}

              {/* Icon replaces emoji */}
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center mb-2",
                isSelected ? "bg-white/60 dark:bg-black/20" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )} />
              </div>

              <p className="text-sm font-semibold leading-tight text-foreground">
                {meta.label}
              </p>
              <p className="text-[11px] mt-1 leading-tight text-muted-foreground opacity-80">
                &ldquo;{meta.tagline}&rdquo;
              </p>

              {meta.isCrisis && (
                <span className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  URGENT
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Description of selected event */}
      {form.event_type && (() => {
        const meta = EVENT_META[form.event_type];
        const Icon = meta.icon;
        return (
          <div className={cn(
            "flex items-start gap-3 px-4 py-3 rounded-xl border transition-all",
            meta.colorClass
          )}>
            <div className="h-8 w-8 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{meta.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
