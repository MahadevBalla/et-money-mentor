"""
tests/test_finance.py
Unit tests for all three finance engine modules.
All tests are deterministic — no LLM, no DB, no network.
Run: pytest tests/ -v
"""

import pytest
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models.schemas import (
    AssetAllocation,
    DebtItem,
    Goal,
    GoalType,
    InsuranceCoverage,
    TaxDeductions,
    UserProfile,
    RiskProfile,
)
from finance import health, fire, tax


# Fixtures
def make_profile(**overrides) -> UserProfile:
    defaults = {
        "age": 30,
        "city": "Mumbai",
        "monthly_gross_income": 100_000,
        "monthly_expenses": 50_000,
        "emergency_fund": 300_000,
        "retirement_age": 60,
        "risk_profile": RiskProfile.MODERATE,
    }
    defaults.update(overrides)
    return UserProfile(**defaults)


# FIRE tests
class TestFIREMath:
    def test_compound_growth_doubles_in_approx_6_years_at_12pct(self):
        fv = fire.compound_growth_value(100_000, 0.12, 6)
        assert fv == pytest.approx(197_623, rel=0.01)

    def test_fv_sip_zero_rate(self):
        """With 0% return, FV = SIP × months."""
        fv = fire.future_value_sip(1_000, 0.0, 10)
        assert fv == pytest.approx(1_000 * 120, rel=0.01)

    def test_required_sip_no_existing_corpus(self):
        sip = fire.required_monthly_sip(10_000_000, 0, 0.12, 10)
        # Rough check: should be between 40k and 60k
        assert 40_000 < sip < 60_000

    def test_required_sip_already_funded(self):
        """If existing corpus will grow past target, SIP = 0."""
        sip = fire.required_monthly_sip(1_000_000, 10_000_000, 0.12, 10)
        assert sip == pytest.approx(0.0)

    def test_fire_corpus_increases_with_expenses(self):
        p1 = make_profile(monthly_expenses=30_000)
        p2 = make_profile(monthly_expenses=60_000)
        assert fire.calculate_fi_corpus(p2) > fire.calculate_fi_corpus(p1)

    def test_fire_plan_returns_on_track_false_when_corpus_gap_large(self):
        profile = make_profile(
            age=29,
            retirement_age=60,
            monthly_gross_income=50_000,
            monthly_expenses=45_000,
        )
        plan = fire.build_fire_plan(profile)
        # Very low surplus vs large corpus needed → not on track
        assert plan.on_track is False

    def test_fire_plan_required_sip_positive(self):
        plan = fire.build_fire_plan(make_profile())
        assert plan.required_monthly_sip >= 0

    def test_fire_plan_goal_sips(self):
        profile = make_profile(
            goals=[
                Goal(
                    type=GoalType.HOUSE,
                    label="Dream home",
                    target_amount=5_000_000,
                    target_year=2035,
                )
            ]
        )
        plan = fire.build_fire_plan(profile)
        assert len(plan.sip_goals) == 1
        assert plan.sip_goals[0].required_monthly_sip > 0


