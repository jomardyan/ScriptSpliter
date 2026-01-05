"""
Example usage of ScriptSpliter library.
"""

from script_spliter import ScriptSpliter
from script_spliter.config import GroupingBuilder
import os

# Create a sample JavaScript file for demonstration
SAMPLE_JS = """
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
        return `<div class="modal"><h2>${this.title}</h2><p>${this.content}</p></div>`;
    }
}

class Card {
    constructor(data) {
        this.data = data;
    }
    
    render() {
        return `<div class="card">${this.data}</div>`;
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

async function logout() {
    const response = await fetch('/api/logout', { method: 'POST' });
    return response.ok;
}

// Helper functions
function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}

// Complex interdependent function
const createUser = async function(userData) {
    if (!validateEmail(userData.email)) {
        throw new Error('Invalid email');
    }
    const sanitized = sanitizeInput(userData.name);
    const user = await fetchUser(userData.id);
    return updateProfile(user.id, { ...user, name: sanitized });
};
"""

def example_1_basic_analysis():
    """Example 1: Analyze a JavaScript file."""
    print("=" * 70)
    print("Example 1: Basic Code Analysis")
    print("=" * 70)
    
    # Create sample file
    os.makedirs('examples', exist_ok=True)
    sample_file = 'examples/sample.js'
    with open(sample_file, 'w') as f:
        f.write(SAMPLE_JS)
    
    # Analyze
    splitter = ScriptSpliter(sample_file)
    print(splitter.get_analysis())


def example_2_block_info():
    """Example 2: Get information about detected blocks."""
    print("=" * 70)
    print("Example 2: Detected Code Blocks")
    print("=" * 70)
    
    sample_file = 'examples/sample.js'
    splitter = ScriptSpliter(sample_file)
    
    blocks = splitter.get_blocks_info()
    print(f"\nFound {len(blocks)} code blocks:\n")
    
    for block in blocks:
        deps = f" → depends on: {', '.join(block['dependencies'])}" if block['dependencies'] else ""
        print(f"  {block['name']:20} [{block['type']:10}] Lines {block['lines']:15}{deps}")


def example_3_dependency_tree():
    """Example 3: Show dependency tree for a specific block."""
    print("=" * 70)
    print("Example 3: Dependency Tree")
    print("=" * 70)
    
    sample_file = 'examples/sample.js'
    splitter = ScriptSpliter(sample_file)
    
    # Show tree for a function with dependencies
    tree = splitter.get_dependency_tree('createUser')
    print(f"\nDependency tree for 'createUser':")
    _print_tree(tree)


def example_4_split_with_auto_grouping():
    """Example 4: Split with automatic grouping."""
    print("=" * 70)
    print("Example 4: Split with Automatic Grouping (ESM)")
    print("=" * 70)
    
    sample_file = 'examples/sample.js'
    splitter = ScriptSpliter(sample_file)
    
    output_dir = 'examples/output_auto_esm'
    file_paths = splitter.split(
        output_dir=output_dir,
        format='esm',
        auto_group=True,
        include_comments=True,
        include_report=True
    )
    
    print(f"\n✓ Successfully split into {len(file_paths) - 1} modules\n")
    
    print("Generated files:")
    for name, path in sorted(file_paths.items()):
        print(f"  {name:20} → {path}")


def example_5_split_with_custom_grouping():
    """Example 5: Split with custom grouping."""
    print("=" * 70)
    print("Example 5: Split with Custom Grouping (CommonJS)")
    print("=" * 70)
    
    sample_file = 'examples/sample.js'
    splitter = ScriptSpliter(sample_file)
    
    # Define custom grouping
    custom_grouping = {
        "utilities": ["formatDate", "parseJSON", "debounce", "validateEmail", "sanitizeInput"],
        "components": ["Button", "Modal", "Card"],
        "api": ["fetchUser", "updateProfile", "logout"],
        "user": ["createUser"]
    }
    
    output_dir = 'examples/output_custom_commonjs'
    file_paths = splitter.split(
        output_dir=output_dir,
        format='commonjs',
        custom_grouping=custom_grouping,
        include_comments=True,
        include_report=True
    )
    
    print(f"\n✓ Successfully split into {len(file_paths) - 1} modules\n")
    
    print("Generated files:")
    for name, path in sorted(file_paths.items()):
        print(f"  {name:20} → {path}")


def example_6_programmatic_grouping():
    """Example 6: Build grouping programmatically."""
    print("=" * 70)
    print("Example 6: Programmatic Grouping")
    print("=" * 70)
    
    from script_spliter.config import GroupingBuilder
    
    builder = GroupingBuilder()
    builder.add_group('helpers', ['validateEmail', 'sanitizeInput', 'parseJSON', 'formatDate'])
    builder.add_group('ui', ['Button', 'Modal', 'Card'])
    builder.add_group('services', ['fetchUser', 'updateProfile', 'logout', 'createUser'])
    builder.add_group('utilities', ['debounce'])
    
    grouping = builder.get_grouping()
    
    print("\nGrouping configuration:")
    for module, blocks in sorted(grouping.items()):
        print(f"  {module}:")
        for block in sorted(blocks):
            print(f"    - {block}")
    
    # Save to file
    os.makedirs('examples', exist_ok=True)
    config_file = 'examples/custom-grouping.json'
    builder.save(config_file)
    print(f"\n✓ Grouping saved to {config_file}")


def _print_tree(node, indent=0):
    """Pretty-print a dependency tree."""
    if isinstance(node, dict):
        if "circular" in node and node["circular"]:
            print(" " * indent + f"├─ {node['name']} (circular)")
        else:
            print(" " * indent + f"├─ {node['name']}")
            deps = node.get("dependencies", [])
            for i, dep in enumerate(deps):
                is_last = i == len(deps) - 1
                prefix = "    " if is_last else "│   "
                _print_tree(dep, indent + 4)


if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("ScriptSpliter - Usage Examples")
    print("=" * 70 + "\n")
    
    example_1_basic_analysis()
    print("\n")
    
    example_2_block_info()
    print("\n")
    
    example_3_dependency_tree()
    print("\n")
    
    example_4_split_with_auto_grouping()
    print("\n")
    
    example_5_split_with_custom_grouping()
    print("\n")
    
    example_6_programmatic_grouping()
    
    print("\n" + "=" * 70)
    print("Examples completed! Check the 'examples/' directory for output.")
    print("=" * 70 + "\n")
