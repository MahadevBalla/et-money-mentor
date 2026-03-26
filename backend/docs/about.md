# AI Money Mentor - Backend Architecture

> A comprehensive guide to understanding the backend implementation

## 📊 Quick Stats

- **40 Python files** | **4,441 lines of code** | **7 folders**
- **6 core features** | **9 API endpoints** | **91 tests**
- **Technology**: FastAPI + SQLite + Groq/Gemini LLM + Sarvam AI Voice

---

## 🔄 The Request Flow (4-Step Pipeline)

Every request goes through the **same 4 agents** in sequence:

```
User Input (JSON)
      ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: IntakeAgent (LLM)                                  │
│  • Validates user data                                       │
│  • Fills Indian defaults (6-month emergency fund, etc.)      │
│  • Checks for errors (expenses > income, etc.)              │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Finance Engine (PURE MATH - NO AI!)                │
│  • Calculates SIP amounts, tax, health scores               │
│  • All deterministic Python functions                        │
│  • Uses FY 2025-26 India tax constants                      │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: MentorAgent (LLM)                                  │
│  • Takes numbers from Step 2                                 │
│  • Converts into friendly Hindi-English advice               │
│  • References Indian instruments (PPF, ELSS, NPS)            │
└─────────────────────────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: GuardrailAgent (LLM)                               │
│  • SEBI compliance check                                     │
│  • Removes stock tips ("buy Reliance")                      │
│  • Softens "guaranteed returns" language                     │
│  • Adds disclaimer                                           │
└─────────────────────────────────────────────────────────────┘
      ↓
Final Response (JSON) + Saved to SQLite Database
```

---

## 📁 Folder Structure (7 Main Folders)

```
backend/
├── main.py              # 🚪 Entry point - starts FastAPI server
│
├── routers/            # 🛣️ API ENDPOINTS (9 files)
│   ├── health_score.py      → POST /api/health-score
│   ├── fire_planner.py      → POST /api/fire-planner
│   ├── tax_wizard.py        → POST /api/tax-wizard
│   ├── life_event.py        → POST /api/life-event
│   ├── couple_planner.py    → POST /api/couple-planner
│   ├── mf_xray.py           → POST /api/mf-xray (file upload)
│   ├── chat.py              → POST /api/chat + GET /api/chat/stream
│   └── voice.py             → POST /api/voice/stt + /tts
│
├── finance/            # 🧮 DETERMINISTIC MATH ENGINE (6 files)
│   ├── tax.py               → Old vs New regime, deductions
│   ├── fire.py              → SIP calculations, corpus projections
│   ├── health.py            → 6-dimension health score
│   ├── life_event.py        → Bonus/inheritance allocation rules
│   ├── couple.py            → HRA, NPS, joint optimization
│   ├── mf_xray.py           → XIRR, overlap analysis
│   └── tax_constants.py     → FY 2025-26 India tax slabs
│
├── agents/             # 🤖 AI AGENTS (6 files)
│   ├── intake_agent.py      → Validates input
│   ├── mentor_agent.py      → Generates advice
│   ├── guardrail_agent.py   → SEBI compliance
│   ├── life_event_agent.py  → Life event narrative
│   ├── couple_agent.py      → Couple advice narrative
│   └── mf_xray_agent.py     → Portfolio advice
│
├── models/             # 📋 DATA SCHEMAS (1 file)
│   └── schemas.py           → All Pydantic models (UserProfile, etc.)
│
├── core/               # ⚙️ INFRASTRUCTURE (4 files)
│   ├── config.py            → Loads .env settings
│   ├── llm_client.py        → LLM abstraction (Groq/Gemini)
│   ├── exceptions.py        → Error classes
│   └── voice.py             → Sarvam AI STT/TTS
│
├── db/                 # 💾 DATABASE (1 file)
│   └── session_store.py     → SQLite: sessions + agent_logs tables
│
└── tests/              # ✅ TESTS (91 tests)
    ├── test_finance.py      → Tax, FIRE, health scores
    ├── test_life_event.py   → All 6 life events
    ├── test_couple.py       → Couple optimization
    └── test_mf_xray.py      → XIRR, overlap detection
```

---

## 🎯 Key Design Decisions

### 1. Finance Engine = Pure Math (NO AI touching numbers)

```python
# finance/fire.py - Just Python math
def required_monthly_sip(target, corpus, rate, years):
    # Binary search algorithm - no LLM needed
    return calculated_sip_amount
```

**Why?** LLMs hallucinate numbers. SIP amounts must be trustworthy.

### 2. LLM = Only for Language (Not calculations)

```python
# agents/mentor_agent.py
# LLM receives: {"monthly_sip": 15000, "corpus": 50000000}
# LLM outputs: "To reach your ₹5Cr goal, invest ₹15,000/month..."
```

**Why?** LLM makes advice human-friendly. Numbers come from Step 2.

### 3. 4-Agent Pipeline (Always runs in order)

Every request goes through all 4 agents—even simple ones.

**Why?**
- **Consistency**: Same guardrails for everyone
- **Audit trail**: Every decision logged to database
- **Compliance**: SEBI checks on all advice

### 4. SQLite Database (2 tables)