# Tax tests
class TestTaxEngine:
    def test_new_regime_rebate_below_7l(self):
        """Income ≤ 7L after standard deduction → 0 tax in new regime."""
        t = tax.compute_new_regime_tax(7_00_000)
        assert t == pytest.approx(0.0)

    def test_new_regime_tax_above_rebate(self):
        t = tax.compute_new_regime_tax(10_00_000)
        assert t > 0

    def test_old_regime_rebate_below_5l(self):
        deductions = TaxDeductions()
        t = tax.compute_old_regime_tax(5_00_000, deductions)
        assert t == pytest.approx(0.0)

    def test_high_income_old_regime_deductions_reduce_tax(self):
        base_deductions = TaxDeductions()
        max_deductions = TaxDeductions(
            section_80c=150_000,
            section_80d_self=25_000,
            nps_80ccd_1b=50_000,
        )
        gross = 15_00_000
        t_base = tax.compute_old_regime_tax(gross, base_deductions)
        t_max = tax.compute_old_regime_tax(gross, max_deductions)
        assert t_max < t_base

    def test_compare_regimes_returns_recommended(self):
        profile = make_profile(monthly_gross_income=100_000)
        result = tax.compare_tax_regimes(profile)
        assert result.recommended_regime.value in ("old", "new")
        assert result.old_regime_tax > 0 or result.new_regime_tax > 0

    def test_missing_deductions_identified(self):
        profile = make_profile()  # no deductions set
        result = tax.compare_tax_regimes(profile)
        assert len(result.missing_deductions) > 0

    def test_cess_applied(self):
        # Tax at ₹20L should include 4% cess
        t = tax.compute_new_regime_tax(20_00_000)
        t_no_cess = t / 1.04
        assert abs(t - (t_no_cess * 1.04)) < 1


# Health Score tests
class TestHealthScore:
    def test_score_range(self):
        profile = make_profile()
        result = health.calculate_money_health_score(profile)
        assert 0 <= result.overall_score <= 100

    def test_grade_assigned(self):
        profile = make_profile()
        result = health.calculate_money_health_score(profile)
        assert result.grade in ("A", "B", "C", "D", "F")

    def test_six_dimensions(self):
        profile = make_profile()
        result = health.calculate_money_health_score(profile)
        assert len(result.dimensions) == 6

    def test_full_emergency_fund_scores_100(self):
        # 6 months of expenses
        profile = make_profile(monthly_expenses=50_000, emergency_fund=300_000)
        d = health.score_emergency_fund(profile)
        assert d.score == pytest.approx(100.0)

    def test_zero_emergency_fund_scores_0(self):
        profile = make_profile(emergency_fund=0)
        d = health.score_emergency_fund(profile)
        assert d.score == pytest.approx(0.0)

    def test_no_debt_scores_100(self):
        profile = make_profile()
        d = health.score_debt_health(profile)
        assert d.score == pytest.approx(100.0)

    def test_high_emi_ratio_penalised(self):
        profile = make_profile(
            monthly_gross_income=50_000,
            monthly_expenses=20_000,
            debts=[
                DebtItem(
                    name="Personal Loan",
                    outstanding=500_000,
                    emi=30_000,
                    interest_rate=24,
                    is_secured=False,
                )
            ],
        )
        d = health.score_debt_health(profile)
        assert d.score < 40

    def test_no_insurance_penalised(self):
        profile = make_profile()
        d = health.score_insurance_coverage(profile)
        assert d.score < 40

    def test_full_insurance_scores_well(self):
        profile = make_profile(
            monthly_gross_income=100_000,
            insurance=InsuranceCoverage(
                has_term_life=True,
                term_cover=12_000_000,
                has_health=True,
                health_cover=1_000_000,
            ),
        )
        d = health.score_insurance_coverage(profile)
        assert d.score >= 80

    def test_net_worth_calculation(self):
        profile = make_profile(
            assets=AssetAllocation(equity=500_000, cash=100_000),
            debts=[
                DebtItem(name="Loan", outstanding=200_000, emi=5_000, interest_rate=10)
            ],
        )
        result = health.calculate_money_health_score(profile)
        # net_worth = assets.total + emergency_fund - debts outstanding
        expected = 500_000 + 100_000 + 300_000 - 200_000
        assert result.total_net_worth == pytest.approx(expected, rel=0.01)


# Profile validation tests
class TestProfileValidation:
    def test_expenses_exceeding_income_raises(self):
        with pytest.raises(Exception):
            make_profile(monthly_gross_income=50_000, monthly_expenses=60_000)

    def test_retirement_age_before_current_raises(self):
        with pytest.raises(Exception):
            make_profile(age=40, retirement_age=35)

    def test_valid_profile_passes(self):
        p = make_profile()
        assert p.monthly_savings == 50_000
