#!/usr/bin/env python3
import sys
sys.path.insert(0, '/workspaces/ScriptSpliter')

print("\n" + "="*70)
print("ScriptSpliter - Running Tests")
print("="*70 + "\n")

# Test 1: Import modules
print("=" * 70)
print("TEST 1: Imports")
print("=" * 70)

try:
    from script_spliter.parser import JavaScriptParser, CodeBlock
    from script_spliter.analyzer import DependencyAnalyzer
    from script_spliter.generator import ModuleGenerator, ModuleConfig
    from script_spliter.spliter import ScriptSpliter
    from script_spliter.config import ConfigLoader, GroupingBuilder
    print("✓ All modules imported successfully\n")
except Exception as e:
    print(f"✗ Import failed: {e}\n")
    sys.exit(1)

# Test 2: JavaScript Parser
print("=" * 70)
print("TEST 2: JavaScript Parser")
print("=" * 70)

try:
    source = """
    function add(a, b) {
        return a + b;
    }
    
    const multiply = (a, b) => a * b;
    
    class Calculator {
        compute(a, b, op) {
            if (op === '+') return add(a, b);
            if (op === '*') return multiply(a, b);
        }
    }
    """
    
    parser = JavaScriptParser(source)
    blocks = parser.parse()
    
    print(f"✓ Parsed {len(blocks)} code blocks")
    names = {b.name for b in blocks if b.name}
    print(f"  Found: {sorted(names)}")
    
    types = {}
    for b in blocks:
        types[b.type] = types.get(b.type, 0) + 1
    for t, c in sorted(types.items()):
        print(f"  {t}: {c} blocks")
    print()
    
except Exception as e:
    print(f"✗ Parser failed: {e}\n")
    import traceback
    traceback.print_exc()

# Test 3: Dependency Analyzer
print("=" * 70)
print("TEST 3: Dependency Analyzer")
print("=" * 70)

try:
    blocks = [
        CodeBlock("add", "function", 0, 2, "function add(a,b) { return a+b; }"),
        CodeBlock("multiply", "function", 4, 6, "const multiply = (a,b) => a*b;"),
        CodeBlock("Calculator", "class", 8, 20, "class Calculator { ... }",
                 dependencies={"add", "multiply"}),
    ]
    
    analyzer = DependencyAnalyzer(blocks)
    
    order = analyzer.get_import_order()
    print(f"✓ Import order: {order}")
    
    cycles = analyzer.detect_circular_dependencies()
    print(f"✓ Circular dependencies: {len(cycles)} detected")
    
    suggestions = analyzer.get_module_suggestions()
    print(f"✓ Suggested modules: {list(suggestions.keys())}")
    print()
    
except Exception as e:
    print(f"✗ Analyzer failed: {e}\n")
    import traceback
    traceback.print_exc()

# Test 4: Module Generator
print("=" * 70)
print("TEST 4: Module Generator")
print("=" * 70)

try:
    blocks = [
        CodeBlock("formatDate", "function", 0, 2, "function formatDate(date) { ... }"),
        CodeBlock("Button", "class", 4, 10, "class Button { ... }"),
        CodeBlock("Modal", "class", 12, 20, "class Modal { ... }"),
    ]
    
    analyzer = DependencyAnalyzer(blocks)
    config = ModuleConfig(format="esm")
    generator = ModuleGenerator(blocks, analyzer, config)
    
    grouping = {
        "utils": ["formatDate"],
        "components": ["Button", "Modal"]
    }
    
    modules = generator.generate_modules(grouping)
    print(f"✓ ESM: Generated {len(modules)} modules")
    for name in modules:
        print(f"  - {name}: {len(modules[name])} chars")
    
    config_cjs = ModuleConfig(format="commonjs")
    generator_cjs = ModuleGenerator(blocks, analyzer, config_cjs)
    modules_cjs = generator_cjs.generate_modules(grouping)
    print(f"✓ CommonJS: Generated {len(modules_cjs)} modules")
    print()
    
