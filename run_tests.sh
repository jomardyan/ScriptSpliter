#!/bin/bash
set -e

echo "=========================================="
echo "ScriptSpliter - Comprehensive Test Suite"
echo "=========================================="
echo ""

# Check Python version
echo "Python version:"
python3 --version
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -q regex PyYAML 2>/dev/null || true
echo "✓ Dependencies installed"
echo ""

# Install package
echo "Installing ScriptSpliter..."
pip install -q -e . 2>/dev/null || true
echo "✓ Package installed"
echo ""

# Run tests
echo "Running tests..."
echo "=========================================="
python3 -m unittest tests.TestJavaScriptParser -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestDependencyAnalyzer -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestModuleGenerator -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestConfigLoader -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestCodeAnalysisReport -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestEdgeCases -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestScriptSpliter -v
echo "=========================================="
echo ""

echo "=========================================="
python3 -m unittest tests.TestIntegration -v
echo "=========================================="
echo ""

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="
