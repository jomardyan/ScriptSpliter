# ScriptSpliter

Convert large JavaScript files into structured, modular components. **ScriptSpliter** takes a monolithic JavaScript file (bundle, legacy script, etc.) and intelligently splits it into smaller, organized modules while automatically managing dependencies and generating proper imports/exports.

## Features

- 🔍 **Intelligent Code Analysis**: Parses JavaScript to identify functions, classes, and code blocks
- 📊 **Dependency Resolution**: Automatically detects and manages dependencies between code blocks
- 🧩 **Smart Grouping**: Groups related code into logical modules
- 🔗 **Automatic Imports/Exports**: Generates proper ES6 modules, CommonJS, or script tag references
- 🚨 **Circular Dependency Detection**: Warns about circular dependencies and suggests fixes
- 📈 **Scalability**: Handles large files (10,000+ lines) efficiently
- 🎯 **Multiple Output Formats**: Supports ES6 modules, CommonJS, and HTML script tags
- 📝 **Analysis Reports**: Generates detailed analysis of code structure and dependencies

## Installation

### From Source

```bash
git clone https://github.com/jomardyan/ScriptSpliter.git
cd ScriptSpliter
pip install -e .
```

### Requirements

- Python 3.8+
- regex library

## Quick Start

### Basic Usage

```bash
# Split a JavaScript file with automatic grouping
script-spliter input.js -o output/

# Specify output format
script-spliter input.js -o output/ --format commonjs

# Use custom grouping
script-spliter input.js -o output/ --config grouping.json
```

### Programmatic Usage

```python
from script_spliter import ScriptSpliter

# Initialize splitter
splitter = ScriptSpliter('large_file.js')

# Analyze code
print(splitter.get_analysis())

# Split into modules
file_paths = splitter.split(
    output_dir='./output',
    format='esm',
    auto_group=True,
    include_comments=True,
    include_report=True
)

print("Generated files:")
for name, path in file_paths.items():
    print(f"  {name}: {path}")
```

## CLI Commands

### Main Split Command

```bash
script-spliter <input_file> [options]
```

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--output` | `-o` | Output directory (default: `./output`) |
| `--format` | `-f` | Output format: `esm`, `commonjs`, `scripts` (default: `esm`) |
| `--config` | `-c` | Custom grouping configuration file (JSON) |
| `--no-auto-group` | | Disable automatic grouping |
| `--no-comments` | | Don't include comments in generated files |
| `--no-report` | | Don't generate analysis report |
| `--analyze` | | Analyze code without generating files |
| `--blocks-info` | | Display detected code blocks |
| `--deps BLOCK_NAME` | | Show dependency tree for a block |
| `--verbose` | `-v` | Verbose output |

### Examples

```bash
# Analyze without generating files
script-spliter input.js --analyze

# View detected code blocks
script-spliter input.js --blocks-info

# Show dependencies for a specific function
script-spliter input.js --deps myFunction

# Split without automatic grouping
script-spliter input.js -o output/ --no-auto-group

# Use CommonJS format
script-spliter input.js -o output/ --format commonjs

# Custom grouping configuration
script-spliter input.js -o output/ --config custom-grouping.json
```

## Configuration Files

### Custom Grouping (JSON)

Define how code blocks should be grouped into modules:

```json
{
  "utilities": ["formatDate", "parseJSON", "debounce"],
  "components": ["Button", "Modal", "Card"],
  "api": ["fetchUser", "updateProfile", "logout"],
  "helpers": ["validateEmail", "sanitizeInput"]
}
```

### Splitter Configuration (JSON)

```json
{
  "format": "esm",
  "auto_group": true,
  "include_comments": true,
  "include_source_maps": false,
  "exclude_patterns": ["test", "spec"],
  "include_patterns": ["src/**"],
  "min_block_size": 0,
  "max_blocks_per_module": 10
}
```

### Splitter Configuration (YAML)

```yaml
format: esm
auto_group: true
include_comments: true
include_source_maps: false
exclude_patterns:
  - test
  - spec
