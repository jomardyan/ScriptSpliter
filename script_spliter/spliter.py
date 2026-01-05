"""
Main ScriptSpliter orchestrator.
"""

import json
from pathlib import Path
from typing import Dict, Optional
from .parser import JavaScriptParser
from .analyzer import DependencyAnalyzer
from .generator import ModuleGenerator, ModuleConfig, CodeAnalysisReport


class ScriptSpliter:
    """Main orchestrator for splitting JavaScript files."""
    
    def __init__(self, source_file: str):
        """Initialize with a JavaScript source file."""
        self.source_file = Path(source_file)
        
        if not self.source_file.exists():
            raise FileNotFoundError(f"Source file not found: {source_file}")
        
        # Read source (prefer UTF-8, tolerate invalid bytes if needed).
        try:
            self.source_code = self.source_file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            self.source_code = self.source_file.read_text(encoding="utf-8", errors="replace")
        
        # Parse
        self.parser = JavaScriptParser(self.source_code)
        self.blocks = self.parser.parse()
        
        # Analyze
        self.analyzer = DependencyAnalyzer(self.blocks)
        
        self.generator = None
        self.modules = {}
    
    def split(
        self,
        output_dir: str,
        format: str = "esm",
        auto_group: bool = True,
        custom_grouping: Optional[Dict[str, list]] = None,
        include_comments: bool = True,
        include_report: bool = True,
        target_module_lines: int = 2000,
        max_blocks_per_module: int = 0,
        dry_run: bool = False
    ) -> Dict[str, str]:
        """
        Split the JavaScript file into modules.
        
        Args:
            output_dir: Directory to write output files
            format: Output format ("esm", "commonjs", or "scripts")
            auto_group: Automatically group related code (if custom_grouping not provided)
            custom_grouping: Custom grouping of blocks into modules
            include_comments: Include comments in generated files
            include_report: Generate analysis report
            target_module_lines: Target max lines per module (0 disables packing)
            max_blocks_per_module: Max blocks per module (0 disables limit)
            dry_run: Generate output in memory only; do not write files
        
        Returns:
            Dictionary mapping module names to file paths
        """
        # Determine grouping
        if custom_grouping:
            grouping = custom_grouping
        elif auto_group:
            grouping = self.analyzer.get_module_suggestions(
                target_lines_per_module=target_module_lines,
                max_blocks_per_module=max_blocks_per_module
            )
        else:
            # One block per module
            grouping = {block.name: [block.name] for block in self.blocks if block.name}
        
        # Validate format
        if format not in ("esm", "commonjs", "scripts"):
            raise ValueError(f"Invalid format: {format}. Must be 'esm', 'commonjs', or 'scripts'")
        
        # Generate modules
        config = ModuleConfig(
            format=format,
            add_comments=include_comments,
            preserve_original=True
        )
        
        self.generator = ModuleGenerator(self.blocks, self.analyzer, config)
        self.modules = self.generator.generate_modules(grouping)

        if dry_run:
            file_paths = {}
            output_path = Path(output_dir)
            file_ext = self.generator.get_file_extension()
            for module_name in self.modules.keys():
                file_paths[module_name] = str(output_path / f"{module_name}{file_ext}")
            index_name = "index.js" if format != "scripts" else "index.html"
            file_paths["index"] = str(output_path / index_name)
            if include_report:
                file_paths["report"] = str(output_path / "ANALYSIS_REPORT.txt")
            return file_paths

        # Write files
        file_paths = self.generator.write_files(output_dir)

        # Generate report if requested
        if include_report:
            report = CodeAnalysisReport(self.blocks, self.modules, self.analyzer)
            report_content = report.generate_report()

            report_path = Path(output_dir) / "ANALYSIS_REPORT.txt"
            with open(report_path, 'w') as f:
                f.write(report_content)

            file_paths["report"] = str(report_path)
        
        return file_paths
    
    def get_analysis(self) -> str:
        """Get code analysis without generating files."""
        report = CodeAnalysisReport(self.blocks, {}, self.analyzer)
        return report.generate_report()
    
    def get_blocks_info(self) -> list:
        """Get information about all parsed blocks."""
        return [
            {
                "name": block.name,
                "type": block.type,
                "lines": f"{block.start_line + 1}-{block.end_line + 1}",
                "dependencies": list(block.dependencies),
                "exported": block.is_exported
            }
            for block in self.blocks
        ]
    
    def get_dependency_tree(self, block_name: str) -> Dict:
        """Get dependency tree for a specific block."""
        block = self.parser.get_block(block_name)
        if not block:
            return {}
        
        def build_tree(name: str, visited: set = None) -> Dict:
            if visited is None:
                visited = set()
            
            if name in visited:
                return {"name": name, "circular": True}
            
            visited.add(name)
            deps = self.analyzer.graph.dependencies.get(name, set())
            
            return {
                "name": name,
                "dependencies": [build_tree(dep, visited.copy()) for dep in sorted(deps)]
            }
        
        return build_tree(block_name)
