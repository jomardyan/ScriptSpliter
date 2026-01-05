"""
Direct functional test demonstrations for ScriptSpliter
This file contains tests that can be run directly without unittest framework
"""

import sys
import tempfile
from pathlib import Path

# Test utilities
def test_header(name):
    """Print test header."""
    print(f"\n{'='*70}")
    print(f"TEST: {name}")
    print('='*70)

def test_pass(message):
    """Print passing test."""
    print(f"✓ {message}")

def test_fail(message):
    """Print failing test."""
    print(f"✗ {message}")
    
def test_info(message):
    """Print test info."""
    print(f"  → {message}")

# Import modules
try:
    from script_spliter.parser import JavaScriptParser, CodeBlock
    from script_spliter.analyzer import DependencyAnalyzer
    from script_spliter.generator import ModuleGenerator, ModuleConfig
    from script_spliter.spliter import ScriptSpliter
    from script_spliter.config import ConfigLoader, GroupingBuilder
    test_pass("All imports successful")
except ImportError as e:
    test_fail(f"Import failed: {e}")
    sys.exit(1)

# Test 1: JavaScript Parser
def test_javascript_parser():
    test_header("JavaScript Parser")
    
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
    
    try:
        parser = JavaScriptParser(source)
        blocks = parser.parse()
        
        test_pass(f"Parsed {len(blocks)} code blocks")
        
        names = {b.name for b in blocks if b.name}
        test_info(f"Block names: {sorted(names)}")
        
        # Check types
        types = {}
        for block in blocks:
            if block.type not in types:
                types[block.type] = 0
            types[block.type] += 1
        
        for block_type, count in sorted(types.items()):
            test_info(f"{block_type}: {count} blocks")
        
        return True
    except Exception as e:
        test_fail(f"Parser failed: {e}")
        return False

