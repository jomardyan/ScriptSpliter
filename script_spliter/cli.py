"""
Command-line interface for ScriptSpliter.
"""

import sys
import argparse
import json
from pathlib import Path
from .spliter import ScriptSpliter


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Split large JavaScript files into structured modules",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Split a JavaScript file with automatic grouping
  script-spliter input.js -o output/

  # Split with specific output format
  script-spliter input.js -o output/ --format commonjs

  # Generate analysis report without splitting
  script-spliter input.js --analyze

  # Use custom grouping configuration
  script-spliter input.js -o output/ --config grouping.json
        """
    )
    
    parser.add_argument(
        "input",
        help="Path to the JavaScript file to split"
    )
    
    parser.add_argument(
        "-o", "--output",
        help="Output directory for generated modules",
        default="./output"
    )
    
    parser.add_argument(
        "-f", "--format",
        choices=["esm", "commonjs", "scripts"],
        default="esm",
        help="Output module format (default: esm)"
    )
    
    parser.add_argument(
        "-c", "--config",
        help="Path to custom grouping configuration file (JSON)"
    )
    
    parser.add_argument(
        "--no-auto-group",
        action="store_true",
        help="Disable automatic grouping (one block per module)"
    )
    
    parser.add_argument(
        "--no-comments",
        action="store_true",
        help="Don't include comments in generated files"
    )
    
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Don't generate analysis report"
    )
    
    parser.add_argument(
        "--analyze",
        action="store_true",
        help="Analyze code without generating files"
    )
    
    parser.add_argument(
        "--blocks-info",
        action="store_true",
        help="Display information about detected code blocks"
    )
    
    parser.add_argument(
        "--deps",
        metavar="BLOCK_NAME",
        help="Show dependency tree for a specific block"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize spliter
        if args.verbose:
            print(f"Reading source file: {args.input}")
        
        spliter = ScriptSpliter(args.input)
        
        # Display blocks info if requested
        if args.blocks_info:
            print("\nDetected Code Blocks:")
            print("-" * 70)
            blocks_info = spliter.get_blocks_info()
            for block in blocks_info:
                deps_str = f" -> {', '.join(block['dependencies'])}" if block['dependencies'] else ""
                print(f"  {block['name']:30} [{block['type']:10}] Lines {block['lines']:15}{deps_str}")
            print()
        
        # Show dependency tree if requested
        if args.deps:
            tree = spliter.get_dependency_tree(args.deps)
            print(f"\nDependency Tree for '{args.deps}':")
            print("-" * 70)
            _print_tree(tree)
            print()
        
        # Show analysis report if requested
        if args.analyze:
            print(spliter.get_analysis())
            return 0
        
        # Load custom grouping if provided
        custom_grouping = None
        if args.config:
            if args.verbose:
                print(f"Loading custom grouping from: {args.config}")
            with open(args.config, 'r') as f:
                custom_grouping = json.load(f)
        
        # Split the file
        if args.verbose:
            print(f"Splitting JavaScript file...")
            print(f"Output format: {args.format}")
            print(f"Output directory: {args.output}")
        
        file_paths = spliter.split(
            output_dir=args.output,
            format=args.format,
            auto_group=not args.no_auto_group,
            custom_grouping=custom_grouping,
            include_comments=not args.no_comments,
            include_report=not args.no_report
        )
        
        # Display results
        print("\n✓ Successfully split JavaScript file!")
        print("\nGenerated files:")
        print("-" * 70)
        for name, path in file_paths.items():
            if name != "report":
                print(f"  {name:20} -> {path}")
        
        if "report" in file_paths:
            print(f"  {'analysis report':20} -> {file_paths['report']}")
        
        print()
        return 0
        
    except FileNotFoundError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


def _print_tree(node, indent=0):
    """Pretty-print a dependency tree."""
    if isinstance(node, dict):
        if "circular" in node and node["circular"]:
            print(" " * indent + f"├─ {node['name']} (circular dependency)")
        else:
            print(" " * indent + f"├─ {node['name']}")
            deps = node.get("dependencies", [])
            for i, dep in enumerate(deps):
                is_last = i == len(deps) - 1
                prefix = "    " if is_last else "│   "
                child_indent = indent + 4
                _print_tree(dep, child_indent)


if __name__ == "__main__":
    sys.exit(main())
