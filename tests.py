"""
Comprehensive unit tests for ScriptSpliter
"""

import unittest
import tempfile
import os
import json
from pathlib import Path
from io import StringIO
import sys

from script_spliter.parser import JavaScriptParser, CodeBlock
from script_spliter.analyzer import DependencyAnalyzer
from script_spliter.generator import ModuleGenerator, ModuleConfig, CodeAnalysisReport
from script_spliter.spliter import ScriptSpliter
from script_spliter.config import ConfigLoader, SplitterConfig, GroupingBuilder


class TestJavaScriptParser(unittest.TestCase):
    """Test JavaScript parsing functionality."""
    
    def test_function_parsing(self):
        """Test parsing of function declarations."""
        source = """
        function add(a, b) {
            return a + b;
        }
        
        function multiply(x, y) {
            return x * y;
        }
        """
        
        parser = JavaScriptParser(source)
        blocks = parser.parse()
        
        names = {b.name for b in blocks if b.type == "function"}
        self.assertIn("add", names)
        self.assertIn("multiply", names)
    
    def test_class_parsing(self):
        """Test parsing of class declarations."""
        source = """
        class Animal {
            constructor(name) {
                this.name = name;
            }
        }
        
        class Dog extends Animal {
            bark() {
                return 'Woof!';
            }
        }
        """
        
        parser = JavaScriptParser(source)
        blocks = parser.parse()
        
        classes = {b.name: b for b in blocks if b.type == "class"}
        self.assertIn("Animal", classes)
        self.assertIn("Dog", classes)
        
        # Check inheritance detection
        dog_block = classes["Dog"]
        self.assertIn("Animal", dog_block.dependencies)
    
    def test_arrow_function_parsing(self):
        """Test parsing of arrow functions."""
        source = """
        const add = (a, b) => a + b;
        const greet = (name) => `Hello, ${name}!`;
        """
        
        parser = JavaScriptParser(source)
        blocks = parser.parse()
        
        names = {b.name for b in blocks if b.type == "function"}
        self.assertIn("add", names)
        self.assertIn("greet", names)
    
    def test_variable_assignment_parsing(self):
        """Test parsing of variable assignments."""
        source = """
        const config = { debug: true };
        let counter = 0;
        var message = 'Hello';
        """
        
        parser = JavaScriptParser(source)
        blocks = parser.parse()
        
        names = {b.name for b in blocks if b.type == "assignment"}
        self.assertIn("config", names)
        self.assertIn("counter", names)
        self.assertIn("message", names)


