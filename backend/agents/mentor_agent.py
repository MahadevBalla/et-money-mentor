"""
agents/mentor_agent.py

Money Mentor Agent — turns Finance Engine numbers into human-readable advice.

Responsibility split (strict):
  Finance Engine → all numbers (source of truth)
  This agent    → narrative, explanation, actionable guidance only

LLM is constrained via:
  1. System prompt rules (regime, language, SEBI compliance)
  2. Runtime instruction injection per call (_regime_instruction)
  3. Deterministic fallback that mirrors the same constraints
"""

from __future__ import annotations

import json
import logging
from typing import Any

from agents.knowledge import INDIA_FINANCE_FACTS
from core.exceptions import LLMUnavailableError
from core.llm_client import structured_chat
from models import (
    AgentAdvice,
    FIREPlan,
    MoneyHealthResult,
    TaxRegimeComparison,
    UserProfile,
)

logger = logging.getLogger(__name__)

# System prompt
_SYSTEM_PROMPT = f"""You are an India-specific financial education mentor integrated into the Economic Times platform.

{INDIA_FINANCE_FACTS}

Your persona:
- Knowledgeable, warm, and direct — like a trusted CA friend.
- India-centric: reference Indian instruments (PPF, ELSS, NPS, EPF, FD, MF SIPs).
- SEBI-compliant: educational only, NO specific stock/fund recommendations.
- Never invent numbers — only use what is in the provided JSON context.
- Language: respond in clear, professional English by default. If the user's message is in Hindi or Hinglish, match their tone naturally — otherwise stay in English.

TAX REGIME RULE (strictly enforced — never violate):
- If recommended_regime = "new": do NOT mention 80C, 80D, HRA, or NPS 80CCD(1B) as action items. These deductions are NOT available in the new regime. Instead reference NPS 80CCD(2) employer contribution (up to 14% of basic), tax-free maturity instruments, and growth investing.
- If recommended_regime = "old": focus on maximising the specific unused deductions listed in missing_deductions. Quantify savings where possible.

Output format — return ONLY valid JSON, no markdown, no prose outside JSON:
{{
  "summary": "2–3 sentence overview using only numbers from the context",
  "key_actions": ["Action 1", "Action 2"],
  "risks": ["Risk 1", "Risk 2"],
  "disclaimer": "Standard SEBI-style disclaimer",
  "regime_suggestion": null
}}
"""


# Context builders
def _build_health_context(profile: UserProfile, result: MoneyHealthResult) -> str:
    return json.dumps(
        {
            "age": profile.age,
            "monthly_income": profile.monthly_gross_income,
            "monthly_surplus": result.monthly_surplus,
            "overall_score": result.overall_score,
            "grade": result.grade,
            "dimensions": [
                {"name": d.name, "score": d.score, "insight": d.insight} for d in result.dimensions
            ],
            "net_worth": result.total_net_worth,
        },
        indent=2,
    )


def _build_fire_context(profile: UserProfile, result: FIREPlan) -> str:
    return json.dumps(
        {
            "age": profile.age,
            "retirement_age": profile.retirement_age,
            "monthly_income": profile.monthly_gross_income,
            "corpus_required": result.fi_corpus_required,
            "current_corpus": result.current_corpus,
            "corpus_gap": result.corpus_gap,
            "required_monthly_sip": result.required_monthly_sip,
            "projected_fi_age": result.projected_fi_age,
            "on_track": result.on_track,
            "goals": [
                {
                    "label": g.goal_label,
                    "target": g.target_amount,
                    "year": g.target_year,
                    "sip": g.required_monthly_sip,
                }
                for g in (result.sip_goals or [])
            ],
        },
        indent=2,
    )


def _build_tax_context(profile: UserProfile, result: TaxRegimeComparison) -> str:
    return json.dumps(
        {
            "annual_income": result.gross_income,
            "old_regime_tax": result.old_regime_tax,
            "new_regime_tax": result.new_regime_tax,
            "recommended_regime": result.recommended_regime.value,
            "savings_by_switching": result.savings_by_switching,
            "effective_rate_old": result.effective_rate_old,
            "effective_rate_new": result.effective_rate_new,
            "missing_deductions": result.missing_deductions or [],
            "quantified_deduction_potential": result.deduction_potential,
            "deduction_potential_note": (
                "This figure covers 80C / 80D / NPS only. "
                "HRA and home loan interest are excluded — amounts depend on actual rent and loan."
            ),
        },
        indent=2,
    )


# Runtime regime instruction (control plane)
def _regime_instruction(result: TaxRegimeComparison) -> str:
    """
    Generates a hard runtime constraint injected into the user message.
    Dual-layer control: system prompt sets the rule; this enforces it per call.
    """
    try:
        regime = result.recommended_regime.value.upper()
    except AttributeError:
        return ""

    if regime == "NEW":
        return (
            "REGIME CONSTRAINT — NEW regime recommended. "
            "Do NOT suggest 80C / 80D / HRA / NPS 80CCD(1B) — unavailable in new regime. "
            "Focus on: NPS 80CCD(2) employer contribution, ULIP/PPF maturity proceeds, "
            "equity SIP growth, and the benefit of lower slab rates on compounding."
        )
    return (
        "REGIME CONSTRAINT — OLD regime recommended. "
        "Focus specifically on the unused deductions listed in missing_deductions. "
        "Quantify each saving where the deduction_potential figure supports it."
    )


# LLM response validator
_REQUIRED_ADVICE_KEYS = {"summary", "key_actions", "risks", "disclaimer"}


