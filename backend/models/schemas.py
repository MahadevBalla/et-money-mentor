"""
models/schemas.py
Pydantic v2 models — the single source of truth for all data contracts.
Frontend, backend, and agents all share these shapes via the API contract.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


# Enums
class RiskProfile(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class EmploymentType(str, Enum):
    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    BUSINESS = "business"


class TaxRegime(str, Enum):
    OLD = "old"
    NEW = "new"


class GoalType(str, Enum):
    RETIREMENT = "retirement"
    HOUSE = "house"
    EDUCATION = "education"
    MARRIAGE = "marriage"
    EMERGENCY = "emergency"
    VACATION = "vacation"
    CUSTOM = "custom"


# Sub-models
class Goal(BaseModel):
    type: GoalType
    label: str = ""
    target_amount: float = Field(..., ge=0)
    target_year: int = Field(..., ge=2025, le=2075)


class DebtItem(BaseModel):
    name: str
    outstanding: float = Field(..., ge=0)
    emi: float = Field(..., ge=0)
    interest_rate: float = Field(..., ge=0, le=100)  # % p.a.
    is_secured: bool = True


class AssetAllocation(BaseModel):
    equity: float = Field(0.0, ge=0)  # ₹
    debt: float = Field(0.0, ge=0)
    gold: float = Field(0.0, ge=0)
    real_estate: float = Field(0.0, ge=0)
    cash: float = Field(0.0, ge=0)
    ppf_epf: float = Field(0.0, ge=0)
    other: float = Field(0.0, ge=0)

    @property
    def total(self) -> float:
        return (
            self.equity
            + self.debt
            + self.gold
            + self.real_estate
            + self.cash
            + self.ppf_epf
            + self.other
        )


class InsuranceCoverage(BaseModel):
    has_term_life: bool = False
    term_cover: float = 0.0  # ₹ sum assured
    has_health: bool = False
    health_cover: float = 0.0  # ₹ sum assured
    has_critical_illness: bool = False


class TaxDeductions(BaseModel):
    """Old-regime deductions."""

    section_80c: float = Field(0.0, ge=0, le=150_000)  # max 1.5L
    section_80d_self: float = Field(0.0, ge=0, le=25_000)
    section_80d_parents: float = Field(0.0, ge=0, le=50_000)
    nps_80ccd_1b: float = Field(0.0, ge=0, le=50_000)
    hra_claimed: float = Field(0.0, ge=0)
    home_loan_interest: float = Field(0.0, ge=0, le=200_000)
    other_deductions: float = Field(0.0, ge=0)


# Core input model
class UserProfile(BaseModel):
    """Complete financial profile — intake agent produces this."""

    # Demographics
    age: int = Field(..., ge=18, le=70)
    city: str = Field(..., min_length=2)
    employment_type: EmploymentType = EmploymentType.SALARIED
    dependents: int = Field(0, ge=0, le=10)

    # Income & Expenses
    monthly_gross_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)

    # Existing assets
    emergency_fund: float = Field(0.0, ge=0)
    assets: AssetAllocation = Field(default_factory=AssetAllocation)

    # Debts
    debts: list[DebtItem] = Field(default_factory=list)

    # Insurance
    insurance: InsuranceCoverage = Field(default_factory=InsuranceCoverage)

    # Tax
    tax_deductions: TaxDeductions = Field(default_factory=TaxDeductions)

    # Goals & profile
    retirement_age: int = Field(60, ge=30, le=70)
    risk_profile: RiskProfile = RiskProfile.MODERATE
    goals: list[Goal] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_cross_fields(self) -> UserProfile:
        if self.monthly_expenses > self.monthly_gross_income:
            raise ValueError("monthly_expenses cannot exceed monthly_gross_income")
        if self.retirement_age <= self.age:
            raise ValueError("retirement_age must be greater than current age")
        return self

    @property
    def annual_gross_income(self) -> float:
        return self.monthly_gross_income * 12

    @property
    def monthly_savings(self) -> float:
        return self.monthly_gross_income - self.monthly_expenses

    @property
    def total_emi(self) -> float:
        return sum(d.emi for d in self.debts)

    @property
    def years_to_retirement(self) -> int:
        return self.retirement_age - self.age


# Output models — Finance Engine returns these
class DimensionScore(BaseModel):
    name: str
    score: float = Field(..., ge=0, le=100)
    label: str  # "Good", "Fair", "Poor"
    insight: str  # one-line deterministic insight


class MoneyHealthResult(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    grade: str  # A, B, C, D, F
    dimensions: list[DimensionScore]
    monthly_surplus: float
    total_net_worth: float


class SIPGoal(BaseModel):
    goal_label: str
    target_amount: float
    target_year: int
    required_monthly_sip: float
    current_on_track: bool


class FIREPlan(BaseModel):
    fi_corpus_required: float
    current_corpus: float
    corpus_gap: float
    required_monthly_sip: float
    projected_fi_age: float
    years_to_fi: float
    monthly_retirement_expense: float
    sip_goals: list[SIPGoal]
    on_track: bool


class TaxRegimeComparison(BaseModel):
    gross_income: float
    old_regime_tax: float
    new_regime_tax: float
    recommended_regime: TaxRegime
    savings_by_switching: float
    effective_rate_old: float
    effective_rate_new: float
    missing_deductions: list[str]
    deduction_potential: float


class AgentAdvice(BaseModel):
    summary: str
    key_actions: list[str]
    risks: list[str]
    disclaimer: str
    regime_suggestion: Optional[str] = None


# API response envelopes
class HealthScoreResponse(BaseModel):
    session_id: str
    profile: UserProfile
    result: MoneyHealthResult
    advice: AgentAdvice
    decision_log: list[dict]


class FIREPlanResponse(BaseModel):
    session_id: str
    profile: UserProfile
    result: FIREPlan
    advice: AgentAdvice
    decision_log: list[dict]


class TaxWizardResponse(BaseModel):
    session_id: str
    profile: UserProfile
    result: TaxRegimeComparison
    advice: AgentAdvice
    decision_log: list[dict]


class ErrorResponse(BaseModel):
    error: str
    code: str
    detail: Optional[str] = None