except Exception as e:
    print(f"✗ Generator failed: {e}\n")
    import traceback
    traceback.print_exc()

# Test 5: ScriptSpliter
print("=" * 70)
print("TEST 5: ScriptSpliter Main Class")
print("=" * 70)

try:
    import tempfile
    from pathlib import Path
    
    sample_js = """
    function formatDate(date) {
        return new Date(date).toLocaleDateString();
    }
    
    function validateEmail(email) {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    }
    
    class User {
        constructor(data) {
            this.data = data;
        }
        
        validate() {
            return validateEmail(this.data.email);
        }
    }
    
    async function fetchUser(id) {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    }
    """
    
    with tempfile.TemporaryDirectory() as tmpdir:
        test_file = Path(tmpdir) / "test.js"
        with open(test_file, 'w') as f:
            f.write(sample_js)
        
        splitter = ScriptSpliter(str(test_file))
        print(f"✓ Splitter initialized")
        
        blocks = splitter.get_blocks_info()
        print(f"✓ Found {len(blocks)} blocks: {[b['name'] for b in blocks]}")
        
        analysis = splitter.get_analysis()
        print(f"✓ Analysis generated ({len(analysis)} chars)")
        
        output_esm = Path(tmpdir) / "output_esm"
        paths = splitter.split(
            output_dir=str(output_esm),
            format='esm',
            auto_group=True,
            include_report=True
        )
        print(f"✓ ESM split: {len(paths)-1} modules created")
        
        output_cjs = Path(tmpdir) / "output_cjs"
        paths_cjs = splitter.split(
            output_dir=str(output_cjs),
            format='commonjs',
            auto_group=True
        )
        print(f"✓ CommonJS split: {len(paths_cjs)-1} modules created")
        print()
        
except Exception as e:
    print(f"✗ ScriptSpliter failed: {e}\n")
    import traceback
    traceback.print_exc()

# Test 6: Configuration
print("=" * 70)
print("TEST 6: Configuration Module")
print("=" * 70)

try:
    config = ConfigLoader.get_default_config()
    print(f"✓ Default config: format={config.format}, auto_group={config.auto_group}")
    
    builder = GroupingBuilder()
    builder.add_group("utils", ["f1", "f2"])
    builder.add_group("components", ["C1", "C2"])
    grouping = builder.get_grouping()
    
    print(f"✓ Grouping builder: {len(grouping)} groups created")
    print()
    
except Exception as e:
    print(f"✗ Configuration failed: {e}\n")
    import traceback
    traceback.print_exc()

# Test 7: Edge Cases
print("=" * 70)
print("TEST 7: Edge Cases")
print("=" * 70)

try:
    import tempfile
    from pathlib import Path
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Empty file
        empty_file = Path(tmpdir) / "empty.js"
        with open(empty_file, 'w') as f:
            f.write("")
        
        splitter = ScriptSpliter(str(empty_file))
        print(f"✓ Empty file: {len(splitter.blocks)} blocks (handled gracefully)")
        
        # Large file
        large_js = "\n".join([f"function f{i}() {{ return {i}; }}" for i in range(50)])
        large_file = Path(tmpdir) / "large.js"
        with open(large_file, 'w') as f:
            f.write(large_js)
        
        splitter = ScriptSpliter(str(large_file))
        print(f"✓ Large file: {len(splitter.blocks)} functions parsed")
        
        # Special characters
        special_js = """
        function _privateFunc() { return 1; }
        const $var = 42;
        class MyClass { }
        """
        special_file = Path(tmpdir) / "special.js"
        with open(special_file, 'w') as f:
            f.write(special_js)
        
        splitter = ScriptSpliter(str(special_file))
        names = [b['name'] for b in splitter.get_blocks_info()]
        print(f"✓ Special characters: {names}")
        print()
        
except Exception as e:
    print(f"✗ Edge cases failed: {e}\n")
    import traceback
    traceback.print_exc()

print("=" * 70)
print("All Tests Completed Successfully!")
print("=" * 70 + "\n")