class TestDependencyAnalyzer(unittest.TestCase):
    """Test dependency analysis functionality."""
    
    def test_simple_dependencies(self):
        """Test simple dependency detection."""
        blocks = [
            CodeBlock("funcA", "function", 0, 2, "function funcA() { return 1; }"),
            CodeBlock("funcB", "function", 4, 6, "function funcB() { return funcA(); }", 
                     dependencies={"funcA"}),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        
        self.assertEqual(analyzer.graph.dependencies["funcA"], set())
        self.assertEqual(analyzer.graph.dependencies["funcB"], {"funcA"})
    
    def test_import_order(self):
        """Test calculation of proper import order."""
        blocks = [
            CodeBlock("funcA", "function", 0, 2, "function funcA() { return 1; }"),
            CodeBlock("funcB", "function", 4, 6, "function funcB() { return funcA(); }", 
                     dependencies={"funcA"}),
            CodeBlock("funcC", "function", 8, 10, "function funcC() { return funcB(); }", 
                     dependencies={"funcB"}),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        order = analyzer.get_import_order()
        
        # funcA should come before funcB, funcB before funcC
        self.assertLess(order.index("funcA"), order.index("funcB"))
        self.assertLess(order.index("funcB"), order.index("funcC"))
    
    def test_circular_dependency_detection(self):
        """Test detection of circular dependencies."""
        blockA = CodeBlock("funcA", "function", 0, 2, "function funcA() { return funcB(); }")
        blockB = CodeBlock("funcB", "function", 4, 6, "function funcB() { return funcA(); }")
        
        blockA.dependencies = {"funcB"}
        blockB.dependencies = {"funcA"}
        
        blocks = [blockA, blockB]
        analyzer = DependencyAnalyzer(blocks)
        cycles = analyzer.detect_circular_dependencies()
        
        # Should detect at least one cycle
        self.assertTrue(len(cycles) > 0)


class TestModuleGenerator(unittest.TestCase):
    """Test module generation functionality."""
    
    def test_esm_generation(self):
        """Test ES6 module generation."""
        blocks = [
            CodeBlock("add", "function", 0, 2, "function add(a, b) { return a + b; }"),
            CodeBlock("sub", "function", 4, 6, "function sub(a, b) { return a - b; }", 
                     dependencies={"add"}),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        config = ModuleConfig(format="esm", add_comments=True)
        generator = ModuleGenerator(blocks, analyzer, config)
        
        modules = generator.generate_modules({
            "math": ["add", "sub"]
        })
        
        self.assertIn("math", modules)
        content = modules["math"]
        self.assertIn("export", content)
        self.assertIn("add", content)
        self.assertIn("sub", content)
    
    def test_commonjs_generation(self):
        """Test CommonJS module generation."""
        blocks = [
            CodeBlock("greet", "function", 0, 2, "function greet(name) { return 'Hello, ' + name; }"),
        ]
        
        analyzer = DependencyAnalyzer(blocks)
        config = ModuleConfig(format="commonjs", add_comments=True)
        generator = ModuleGenerator(blocks, analyzer, config)
        
        modules = generator.generate_modules({
            "utils": ["greet"]
        })
        
        self.assertIn("utils", modules)
        content = modules["utils"]
        self.assertIn("module.exports", content)


class TestScriptSpliter(unittest.TestCase):
    """Test the main ScriptSpliter class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
        self.sample_js = """
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
        
        function divide(a, b) {
            return a / b;
        }
        
        const utils = {
            format: function(value) {
                return String(value);
            }
        };
        """
        
        self.test_file = Path(self.test_dir) / "test.js"
        with open(self.test_file, 'w') as f:
            f.write(self.sample_js)
    
    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_initialization(self):
        """Test ScriptSpliter initialization."""
        splitter = ScriptSpliter(str(self.test_file))
        self.assertIsNotNone(splitter.blocks)
        self.assertTrue(len(splitter.blocks) > 0)
    
    def test_file_not_found(self):
        """Test error handling for missing files."""
        with self.assertRaises(FileNotFoundError):
            ScriptSpliter("nonexistent.js")
    
    def test_split_generation_esm(self):
        """Test file splitting and generation with ESM format."""
        splitter = ScriptSpliter(str(self.test_file))
        
        output_dir = Path(self.test_dir) / "output_esm"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            format='esm',
            auto_group=True,
            include_comments=True,
            include_report=True
        )
        
        # Check that files were created
        self.assertGreater(len(file_paths), 0)
        
        # Check that output directory exists
        self.assertTrue(output_dir.exists())
        
        # Check that index file was created
        self.assertIn("index", file_paths)
        
        # Check index file content
        index_path = Path(file_paths["index"])
        self.assertTrue(index_path.exists())
        
        with open(index_path, 'r') as f:
            index_content = f.read()
            self.assertIn("export", index_content)
    
    def test_split_generation_commonjs(self):
        """Test file splitting and generation with CommonJS format."""
        splitter = ScriptSpliter(str(self.test_file))
        
        output_dir = Path(self.test_dir) / "output_cjs"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            format='commonjs',
            auto_group=True,
            include_comments=True,
            include_report=False
        )
        
        # Check that files were created
        self.assertGreater(len(file_paths), 0)
        
        # Check index file
        index_path = Path(file_paths["index"])
        with open(index_path, 'r') as f:
            index_content = f.read()
            self.assertIn("module.exports", index_content)
    
    def test_split_with_custom_grouping(self):
        """Test splitting with custom grouping."""
        splitter = ScriptSpliter(str(self.test_file))
        
        custom_grouping = {
            "math": ["add", "multiply", "divide"],
            "classes": ["Calculator"],
            "utilities": ["utils"]
        }
        
        output_dir = Path(self.test_dir) / "output_custom"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            custom_grouping=custom_grouping,
            format='esm'
        )
        
        # Check that all modules were created
        self.assertIn("math", file_paths)
        self.assertIn("classes", file_paths)
        self.assertIn("utilities", file_paths)
        
        # Verify files exist
        for module in ["math", "classes", "utilities"]:
            self.assertTrue(Path(file_paths[module]).exists())
    
    def test_get_analysis(self):
        """Test getting code analysis."""
        splitter = ScriptSpliter(str(self.test_file))
        analysis = splitter.get_analysis()
        
        self.assertIsInstance(analysis, str)
        self.assertIn("CODE SPLIT ANALYSIS REPORT", analysis)
        self.assertIn("SUMMARY", analysis)
    
    def test_get_blocks_info(self):
        """Test getting blocks information."""
        splitter = ScriptSpliter(str(self.test_file))
        blocks = splitter.get_blocks_info()
        
        self.assertIsInstance(blocks, list)
        self.assertTrue(len(blocks) > 0)
        
        # Check block structure
        for block in blocks:
            self.assertIn("name", block)
            self.assertIn("type", block)
            self.assertIn("lines", block)
            self.assertIn("dependencies", block)
    
    def test_get_dependency_tree(self):
        """Test getting dependency tree."""
        splitter = ScriptSpliter(str(self.test_file))
        
        # Test with Calculator class which depends on add and multiply
        tree = splitter.get_dependency_tree("Calculator")
        
        self.assertIsInstance(tree, dict)
        self.assertIn("name", tree)
        self.assertEqual(tree["name"], "Calculator")


class TestConfigLoader(unittest.TestCase):
    """Test configuration loading functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_default_config(self):
        """Test getting default configuration."""
        config = ConfigLoader.get_default_config()
        
        self.assertIsInstance(config, SplitterConfig)
        self.assertEqual(config.format, "esm")
        self.assertTrue(config.auto_group)
        self.assertTrue(config.include_comments)
    
    def test_save_and_load_json_config(self):
        """Test saving and loading JSON configuration."""
        config_file = Path(self.test_dir) / "config.json"
        
        # Create and save
        ConfigLoader.create_sample_config(str(config_file), format='json')
        self.assertTrue(config_file.exists())
        
        # Load
        loaded_config = ConfigLoader.load_from_file(str(config_file))
        self.assertIsInstance(loaded_config, SplitterConfig)
    
    def test_load_nonexistent_config(self):
        """Test loading a nonexistent configuration file."""
        with self.assertRaises(FileNotFoundError):
            ConfigLoader.load_from_file("nonexistent.json")
    
    def test_grouping_builder(self):
        """Test GroupingBuilder functionality."""
        builder = GroupingBuilder()
        
        builder.add_group("utils", ["func1", "func2"])
        builder.add_group("components", ["Class1", "Class2"])
        
        grouping = builder.get_grouping()
        
        self.assertIn("utils", grouping)
        self.assertIn("components", grouping)
        self.assertEqual(len(grouping["utils"]), 2)
    
    def test_grouping_builder_add_to_group(self):
        """Test adding blocks to groups."""
        builder = GroupingBuilder()
        
        builder.add_group("utils", ["func1"])
        builder.add_block_to_group("utils", "func2")
        
        grouping = builder.get_grouping()
        
        self.assertEqual(len(grouping["utils"]), 2)
        self.assertIn("func2", grouping["utils"])
    
    def test_save_and_load_grouping(self):
        """Test saving and loading grouping configuration."""
        grouping_file = Path(self.test_dir) / "grouping.json"
        
        grouping = {
            "utils": ["func1", "func2"],
            "components": ["Class1", "Class2"]
        }
        
        ConfigLoader.save_grouping(grouping, str(grouping_file))
        self.assertTrue(grouping_file.exists())
        
        loaded = ConfigLoader.load_grouping(str(grouping_file))
        self.assertEqual(loaded, grouping)


class TestCodeAnalysisReport(unittest.TestCase):
    """Test code analysis report generation."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.blocks = [
            CodeBlock("funcA", "function", 0, 2, "function funcA() { return 1; }"),
            CodeBlock("funcB", "function", 4, 6, "function funcB() { return funcA(); }", 
                     dependencies={"funcA"}),
            CodeBlock("ClassA", "class", 8, 15, "class ClassA { }"),
        ]
    
    def test_report_generation(self):
        """Test report generation."""
        analyzer = DependencyAnalyzer(self.blocks)
        report = CodeAnalysisReport(self.blocks, {}, analyzer)
        
        report_content = report.generate_report()
        
        self.assertIn("CODE SPLIT ANALYSIS REPORT", report_content)
        self.assertIn("SUMMARY", report_content)
        self.assertIn("Total code blocks", report_content)


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and error handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_empty_javascript_file(self):
        """Test handling empty JavaScript files."""
        test_file = Path(self.test_dir) / "empty.js"
        with open(test_file, 'w') as f:
            f.write("")
        
        splitter = ScriptSpliter(str(test_file))
        # Should not crash, just have 0 blocks
        self.assertEqual(len(splitter.blocks), 0)
    
    def test_javascript_with_only_comments(self):
        """Test handling files with only comments."""
        test_file = Path(self.test_dir) / "comments.js"
        with open(test_file, 'w') as f:
            f.write("// This is a comment\n/* Multi-line\n   comment */")
        
        splitter = ScriptSpliter(str(test_file))
        # Should handle gracefully
        analysis = splitter.get_analysis()
        self.assertIn("ANALYSIS", analysis)
    
    def test_complex_nested_structures(self):
        """Test handling complex nested code."""
        complex_js = """
        class Parent {
            constructor() {
                this.child = {
                    method: function() {
                        return {
                            deep: {
                                value: 42
                            }
                        };
                    }
                };
            }
        }
        """
        
        test_file = Path(self.test_dir) / "complex.js"
        with open(test_file, 'w') as f:
            f.write(complex_js)
        
        splitter = ScriptSpliter(str(test_file))
        blocks = splitter.get_blocks_info()
        
        # Should parse without errors
        self.assertGreater(len(blocks), 0)
    
    def test_invalid_format_error(self):
        """Test error handling for invalid output format."""
        test_file = Path(self.test_dir) / "test.js"
        with open(test_file, 'w') as f:
            f.write("function test() { return 1; }")
        
        splitter = ScriptSpliter(str(test_file))
        
        with self.assertRaises(ValueError):
            splitter.split(
                output_dir=str(Path(self.test_dir) / "output"),
                format='invalid_format'
            )
    
    def test_special_characters_in_names(self):
        """Test handling special characters and Unicode."""
        js_with_special = """
        function _privateFunc() { return 1; }
        const $var = 42;
        function café() { return 'test'; }
        """
        
        test_file = Path(self.test_dir) / "special.js"
        with open(test_file, 'w') as f:
            f.write(js_with_special)
        
        splitter = ScriptSpliter(str(test_file))
        blocks = splitter.get_blocks_info()
        
        # Should handle special characters
        names = [b['name'] for b in blocks]
        self.assertTrue(any(name for name in names if name))
    
    def test_large_file_handling(self):
        """Test handling of large JavaScript files."""
        # Generate a large file with many functions
        large_js = "\n".join([
            f"function func{i}() {{ return {i}; }}"
            for i in range(100)
        ])
        
        test_file = Path(self.test_dir) / "large.js"
        with open(test_file, 'w') as f:
            f.write(large_js)
        
        splitter = ScriptSpliter(str(test_file))
        blocks = splitter.get_blocks_info()
        
        # Should parse all functions
        self.assertEqual(len(blocks), 100)
    
    def test_no_circular_dependencies(self):
        """Test detection when no circular dependencies exist."""
        simple_js = """
        function a() { return 1; }
        function b() { return a(); }
        function c() { return b(); }
        """
        
        test_file = Path(self.test_dir) / "simple.js"
        with open(test_file, 'w') as f:
            f.write(simple_js)
        
        splitter = ScriptSpliter(str(test_file))
        analysis = splitter.get_analysis()
        
        # Should report no circular dependencies
        self.assertIn("No circular dependencies", analysis)


class TestIntegration(unittest.TestCase):
    """Integration tests for the full workflow."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_dir = tempfile.mkdtemp()
        
        # Create a realistic application structure
        self.realistic_js = """
        // Authentication utilities
        function validateToken(token) {
            return token && token.length > 0;
        }
        
        async function authenticate(username, password) {
            if (!username || !password) return null;
            const response = await fetch('/auth', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            return response.json();
        }
        
        // User management
        class User {
            constructor(data) {
                this.data = data;
                this.token = null;
            }
            
            async login(username, password) {
                const auth = await authenticate(username, password);
                if (auth && validateToken(auth.token)) {
                    this.token = auth.token;
                    return true;
                }
                return false;
            }
        }
        
        // UI Components
        class Button {
            constructor(label, onClick) {
                this.label = label;
                this.onClick = onClick;
            }
            
            render() {
                return `<button>${this.label}</button>`;
            }
        }
        
        class Form {
            constructor(fields) {
                this.fields = fields;
                this.user = new User({});
            }
        }
        
        // Utilities
        const formatDate = (date) => new Date(date).toLocaleDateString();
        const debounce = (func, delay) => {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        };
        """
        
        self.test_file = Path(self.test_dir) / "app.js"
        with open(self.test_file, 'w') as f:
            f.write(self.realistic_js)
    
    def tearDown(self):
        """Clean up test files."""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_full_workflow_esm(self):
        """Test full workflow with ESM format."""
        splitter = ScriptSpliter(str(self.test_file))
        
        # Step 1: Analyze
        analysis = splitter.get_analysis()
        self.assertIn("ANALYSIS", analysis)
        
        # Step 2: Get blocks info
        blocks = splitter.get_blocks_info()
        self.assertGreater(len(blocks), 0)
        
        # Step 3: Split
        output_dir = Path(self.test_dir) / "output"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            format='esm',
            auto_group=True,
            include_report=True
        )
        
        # Step 4: Verify output
        self.assertGreater(len(file_paths), 0)
        
        # Verify files exist and have content
        for name, path in file_paths.items():
            file_path = Path(path)
            self.assertTrue(file_path.exists())
            
            with open(file_path, 'r') as f:
                content = f.read()
                self.assertGreater(len(content), 0)
    
    def test_full_workflow_with_custom_config(self):
        """Test full workflow with custom configuration."""
        splitter = ScriptSpliter(str(self.test_file))
        
        # Define custom grouping
        custom_grouping = {
            "auth": ["validateToken", "authenticate"],
            "models": ["User"],
            "components": ["Button", "Form"],
            "utilities": ["formatDate", "debounce"]
        }
        
        # Split with custom grouping
        output_dir = Path(self.test_dir) / "output_custom"
        file_paths = splitter.split(
            output_dir=str(output_dir),
            format='commonjs',
            custom_grouping=custom_grouping,
            include_comments=True,
            include_report=True
        )
        
        # Verify all modules created
        for module in ["auth", "models", "components", "utilities"]:
            self.assertIn(module, file_paths)
            self.assertTrue(Path(file_paths[module]).exists())
        
        # Verify index file
        self.assertIn("index", file_paths)
        
        # Verify report
        self.assertIn("report", file_paths)
        report_path = Path(file_paths["report"])
        self.assertTrue(report_path.exists())
        
        with open(report_path, 'r') as f:
            report = f.read()
            self.assertIn("CODE SPLIT ANALYSIS", report)


if __name__ == "__main__":
    unittest.main()
