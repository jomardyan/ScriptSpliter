.PHONY: help install dev-install uninstall clean lint format type-check test run analyze build docs

# Default target
help:
	@echo "ScriptSpliter - Makefile targets:"
	@echo ""
	@echo "Installation:"
	@echo "  make install         - Install the package"
	@echo "  make dev-install     - Install with development dependencies"
	@echo "  make uninstall       - Uninstall the package"
	@echo ""
	@echo "Development:"
	@echo "  make lint            - Run code linting (flake8)"
	@echo "  make format          - Format code with black and isort"
	@echo "  make type-check      - Run type checking with mypy"
	@echo "  make test            - Run tests with pytest"
	@echo "  make test-coverage   - Run tests with coverage report"
	@echo ""
	@echo "Building:"
	@echo "  make build           - Build distribution packages"
	@echo "  make clean           - Clean up build artifacts"
	@echo ""
	@echo "Usage:"
	@echo "  make run             - Run the CLI tool (requires input file)"
	@echo "  make analyze FILE=<file.js> - Analyze a JavaScript file"
	@echo ""
	@echo "Utilities:"
	@echo "  make freeze          - Generate frozen requirements"
	@echo "  make docs            - Generate documentation"
	@echo "  make check-all       - Run all checks (lint, type-check, test)"

# Installation targets
install:
	pip install -e .

dev-install:
	pip install -e ".[dev]"
	pip install -r requirements.txt

uninstall:
	pip uninstall -y script-spliter

# Linting and code quality
lint:
	flake8 script_spliter/ tests/ --max-line-length=100 --exclude=__pycache__

format:
	black script_spliter/ tests/ --line-length=100
	isort script_spliter/ tests/ --profile black --line-length=100

type-check:
	mypy script_spliter/ --python-version=3.8

# Testing
test:
	pytest tests/ -v

test-coverage:
	pytest tests/ -v --cov=script_spliter --cov-report=html --cov-report=term

# Building
build: clean
	python -m build

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	rm -rf .coverage
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete

# CLI usage
run:
	@if [ -z "$(INPUT)" ]; then \
		echo "Usage: make run INPUT=<file.js> [OPTIONS]"; \
		echo "Example: make run INPUT=sample.js OUTPUT=output/"; \
		exit 1; \
	fi
	script-spliter $(INPUT) $(if $(OUTPUT),-o $(OUTPUT),)

analyze:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make analyze FILE=<file.js>"; \
		exit 1; \
	fi
	script-spliter $(FILE) --analyze

blocks-info:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make blocks-info FILE=<file.js>"; \
		exit 1; \
	fi
	script-spliter $(FILE) --blocks-info

show-deps:
	@if [ -z "$(FILE)" ] || [ -z "$(BLOCK)" ]; then \
		echo "Usage: make show-deps FILE=<file.js> BLOCK=<blockName>"; \
		exit 1; \
	fi
	script-spliter $(FILE) --deps $(BLOCK)

# All checks
check-all: lint type-check test
	@echo "All checks passed!"

# Utilities
freeze:
	pip freeze > requirements-frozen.txt
	@echo "Frozen requirements saved to requirements-frozen.txt"

docs:
	@echo "Documentation is in README.md"
	@echo "View it with: cat README.md"

# Development workflow targets
setup: dev-install
	@echo "Development environment setup complete!"
	@echo "Run 'make check-all' to verify everything is working"

watch-test:
	@echo "Running tests in watch mode (requires pytest-watch)..."
	ptw tests/ -- -v

# Quick targets for common workflows
quick-split: build
	@echo "Ready to split JavaScript files!"
	@echo "Usage: make run INPUT=file.js OUTPUT=output/"
