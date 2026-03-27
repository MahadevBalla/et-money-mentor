// frontend/src/components/fire/steps/step-goals.tsx
"use client";

import { Plus, Trash2, Home, GraduationCap, Gem, Plane, Shield, Pin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FIREFormState } from "@/lib/fire-types";

type Goal = FIREFormState["goals"][number];

interface Props {
  form: FIREFormState;
  onChange: (patch: Partial<FIREFormState>) => void;
}

const GOAL_TYPES: {
  value: Goal["type"]; icon: LucideIcon; label: string; hint: string;
}[] = [
    { value: "house", icon: Home, label: "House", hint: "Property purchase" },
    { value: "education", icon: GraduationCap, label: "Education", hint: "Child's education fund" },
    { value: "marriage", icon: Gem, label: "Marriage", hint: "Wedding expenses" },
    { value: "vacation", icon: Plane, label: "Vacation", hint: "Dream trip / sabbatical" },
    { value: "emergency", icon: Shield, label: "Emergency", hint: "Emergency fund corpus" },
    { value: "custom", icon: Pin, label: "Custom", hint: "Any other financial goal" },
  ];

function emptyGoal(): Goal {
  return {
    type: "house",
    label: "",
    target_amount: 0,
    target_year: new Date().getFullYear() + 5,
  };
}

export function StepGoals({ form, onChange }: Readonly<Props>) {
  function addGoal() {
    onChange({ goals: [...form.goals, emptyGoal()] });
  }

  function removeGoal(idx: number) {
    onChange({ goals: form.goals.filter((_, i) => i !== idx) });
  }

  function patchGoal(idx: number, patch: Partial<Goal>) {
    onChange({
      goals: form.goals.map((g, i) => (i === idx ? { ...g, ...patch } : g)),
    });
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm text-foreground font-medium">
          What are you saving for beyond retirement?
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Each goal gets its own required SIP amount in your results.
          Skip this step if you only want your FIRE corpus plan.
        </p>
      </div>

      {/* Goal cards */}
      {form.goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl text-center">
          <p className="text-muted-foreground text-sm">No goals added yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click below to add goals like house, education, or a dream vacation
          </p>
        </div>
      )}

      {form.goals.map((goal, idx) => {
        const yearsToGoal =
          goal.target_year > currentYear ? goal.target_year - currentYear : null;
        return (
          <div key={idx} className="border border-border rounded-xl p-4 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Goal {idx + 1}
              </span>
              <button type="button" onClick={() => removeGoal(idx)}
                className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Goal type picker */}
            <div className="flex flex-wrap gap-1.5">
              {GOAL_TYPES.map((gt) => {
                const Icon = gt.icon;
                const isSelected = goal.type === gt.value;
                return (
                  <button
                    key={gt.value}
                    type="button"
                    onClick={() =>
                      patchGoal(idx, {
                        type: gt.value,
                        label:
                          goal.label === "" ||
                            GOAL_TYPES.find((g) => g.value === goal.type)?.label === goal.label
                            ? gt.label
                            : goal.label,
                      })
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{gt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom label */}
            {goal.type === "custom" && (
              <div className="space-y-1">
                <Label className="text-xs">Goal Name</Label>
                <Input placeholder="e.g. Start a business" className="h-9 text-sm"
                  value={goal.label}
                  onChange={(e) => patchGoal(idx, { label: e.target.value })} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Target Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                  <Input type="number" placeholder="1,00,00,000" className="pl-5 h-9 text-sm"
                    value={goal.target_amount === 0 ? "" : goal.target_amount}
                    onChange={(e) => patchGoal(idx, { target_amount: Number(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Target Year</Label>
                <Input type="number" placeholder="2032" className="h-9 text-sm"
                  min={currentYear + 1} max={2075}
                  value={goal.target_year}
                  onChange={(e) => patchGoal(idx, { target_year: Number(e.target.value) || currentYear + 5 })} />
                {yearsToGoal && (
                  <p className="text-[10px] text-muted-foreground">
                    {yearsToGoal} year{yearsToGoal === 1 ? "" : "s"} away
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={addGoal} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" /> Add a goal
      </Button>
    </div>
  );
}
