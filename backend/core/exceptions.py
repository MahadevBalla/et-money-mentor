"""
core/exceptions.py
All custom exceptions for the application.
Centralising here prevents scattered try/except anti-patterns.
"""


class MoneyMentorError(Exception):
    """Base exception for all domain errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class ValidationError(MoneyMentorError):
    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR")


class FinanceEngineError(MoneyMentorError):
    def __init__(self, message: str):
        super().__init__(message, code="FINANCE_ENGINE_ERROR")


class AgentError(MoneyMentorError):
    def __init__(self, message: str):
        super().__init__(message, code="AGENT_ERROR")


class LLMUnavailableError(AgentError):
    """Raised when Groq/LLM API is down — triggers graceful degradation."""

    def __init__(self):
        super().__init__("LLM service temporarily unavailable. Returning deterministic results.")


class AuthenticationError(MoneyMentorError):
    """Raised when authentication fails (invalid token, expired, etc.)."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, code="AUTHENTICATION_ERROR")


class AuthorizationError(MoneyMentorError):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, code="AUTHORIZATION_ERROR")


class UserAlreadyExistsError(MoneyMentorError):
    """Raised when trying to create a user with an existing email."""

    def __init__(self, email: str):
        super().__init__(f"User with email {email} already exists", code="USER_ALREADY_EXISTS")


class InvalidCredentialsError(MoneyMentorError):
    """Raised when login credentials are incorrect."""

    def __init__(self):
        super().__init__("Invalid email or password", code="INVALID_CREDENTIALS")


class TokenExpiredError(MoneyMentorError):
    """Raised when a token (refresh, verification, etc.) has expired."""

    def __init__(self, message: str = "Token has expired"):
        super().__init__(message, code="TOKEN_EXPIRED")


class InvalidTokenError(MoneyMentorError):
    """Raised when a token is invalid or malformed."""

    def __init__(self, message: str = "Invalid token"):
        super().__init__(message, code="INVALID_TOKEN")
