# ScriptSpliter - Quick Start Guide

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/jomardyan/ScriptSpliter.git
cd ScriptSpliter
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Install the Package (Development Mode)
```bash
pip install -e .
```

## Basic Usage

### Analyze a JavaScript File

```bash
script-spliter my_large_file.js --analyze
```

This command:
- Parses the JavaScript file
- Detects functions, classes, and variables
- Analyzes dependencies
- Displays a report showing:
  - Total code blocks detected
  - Types of blocks found
  - Circular dependencies (if any)
  - Recommended import order

### View Code Structure

```bash
script-spliter my_large_file.js --blocks-info
```

This shows all detected code blocks with:
- Block name
- Type (function, class, assignment)
- Line numbers
- Dependencies

### Split into Modules (Automatic)

```bash
script-spliter my_large_file.js -o output/
```

This:
1. Analyzes the file
2. Groups related code automatically
3. Generates separate module files
4. Creates an index file with imports/exports
5. Generates an analysis report

### Split with Custom Format

```bash
# CommonJS format
script-spliter my_large_file.js -o output/ --format commonjs

# Script tags (for browser)
script-spliter my_large_file.js -o output/ --format scripts
```

## Advanced Usage

### Create Custom Grouping Configuration

Create a `grouping.json` file:

```json
{
  "utilities": ["formatDate", "parseJSON", "debounce"],
  "components": ["Button", "Modal", "Card"],
  "api": ["fetchUser", "updateProfile", "logout"],
  "helpers": ["validateEmail", "sanitizeInput"]
}
```

Then apply it:

```bash
script-spliter my_large_file.js -o output/ --config grouping.json
```

### Examine Dependencies

Show the dependency tree for a specific function:

```bash
script-spliter my_large_file.js --deps myFunction
```

Output example:
```
Dependency tree for 'myFunction':
├─ myFunction
  ├─ helper1
  ├─ helper2
  └─ utilityFunc
    └─ formatter
```

### Generate Without Comments

```bash
script-spliter my_large_file.js -o output/ --no-comments
```

### Verbose Output

For detailed logging:

```bash
script-spliter my_large_file.js -o output/ --verbose
```

## Python API Usage

### Basic Example

```python
from script_spliter import ScriptSpliter

# Initialize with a JavaScript file
splitter = ScriptSpliter('my_file.js')

# Analyze the code
print(splitter.get_analysis())

# Split into modules
file_paths = splitter.split(
    output_dir='output',
    format='esm',
    auto_group=True
)

print("Generated files:")
for name, path in file_paths.items():
    print(f"  {name}: {path}")
```

### Get Block Information

```python
from script_spliter import ScriptSpliter

splitter = ScriptSpliter('my_file.js')

# Get all detected blocks
blocks = splitter.get_blocks_info()

for block in blocks:
    print(f"{block['name']} ({block['type']}) - Lines {block['lines']}")
    if block['dependencies']:
        print(f"  Dependencies: {', '.join(block['dependencies'])}")
```

### Show Dependency Tree

```python
from script_spliter import ScriptSpliter

splitter = ScriptSpliter('my_file.js')

# Get dependency tree for a function
tree = splitter.get_dependency_tree('functionName')

# tree is a nested dictionary with structure:
# {
#   'name': 'functionName',
#   'dependencies': [
#     {'name': 'dep1', 'dependencies': [...]},
#     ...
#   ]
# }
```

### Custom Grouping

```python
from script_spliter import ScriptSpliter

splitter = ScriptSpliter('my_file.js')

custom_grouping = {
    'utilities': ['func1', 'func2'],
    'components': ['ClassA', 'ClassB'],
}

file_paths = splitter.split(
    output_dir='output',
    format='esm',
    custom_grouping=custom_grouping
)
```

## Examples

Run the provided examples:

```bash
python examples.py
```

This will:
1. Create a sample JavaScript file
2. Run 6 different examples showing various features
3. Generate output in the `examples/` directory

## Troubleshooting

### Problem: Some functions not detected
**Solution:** Check if they use unusual syntax. Review `--blocks-info` output.

### Problem: Circular dependencies detected
**Solution:** The analysis report will show the cycles. You may need to:
1. Refactor the code to break cycles
2. Use custom grouping to group circular code together

### Problem: Wrong imports generated
**Solution:** Create a custom `grouping.json` to specify how blocks should be grouped.

### Problem: Very slow on large files
**Solution:** The tool should handle 10,000+ lines efficiently. If slow:
1. Try with `--no-comments` flag
2. Check if file is highly obfuscated (not recommended)

## Next Steps

- Read the full [README.md](README.md) for complete documentation
- Check out the [examples.py](examples.py) for more code examples
- Explore the source code in [script_spliter/](script_spliter/) directory
- Open an issue if you find bugs or have feature requests

## Common Workflows

### Modernize Legacy Code

```bash
# 1. Analyze the legacy file
script-spliter legacy.js --analyze

# 2. Review the structure
script-spliter legacy.js --blocks-info

# 3. Create custom grouping if needed
# (Create grouping.json with desired structure)

# 4. Generate ES6 modules
script-spliter legacy.js -o modern/ --format esm --config grouping.json

# 5. Integrate the split modules into your project
```

### Extract Components

```bash
# 1. Get dependency info
script-spliter bundle.js --blocks-info

# 2. Create grouping for specific components
# (e.g., group all UI components together)

# 3. Generate with custom grouping
script-spliter bundle.js -o components/ --config grouping.json

# 4. Use only the needed modules
```

### Code Review/Refactoring

```bash
# Analyze and review the dependency report
script-spliter app.js --analyze

# Check specific dependency chains
script-spliter app.js --deps mainFunction

# Generate split code for easier review
script-spliter app.js -o reviewed/ --format esm
```

---

For more information, see the [README.md](README.md) file.