```sql
sessions        → id, feature, created_at, state_json
agent_logs      → session_id, agent_name, step, input_json, output_json, timestamp
```

**Why?** Full audit trail. You can reconstruct any advice given to any user.

---

## 💡 Simple Example: Health Score Flow

### User Input
```json
{
  "age": 28,
  "monthly_gross_income": 100000,
  "monthly_expenses": 45000,
  "emergency_fund": 270000
}
```

### Step-by-Step Processing

#### Step 1 (IntakeAgent)
- Checks: age valid? income > expenses? ✅
- Adds defaults: `retirement_age: 60`, `risk_profile: moderate`
- Output: Complete `UserProfile` object

#### Step 2 (Finance Engine)
```python
# finance/health.py
emergency_score = (270000 / (45000 * 6)) * 100  # = 100.0
debt_score = 100  # No debts
diversification_score = 0  # No investments
# ... 6 dimensions
overall_score = average = 78.6
grade = "B"
```
**Pure math!** No AI involved.

#### Step 3 (MentorAgent)
- Gets numbers: `{"overall_score": 78.6, "grade": "B", ...}`
- LLM generates:
```json
{
  "summary": "You're doing well but need to start investing...",
  "key_actions": [
    "Start a ₹10,000 SIP in ELSS for tax savings",
    "Consider NPS for retirement..."
  ]
}
```

#### Step 4 (GuardrailAgent)
- Scans for banned words: "guaranteed returns", "buy HDFC stock"
- If found → removes or softens language
- Adds disclaimer

### Final Response
```json
{
  "session_id": "uuid",
  "result": { "overall_score": 78.6, "grade": "B", ... },
  "advice": { "summary": "...", "key_actions": [...] },
  "decision_log": [
    {"agent": "IntakeAgent", "step": "Validated", ...},
    {"agent": "FinanceEngine", "step": "Calculated", ...},
    {"agent": "MentorAgent", "step": "Generated", ...},
    {"agent": "GuardrailAgent", "step": "Checked", ...}
  ]
}
```

---

## 🔧 Technical Stack

| Component | Technology | Why? |
|-----------|-----------|------|
| **Web Framework** | FastAPI | Fast, async, auto-docs at `/docs` |
| **Database** | SQLite (async) | Zero config, can switch to Postgres easily |
| **LLM** | Groq/Gemini | Switchable via `.env` |
| **Voice** | Sarvam AI | Indian languages (Hindi, Tamil, etc.) |
| **Validation** | Pydantic v2 | Type-safe, auto-validation |
| **Testing** | pytest | 91 tests, all deterministic |

---

## ⚡ The Magic: Deterministic + LLM Hybrid

```
┌─────────────────────────────────────────────────────┐
│  INDIAN FINANCIAL ADVISOR                           │
│                                                      │
│  Trustworthy Math     +     Human-Friendly Language │
│  (Finance Engine)            (LLM Agents)           │
│                                                      │
│  ✅ Accurate numbers    ✅ Conversational advice     │
│  ✅ Unit testable       ✅ Regional language support│
│  ✅ No hallucinations   ✅ Personalized narratives  │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 The 6 Core Features

### 1. Money Health Score

**File**: `finance/health.py`

**What It Does**: Returns a 0-100 score across 6 dimensions:

| Dimension | How It's Scored |
|-----------|----------------|
| **Emergency Fund** | Months of expenses covered (target: 6 months) |
| **Debt Health** | EMI-to-income ratio + unsecured debt penalty |
| **Diversification** | Herfindahl index across equity/debt/gold/cash |
| **Retirement Readiness** | Projected corpus ÷ required corpus |
| **Insurance Coverage** | Term (10× income) + Health coverage |
| **Tax Efficiency** | Claimed deductions ÷ max available |

**API**: `POST /api/health-score`

**Engine Logic**:
```python
def calculate_money_health_score(profile: UserProfile) -> MoneyHealthResult:
    dimensions = [
        score_emergency_fund(profile),       # 100.0 if 6mo covered
        score_debt_health(profile),          # Penalizes high EMI%
        score_investment_diversification(),  # Checks concentration
        score_retirement_readiness(profile), # Future-value projection
        score_insurance_coverage(profile),   # Term + health adequacy
        score_tax_efficiency(profile),       # 80C/80D utilization
    ]
    overall = average(dimensions)
    grade = assign_grade(overall)  # A-F scale
    return result
```

---

### 2. FIRE Path Planner

**File**: `finance/fire.py`

**What It Does**: Calculates the exact SIP amount needed to retire early.

**Key Calculations**:
- **FI Corpus Required**: `(monthly_expenses × 12) ÷ safe_withdrawal_rate`
- **Flat SIP**: Fixed monthly amount via binary search
- **Step-up SIP**: Initial SIP that increases 10% annually (typically 30-40% lower)
- **Projected FI Age**: Earliest age you can retire with current savings

**API**: `POST /api/fire-planner`

**Engine Logic**:
```python
def build_fire_plan(profile: UserProfile) -> FIREPlan:
    # Calculate retirement corpus (25x annual expenses)
    fi_corpus = (profile.monthly_expenses * 12) / settings.SAFE_WITHDRAWAL_RATE

    # Calculate required SIP (binary search)
    flat_sip = required_monthly_sip(fi_corpus, profile.assets.total, ...)
    stepup_sip = required_stepup_sip(fi_corpus, ..., stepup_rate=0.10)

    # Calculate when you'll reach FI
    projected_age = projected_fi_age(profile.age, ..., stepup_sip)

    # Per-goal SIP amounts
    sip_goals = [calculate_goal_sip(goal) for goal in profile.goals]

    return FIREPlan(...)