# Test 2: Dependency Analyzer
def test_dependency_analyzer():
    test_header("Dependency Analyzer")
    
    try:
        # Create sample blocks
        blocks = [
            CodeBlock("add", "function", 0, 2, "function add(a,b) { return a+b; }"),
            CodeBlock("multiply", "function", 4, 6, "const multiply = (a,b) => a*b;"),
            CodeBlock("Calculate", "class", 8, 20, "class Calculate { compute(a,b,op) { ... } }",
                     dependencies={"add", "multiply"}),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        
        # Test import order
        order = analyzer.get_import_order()
        test_pass(f"Import order: {order}")
        
        # Test circular dependencies
        cycles = analyzer.detect_circular_dependencies()
        test_pass(f"Circular dependencies: {len(cycles)} detected")
        
        # Test module suggestions
        suggestions = analyzer.get_module_suggestions()
        test_info(f"Suggested modules: {list(suggestions.keys())}")
        
        return True
    except Exception as e:
        test_fail(f"Analyzer failed: {e}")
        return False

# Test 3: Module Generator
def test_module_generator():
    test_header("Module Generator")
    
    try:
        # Create sample blocks
        blocks = [
            CodeBlock("formatDate", "function", 0, 2, "function formatDate(date) { ... }"),
            CodeBlock("Button", "class", 4, 10, "class Button { ... }"),
            CodeBlock("Modal", "class", 12, 20, "class Modal { ... }"),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        
        # Test ESM generation
        config_esm = ModuleConfig(format="esm", add_comments=True)
        generator_esm = ModuleGenerator(blocks, analyzer, config_esm)
        
        grouping = {
            "utils": ["formatDate"],
            "components": ["Button", "Modal"]
        }
        
        modules = generator_esm.generate_modules(grouping)
        test_pass(f"Generated {len(modules)} modules (ESM format)")
        
        for name in modules:
            test_info(f"Module '{name}': {len(modules[name])} characters")
        
        # Test CommonJS generation
        config_cjs = ModuleConfig(format="commonjs")
        generator_cjs = ModuleGenerator(blocks, analyzer, config_cjs)
        modules_cjs = generator_cjs.generate_modules(grouping)
        
        test_pass(f"Generated {len(modules_cjs)} modules (CommonJS format)")
        
        return True
    except Exception as e:
        test_fail(f"Generator failed: {e}")
        return False

# Test 4: ScriptSpliter Main Class
def test_script_spliter():
    test_header("ScriptSpliter Main Class")
    
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
        
        getFormattedDate() {
            return formatDate(this.data.date);
        }
    }
    
    async function fetchUser(id) {
        const response = await fetch(`/api/users/${id}`);
        return response.json();
    }
    """
    
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            test_file = Path(tmpdir) / "test.js"
            with open(test_file, 'w') as f:
                f.write(sample_js)
            
            # Initialize
            splitter = ScriptSpliter(str(test_file))
            test_pass("Splitter initialized")
            
            # Get blocks info
            blocks = splitter.get_blocks_info()
            test_pass(f"Found {len(blocks)} code blocks")
            for block in blocks:
                test_info(f"{block['name']} ({block['type']}) - Lines {block['lines']}")
            
            # Get analysis
            analysis = splitter.get_analysis()
            test_pass(f"Analysis generated ({len(analysis)} characters)")
            
            # Split with ESM
            output_esm = Path(tmpdir) / "output_esm"
            paths_esm = splitter.split(
                output_dir=str(output_esm),
                format='esm',
                auto_group=True,
                include_report=True
            )
            test_pass(f"Split to ESM: {len(paths_esm)-1} modules")
            
            for name, path in paths_esm.items():
                if Path(path).exists():
                    size = Path(path).stat().st_size
                    test_info(f"{name}: {size} bytes")
            
            # Split with CommonJS
            output_cjs = Path(tmpdir) / "output_cjs"
            paths_cjs = splitter.split(
                output_dir=str(output_cjs),
                format='commonjs',
                auto_group=False,
                include_report=False
            )
            test_pass(f"Split to CommonJS: {len(paths_cjs)-1} modules")
            
            return True
    except Exception as e:
        test_fail(f"ScriptSpliter failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# Test 5: Configuration
def test_configuration():
    test_header("Configuration Module")
    
    try:
        # Test default config
        config = ConfigLoader.get_default_config()
        test_pass(f"Default config: format={config.format}, auto_group={config.auto_group}")
        
        # Test grouping builder
        builder = GroupingBuilder()
        builder.add_group("utils", ["func1", "func2"])
        builder.add_group("components", ["Class1", "Class2"])
        builder.add_block_to_group("utils", "func3")
        
        grouping = builder.get_grouping()
        test_pass(f"Grouping builder created {len(grouping)} groups")
        
        for group_name, items in grouping.items():
            test_info(f"{group_name}: {len(items)} items - {items}")
        
        return True
    except Exception as e:
        test_fail(f"Configuration failed: {e}")
        return False

# Test 6: Edge Cases
def test_edge_cases():
    test_header("Edge Cases")
    
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            # Empty file
            empty_file = Path(tmpdir) / "empty.js"
            with open(empty_file, 'w') as f:
                f.write("")
            
            splitter = ScriptSpliter(str(empty_file))
            test_pass(f"Empty file handled: {len(splitter.blocks)} blocks")
            
            # Large file
            large_js = "\n".join([f"function f{i}() {{ return {i}; }}" for i in range(50)])
            large_file = Path(tmpdir) / "large.js"
            with open(large_file, 'w') as f:
                f.write(large_js)
            
            splitter = ScriptSpliter(str(large_file))
            test_pass(f"Large file handled: {len(splitter.blocks)} functions")
            
            # File with special characters
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
            test_pass(f"Special characters handled: {names}")
            
            return True
    except Exception as e:
        test_fail(f"Edge case test failed: {e}")
        return False

# Main test execution
def main():
    print("\n" + "="*70)
    print("ScriptSpliter - Comprehensive Functional Tests")
    print("="*70)
    
    tests = [
        ("JavaScript Parser", test_javascript_parser),
        ("Dependency Analyzer", test_dependency_analyzer),
        ("Module Generator", test_module_generator),
        ("ScriptSpliter Main", test_script_spliter),
        ("Configuration", test_configuration),
        ("Edge Cases", test_edge_cases),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ CRITICAL ERROR in {name}: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # Summary
    print(f"\n{'='*70}")
    print("Test Summary")
    print('='*70)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} test suites passed")
    print('='*70 + "\n")
    
    return all(r for _, r in results)

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
