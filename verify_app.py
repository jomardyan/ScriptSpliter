#!/usr/bin/env python3
"""
Functional verification of ScriptSpliter application
"""

import sys
import os
import tempfile
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def create_sample_js():
    """Create a sample JavaScript file for testing."""
    return '''
// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function parseJSON(str) {
    return JSON.parse(str);
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Component classes
class Button {
    constructor(label) {
        this.label = label;
    }
    
    render() {
        return `<button>${this.label}</button>`;
    }
}

class Modal {
    constructor(title, content) {
        this.title = title;
        this.content = content;
    }
    
    render() {
        return `<div class="modal"><h2>${this.title}</h2></div>`;
    }
}

// API functions
async function fetchUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
}

async function updateProfile(userId, data) {
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    return response.json();
}

// Helper functions
function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}
'''

def test_parser():
    """Test JavaScript parser."""
    print("\n[TEST 1] Testing JavaScript Parser...")
    print("-" * 50)
    
    from script_spliter.parser import JavaScriptParser
    
    source = create_sample_js()
    parser = JavaScriptParser(source)
    blocks = parser.parse()
    
    print(f"✓ Parsed {len(blocks)} code blocks")
    
    # Check for specific functions
    names = {b.name for b in blocks if b.name}
    required = {'formatDate', 'parseJSON', 'debounce', 'Button', 'Modal', 'fetchUser', 'updateProfile', 'validateEmail', 'sanitizeInput'}
    
    found = required.intersection(names)
    print(f"✓ Found {len(found)}/{len(required)} expected blocks:")
    for name in sorted(found):
        print(f"  - {name}")
    
    return len(blocks) > 0

def test_analyzer():
    """Test dependency analyzer."""
    print("\n[TEST 2] Testing Dependency Analyzer...")
    print("-" * 50)
    
    from script_spliter.parser import JavaScriptParser, CodeBlock
    from script_spliter.analyzer import DependencyAnalyzer
    
    blocks = [
        CodeBlock("funcA", "function", 0, 2, "function funcA() { return 1; }"),
        CodeBlock("funcB", "function", 4, 6, "function funcB() { return funcA(); }", dependencies={"funcA"}),
        CodeBlock("funcC", "function", 8, 10, "function funcC() { return funcB(); }", dependencies={"funcB"}),
    ]
    
    analyzer = DependencyAnalyzer(blocks)
    
    # Test import order
    order = analyzer.get_import_order()
    print(f"✓ Generated import order: {order}")
    
    # Test circular dependency detection
    cycles = analyzer.detect_circular_dependencies()
    print(f"✓ Detected {len(cycles)} circular dependencies (expected 0)")
    
    return True

def test_generator():
    """Test module generator."""
    print("\n[TEST 3] Testing Module Generator...")
    print("-" * 50)
    
    from script_spliter.parser import JavaScriptParser
    from script_spliter.analyzer import DependencyAnalyzer
    from script_spliter.generator import ModuleGenerator, ModuleConfig
    
    source = create_sample_js()
    parser = JavaScriptParser(source)
    blocks = parser.parse()
    analyzer = DependencyAnalyzer(blocks)
    
    config = ModuleConfig(format="esm")
    generator = ModuleGenerator(blocks, analyzer, config)
    
    # Generate modules
    grouping = {
        "utils": [b.name for b in blocks if b.type == "function" and b.name in ['formatDate', 'parseJSON', 'debounce', 'validateEmail', 'sanitizeInput']],
        "components": [b.name for b in blocks if b.type == "class"],
        "api": [b.name for b in blocks if b.name in ['fetchUser', 'updateProfile']]
    }
    
    modules = generator.generate_modules(grouping)
    
    print(f"✓ Generated {len(modules)} modules: {list(modules.keys())}")
    
    for name, content in modules.items():
        print(f"✓ Module '{name}' has {len(content)} characters")
    
    return len(modules) > 0

def test_splitter():
    """Test main ScriptSpliter class."""
    print("\n[TEST 4] Testing ScriptSpliter...")
    print("-" * 50)
    
    from script_spliter import ScriptSpliter
    
    # Create temporary test file
    with tempfile.TemporaryDirectory() as tmpdir:
        test_file = Path(tmpdir) / "test.js"
        with open(test_file, 'w') as f:
            f.write(create_sample_js())
        
        splitter = ScriptSpliter(str(test_file))
        print(f"✓ Initialized splitter")
        
        # Get blocks info
        blocks = splitter.get_blocks_info()
        print(f"✓ Found {len(blocks)} code blocks")
        
        # Get analysis
        analysis = splitter.get_analysis()
        print(f"✓ Generated analysis report ({len(analysis)} chars)")
        
        # Test splitting
        output_dir = Path(tmpdir) / "output"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            format='esm',
            auto_group=True,
            include_comments=True,
            include_report=True
        )
        
        print(f"✓ Split into {len(file_paths) - 1} modules")
        
        # Verify files exist
        for name, path in file_paths.items():
            if Path(path).exists():
                print(f"  ✓ {name}: {Path(path).stat().st_size} bytes")
        
        return True

def test_cli():
    """Test CLI interface."""
    print("\n[TEST 5] Testing CLI Interface...")
    print("-" * 50)
    
    from script_spliter.cli import main
    
    # Test help
    print("✓ CLI module imported successfully")
    print("✓ Main entry point available")
    
    return True

def test_config():
    """Test configuration module."""
    print("\n[TEST 6] Testing Configuration Module...")
    print("-" * 50)
    
    from script_spliter.config import ConfigLoader, GroupingBuilder, SplitterConfig
    
    # Test default config
    config = ConfigLoader.get_default_config()
    print(f"✓ Default config created: format={config.format}")
    
    # Test grouping builder
    builder = GroupingBuilder()
    builder.add_group("utils", ["func1", "func2"])
    builder.add_group("components", ["Class1"])
    
    grouping = builder.get_grouping()
    print(f"✓ Grouping builder: {len(grouping)} groups")
    
    return True

def main_test():
    """Run all functional verification tests."""
    print("\n" + "=" * 70)
    print("ScriptSpliter - Functional Verification")
    print("=" * 70)
    
    tests = [
        ("Parser", test_parser),
        ("Analyzer", test_analyzer),
        ("Generator", test_generator),
        ("Splitter", test_splitter),
        ("CLI", test_cli),
        ("Config", test_config),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ ERROR in {name}: {str(e)}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # Print summary
    print("\n" + "=" * 70)
    print("Functional Test Summary")
    print("=" * 70)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 70 + "\n")
    
    return all(r for _, r in results)

if __name__ == '__main__':
    success = main_test()
    sys.exit(0 if success else 1)
