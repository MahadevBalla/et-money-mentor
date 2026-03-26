// frontend/src/components/fire/results/goal-sip-table.tsx

import type { SIPGoal, FIREResult } from "@/lib/fire-types";

interface Props {
  sipGoals: SIPGoal[];
  fireSIP: number;
}

const GOAL_EMOJIS: Record<string, string> = {
  house: "🏠", education: "🎓", marriage: "💍",
  vacation: "✈️", emergency: "🛡", retirement: "🏖", custom: "📌",
};

export function GoalSIPTable({ sipGoals, fireSIP }: Props) {
  if (!sipGoals || sipGoals.length === 0) return null;

  const fmt    = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  const fmtCr  = (n: number) =>
    n >= 1e7
      ? `₹${(n / 1e7).toFixed(1)} Cr`
      : n >= 1e5
      ? `₹${(n / 1e5).toFixed(1)} L`
      : fmt(n);

  const totalGoalSIP = sipGoals.reduce((s, g) => s + g.required_monthly_sip, 0);
  const grandTotal   = fireSIP + totalGoalSIP;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/40">
        <h2 className="text-sm font-semibold">Goal-wise SIP Plan</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Separate SIP amounts needed for each financial goal
        </p>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-4 px-5 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
        <span>Goal</span>
        <span className="text-right">Target</span>
        <span className="text-right">By Year</span>
        <span className="text-right">Monthly SIP</span>
      </div>

      {/* Goal rows */}
      {sipGoals.map((goal, i) => {
        const emoji =
          GOAL_EMOJIS[
            goal.goal_label.toLowerCase().replace(/ /g, "_")
          ] ?? "📌";
        return (
          <div
            key={i}
            className="grid grid-cols-4 px-5 py-3 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{emoji}</span>
              <span className="text-sm font-medium truncate">
                {goal.goal_label}
              </span>
            </div>
            <span className="text-sm text-right text-muted-foreground">
              {fmtCr(goal.target_amount)}
            </span>
            <span className="text-sm text-right text-muted-foreground">
              {goal.target_year}
            </span>
            <span className="text-sm font-semibold text-right">
              {fmt(goal.required_monthly_sip)}/mo
            </span>
          </div>
        );
      })}

      {/* Totals section */}
      <div className="bg-muted/40 border-t border-border">
        <div className="grid grid-cols-4 px-5 py-2.5 text-xs text-muted-foreground">
          <span>All goal SIPs</span>
          <span />
          <span />
          <span className="text-right font-semibold">
            {fmt(totalGoalSIP)}/mo
          </span>
        </div>
        <div className="grid grid-cols-4 px-5 py-2.5 text-xs text-muted-foreground border-t border-border">
          <span>FIRE corpus SIP</span>
          <span />
          <span />
          <span className="text-right font-semibold">
            {fmt(fireSIP)}/mo
          </span>
        </div>
        <div className="grid grid-cols-4 px-5 py-3 bg-primary/5 border-t border-primary/20 text-sm font-bold text-primary">
          <span>Grand Total</span>
          <span />
          <span />
          <span className="text-right">{fmt(grandTotal)}/mo</span>
        </div>
      </div>
    </div>
  );
}