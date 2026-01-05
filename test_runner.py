#!/usr/bin/env python3
"""
Test runner and verification script for ScriptSpliter
"""

import sys
import unittest
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_tests():
    """Run all tests and display results."""
    
    # Import test module
    import tests
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(tests.TestJavaScriptParser))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestDependencyAnalyzer))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestModuleGenerator))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestConfigLoader))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestCodeAnalysisReport))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestEdgeCases))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestScriptSpliter))
    suite.addTests(loader.loadTestsFromTestCase(tests.TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("ScriptSpliter - Comprehensive Test Suite")
    print("=" * 70 + "\n")
    
    result = run_tests()
    
    # Print summary
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("=" * 70 + "\n")
    
    # Exit with appropriate code
    sys.exit(0 if result.wasSuccessful() else 1)
