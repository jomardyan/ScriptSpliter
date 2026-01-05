#!/usr/bin/env python3
"""Simple test script - no dependencies"""

import sys
import os

# Add path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("\n" + "=" * 70)
print("ScriptSpliter - Simple Test Suite")
print("=" * 70 + "\n")

passed = 0
failed = 0

# Test 1: Imports
print("[TEST 1] Importing modules...")
try:
    from script_spliter.parser import JavaScriptParser, CodeBlock
    from script_spliter.analyzer import DependencyAnalyzer
    from script_spliter.generator import ModuleGenerator, ModuleConfig
    from script_spliter.spliter import ScriptSpliter
    from script_spliter.config import ConfigLoader, GroupingBuilder
    print("✓ PASS: All imports successful\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1
    sys.exit(1)

# Test 2: Parser
print("[TEST 2] Parser - parse JavaScript...")
try:
    source = """
    function add(a, b) { return a + b; }
    const multiply = (a, b) => a * b;
    class Calculator { }
    """
    parser = JavaScriptParser(source)
    blocks = parser.parse()
    assert len(blocks) > 0, "No blocks parsed"
    names = {b.name for b in blocks if b.name}
    assert "add" in names, "Function 'add' not found"
    assert "multiply" in names, "Function 'multiply' not found"
    assert "Calculator" in names, "Class 'Calculator' not found"
    print(f"✓ PASS: Parsed {len(blocks)} blocks\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1

# Test 3: Analyzer
print("[TEST 3] Analyzer - dependency analysis...")
try:
    blocks = [
        CodeBlock("func1", "function", 0, 2, "function func1() {}"),
        CodeBlock("func2", "function", 4, 6, "function func2() { func1(); }", dependencies={"func1"}),
        CodeBlock("func3", "function", 8, 10, "function func3() { func2(); }", dependencies={"func2"}),
    ]
    analyzer = DependencyAnalyzer(blocks)
    order = analyzer.get_import_order()
    assert len(order) == 3, "Wrong import order length"
    assert order[0] == "func1", "func1 should be first"
    cycles = analyzer.detect_circular_dependencies()
    assert len(cycles) == 0, "Should have no circular deps"
    print(f"✓ PASS: Dependency analysis correct\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1

# Test 4: Generator
print("[TEST 4] Generator - ESM module generation...")
try:
    blocks = [
        CodeBlock("format", "function", 0, 2, "function format() {}"),
        CodeBlock("Button", "class", 4, 10, "class Button {}"),
    ]
    analyzer = DependencyAnalyzer(blocks)
    config = ModuleConfig(format="esm")
    generator = ModuleGenerator(blocks, analyzer, config)
    grouping = {"utils": ["format"], "components": ["Button"]}
    modules = generator.generate_modules(grouping)
    assert len(modules) == 2, f"Expected 2 modules, got {len(modules)}"
    assert "utils" in modules, "utils module missing"
    assert "components" in modules, "components module missing"
    assert "export" in modules["utils"], "ESM export missing"
    print(f"✓ PASS: Generated {len(modules)} ESM modules\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1

# Test 5: Config
print("[TEST 5] Configuration - default config...")
try:
    config = ConfigLoader.get_default_config()
    assert config.format == "esm", "Wrong default format"
    assert config.auto_group == True, "auto_group should be True"
    builder = GroupingBuilder()
    builder.add_group("g1", ["a", "b"])
    grouping = builder.get_grouping()
    assert "g1" in grouping, "g1 not in grouping"
    assert len(grouping["g1"]) == 2, "Wrong group size"
    print(f"✓ PASS: Configuration working\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1

# Test 6: ScriptSpliter
print("[TEST 6] ScriptSpliter - main class...")
try:
    import tempfile
    from pathlib import Path
    
    sample = """
    function test() { return 1; }
    class TestClass { }
    const helper = () => test();
    """
    
    with tempfile.TemporaryDirectory() as tmpdir:
        test_file = Path(tmpdir) / "test.js"
        with open(test_file, 'w') as f:
            f.write(sample)
        
        splitter = ScriptSpliter(str(test_file))
        assert len(splitter.blocks) > 0, "No blocks found"
        blocks = splitter.get_blocks_info()
        assert len(blocks) > 0, "No block info"
        analysis = splitter.get_analysis()
        assert len(analysis) > 0, "No analysis"
        
        output = Path(tmpdir) / "output"
        paths = splitter.split(
            output_dir=str(output),
            format='esm',
            auto_group=True,
            include_report=False
        )
        assert output.exists(), "Output dir not created"
        assert "index" in paths, "Index file missing"
        
    print(f"✓ PASS: ScriptSpliter working correctly\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1
    import traceback
    traceback.print_exc()

# Test 7: Edge cases
print("[TEST 7] Edge cases...")
try:
    import tempfile
    from pathlib import Path
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Empty file
        empty_file = Path(tmpdir) / "empty.js"
        with open(empty_file, 'w') as f:
            f.write("")
        splitter = ScriptSpliter(str(empty_file))
        assert len(splitter.blocks) == 0, "Empty file should have 0 blocks"
        
        # Large file
        large_js = "\n".join([f"function f{i}() {{ return {i}; }}" for i in range(50)])
        large_file = Path(tmpdir) / "large.js"
        with open(large_file, 'w') as f:
            f.write(large_js)
        splitter = ScriptSpliter(str(large_file))
        assert len(splitter.blocks) == 50, f"Expected 50 blocks, got {len(splitter.blocks)}"
        
    print(f"✓ PASS: Edge cases handled\n")
    passed += 1
except Exception as e:
    print(f"✗ FAIL: {e}\n")
    failed += 1

# Summary
print("=" * 70)
print(f"RESULTS: {passed} passed, {failed} failed")
print("=" * 70 + "\n")

if failed == 0:
    print("✓ ALL TESTS PASSED!")
    sys.exit(0)
else:
    print(f"✗ {failed} TEST(S) FAILED")
    sys.exit(1)