```

**Special Feature**: Step-up SIP matches Indian salary growth patterns (10% annual hikes).

---

### 3. Tax Wizard

**File**: `finance/tax.py`

**What It Does**: Compares old vs new tax regime and finds missing deductions.

**Tax Constants** (FY 2025-26):
```python
# finance/tax_constants.py
NEW_REGIME_SLABS = [
    (0, 300_000, 0.00),
    (300_001, 700_000, 0.05),
    (700_001, 1_000_000, 0.10),
    (1_000_001, 1_200_000, 0.15),
    (1_200_001, 1_500_000, 0.20),
    (1_500_001, float('inf'), 0.30),
]
```

**API**: `POST /api/tax-wizard`

**Engine Logic**:
```python
def compare_regimes(profile: UserProfile) -> TaxRegimeComparison:
    gross = profile.annual_gross_income

    # Old regime with deductions
    old_taxable = gross - 50_000  # standard deduction
    old_taxable -= profile.tax_deductions.section_80c
    old_taxable -= profile.tax_deductions.section_80d_self
    # ... apply all deductions
    old_tax = calculate_tax_from_slabs(OLD_SLABS, old_taxable)

    # New regime (₹75k standard deduction only)
    new_taxable = gross - 75_000
    new_tax = calculate_tax_from_slabs(NEW_SLABS, new_taxable)

    # Add Section 87A rebate (₹7L for new, ₹5L for old)
    # Add surcharge, cess

    # Find unused deductions
    missing = find_missing_deductions(profile)

    return comparison
```

---

### 4. Life Event Financial Advisor

**File**: `finance/life_event.py`

**What It Does**: Handles 6 life events with deterministic allocation rules.

| Event | Allocation Logic |
|-------|-----------------|
| **Bonus** | High-interest debt (>18%) → Emergency fund → 80C → Equity |
| **Inheritance** | Emergency fund → Debt clearance (>10%) → Term insurance → STP |
| **Marriage** | Insurance gap analysis + HRA optimization + Nominations |
| **New Baby** | Education fund (₹30L @ 6% inflation) + Emergency fund boost |
| **Job Loss** | Runway calculation (emergency ÷ expenses) + Liquidity preservation |
| **Home Purchase** | 20% down payment + 3% stamp duty + Section 24(b)/80C guidance |

**API**: `POST /api/life-event`

**Engine Logic** (Bonus example):
```python
def allocate_bonus(profile: UserProfile, amount: float) -> LifeEventAllocation:
    allocations = []
    remaining = amount

    # Priority 1: Clear high-interest debt (>18% unsecured)
    high_interest_debt = sum(d.outstanding for d in profile.debts
                              if d.interest_rate > 18 and not d.is_secured)
    if high_interest_debt > 0:
        to_debt = min(remaining * 0.50, high_interest_debt)
        allocations.append(("Debt Clearance", to_debt))
        remaining -= to_debt

    # Priority 2: Top up emergency fund (if < 6 months)
    ef_gap = (profile.monthly_expenses * 6) - profile.emergency_fund
    if ef_gap > 0:
        to_ef = min(remaining * 0.30, ef_gap)
        allocations.append(("Emergency Fund", to_ef))
        remaining -= to_ef

    # Priority 3: Tax-saving (80C unused)
    unused_80c = 150_000 - profile.tax_deductions.section_80c
    to_tax = min(remaining * 0.20, unused_80c)
    allocations.append(("Tax-Saving (80C)", to_tax))
    remaining -= to_tax

    # Remaining → Long-term equity
    allocations.append(("Long-term Equity", remaining))

    # Calculate tax impact (bonus is taxed at slab rate)
    tax_impact = calculate_additional_tax(profile, amount)

    return LifeEventAllocation(allocations, tax_impact, ...)
