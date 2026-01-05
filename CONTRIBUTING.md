# Contributing to ScriptSpliter

Thank you for your interest in contributing to ScriptSpliter! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ScriptSpliter.git
   cd ScriptSpliter
   ```

3. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install development dependencies**:
   ```bash
   pip install -e ".[dev]"
   ```

## Development Workflow

### Code Style

We use Black for code formatting and follow PEP 8 style guidelines.

Format your code before committing:
```bash
black script_spliter/
```

Check code quality with flake8:
```bash
flake8 script_spliter/
```

### Type Hints

Use type hints in your code. Check with mypy:
```bash
mypy script_spliter/
```

### Testing

Add tests for new features. Run the test suite:
```bash
python -m pytest
```

## Reporting Issues

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Python version and OS
- Minimal code example

## Submitting Pull Requests

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "Add feature: brief description"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a pull request** with:
   - Clear title and description
   - Reference to any related issues
   - Explanation of changes
   - Tests for new functionality

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new code
- Update documentation if needed
- Ensure all tests pass
- Follow the existing code style
- Keep commit history clean

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Open an issue or discussion on GitHub. We're here to help!
