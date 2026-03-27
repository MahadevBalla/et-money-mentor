// frontend/src/lib/tax-slabs.ts
// Client-side reconstruction of India tax computation for FY 2025-26
// Mirrors backend/finance/tax.py and tax_constants.py — keep in sync.

import type { TaxDeductions, TaxRegime } from "@/lib/tax-types";
import { TAX_LIMITS } from "@/lib/tax-types";

// ─── Slab definitions (mirror FY2025_26 from tax_constants.py) ───────────────

interface Slab { lower: number; upper: number; rate: number; }

const OLD_SLABS: Slab[] = [
  { lower: 0,        upper: 2_50_000,       rate: 0.00 },
  { lower: 2_50_000, upper: 5_00_000,       rate: 0.05 },
  { lower: 5_00_000, upper: 10_00_000,      rate: 0.20 },
  { lower: 10_00_000, upper: Infinity,      rate: 0.30 },
];

const NEW_SLABS: Slab[] = [
  { lower: 0,         upper: 4_00_000,      rate: 0.00 },
  { lower: 4_00_000,  upper: 8_00_000,      rate: 0.05 },
  { lower: 8_00_000,  upper: 12_00_000,     rate: 0.10 },
  { lower: 12_00_000, upper: 16_00_000,     rate: 0.15 },
  { lower: 16_00_000, upper: 20_00_000,     rate: 0.20 },
  { lower: 20_00_000, upper: 24_00_000,     rate: 0.25 },
  { lower: 24_00_000, upper: Infinity,      rate: 0.30 },
];

// ─── Line-item for the slab breakdown table ───────────────────────────────────
export interface SlabLine {
  label: string;   // e.g. "₹2.5L – ₹5L"
  amount: number;  // taxable amount in this band
  rate: number;    // e.g. 0.05
  tax: number;     // computed tax for this band
}

export interface TaxBreakdown {
  regime: TaxRegime;
  grossIncome: number;
  standardDeduction: number;
  otherDeductions: number;       // sum of all 80C, 80D, NPS etc.
  taxableIncome: number;
  slabLines: SlabLine[];
  baseTax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applySlabs(taxable: number, slabs: Slab[]): { lines: SlabLine[]; base: number } {
  const lines: SlabLine[] = [];
  let base = 0;
  for (const slab of slabs) {
    if (taxable <= slab.lower) break;
    const band = Math.min(taxable, slab.upper) - slab.lower;
    const tax = band * slab.rate;
    base += tax;
    if (slab.rate > 0 || band > 0) {
      const lo = slab.lower === 0 ? "₹0" : fmtLakh(slab.lower);
      const hi = slab.upper === Infinity ? "above" : fmtLakh(slab.upper);
      lines.push({
        label: slab.upper === Infinity ? `Above ${lo}` : `${lo} – ${hi}`,
        amount: band,
        rate: slab.rate,
        tax,
      });
    }
  }
  return { lines, base };
}

function applyRebate(taxable: number, baseTax: number, regime: TaxRegime): number {
  if (regime === "old" && taxable <= 5_00_000) return Math.max(0, baseTax - Math.min(baseTax, 12_500));
  if (regime === "new" && taxable <= 12_00_000) return Math.max(0, baseTax - Math.min(baseTax, 60_000));
  return baseTax;
}

function applySurcharge(grossIncome: number, afterRebate: number, regime: TaxRegime): number {
  const thresholds =
    regime === "old"
      ? [
          { lower: 5_00_00_000, rate: 0.37 },
          { lower: 2_00_00_000, rate: 0.25 },
          { lower: 1_00_00_000, rate: 0.15 },
          { lower: 50_00_000,   rate: 0.10 },
        ]
      : [
          { lower: 2_00_00_000, rate: 0.25 },
          { lower: 1_00_00_000, rate: 0.15 },
          { lower: 50_00_000,   rate: 0.10 },
        ];

  for (const t of thresholds) {
    if (grossIncome > t.lower) {
      const surcharge = afterRebate * t.rate;
      const marginal = grossIncome - t.lower;
      return Math.max(0, Math.min(surcharge, marginal));
    }
  }
  return 0;
}

function fmtLakh(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(0)}Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1).replace(".0", "")}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── Public functions ─────────────────────────────────────────────────────────

export function computeOldTaxableIncome(gross: number, d: TaxDeductions): number {
  const deductions =
    TAX_LIMITS.STANDARD_DEDUCTION_OLD +
    Math.min(d.section_80c,          TAX_LIMITS.SEC_80C) +
    Math.min(d.section_80d_self,     d.section_80d_self_is_senior
      ? TAX_LIMITS.SEC_80D_SELF_SENIOR : TAX_LIMITS.SEC_80D_SELF) +
    Math.min(d.section_80d_parents,  d.section_80d_parents_are_senior
      ? TAX_LIMITS.SEC_80D_PARENTS_SENIOR : TAX_LIMITS.SEC_80D_PARENTS) +
    Math.min(d.nps_80ccd_1b,         TAX_LIMITS.NPS_80CCD_1B) +
    d.hra_claimed +
    Math.min(d.home_loan_interest,   TAX_LIMITS.HOME_LOAN_INTEREST) +
    d.other_deductions;
  return Math.max(gross - deductions, 0);
}

export function computeNewTaxableIncome(gross: number): number {
  return Math.max(gross - TAX_LIMITS.STANDARD_DEDUCTION_NEW, 0);
}

export function buildBreakdown(
  grossIncome: number,
  deductions: TaxDeductions,
  regime: TaxRegime
): TaxBreakdown {
  const stdDed = regime === "old"
    ? TAX_LIMITS.STANDARD_DEDUCTION_OLD
    : TAX_LIMITS.STANDARD_DEDUCTION_NEW;

  const otherDed = regime === "old"
    ? Math.min(deductions.section_80c, TAX_LIMITS.SEC_80C) +
      Math.min(deductions.section_80d_self, deductions.section_80d_self_is_senior
        ? TAX_LIMITS.SEC_80D_SELF_SENIOR : TAX_LIMITS.SEC_80D_SELF) +
      Math.min(deductions.section_80d_parents, deductions.section_80d_parents_are_senior
        ? TAX_LIMITS.SEC_80D_PARENTS_SENIOR : TAX_LIMITS.SEC_80D_PARENTS) +
      Math.min(deductions.nps_80ccd_1b, TAX_LIMITS.NPS_80CCD_1B) +
      deductions.hra_claimed +
      Math.min(deductions.home_loan_interest, TAX_LIMITS.HOME_LOAN_INTEREST) +
      deductions.other_deductions
    : 0;

  const taxableIncome = Math.max(grossIncome - stdDed - otherDed, 0);
  const slabs = regime === "old" ? OLD_SLABS : NEW_SLABS;
  const { lines, base } = applySlabs(taxableIncome, slabs);
  const afterRebate = applyRebate(taxableIncome, base, regime);
  const surcharge = applySurcharge(grossIncome, afterRebate, regime);
  const cess = (afterRebate + surcharge) * 0.04;
  const totalTax = Math.round(afterRebate + surcharge + cess);

  return {
    regime, grossIncome, standardDeduction: stdDed,
    otherDeductions: otherDed, taxableIncome,
    slabLines: lines, baseTax: base,
    surcharge, cess, totalTax,
  };
}