```

---

### 5. Couple's Money Planner

**File**: `finance/couple.py`

**What It Does**: India's first AI-powered joint financial optimization.

**Optimizations**:
1. **HRA Benefit**: Calculates who should claim HRA (metro vs non-metro)
2. **NPS Matching**: Both partners max out 80CCD(1B) for ₹50k deduction each
3. **SIP Split**: Proportional to investable surplus (after expenses + EMIs)
4. **Joint Tax Saving**: Combined 80C/80D optimization across both incomes
5. **Insurance Review**: Adequate term + health coverage for family

**API**: `POST /api/couple-planner`

**Engine Logic**:
```python
def optimise_couple_finances(couple: CoupleProfile) -> CoupleOptimisation:
    a, b = couple.partner_a, couple.partner_b

    # 1. HRA optimization (metro = 50% of rent, non-metro = 40%)
    hra_a = calculate_hra_benefit(a, is_metro=(a.city in METROS))
    hra_b = calculate_hra_benefit(b, is_metro=(b.city in METROS))
    better_claimant = "partner_a" if hra_a > hra_b else "partner_b"
    hra_savings = max(hra_a, hra_b)

    # 2. NPS matching (₹50k each × marginal tax rate)
    unused_nps_a = 50_000 - a.tax_deductions.nps_80ccd_1b
    unused_nps_b = 50_000 - b.tax_deductions.nps_80ccd_1b
    nps_benefit = (unused_nps_a * marginal_rate_a) + (unused_nps_b * marginal_rate_b)

    # 3. SIP split (proportional to surplus)
    surplus_a = a.monthly_gross_income - a.monthly_expenses - a.total_emi
    surplus_b = b.monthly_gross_income - b.monthly_expenses - b.total_emi
    total_surplus = surplus_a + surplus_b

    sip_a = (surplus_a / total_surplus) * target_monthly_sip
    sip_b = (surplus_b / total_surplus) * target_monthly_sip

    # 4. Joint tax saving (both at max deductions)
    joint_tax_saving = calculate_joint_tax_optimization(a, b)

    # 5. Combined net worth
    net_worth = (a.assets.total - sum(d.outstanding for d in a.debts)) + \
                (b.assets.total - sum(d.outstanding for d in b.debts))

    return CoupleOptimisation(...)
```

---

### 6. Mutual Fund Portfolio X-Ray

**File**: `finance/mf_xray.py`

**What It Does**: Analyzes CAMS/KFintech statement in <10 seconds.

**Outputs**:
- **XIRR**: True annualized return across all cash flows
- **Overlap Analysis**: Detects duplicate holdings (e.g., HDFC Top 100 + Axis Bluechip = 65% overlap)
- **Category Breakdown**: Large Cap, Mid Cap, Small Cap, Debt, Hybrid, Index
- **Expense Ratio Drag**: Identifies high-TER funds (Regular vs Direct plans)
- **Rebalancing Suggestions**: Consolidation, direct plan switch, gap filling

**API**: `POST /api/mf-xray` (multipart/form-data file upload)

**Engine Logic**:
```python
def analyse_portfolio(holdings: list, cash_flows: list) -> MFXRayResult:
    # 1. Calculate XIRR (scipy.optimize.brentq)
    overall_xirr = compute_xirr(cash_flows)

    # 2. Infer categories from fund names
    for holding in holdings:
        holding.category = _infer_category(holding.fund_name)
        # "HDFC Top 100" → "Large Cap"
        # "Axis Liquid Fund" → "Liquid"

    # 3. Detect overlap (same category = potential duplication)
    overlaps = detect_overlap(holdings)
    # Example: {fund_a: "HDFC Top 100", fund_b: "Axis Bluechip",
    #           overlap_pct: 65, common_stocks: ["HDFC Bank", "ICICI"]}

    # 4. Category breakdown
    category_breakdown = {
        "Large Cap": sum(h.current_value for h in holdings if h.category == "Large Cap"),
        "Debt": sum(h.current_value for h in holdings if h.category == "Debt"),
        # ...
    }

    # 5. High-expense funds (Regular plans: TER ~2%, Direct: TER ~0.5%)
    high_expense = [h for h in holdings if "Regular" in h.fund_name]

    # 6. Rebalancing suggestions
    suggestions = generate_rebalancing_suggestions(holdings, profile.risk_profile)

    return MFXRayResult(
        total_invested=sum(cf.amount for cf in cash_flows if cf.amount > 0),
        total_current_value=sum(h.current_value for h in holdings),
        overall_xirr=overall_xirr,
        holdings=holdings,
        overlapping_pairs=overlaps,
        category_breakdown=category_breakdown,
        high_expense_funds=high_expense,
        rebalancing_suggestions=suggestions,
    )
```

**XIRR Calculation**:
```python
def compute_xirr(cash_flows: list[CashFlow]) -> float:
    """
    Extended Internal Rate of Return via Newton-Raphson method.
    cash_flows = [(date, amount), ...] where amount < 0 for investments
    """
    from scipy.optimize import brentq

    def npv(rate):
        return sum(cf.amount / (1 + rate) ** ((cf.date - today).days / 365)
                   for cf in cash_flows)

    try:
        xirr = brentq(npv, -0.99, 10.0)  # Search between -99% and 1000%
        return xirr * 100  # Convert to percentage
    except ValueError:
        # Fallback to numpy_financial.irr if brentq fails
        return numpy_irr(cash_flows) * 100
```

---

## 🤖 The 4 Agents Explained

### 1. IntakeAgent (`agents/intake_agent.py`)

**Role**: First line of defense - validates and enriches user input.

**What It Does**:
- Checks for required fields (age, income, expenses)
- Validates cross-field constraints (expenses ≤ income, retirement_age > age)
- Fills Indian defaults:
  - Emergency fund target: 6 months
  - Insurance: 10× annual income for term, ₹5L for health
  - Risk profile: moderate (if not specified)
  - Retirement age: 60

**Fallback**: If LLM unavailable, falls back to Pydantic validation.

```python
async def run_intake_agent(raw_data: dict) -> tuple[UserProfile, list[str]]:
    try:
        # Ask LLM to validate and enrich
        messages = [{"role": "system", "content": _SYSTEM_PROMPT}, ...]
        result = await structured_chat(messages)
        profile = UserProfile.model_validate(result["profile"])
        return profile, result["validation_notes"]
    except LLMUnavailableError:
        # Direct Pydantic validation (no enrichment)
        profile = UserProfile.model_validate(raw_data)
        return profile, ["LLM unavailable — direct validation used."]
