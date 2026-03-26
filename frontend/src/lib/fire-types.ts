// frontend/src/lib/fire-types.ts

import type { HealthScorePayload } from "@/lib/health-score-types";

// Re-export shared sub-types from health-score-types so FIRE can reuse them
export type {
  AssetAllocation,
  DebtItem,
  Goal,
  GoalType,
  RiskProfile,
  EmploymentType,
} from "@/lib/health-score-types";

// ─── FIRE-specific API payload ────────────────────────────────────────────────
// FIRE uses the SAME UserProfile shape as Health Score — full reuse
export type FIREPayload = HealthScorePayload;

// ─── API Response types ───────────────────────────────────────────────────────

export interface SIPGoal {
  goal_label: string;
  target_amount: number;
  target_year: number;
  required_monthly_sip: number;
  required_stepup_sip: number;
  stepup_rate: number;
  current_on_track: boolean;
}

export interface YearlyProjection {
  year: number;
  age: number;
  sip: number;
  corpus: number;
  invested: number;
}

export interface FIREResult {
  fi_corpus_required: number;
  current_corpus: number;
  corpus_gap: number;
  required_monthly_sip: number;
  required_stepup_sip: number;
  stepup_rate: number;
  projected_fi_age: number | null;
  years_to_fi: number;
  monthly_retirement_expense: number;
  sip_goals: SIPGoal[];
  on_track: boolean;
  yearly_projections: YearlyProjection[];
}

export interface FIREApiResponse {
  session_id: string;
  profile: FIREPayload;
  result: FIREResult;
  advice: {
    summary: string;
    key_actions: string[];
    risks: string[];
    disclaimer: string;
  };
  decision_log: unknown[];
}

// ─── Wizard form state ────────────────────────────────────────────────────────

export interface FIREFormState {
  // Step 1
  age: string;
  city: string;
  employment_type: "salaried" | "self_employed" | "business";
  retirement_age: string;
  risk_profile: "conservative" | "moderate" | "aggressive";

  // Step 2
  monthly_gross_income: string;
  monthly_expenses: string;
  total_emi: string; // simplified — just one number for FIRE
  assets: {
    equity: number;
    debt: number;
    gold: number;
    real_estate: number;
    cash: number;
    ppf_epf: number;
    other: number;
  };

  // Step 3
  goals: Array<{
    type: "retirement" | "house" | "education" | "marriage" | "emergency" | "vacation" | "custom";
    label: string;
    target_amount: number;
    target_year: number;
  }>;
}

export const DEFAULT_FIRE_FORM: FIREFormState = {
  age: "",
  city: "",
  employment_type: "salaried",
  retirement_age: "50",
  risk_profile: "moderate",
  monthly_gross_income: "",
  monthly_expenses: "",
  total_emi: "0",
  assets: {
    equity: 0, debt: 0, gold: 0,
    real_estate: 0, cash: 0, ppf_epf: 0, other: 0,
  },
  goals: [],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export const RATE_MAP: Record<string, number> = {
  conservative: 7,
  moderate: 10,
  aggressive: 12,
};