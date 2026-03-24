"""
core/config.py
Central configuration — all env vars loaded once here.
Import `settings` everywhere; never read os.environ directly.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    APP_NAME: str = "AI Money Mentor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS — comma-separated origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./money_mentor.db"

    # LLM provider selection
    LLM_PROVIDER: str = "groq"            # "groq" | "gemini"

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MAX_TOKENS: int = 2048
    GROQ_TEMPERATURE: float = 0.3

    # Gemini (only needed if LLM_PROVIDER=gemini)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash-preview"

    # Finance defaults (India-specific)
    DEFAULT_INFLATION_RATE: float = 0.06  # 6% p.a.
    DEFAULT_EQUITY_RETURN: float = 0.12  # 12% p.a.
    DEFAULT_DEBT_RETURN: float = 0.07  # 7% p.a.
    DEFAULT_SAFE_WITHDRAWAL_RATE: float = 0.04  # 4% SWR
    EMERGENCY_FUND_MONTHS: int = 6
    STANDARD_DEDUCTION_NEW: int = 75_000  # FY 2025-26
    STANDARD_DEDUCTION_OLD: int = 50_000

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