```

---

### 2. MentorAgent (`agents/mentor_agent.py`)

**Role**: Translates engine numbers into human-friendly, India-specific advice.

**System Prompt**:
```
You are an India-specific financial education mentor.

Persona:
- Knowledgeable, warm, direct — like a trusted CA friend
- Reference Indian instruments: PPF, ELSS, NPS, EPF, FD, MF SIPs
- SEBI-compliant: educational only, NO specific stock picks
- Never invent numbers — only use provided JSON

Output format:
{
  "summary": "2-3 sentence overview",
  "key_actions": ["Action 1", "Action 2", ...],  // 3-5 items
  "risks": ["Risk 1", ...],  // 2-3 items
  "disclaimer": "Standard SEBI disclaimer"
}
```

**Example Output** (Health Score):
```json
{
  "summary": "Your money health score of 78.6 (Grade B) shows solid fundamentals. Emergency fund is excellent at 6 months coverage. The main gap is zero equity allocation — you're missing out on long-term wealth creation.",
  "key_actions": [
    "Start a ₹10,000/month SIP in diversified equity mutual funds (ELSS for tax savings)",
    "Max out Section 80C (₹1,00,000 unused) via PPF or NPS",
    "Review term insurance — ₹1Cr coverage recommended at your age"
  ],
  "risks": [
    "100% cash/savings accounts means inflation erodes wealth over time",
    "No equity exposure = missing 10-12% historical returns"
  ],
  "disclaimer": "This is for educational purposes only..."
}
```

---

### 3. GuardrailAgent (`agents/guardrail_agent.py`)

**Role**: Final SEBI compliance pass before response goes to user.

**What It Checks**:
1. **Stock Picks**: Flags "buy HDFC", "invest in Reliance"
2. **Guaranteed Returns**: Removes "guaranteed 12% returns", "assured returns"
3. **Number Mismatches**: Verifies LLM didn't hallucinate numbers
4. **Missing Disclaimer**: Adds standard disclaimer if missing

**Banned Patterns** (regex):
```python
_BANNED_PATTERNS = [
    r"\bguarantee[d]? return[s]?\b",  # "guaranteed returns"
    r"\bassure[d]? return[s]?\b",     # "assured returns"
    r"\b\d{1,2}% guaranteed\b",       # "12% guaranteed"
    r"\b(buy|invest in) (HDFC|ICICI|SBI|Reliance|TCS|...)\b",  # Stock tickers
]
```

**Sanitization** (if banned pattern found):
```python
# Before: "You'll get guaranteed 12% returns"
# After:  "You'll get historical 12% returns"

# Before: "Invest in HDFC Top 100 Fund"
# After:  [REMOVED] "Consider large-cap equity funds"
```

**Fallback**: If LLM unavailable, runs deterministic regex-based sanitization.

---

### 4. Feature-Specific Agents

#### LifeEventAgent (`agents/life_event_agent.py`)
- Takes allocations from `finance/life_event.py`
- Generates narrative: "Your ₹5L bonus will incur ~₹1.5L tax..."

#### CoupleAgent (`agents/couple_agent.py`)
- Takes optimization results from `finance/couple.py`
- Generates joint advice: "Partner A should claim HRA to save ₹84k..."

#### MFXRayAgent (`agents/mf_xray_agent.py`)
- Takes portfolio analysis from `finance/mf_xray.py`
- Generates rebalancing advice: "Switch Regular plans to Direct to save 1.5% p.a."

---

## 📦 Data Schemas (Pydantic Models)

**File**: `models/schemas.py`

### Core Models

```python
class UserProfile(BaseModel):
    # Demographics
    age: int = Field(..., ge=18, le=70)
    city: str
    employment_type: EmploymentType = EmploymentType.SALARIED
    dependents: int = Field(0, ge=0, le=10)

    # Income & Expenses
    monthly_gross_income: float
    monthly_expenses: float
    emergency_fund: float = 0.0

    # Assets & Debts
    assets: AssetAllocation = Field(default_factory=AssetAllocation)
    debts: list[DebtItem] = []

    # Insurance & Tax
    insurance: InsuranceCoverage = Field(default_factory=InsuranceCoverage)
    tax_deductions: TaxDeductions = Field(default_factory=TaxDeductions)

    # Goals
    retirement_age: int = Field(60, ge=30, le=70)
    risk_profile: RiskProfile = RiskProfile.MODERATE
    goals: list[Goal] = []

    @model_validator(mode="after")
    def validate_cross_fields(self) -> UserProfile:
        if self.monthly_expenses > self.monthly_gross_income:
            raise ValueError("Expenses cannot exceed income")
        if self.retirement_age <= self.age:
            raise ValueError("Retirement age must be greater than current age")
        return self
