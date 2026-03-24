"""
finance/fire.py
FIRE (Financial Independence, Retire Early) planning engine.
All math is deterministic. No LLM.
"""

from __future__ import annotations
import datetime

from models.schemas import FIREPlan, SIPGoal, UserProfile, Goal
from core.config import settings

# Math primitives
def compound_growth_value(present_value: float, rate: float, years: float) -> float:
    """Future value of a lump-sum investment."""
    return present_value * ((1 + rate) ** years)


def future_value_sip(monthly_sip: float, annual_rate: float, years: float) -> float:
    """Future value of a regular monthly SIP."""
    r = annual_rate / 12
    n = years * 12
    if r == 0:
        return monthly_sip * n
    return monthly_sip * (((1 + r) ** n - 1) / r) * (1 + r)


def required_monthly_sip(
    target: float,
    corpus_already_accumulated: float,
    annual_rate: float,
    years: float,
) -> float:
    """
    Solve for monthly SIP needed to reach `target` given existing corpus
    and remaining time, using binary search.
    """
    existing_fv = compound_growth_value(corpus_already_accumulated, annual_rate, years)
    remaining = target - existing_fv

    if remaining <= 0:
        return 0.0

    # Binary search between 0 and target/months
    lo, hi = 0.0, target / max(years * 12, 1)
    # Extend hi if needed
    while future_value_sip(hi, annual_rate, years) < remaining:
        hi *= 2

    for _ in range(60):
        mid = (lo + hi) / 2
        fv = future_value_sip(mid, annual_rate, years)
        if fv < remaining:
            lo = mid
        else:
            hi = mid

    return round((lo + hi) / 2, 0)


def projected_fi_age(
    current_age: int,
    current_corpus: float,
    monthly_sip: float,
    corpus_target: float,
    annual_rate: float,
) -> float:
    """
    Given current corpus and ongoing SIP, find the age when corpus reaches target.
    Returns current_age + years (float).
    """
    for years in range(1, 60):
        projected = compound_growth_value(
            current_corpus, annual_rate, years
        ) + future_value_sip(monthly_sip, annual_rate, years)
        if projected >= corpus_target:
            # Interpolate for fraction
            prev = compound_growth_value(
                current_corpus, annual_rate, years - 1
            ) + future_value_sip(monthly_sip, annual_rate, years - 1)
            frac = (corpus_target - prev) / max(projected - prev, 1)
            return current_age + years - 1 + frac
    return float(current_age + 60)


# FIRE corpus
def calculate_fi_corpus(profile: UserProfile) -> float:
    """
    Target retirement corpus using the 4% Safe Withdrawal Rate, inflation-adjusted.
    Annual expenses in retirement = current monthly expenses × 12, grown by inflation.
    """
    current_annual_expenses = profile.monthly_expenses * 12
    inflation_adjusted = compound_growth_value(
        current_annual_expenses,
        settings.DEFAULT_INFLATION_RATE,
        profile.years_to_retirement,
    )
    return inflation_adjusted / settings.DEFAULT_SAFE_WITHDRAWAL_RATE


# Goal SIPs
GOAL_RETURN_MAP = {
    "retirement": settings.DEFAULT_EQUITY_RETURN,
    "house": settings.DEFAULT_DEBT_RETURN,
    "education": settings.DEFAULT_EQUITY_RETURN,
    "marriage": settings.DEFAULT_DEBT_RETURN,
    "vacation": settings.DEFAULT_DEBT_RETURN,
    "emergency": 0.065,
    "custom": settings.DEFAULT_EQUITY_RETURN,
}

_CURRENT_YEAR = datetime.date.today().year


def plan_goal_sip(goal: Goal) -> SIPGoal:
    years = max(goal.target_year - _CURRENT_YEAR, 1)
    rate = GOAL_RETURN_MAP.get(goal.type.value, settings.DEFAULT_EQUITY_RETURN)
    sip = required_monthly_sip(goal.target_amount, 0.0, rate, years)
    label = goal.label or goal.type.value.replace("_", " ").title()
    return SIPGoal(
        goal_label=label,
        target_amount=goal.target_amount,
        target_year=goal.target_year,
        required_monthly_sip=sip,
        current_on_track=False,  # without knowing current corpus per goal, conservative
    )


# Main entry point
def build_fire_plan(profile: UserProfile) -> FIREPlan:
    """
    Builds a complete FIRE plan from a UserProfile.
    Returns deterministic FIREPlan.
    """
    corpus_target = calculate_fi_corpus(profile)
    current_corpus = profile.assets.total
    years_left = float(profile.years_to_retirement)

    # Choose blended rate based on risk profile
    rate_map = {
        "conservative": settings.DEFAULT_DEBT_RETURN,
        "moderate": 0.10,
        "aggressive": settings.DEFAULT_EQUITY_RETURN,
    }
    growth_rate = rate_map.get(profile.risk_profile.value, 0.10)

    # Required SIP for retirement
    ret_sip = required_monthly_sip(
        corpus_target, current_corpus, growth_rate, years_left
    )

    # Projected FI age based on current savings capacity
    investable = max(0, profile.monthly_savings - profile.total_emi)
    fi_age = projected_fi_age(
        profile.age, current_corpus, investable, corpus_target, growth_rate
    )

    # Monthly retirement expense (inflation-adjusted)
    monthly_ret_expense = compound_growth_value(
        profile.monthly_expenses, settings.DEFAULT_INFLATION_RATE, years_left
    )

    # Goal SIPs
    goal_sips = [plan_goal_sip(g) for g in profile.goals]

    on_track = fi_age <= profile.retirement_age

    return FIREPlan(
        fi_corpus_required=round(corpus_target, 0),
        current_corpus=round(current_corpus, 0),
        corpus_gap=round(max(corpus_target - current_corpus, 0), 0),
        required_monthly_sip=round(ret_sip, 0),
        projected_fi_age=round(fi_age, 1),
        years_to_fi=round(max(fi_age - profile.age, 0), 1),
        monthly_retirement_expense=round(monthly_ret_expense, 0),
        sip_goals=goal_sips,
        on_track=on_track,
    )
