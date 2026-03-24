"""
finance/tax.py
India Tax Wizard — FY 2025-26 (AY 2026-27).
Old regime vs New regime comparison, missing deductions analysis.
Pure deterministic. No LLM.
"""

from __future__ import annotations

from core.config import settings
from models.schemas import TaxDeductions, TaxRegime, TaxRegimeComparison, UserProfile


# Tax slab helpers
def _apply_slabs(taxable: float, slabs: list[tuple[float, float]]) -> float:
    """
    Apply progressive tax slabs.
    slabs: list of (upper_limit, rate) where upper_limit=inf means no cap.
    """
    tax = 0.0
    prev = 0.0
    for upper, rate in slabs:
        if taxable <= prev:
            break
        band = min(taxable, upper) - prev
        tax += band * rate
        prev = upper
    return max(tax, 0.0)


def _surcharge(income: float, base_tax: float, regime: TaxRegime) -> float:
    """Surcharge for super-rich — simplified (marginal relief ignored)."""
    if income <= 50_00_000:
        return 0.0
    if income <= 1_00_00_000:
        return base_tax * 0.10
    if income <= 2_00_00_000:
        return base_tax * 0.15
    if income <= 5_00_00_000:
        return base_tax * 0.25
    return base_tax * 0.37 if regime == TaxRegime.OLD else base_tax * 0.25


def _cess(tax_plus_surcharge: float) -> float:
    return tax_plus_surcharge * 0.04  # Health & Education Cess


# OLD REGIME
_OLD_SLABS = [
    (2_50_000, 0.00),
    (5_00_000, 0.05),
    (10_00_000, 0.20),
    (float("inf"), 0.30),
]


def _old_regime_deductions(deductions: TaxDeductions) -> float:
    """Total eligible deductions under old regime."""
    return (
        settings.STANDARD_DEDUCTION_OLD
        + deductions.section_80c
        + deductions.section_80d_self
        + deductions.section_80d_parents
        + deductions.nps_80ccd_1b
        + deductions.hra_claimed
        + deductions.home_loan_interest
        + deductions.other_deductions
    )


def compute_old_regime_tax(gross_income: float, deductions: TaxDeductions) -> float:
    total_deductions = _old_regime_deductions(deductions)
    taxable = max(gross_income - total_deductions, 0.0)
    base = _apply_slabs(taxable, _OLD_SLABS)

    # Rebate u/s 87A: full rebate if taxable ≤ 5L
    if taxable <= 5_00_000:
        base = 0.0

    surcharge = _surcharge(gross_income, base, TaxRegime.OLD)
    return base + surcharge + _cess(base + surcharge)


# NEW REGIME (FY 2025-26)
_NEW_SLABS = [
    (3_00_000, 0.00),
    (7_00_000, 0.05),
    (10_00_000, 0.10),
    (12_00_000, 0.15),
    (15_00_000, 0.20),
    (float("inf"), 0.30),
]


def compute_new_regime_tax(gross_income: float) -> float:
    taxable = max(gross_income - settings.STANDARD_DEDUCTION_NEW, 0.0)
    base = _apply_slabs(taxable, _NEW_SLABS)

    # Rebate u/s 87A: full rebate if taxable ≤ 7L
    if taxable <= 7_00_000:
        base = 0.0

    surcharge = _surcharge(gross_income, base, TaxRegime.NEW)
    return base + surcharge + _cess(base + surcharge)


# Missing deductions analysis
def analyse_missing_deductions(deductions: TaxDeductions) -> tuple[list[str], float]:
    """
    Returns (list of missing deduction labels, total potential deduction amount).
    """
    missing = []
    potential = 0.0

    unused_80c = 150_000 - deductions.section_80c
    if unused_80c > 0:
        missing.append(f"Section 80C: ₹{unused_80c:,.0f} unused (PPF, ELSS, EPF, LIC)")
        potential += unused_80c

    if deductions.section_80d_self < 25_000:
        gap = 25_000 - deductions.section_80d_self
        missing.append(f"Section 80D (self health): ₹{gap:,.0f} unused")
        potential += gap

    if deductions.nps_80ccd_1b < 50_000:
        gap = 50_000 - deductions.nps_80ccd_1b
        missing.append(
            f"NPS 80CCD(1B): ₹{gap:,.0f} unused (additional NPS contribution)"
        )
        potential += gap

    if deductions.hra_claimed == 0:
        missing.append("HRA exemption not claimed — if paying rent, provide documents")

    if deductions.home_loan_interest == 0:
        missing.append(
            "Section 24(b): home loan interest up to ₹2L deductible if applicable"
        )

    return missing, potential


# Main entry point
def compare_tax_regimes(profile: UserProfile) -> TaxRegimeComparison:
    gross = profile.annual_gross_income
    old_tax = compute_old_regime_tax(gross, profile.tax_deductions)
    new_tax = compute_new_regime_tax(gross)

    recommended = TaxRegime.OLD if old_tax < new_tax else TaxRegime.NEW
    savings = abs(new_tax - old_tax)

    missing, potential = analyse_missing_deductions(profile.tax_deductions)

    return TaxRegimeComparison(
        gross_income=gross,
        old_regime_tax=round(old_tax, 0),
        new_regime_tax=round(new_tax, 0),
        recommended_regime=recommended,
        savings_by_switching=round(savings, 0),
        effective_rate_old=round(old_tax / gross * 100, 2) if gross > 0 else 0.0,
        effective_rate_new=round(new_tax / gross * 100, 2) if gross > 0 else 0.0,
        missing_deductions=missing,
        deduction_potential=round(potential, 0),
    )
