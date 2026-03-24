# AI Money Mentor — Backend

> India's AI-powered personal finance mentor. Deterministic finance engine + multi-agent LLM pipeline, built on FastAPI.

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Agent Pipeline](#agent-pipeline)
- [Finance Engine](#finance-engine)
- [LLM Providers](#llm-providers)
- [Testing](#testing)
- [Development](#development)
- [Design Decisions](#design-decisions)

## Architecture

```md
Request → IntakeAgent → Finance Engine → MentorAgent → GuardrailAgent → Response
              ↓               ↓                ↓               ↓
         (Validate)     (Deterministic)    (LLM advice)  (SEBI compliance)
              ↓               ↓                ↓               ↓
                         SQLite audit log (agent_logs table)
```

Every request runs through a 4-agent pipeline. The finance engine is **fully deterministic** — no LLM involved in the numbers. The LLM only generates the natural-language advice layer on top of computed results.

## Project Structure

```md
backend/
├── agents/
│   ├── intake_agent.py        # Profile validation + defaults (LLM)
│   ├── mentor_agent.py        # Advice generation (LLM)
│   └── guardrail_agent.py     # SEBI compliance check (LLM)
├── core/
│   ├── config.py              # All env vars via pydantic-settings
│   ├── exceptions.py          # Domain exception hierarchy
│   └── llm_client.py          # Provider-agnostic LLM abstraction
├── db/
│   └── session_store.py       # SQLAlchemy async session + audit log
├── finance/
│   ├── fire.py                # FIRE corpus, SIP, projected FI age
│   ├── health.py              # 6-dimension money health score
│   └── tax.py                 # Old vs new regime comparison
├── models/
│   └── schemas.py             # Pydantic v2 — single source of truth
├── routers/
│   ├── fire_planner.py        # POST /api/fire-planner
│   ├── health_score.py        # POST /api/health-score
│   └── tax_wizard.py          # POST /api/tax-wizard
├── tests/
│   ├── conftest.py
│   └── test_finance.py        # 28 unit tests (zero LLM/network)
├── main.py                    # App entry point, lifespan, middleware
├── pyproject.toml
├── Makefile
└── .env.example
```

## Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- A Groq/Gemini API key:
  - [console.groq.com](https://console.groq.com)
  - [aistudio.google.com/app/api-keys](https://aistudio.google.com/app/api-keys)

## Quick Start

```bash
# 1. Clone and enter
git clone https://github.com/MahadevBalla/et-money-mentor.git
cd et-money-mentor/backend

# 2. Install all dependencies (creates .venv automatically)
make install
# Equivalent: cp .env.example .env && uv sync

# 3. Add your API key
#    Edit .env → set GROQ_API_KEY or GEMINI_API_KEY

# 4. Start the dev server
make dev
# Server: http://localhost:8000
# Swagger UI: http://localhost:8000/docs  (only when DEBUG=true)
```

## Configuration

All configuration is loaded from `.env` via `core/config.py`. Never read `os.environ` directly — always import `settings`.

```bash
# .env (copy from .env.example)

# LLM provider: "groq" (default) or "gemini"
LLM_PROVIDER=groq

# Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=2048
GROQ_TEMPERATURE=0.3

# Gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview

# Database
DATABASE_URL=sqlite+aiosqlite:///./money_mentor.db

# App
APP_NAME=AI Money Mentor
DEBUG=true                        # Enables Swagger UI; does NOT affect log verbosity

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Finance Engine — India-specific defaults
DEFAULT_INFLATION_RATE=0.06
DEFAULT_EQUITY_RETURN=0.12
DEFAULT_DEBT_RETURN=0.07
DEFAULT_SAFE_WITHDRAWAL_RATE=0.04
EMERGENCY_FUND_MONTHS=6
```

**Important:** `DEBUG=true` controls Swagger UI availability only. Log level is always `INFO` — this is intentional to prevent third-party library debug floods (aiosqlite, httpcore, groq SDK internals).

## API Reference

All endpoints accept and return JSON. Request body is a `UserProfile` object.

### `GET /health`

```json
{"status": "ok", "version": "1.0.0"}
```

### `POST /api/health-score`

Returns a 6-dimension financial wellness score.

**Request body** (minimum viable):

```json
{
  "age": 28,
  "city": "Mumbai",
  "monthly_gross_income": 100000,
  "monthly_expenses": 45000,
  "emergency_fund": 270000,
  "retirement_age": 60,
  "risk_profile": "moderate"
}
```

**Optional fields:** `assets`, `debts`, `insurance`, `tax_deductions`, `goals`

**Response:**

```json
{
  "session_id": "uuid",
  "profile": { "...validated UserProfile..." },
  "result": {
    "overall_score": 78.6,
    "grade": "B",
    "dimensions": [
      { "name": "Emergency Fund", "score": 100.0, "label": "Excellent", "insight": "..." },
      { "name": "Debt Health",    "score": 100.0, "label": "Excellent", "insight": "..." },
      { "name": "Diversification","score": 100.0, "label": "Excellent", "insight": "..." },
      { "name": "Retirement Readiness", "score": 46.2, "label": "Fair", "insight": "..." },
      { "name": "Insurance Coverage",   "score": 60.0, "label": "Good", "insight": "..." },
      { "name": "Tax Efficiency",       "score": 53.3, "label": "Fair", "insight": "..." }
    ],
    "monthly_surplus": 55000.0,
    "total_net_worth": 1070000.0
  },
  "advice": {
    "summary": "...",
    "key_actions": ["..."],
    "risks": ["..."],
    "disclaimer": "..."
  },
  "decision_log": [
    { "agent": "IntakeAgent",    "step": "Profile validated",      "timestamp": "..." },
    { "agent": "FinanceEngine",  "step": "Health score calculated","timestamp": "..." },
    { "agent": "MentorAgent",    "step": "Advice generated",       "timestamp": "..." },
    { "agent": "GuardrailAgent", "step": "Compliance check",       "timestamp": "..." }
  ]
}
```

### `POST /api/fire-planner`

Returns a complete FIRE (Financial Independence, Retire Early) plan.

**Additional request fields:** `retirement_age`, `goals` (array of `{ type, label, target_amount, target_year }`)

**Key response fields in `result`:**

```json
{
  "fi_corpus_required": 65101670.0,
  "current_corpus": 600000.0,
  "corpus_gap": 64501670.0,
  "required_monthly_sip": 21466.0,
  "projected_fi_age": 48.5,
  "monthly_retirement_expense": 217006.0,
  "sip_goals": [
    { "goal_label": "Dream Home", "target_amount": 5000000.0, "target_year": 2032, "required_monthly_sip": 55753.0 }
  ],
  "on_track": true
}
```

### `POST /api/tax-wizard`

Compares old vs new tax regime with India FY 2025-26 slabs.

**Key response fields in `result`:**

```json
{
  "gross_income": 1800000.0,
  "old_regime_tax": 335400.0,
  "new_regime_tax": 215800.0,
  "recommended_regime": "new",
  "savings_by_switching": 119600.0,
  "effective_rate_old": 18.63,
  "effective_rate_new": 11.99,
  "missing_deductions": ["Section 80C: ₹100,000 unused (PPF, ELSS, EPF, LIC)", "..."],
  "deduction_potential": 175000.0
}
```

## Agent Pipeline

Each request runs through 4 agents in sequence. Every agent step is written to the `agent_logs` DB table for full auditability.

| Agent | Model | Responsibility |
| --- | --- | --- |
| `IntakeAgent` | LLM | Validates profile JSON, fills Indian defaults, flags anomalies |
| `FinanceEngine` | Deterministic | Runs FIRE / Health / Tax calculations — no LLM |
| `MentorAgent` | LLM | Generates personalised, India-specific financial advice |
| `GuardrailAgent` | LLM | SEBI compliance check — removes stock picks, softens guarantees |

The `decision_log` array in every response shows exactly what each agent did, including input/output summaries and timestamps. This is the audit trail.

## Finance Engine

Pure Python, zero LLM dependency. All functions are stateless and deterministic.

### FIRE (`finance/fire.py`)

- `compound_growth_value(principal, rate, years)` — standard compound growth
- `future_value_sip(monthly_sip, annual_rate, months)` — SIP future value
- `required_monthly_sip(target, current_corpus, rate, years)` — back-calculated SIP
- `projected_fi_age(...)` — binary search for earliest FI age
- `build_fire_plan(profile)` → `FIREPlan`

### Health Score (`finance/health.py`)

6 equally-weighted dimensions, each scored 0–100:

1. **Emergency Fund** — months of expenses covered
2. **Debt Health** — EMI-to-income ratio, unsecured debt penalty
3. **Diversification** — Herfindahl index across asset classes
4. **Retirement Readiness** — projected corpus vs required corpus %
5. **Insurance Coverage** — term life (10× income) + health cover adequacy
6. **Tax Efficiency** — deduction utilisation rate

### Tax Engine (`finance/tax.py`)

- FY 2025-26 slabs for both regimes (standard deduction ₹75,000 new / ₹50,000 old)
- 4% health & education cess applied
- Section 87A rebate: ₹0 tax if taxable income ≤ ₹7L (new) / ₹5L (old)
- Identifies unused deductions across 80C, 80D, 80CCD(1B), HRA, Section 24(b)

## LLM Providers

Provider-agnostic design — switch without touching any agent code.

```md
# In .env
LLM_PROVIDER=groq    # default
LLM_PROVIDER=gemini  # requires: uv add google-genai
```

To add a new provider (e.g., OpenAI):

```python
# core/llm_client.py
class OpenAIProvider(BaseLLMProvider):
    async def complete(self, messages, *, temperature, max_tokens, json_mode) -> str:
        ...

_REGISTRY["openai"] = OpenAIProvider
```

Then set `LLM_PROVIDER=openai` in `.env`. No other changes needed.

Agents call only `chat_completion()` or `structured_chat()` — never instantiate providers directly.

## Testing

```bash
make test          # All tests
make test-unit     # Finance engine only (fast, no LLM/DB/network)
make test-cov      # With coverage report
```

**28 unit tests** across 4 test classes:

| Class | Tests | Coverage |
| --- | --- | --- |
| `TestFIREMath` | 8 | FIRE corpus, SIP math, goal planning |
| `TestTaxEngine` | 7 | Both regimes, rebates, cess, deduction identification |
| `TestHealthScore` | 10 | All 6 dimensions, net worth, grade assignment |
| `TestProfileValidation` | 3 | Cross-field validators (expenses > income, etc.) |

All tests are **deterministic** — zero LLM calls, zero DB, zero network. Safe to run in CI with no secrets.

## Development

```bash
make help          # Show all available commands

make install       # Install deps + create .env from example
make dev           # Hot-reload dev server on :8000
make test          # Full test suite
make test-unit     # Finance tests only
make lint          # Ruff auto-fix
make reset-db      # Delete SQLite DB (recreated on next startup)
make clean         # Remove __pycache__, .pytest_cache, *.pyc
```

### Adding a new API feature

1. Add Pydantic schemas to `models/schemas.py`
2. Add calculation logic to `finance/` (pure functions, no I/O)
3. Add agent prompts to `agents/`
4. Add router to `routers/` and mount in `main.py`
5. Add tests to `tests/test_finance.py`

## Design Decisions

**Why deterministic finance engine + LLM advice layer (not end-to-end LLM)?**
LLMs hallucinate numbers. SIP amounts, tax figures, and corpus calculations are too consequential. The engine guarantees mathematical accuracy; the LLM only handles language.

**Why provider-agnostic LLM client?**
Groq for speed during development, Gemini for production optionality. The `BaseLLMProvider` abstraction means switching is a one-line env var change — no agent code changes.

**Why SQLite now?**
Zero-config for hackathon/demo. The `engine` in `db/session_store.py` is the only place that references SQLite. Moving to Postgres means changing `DATABASE_URL` in `.env`. The `async_sessionmaker` pattern works identically.

**Why `DEBUG=true` doesn't change log level?**
`DEBUG` controls product features (Swagger UI). Log verbosity is a separate operational concern. Setting root logger to `DEBUG` floods stdout with aiosqlite cursor operations and httpcore TLS handshakes — useless noise that buries real errors.

**Why audit log every agent step?**
SEBI-style compliance requires an evidence trail. `decision_log` in the response + `agent_logs` in DB means you can reconstruct exactly what the system told any user at any point in time.