```

### Result Models

```python
class MoneyHealthResult(BaseModel):
    overall_score: float
    grade: str  # A, B, C, D, F
    dimensions: list[DimensionScore]  # 6 dimensions
    monthly_surplus: float
    total_net_worth: float

class FIREPlan(BaseModel):
    fi_corpus_required: float
    current_corpus: float
    corpus_gap: float
    required_monthly_sip: float
    required_stepup_sip: float
    projected_fi_age: Optional[float]
    years_to_fi: float
    on_track: bool
    sip_goals: list[SIPGoal]

class TaxRegimeComparison(BaseModel):
    gross_income: float
    old_regime_tax: float
    new_regime_tax: float
    recommended_regime: TaxRegime
    savings_by_switching: float
    missing_deductions: list[str]
    deduction_potential: float

class LifeEventAllocation(BaseModel):
    event_type: LifeEventType
    event_amount: float
    tax_impact: float
    allocations: list[AllocationItem]
    insurance_gaps: list[str]
    priority_actions: list[str]

class CoupleOptimisation(BaseModel):
    combined_net_worth: float
    combined_monthly_surplus: float
    better_hra_claimant: str
    hra_savings: float
    nps_matching_benefit: float
    partner_a_sip: float
    partner_b_sip: float
    joint_tax_saving: float
    recommendations: list[str]

class MFXRayResult(BaseModel):
    total_invested: float
    total_current_value: float
    overall_xirr: float
    holdings: list[Holding]
    overlapping_pairs: list[OverlapPair]
    category_breakdown: dict[str, float]
    high_expense_funds: list[str]
    rebalancing_suggestions: list[str]
```

---

## 🔌 Infrastructure Layer

### 1. LLM Client (`core/llm_client.py`)

**Provider-Agnostic Design**: Switch LLMs with a single env var.

```python
# Abstract base
class BaseLLMProvider(ABC):
    @abstractmethod
    async def complete(self, messages, *, temperature, max_tokens, json_mode) -> str:
        pass

# Groq implementation
class GroqProvider(BaseLLMProvider):
    async def complete(self, messages, **kwargs) -> str:
        response = await self._client.chat.completions.create(...)
        return response.choices[0].message.content

# Gemini implementation
class GeminiProvider(BaseLLMProvider):
    async def complete(self, messages, **kwargs) -> str:
        response = await self._client.generate_content_async(...)
        return response.text

# Public API (used by all agents)
async def chat_completion(messages: list[dict]) -> str:
    provider = get_provider()  # Reads LLM_PROVIDER from .env
    return await provider.complete(messages, ...)

async def structured_chat(messages: list[dict]) -> dict:
    raw = await chat_completion(messages)
    return json.loads(strip_markdown_fences(raw))
```

**Adding a New Provider** (e.g., OpenAI):
```python
class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        from openai import AsyncOpenAI
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def complete(self, messages, **kwargs):
        response = await self._client.chat.completions.create(
            model="gpt-4", messages=messages, **kwargs
        )
        return response.choices[0].message.content

# Register in get_provider()
def get_provider() -> BaseLLMProvider:
    if settings.LLM_PROVIDER == "groq":
        return GroqProvider()
    elif settings.LLM_PROVIDER == "gemini":
        return GeminiProvider()
    elif settings.LLM_PROVIDER == "openai":
        return OpenAIProvider()
```

Then set `LLM_PROVIDER=openai` in `.env`. **No agent code changes needed!**

---

### 2. Voice Layer (`core/voice.py`)

**Sarvam AI Integration**: STT (Saaras) + TTS (Bulbul) for Indian languages.

```python
class SarvamVoiceClient:
    def __init__(self):
        self._base_url = "https://api.sarvam.ai"
        self._api_key = settings.SARVAM_API_KEY

    async def speech_to_text(self, audio_bytes: bytes, language_code: str = "en-IN") -> str:
        """Convert speech to text (supports 10+ Indian languages)"""
        response = await httpx.post(
            f"{self._base_url}/speech-to-text",
            files={"file": audio_bytes},
            data={"language_code": language_code},
        )
        return response.json()["transcript"]

    async def text_to_speech(self, text: str, voice: str = "meera", language_code: str = "en-IN") -> bytes:
        """Convert text to speech (returns WAV audio bytes)"""
        # Sarvam has 490-char limit per request
        chunks = split_text_at_sentences(text, max_chars=490)

        audio_chunks = []
        for chunk in chunks:
            response = await httpx.post(
                f"{self._base_url}/text-to-speech",
                json={"text": chunk, "voice": voice, "language_code": language_code},
            )
            audio_chunks.append(response.content)

        # Concatenate WAV files
        return concatenate_wav_bytes(audio_chunks)
