# Makefile — AI Money Mentor Backend
# Usage: make <target>
# Requires: uv (https://docs.astral.sh/uv/)

.PHONY: help install dev test lint clean reset-db

PYTHON := uv run python
UVICORN := uv run uvicorn

help:
	@echo ""
	@echo "  AI Money Mentor — Backend"
	@echo ""
	@echo "  make install     Install all dependencies"
	@echo "  make dev         Start dev server with hot reload"
	@echo "  make test        Run all tests"
	@echo "  make test-unit   Run only finance engine tests (no LLM/DB)"
	@echo "  make lint        Run ruff linter"
	@echo "  make reset-db    Delete local SQLite DB (fresh start)"
	@echo "  make clean       Remove __pycache__ and .pytest_cache"
	@echo ""

install:
	cp -n .env.example .env || true
	uv sync

dev:
	$(UVICORN) main:app --reload --port 8000

dev-prod:
	$(UVICORN) main:app --host 0.0.0.0 --port 8000 --workers 2

test:
	uv run pytest tests/ -v

test-unit:
	uv run pytest tests/test_finance.py -v

test-cov:
	uv run pytest tests/ -v --cov=. --cov-report=term-missing

lint:
	uv run ruff check . --fix

reset-db:
	rm -f money_mentor.db
	@echo "Database reset. Will be recreated on next startup."

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "Cleaned."
