// frontend/src/lib/tax-types.ts
// Mirror of backend schemas.py + tax_constants.py for FY 2025-26

import type { EmploymentType, TaxDeductions } from "@/lib/health-score-types";

// Re-export so tax components only need one import
export type { EmploymentType, TaxDeductions };

// ─── API Payload ──────────────────────────────────────────────────────────────
// Tax Wizard only needs a slim subset of UserProfile — no assets/debts/goals
export interface TaxPayload {
  age: number;
  city: string;
  employment_type: EmploymentType;
  dependents: number;
  monthly_gross_income: number;
  monthly_expenses: number;         // backend requires this; use 0 if unknown
  emergency_fund: number;           // required by UserProfile validator; use 0
  risk_profile: "moderate";         // irrelevant for tax; always "moderate"
  retirement_age: number;           // irrelevant for tax; always age+1 minimum
  assets: {
    equity: number; debt: number; gold: number;
    real_estate: number; cash: number; ppf_epf: number; other: number;
  };
  debts: [];
  insurance: {
    has_term_life: false; term_cover: 0;
    has_health: false; health_cover: 0;
    has_critical_illness: false;
  };
  tax_deductions: TaxDeductions;
  goals: [];
}

// ─── API Response ─────────────────────────────────────────────────────────────
export type TaxRegime = "old" | "new";

export interface TaxResult {
  gross_income: number;
  old_regime_tax: number;
  new_regime_tax: number;
  recommended_regime: TaxRegime;
  savings_by_switching: number;
  effective_rate_old: number;
  effective_rate_new: number;
  missing_deductions: string[];
  deduction_potential: number;
}

export interface TaxApiResponse {
  session_id: string;
  profile: TaxPayload;
  result: TaxResult;
  advice: {
    summary: string;
    key_actions: string[];
    risks: string[];
    disclaimer: string;
    regime_suggestion?: string;
  };
  decision_log: unknown[];
}

// ─── Wizard Form State ────────────────────────────────────────────────────────
export interface TaxFormState {
  // Step 1
  age: string;
  city: string;
  employment_type: EmploymentType;
  annual_gross_income: string; // user inputs annual for tax

  // Step 2 (all optional)
  section_80c: string;
  section_80d_self: string;
  section_80d_self_is_senior: boolean;
  section_80d_parents: string;
  section_80d_parents_are_senior: boolean;
  nps_80ccd_1b: string;
  hra_claimed: string;
  home_loan_interest: string;
  other_deductions: string;
}

export const DEFAULT_TAX_FORM: TaxFormState = {
  age: "",
  city: "",
  employment_type: "salaried",
  annual_gross_income: "",
  section_80c: "",
  section_80d_self: "",
  section_80d_self_is_senior: false,
  section_80d_parents: "",
  section_80d_parents_are_senior: false,
  nps_80ccd_1b: "",
  hra_claimed: "",
  home_loan_interest: "",
  other_deductions: "",
};

// ─── FY 2025-26 Statutory Limits (from tax_constants.py) ─────────────────────
// Keep in sync with backend/finance/tax_constants.py CURRENT alias
export const TAX_LIMITS = {
  STANDARD_DEDUCTION_OLD: 50_000,
  STANDARD_DEDUCTION_NEW: 75_000,
  SEC_80C:                1_50_000,
  SEC_80D_SELF:           25_000,
  SEC_80D_SELF_SENIOR:    50_000,
  SEC_80D_PARENTS:        25_000,
  SEC_80D_PARENTS_SENIOR: 50_000,
  NPS_80CCD_1B:           50_000,
  HOME_LOAN_INTEREST:     2_00_000,
} as const;

export const FY_LABEL = "FY 2025-26  ·  AY 2026-27";