def _validate_llm_advice(data: Any) -> dict:
    """
    Guards against malformed LLM output before passing to AgentAdvice(**data).
    Raises ValueError if critical fields are missing or wrong type.
    """
    if not isinstance(data, dict):
        raise ValueError(f"LLM returned non-dict: {type(data)}")

    missing = _REQUIRED_ADVICE_KEYS - data.keys()
    if missing:
        raise ValueError(f"LLM response missing keys: {missing}")

    if not isinstance(data.get("key_actions"), list):
        data["key_actions"] = [str(data["key_actions"])]

    if not isinstance(data.get("risks"), list):
        data["risks"] = [str(data["risks"])]

    # Ensure no None bleeds into string fields
    for key in ("summary", "disclaimer"):
        if not data.get(key):
            raise ValueError(f"LLM returned empty '{key}'")

    # regime_suggestion is nullable — normalise
    if "regime_suggestion" not in data:
        data["regime_suggestion"] = None

    return data


# Fallback advice (deterministic — mirrors LLM constraints)
def _fallback_advice(feature: str, result: Any) -> AgentAdvice:
    """Deterministic fallback when LLM is unavailable or returns invalid output."""

    if feature == "health":
        low_dims = [d.insight for d in (result.dimensions or []) if d.score < 70]
        return AgentAdvice(
            summary=(
                f"Your Money Health Score is {result.overall_score:.0f}/100 "
                f"(Grade {result.grade}). Review each dimension for targeted improvements."
            ),
            key_actions=low_dims[:5] or ["Maintain your financial discipline — you're doing well!"],
            risks=[
                "Market volatility can impact equity allocation.",
                "Emergency fund should be held in liquid instruments only.",
            ],
            disclaimer=(
                "This analysis is for educational purposes only. "
                "Consult a SEBI-registered financial advisor for personalised recommendations."
            ),
        )

    if feature == "fire":
        on_track_msg = (
            "You are on track!" if result.on_track else "Increase savings to meet your goal."
        )
        return AgentAdvice(
            summary=(
                f"You need ₹{result.fi_corpus_required:,.0f} for retirement. "
                f"Required monthly SIP: ₹{result.required_monthly_sip:,.0f}. {on_track_msg}"
            ),
            key_actions=[
                f"Start a SIP of ₹{result.required_monthly_sip:,.0f}/month in equity mutual funds.",
                "Step up SIP by 10% annually as income grows.",
                "Ensure a 6-month emergency fund before increasing equity exposure.",
            ],
            risks=[
                "Inflation may erode purchasing power over long horizons.",
                "Sequence-of-returns risk near retirement — shift to debt gradually.",
            ],
            disclaimer=(
                "This is an illustrative projection. Actual returns may vary. "
                "Consult a SEBI-registered advisor for a personalised plan."
            ),
        )

    # tax fallback — respects regime constraint deterministically
    try:
        regime = result.recommended_regime.value.upper()
    except AttributeError:
        regime = "NEW"

    if regime == "OLD":
        actions = [f"Claim: {d}" for d in (result.missing_deductions or [])[:4]] or [
            "Maximise Section 80C investments (ELSS, PPF, EPF top-up)."
        ]
    else:
        actions = [
            "Explore NPS 80CCD(2) employer contribution (up to 14% of basic — allowed in new regime).",
            "Invest tax savings into equity SIPs for long-term compounding.",
            "Review your investment mix annually to align with your risk profile.",
        ]

    return AgentAdvice(
        summary=(
            f"Under the {result.recommended_regime.value} tax regime, "
            f"you save ₹{result.savings_by_switching:,.0f} in taxes. "
            f"Effective rate: {result.effective_rate_new:.1f}% (new) vs "
            f"{result.effective_rate_old:.1f}% (old)."
        ),
        key_actions=actions,
        risks=[
            "Tax laws may change with each Union Budget — review annually.",
            "Verify all deductions and regime choice with a CA before filing.",
        ],
        disclaimer=(
            "Tax calculations are based on FY 2025-26 slabs. "
            "This is not professional tax advice — consult a CA for filing."
        ),
        regime_suggestion=(
            f"Switch to {result.recommended_regime.value} regime "
            f"to save ₹{result.savings_by_switching:,.0f}."
        ),
    )


# Public advice generators
async def generate_health_advice(profile: UserProfile, result: MoneyHealthResult) -> AgentAdvice:
    try:
        context = _build_health_context(profile, result)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate Money Health Score advice for:\n{context}"},
        ]
        data = await structured_chat(messages)
        data = _validate_llm_advice(data)
        return AgentAdvice(**data)
    except (LLMUnavailableError, Exception) as e:
        logger.warning("Mentor health fallback triggered: %s", e)
        return _fallback_advice("health", result)


async def generate_fire_advice(profile: UserProfile, result: FIREPlan) -> AgentAdvice:
    try:
        context = _build_fire_context(profile, result)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Generate FIRE planning advice for:\n{context}"},
        ]
        data = await structured_chat(messages)
        data = _validate_llm_advice(data)
        return AgentAdvice(**data)
    except (LLMUnavailableError, Exception) as e:
        logger.warning("Mentor FIRE fallback triggered: %s", e)
        return _fallback_advice("fire", result)


async def generate_tax_advice(profile: UserProfile, result: TaxRegimeComparison) -> AgentAdvice:
    try:
        context = _build_tax_context(profile, result)
        regime_constraint = _regime_instruction(result)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Generate tax wizard advice for:\n{context}"
                    + (f"\n\n{regime_constraint}" if regime_constraint else "")
                ),
            },
        ]
        data = await structured_chat(messages)
        data = _validate_llm_advice(data)
        return AgentAdvice(**data)
    except (LLMUnavailableError, Exception) as e:
        logger.warning("Mentor tax fallback triggered: %s", e)
        return _fallback_advice("tax", result)