```

**Available Voices**:
- `meera` (female, en-IN) — neutral professional
- `pavithra` (female, hi) — warm conversational
- `arvind` (male, en-IN) — authoritative
- `amol` (male, hi) — friendly

---

### 3. Database (`db/session_store.py`)

**SQLite with SQLAlchemy async**:

```python
# Engine setup
engine = create_async_engine(
    "sqlite+aiosqlite:///./money_mentor.db",
    echo=False
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Tables
class Session(Base):
    __tablename__ = "sessions"
    id = Column(String(36), primary_key=True)
    created_at = Column(DateTime(timezone=True))
    feature = Column(String(64))  # "health_score", "fire_planner", etc.
    state_json = Column(Text)  # For multi-turn context

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), ForeignKey("sessions.id"))
    agent_name = Column(String(64))  # "IntakeAgent", "MentorAgent", etc.
    step = Column(String(128))  # "Profile validated", "Advice generated"
    input_json = Column(Text)  # Truncated to 10k chars
    output_json = Column(Text)  # Truncated to 10k chars
    timestamp = Column(DateTime(timezone=True))

# Repository functions
async def create_session(feature: str) -> str:
    session_id = str(uuid.uuid4())
    async with AsyncSessionLocal() as db:
        session = Session(id=session_id, feature=feature)
        db.add(session)
        await db.commit()
    return session_id

async def append_log(session_id: str, agent_name: str, step: str, input_data, output_data) -> dict:
    entry = {
        "agent": agent_name,
        "step": step,
        "timestamp": datetime.now(UTC).isoformat(),
        "input_summary": _summarise(input_data),  # First 300 chars
        "output_summary": _summarise(output_data),
    }

    # Save full data to DB (truncated to 10k chars)
    async with AsyncSessionLocal() as db:
        log = AgentLog(
            session_id=session_id,
            agent_name=agent_name,
            step=step,
            input_json=json.dumps(input_data)[:10_000],
            output_json=json.dumps(output_data)[:10_000],
        )
        db.add(log)
        await db.commit()

    return entry  # For decision_log in response
```

---

### 4. Configuration (`core/config.py`)

**Pydantic Settings** (loads from `.env`):

```python
class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Money Mentor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # LLM Provider
    LLM_PROVIDER: Literal["groq", "gemini"] = "groq"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Voice (Sarvam AI)
    SARVAM_API_KEY: str = ""
    SARVAM_DEFAULT_VOICE: str = "meera"
    SARVAM_DEFAULT_LANGUAGE: str = "en-IN"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./money_mentor.db"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Finance Engine Defaults
    DEFAULT_INFLATION_RATE: float = 0.06
    DEFAULT_EQUITY_RETURN: float = 0.12
    DEFAULT_DEBT_RETURN: float = 0.07
    DEFAULT_SAFE_WITHDRAWAL_RATE: float = 0.04
    DEFAULT_STEPUP_RATE: float = 0.10
    EMERGENCY_FUND_MONTHS: int = 6

    @property
    def cors_origins(self) -> list[str]:
        return [s.strip() for s in self.ALLOWED_ORIGINS.split(",")]

    model_config = SettingsConfigDict(env_file=".env")

# Global singleton
settings = Settings()
```

**Usage**:
```python
from core.config import settings

if settings.DEBUG:
    print("Running in debug mode")