include_patterns:
  - src/**
min_block_size: 0
max_blocks_per_module: 10
```

## Example Workflow

### 1. Analyze a Large File

```bash
script-spliter legacy_app.js --analyze
```

Output shows:
- Total code blocks detected
- Types and counts
- Circular dependencies (if any)
- Recommended import order

### 2. View Code Structure

```bash
script-spliter legacy_app.js --blocks-info
```

Shows all detected functions, classes, and variables with their dependencies.

### 3. Create Custom Grouping

```bash
# View the structure first
script-spliter legacy_app.js --blocks-info

# Create grouping.json with custom modules
# Then apply it:
script-spliter legacy_app.js -o output/ --config grouping.json
```

### 4. Generate Modules

```bash
# With ES6 modules
script-spliter legacy_app.js -o output/ --format esm

# Or CommonJS
script-spliter legacy_app.js -o output/ --format commonjs
```

## Python API

### ScriptSpliter Class

```python
from script_spliter import ScriptSpliter

splitter = ScriptSpliter('path/to/file.js')

# Get analysis
analysis = splitter.get_analysis()

# Get block information
blocks = splitter.get_blocks_info()

# Get dependency tree
deps = splitter.get_dependency_tree('functionName')

# Split into modules
files = splitter.split(
    output_dir='output',
    format='esm',
    auto_group=True,
    include_comments=True,
    include_report=True
)
```

### Parser Class

```python
from script_spliter.parser import JavaScriptParser

parser = JavaScriptParser(source_code)
blocks = parser.parse()

for block in blocks:
    print(f"{block.name}: {block.type}")
    print(f"  Dependencies: {block.dependencies}")
    print(f"  Lines: {block.start_line}-{block.end_line}")
```

### Analyzer Class

```python
from script_spliter.analyzer import DependencyAnalyzer

analyzer = DependencyAnalyzer(blocks)

# Get logical groupings
groups = analyzer.get_logical_groups()

# Get import order
order = analyzer.get_import_order()

# Detect circular dependencies
cycles = analyzer.detect_circular_dependencies()

# Get module suggestions
suggestions = analyzer.get_module_suggestions()
```

### Configuration

```python
from script_spliter.config import ConfigLoader, GroupingBuilder

# Load from file
config = ConfigLoader.load_from_file('config.json')
grouping = ConfigLoader.load_grouping('grouping.json')

# Build configuration programmatically
builder = GroupingBuilder()
builder.add_group('utils', ['formatDate', 'parseJSON'])
builder.add_group('components', ['Button', 'Modal'])
builder.save('grouping.json')

# Create sample config
ConfigLoader.create_sample_config('sample-config.json')
```

## How It Works

### 1. **Parsing Phase**
   - Scans JavaScript source code
   - Identifies functions, classes, variable assignments
   - Extracts imports and exports

### 2. **Analysis Phase**
   - Builds dependency graph
   - Detects circular dependencies
   - Suggests logical groupings
   - Calculates import order

### 3. **Generation Phase**
   - Groups related code into modules
   - Generates appropriate import/export statements
   - Creates separate files for each module
   - Generates index/entry file

### 4. **Output Phase**
   - Writes modules to files
   - Generates analysis report
   - Creates index file with proper references

## Output Formats

### ES6 Modules (ESM)

```javascript
// utilities.js
export function formatDate(date) { ... }
export function parseJSON(str) { ... }

// index.js
export * from './utilities.js';
```

### CommonJS

```javascript
// utilities.js
module.exports = {
  formatDate,
  parseJSON
};

// index.js
module.exports = {
  ...require('./utilities'),
};
```

### HTML Script Tags

```html
<!-- index.html -->
<script src="utilities.js"></script>
<script src="components.js"></script>
```

## Limitations & Considerations

- Complex dynamic imports (string concatenation, computed paths) may not be detected
- Minified or heavily obfuscated code may produce suboptimal splits
- Comments within code blocks are preserved but may need manual adjustment
- Regular expressions and string contents aren't parsed (to avoid false positives)

## Troubleshooting

### Circular Dependency Detected

If the analysis reports circular dependencies:

```bash
script-spliter input.js --analyze
```

The report will show the circular dependency chains. You can:
1. Manually refactor the code to break cycles
2. Use custom grouping to group circular items together
3. Extract common code into a separate module

### Incomplete or Wrong Splits

If code isn't being split as expected:

```bash
# View detected blocks
script-spliter input.js --blocks-info

# Check dependencies
script-spliter input.js --deps blockName
```

Then create a custom `grouping.json` to manually specify the grouping.

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Building from Source

```bash
pip install -e ".[dev]"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/jomardyan/ScriptSpliter/issues).