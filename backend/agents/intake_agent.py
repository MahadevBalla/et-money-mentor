"""
agents/intake_agent.py

Intake Agent — validates raw user input and produces a complete UserProfile.

Responsibility split (strict):
  LLM   → structural validation + data quality flags (no arithmetic, no corrections)
  Code  → all deterministic normalization (emergency fund, term cover)

This separation ensures Finance Engine always receives consistent, rule-compliant
numbers regardless of LLM availability or output quality.
"""

from __future__ import annotations

import copy
import json
import logging

from pydantic import ValidationError as PydanticValidationError

from core.exceptions import LLMUnavailableError, ValidationError
from core.llm_client import structured_chat
from models import UserProfile

logger = logging.getLogger(__name__)

# Normalization constants
# Mirror finance rules of thumb — update here if assumptions change.
_EMERGENCY_FUND_MONTHS: int = 6
_TERM_COVER_MULTIPLIER: int = 10  # × annual gross income

_SYSTEM_PROMPT = """You are a financial data intake assistant for an Indian personal finance app.

Your ONLY job is to:
1. Check for obvious data quality issues (expenses > income, negative values, missing required fields).
2. Flag issues in "validation_notes" — describe what is wrong, do NOT correct numbers.
3. Return the profile JSON exactly as received, with structurally missing fields set to 0.

Hard rules:
- Do NOT modify any numeric values (income, insurance, emergency fund, assets, debts).
- Do NOT compute, estimate, or adjust financial figures of any kind.
- Do NOT add fields that were not in the input unless they are structurally required by the schema and can safely default to 0 or false.
- Return ONLY a JSON object with exactly two keys:
    "profile"          — the UserProfile dict (numbers untouched)
    "validation_notes" — array of strings describing issues found (empty array if none)
"""


# Deterministic normalization
def _normalize_profile(profile: UserProfile) -> tuple[UserProfile, list[str]]:
    """
    Apply Indian financial rules of thumb deterministically.

    Rules:
      1. Emergency fund — flag if below 6× monthly expenses. NEVER overwrite.
         (Must reflect reality for health scoring to be accurate.)
      2. Term life cover — normalize upward if user HAS a policy but cover is low.
         Flag if user has NO policy at all.

    Returns (profile_unchanged_or_corrected, notes_list).
    Safe: works on a deep-copy — original profile object is never mutated.
    """
    notes: list[str] = []
    data: dict = copy.deepcopy(profile.model_dump())

    # 1. Emergency fund — flag only, never overwrite
    try:
        recommended_ef = profile.monthly_expenses * _EMERGENCY_FUND_MONTHS
        if recommended_ef > 0 and (profile.emergency_fund or 0) < recommended_ef:
            shortfall = recommended_ef - (profile.emergency_fund or 0)
            notes.append(
                f"Emergency fund ₹{(profile.emergency_fund or 0):,.0f} is below the recommended "
                f"₹{recommended_ef:,.0f} ({_EMERGENCY_FUND_MONTHS}× monthly expenses). "
                f"Shortfall: ₹{shortfall:,.0f}."
            )
    except (TypeError, AttributeError) as e:
        logger.warning("Emergency fund check skipped: %s", e)

    # 2. Term life insurance — normalize cover, flag missing policy
    try:
        recommended_cover = (profile.annual_gross_income or 0) * _TERM_COVER_MULTIPLIER

        if recommended_cover > 0:
            insurance = data.get("insurance", {})
            if not isinstance(insurance, dict):
                insurance = {}

            if not profile.insurance.has_term_life:
                notes.append(
                    f"No term life policy found. Recommended cover: ₹{recommended_cover:,.0f} "
                    f"({_TERM_COVER_MULTIPLIER}× annual income). Consider a pure-term plan."
                )
            elif (profile.insurance.term_cover or 0) < recommended_cover:
                insurance["term_cover"] = recommended_cover
                data["insurance"] = insurance
                notes.append(
                    f"Term cover updated to {_TERM_COVER_MULTIPLIER}× annual income "
                    f"(₹{recommended_cover:,.0f})."
                )
    except (TypeError, AttributeError) as e:
        logger.warning("Term cover normalization skipped: %s", e)

    # Rebuild model from corrected data
    try:
        corrected = UserProfile.model_validate(data)
    except PydanticValidationError as e:
        logger.error(
            "Profile normalization produced invalid model — returning original. Error: %s", e
        )
        notes.append("Normalization failed validation — original profile used.")
        return profile, notes

    return corrected, notes


# Public entry point
async def run_intake_agent(raw_data: dict) -> tuple[UserProfile, list[str]]:
    """
    Validate raw input dict and return (UserProfile, validation_notes).

    Flow:
      1. LLM validates structure + flags data quality issues (no arithmetic).
      2. _normalize_profile() applies deterministic financial rules of thumb.
      3. If LLM is unavailable or returns invalid JSON, falls back to direct
         Pydantic parse — normalization still runs.

    Raises:
      ValidationError — if raw_data fails Pydantic validation entirely.
    """
    llm_notes: list[str] = []
    profile: UserProfile | None = None

    # Step 1: LLM structural validation
    try:
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": "Validate this profile JSON:\n\n" + json.dumps(raw_data, indent=2),
            },
        ]
        result = await structured_chat(messages)

        # Guard: result must be a dict
        if not isinstance(result, dict):
            raise LLMUnavailableError("LLM returned non-dict response")

        profile_dict = result.get("profile")
        llm_notes = result.get("validation_notes") or []

        # Guard: notes must be a list of strings
        if not isinstance(llm_notes, list):
            llm_notes = [str(llm_notes)]

        # Guard: profile_dict must be a non-empty dict
        if not isinstance(profile_dict, dict) or not profile_dict:
            logger.warning("LLM returned empty/missing profile key — falling back to raw input")
            profile_dict = raw_data
            llm_notes.append("LLM returned no profile — raw input used for validation.")

        try:
            profile = UserProfile.model_validate(profile_dict)
        except PydanticValidationError as e:
            logger.warning(
                "LLM profile dict failed Pydantic validation — falling back to raw: %s", e
            )
            llm_notes.append("LLM output invalid — raw input used for validation.")
            profile = None  # will be retried below

    except LLMUnavailableError as e:
        logger.info("Intake agent: LLM unavailable (%s) — using direct validation", e)
        llm_notes = ["LLM unavailable — direct validation used."]

    except Exception as e:  # noqa: BLE001
        logger.warning("Intake agent: unexpected LLM error (%s) — using direct validation", e)
        llm_notes = [f"LLM error — direct validation used. ({type(e).__name__})"]

    # Step 2: Fallback — direct Pydantic parse from raw_data
    if profile is None:
        try:
            profile = UserProfile.model_validate(raw_data)
        except PydanticValidationError as e:
            raise ValidationError(str(e)) from e

    # Step 3: Deterministic normalization
    profile, norm_notes = _normalize_profile(profile)

    return profile, llm_notes + norm_notes