sip_return = settings.DEFAULT_EQUITY_RETURN  # 0.12 (12%)
```

---

## 🎯 What Makes This Special

### 1. India-First Design

**Tax Constants** (FY 2025-26):
- Section 80C: ₹1.5L
- Section 80D: ₹25k (self), ₹50k (senior citizen)
- NPS 80CCD(1B): ₹50k
- Section 87A rebate: ₹7L (new regime), ₹5L (old regime)
- HRA: 50% metro, 40% non-metro

**Indian Instruments**:
- PPF, EPF, NPS (retirement)
- ELSS (tax-saving equity)
- FD, RD (safe debt)
- Term + Health insurance
- Mutual Fund SIPs

**SEBI Compliance**:
- No specific stock recommendations
- No guaranteed return claims
- Educational disclaimers on all advice

---

### 2. Hybrid Intelligence

```
┌───────────────────────────────────────────────────────┐
│  Numbers (Finance Engine)     Language (LLM Agents)  │
│  ━━━━━━━━━━━━━━━━━━━━━━━      ━━━━━━━━━━━━━━━━━━━━━  │
│  ✅ Deterministic               ✅ Natural language    │
│  ✅ Unit testable               ✅ Regional languages  │
│  ✅ Accurate                    ✅ Personalized        │
│  ✅ Auditable                   ✅ Context-aware       │
└───────────────────────────────────────────────────────┘
```

**Why this matters**:
- Users get **trustworthy calculations** (SIP amounts, tax figures)
- Users get **human-friendly advice** (not JSON dumps)
- Developers can **unit test** all math (no LLM secrets needed)

---

### 3. Full Audit Trail

Every request creates a `decision_log`:

```json
{
  "session_id": "uuid",
  "decision_log": [
    {
      "agent": "IntakeAgent",
      "step": "Profile validated",
      "timestamp": "2026-03-26T10:30:00Z",
      "input_summary": "age: 28, income: 100000, ...",
      "output_summary": "notes: Added retirement_age=60"
    },
    {
      "agent": "FinanceEngine",
      "step": "Health score calculated",
      "timestamp": "2026-03-26T10:30:01Z",
      "input_summary": "profile_income: 100000",
      "output_summary": "overall_score: 78.6, grade: B"
    },
    {
      "agent": "MentorAgent",
      "step": "Advice generated",
      "timestamp": "2026-03-26T10:30:03Z",
      "input_summary": "score: 78.6",
      "output_summary": "actions_count: 3"
    },
    {
      "agent": "GuardrailAgent",
      "step": "Compliance check",
      "timestamp": "2026-03-26T10:30:04Z",
      "input_summary": "advice_summary: You're doing well...",
      "output_summary": "status: PASS, issues: []"
    }
  ]
}
```

This is **critical for SEBI compliance** — you can prove exactly what advice was given.

---

### 4. Step-up SIP (30-40% Lower Initial Commitment)

Traditional (Flat) SIP:
```
Year 1-20: ₹15,000/month
Total: ₹36L invested → ₹1.1Cr corpus
```

Step-up SIP:
```
Year 1:  ₹9,200/month
Year 2:  ₹10,120/month (+10%)
Year 3:  ₹11,132/month (+10%)
...
Year 20: ₹57,000/month
Total: ₹36L invested → ₹1.1Cr corpus (same!)
```

**Why it works**: Matches Indian salary growth (typically 8-12% annual hikes).

---

### 5. Couple Optimization (First in India)

Most finance apps treat couples as two individuals. This engine **jointly optimizes**:

```
┌────────────────────────────────────────────────────┐
│  Partner A: ₹1.5L/mo salary in Mumbai (metro)     │
│  Partner B: ₹1.0L/mo salary in Mumbai (metro)     │
└────────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│  HRA Optimization                                  │
│  Partner A claims HRA → saves ₹84k/year           │
│  (Higher salary = higher HRA benefit)              │
└────────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│  NPS Matching                                      │
│  Both max out ₹50k NPS → ₹31k tax benefit         │
└────────────────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────┐
│  SIP Split (Proportional to surplus)               │
│  Partner A: ₹41k SIP (60% of combined surplus)    │
│  Partner B: ₹27k SIP (40% of combined surplus)    │
└────────────────────────────────────────────────────┘
```

---

## 🚀 API Quick Reference

| Endpoint | Method | Purpose | Key Input | Key Output |
|----------|--------|---------|-----------|------------|
| `/health` | GET | Health check | None | `{"status": "ok"}` |
| `/api/health-score` | POST | Money health score | age, income, expenses | 6-dimension score (0-100) |
| `/api/fire-planner` | POST | Retirement planning | age, retirement_age, goals | SIP amounts, FI age |
| `/api/tax-wizard` | POST | Tax optimization | income, deductions | Old vs new regime comparison |
| `/api/life-event` | POST | Life event guidance | event_type, amount | Allocation plan |
| `/api/couple-planner` | POST | Joint optimization | partner_a, partner_b | HRA, NPS, SIP splits |
| `/api/mf-xray` | POST | Portfolio analysis | CAMS/KFintech file | XIRR, overlap, rebalancing |
| `/api/chat` | POST | Multi-turn chat | session_id, message | Reply with context |
| `/api/chat/stream` | GET | SSE streaming chat | session_id, message | Token-by-token SSE |
| `/api/voice/stt` | POST | Speech-to-text | audio file | Transcript |
| `/api/voice/tts` | POST | Text-to-speech | text, voice | WAV audio bytes |
| `/api/voice/voices` | GET | List voices | None | Available voices |

---

## 🧪 Testing (91 Tests)

All tests are **deterministic** — no LLM/DB/network calls.

```python
# tests/test_finance.py
def test_required_monthly_sip(sample_profile):
    target = 5_000_000  # ₹50L
    current_corpus = 0
    rate = 0.12  # 12% equity
    years = 10

    sip = required_monthly_sip(target, current_corpus, rate, years)

    # Verify via FV calculation
    actual_corpus = future_value_sip(sip, rate, years)
    assert abs(actual_corpus - target) < 1000  # Within ₹1k tolerance

def test_tax_old_vs_new_regime():
    profile = UserProfile(
        age=30,
        city="Mumbai",
        monthly_gross_income=150_000,  # ₹18L/year
        monthly_expenses=60_000,
        tax_deductions=TaxDeductions(section_80c=150_000),  # Max 80C
    )

    result = compare_regimes(profile)

    # At ₹18L, new regime should be better
    assert result.recommended_regime == TaxRegime.NEW
    assert result.new_regime_tax < result.old_regime_tax
```

Run tests:
```bash
make test          # Full suite
make test-unit     # Finance tests only (fast)
make test-cov      # With HTML coverage report
```

---

## 🎓 Summary

The AI Money Mentor backend is:

1. **Production-Ready**: 4,441 lines of clean, tested code
2. **India-Specific**: FY 2025-26 tax laws, SEBI compliance, Indian instruments
3. **Hybrid Intelligence**: Trustworthy math + conversational AI
4. **Fully Auditable**: Every decision logged to database
5. **Voice-Enabled**: Sarvam AI for Indian languages
6. **Extensible**: Add new features by following the 4-agent pattern

**In One Sentence**:
> A FastAPI backend with 6 AI-powered financial planning features where all math is deterministic Python (no LLM) and AI only generates human-friendly advice in Indian languages with full SEBI compliance.

---

**For detailed API documentation, see**: [README.md](./README.md)

**For implementation guide, see**: [Design Decisions section in README.md](./README.md#design-decisions)
