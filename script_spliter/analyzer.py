"""
Dependency analyzer for JavaScript code blocks.
"""

from typing import Dict, Set, List, Tuple
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class DependencyGraph:
    """Represents the dependency relationships between code blocks."""
    dependencies: Dict[str, Set[str]]  # block_name -> set of dependencies
    reverse_dependencies: Dict[str, Set[str]]  # block_name -> set of dependents
    
    def get_all_dependencies(self, name: str) -> Set[str]:
        """Get all direct and transitive dependencies."""
        visited = set()
        stack = [name]
        
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            
            deps = self.dependencies.get(current, set())
            stack.extend(deps - visited)
        
        visited.discard(name)
        return visited
    
    def get_all_dependents(self, name: str) -> Set[str]:
        """Get all direct and transitive dependents."""
        visited = set()
        stack = [name]
        
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            
            dependents = self.reverse_dependencies.get(current, set())
            stack.extend(dependents - visited)
        
        visited.discard(name)
        return visited


class DependencyAnalyzer:
    """Analyzes dependencies between code blocks."""
    
    def __init__(self, blocks):
        """Initialize with a list of CodeBlock objects."""
        self.blocks = blocks
        self.graph = self._build_graph()
    
    def _build_graph(self) -> DependencyGraph:
        """Build the dependency graph."""
        dependencies = {}
        reverse_dependencies = defaultdict(set)
        
        for block in self.blocks:
            dependencies[block.name] = block.dependencies.copy()
            
            for dep in block.dependencies:
                reverse_dependencies[dep].add(block.name)
        
        return DependencyGraph(
            dependencies=dependencies,
            reverse_dependencies=dict(reverse_dependencies)
        )
    
    def get_logical_groups(self) -> List[Set[str]]:
        """Group related blocks by their dependencies."""
        groups = []
        visited = set()
        
        # Start with blocks that have no dependencies (leaf nodes)
        for block in self.blocks:
            if not block.dependencies:
                if block.name and block.name not in visited:
                    group = self._build_group(block.name) - visited
                    if group:
                        groups.append(group)
                        visited.update(group)
        
        # Then process remaining blocks
        for block in self.blocks:
            if block.name and block.name not in visited:
                group = self._build_group(block.name) - visited
                if group:
                    groups.append(group)
                    visited.update(group)
        
        return groups
    
    def _build_group(self, start_name: str) -> Set[str]:
        """Build a group containing a block and its direct dependencies."""
        group = {start_name}
        group.update(self.graph.get_all_dependencies(start_name))
        return group
    
    def get_import_order(self) -> List[str]:
        """Get the order in which modules should be imported."""
        result = []
        visited = set()
        
        def visit(name: str):
            if name in visited or name is None:
                return
            visited.add(name)
            
            for dep in self.graph.dependencies.get(name, set()):
                visit(dep)
            
            result.append(name)
        
        # Start with blocks that have fewest dependencies
        blocks_by_dep_count = sorted(
            (b for b in self.blocks if b.name),
            key=lambda b: len(b.dependencies)
        )
        
        for block in blocks_by_dep_count:
            visit(block.name)
        
        return result
    
    def detect_circular_dependencies(self) -> List[List[str]]:
        """Detect circular dependencies in the code."""
        cycles = []
        visited = set()
        rec_stack = set()
        
        def dfs(node: str, path: List[str]) -> None:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.graph.dependencies.get(node, set()):
                if neighbor not in visited:
                    dfs(neighbor, path)
                elif neighbor in rec_stack:
                    # Found a cycle; guard against missing neighbor in path.
                    if neighbor in path:
                        cycle_start = path.index(neighbor)
                        cycle = path[cycle_start:] + [neighbor]
                    else:
                        cycle = [node, neighbor, node]
                    cycles.append(cycle)
            
            path.pop()
            rec_stack.discard(node)
        
        for block in self.blocks:
            if block.name and block.name not in visited:
                dfs(block.name, [])
        
        return cycles
    
    def get_module_suggestions(
        self,
        target_lines_per_module: int = 2000,
        max_blocks_per_module: int = 0
    ) -> Dict[str, List[str]]:
        """Suggest how to group blocks into modules."""
        suggestions = {}
        groups = self.get_logical_groups()
        packed_groups = self._pack_groups(groups, target_lines_per_module, max_blocks_per_module)
        
        for i, group in enumerate(packed_groups):
            # Generate a module name based on the blocks in the group
            names = self._order_blocks(group)
            if len(names) == 1:
                module_name = names[0]
            else:
                # Find a common prefix or use a numbered name
                module_name = f"module_{i + 1}"
            
            suggestions[module_name] = names
        
        return suggestions

    def _pack_groups(
        self,
        groups: List[Set[str]],
        target_lines_per_module: int,
        max_blocks_per_module: int
    ) -> List[List[str]]:
        """Combine small groups into larger modules based on size thresholds."""
        if target_lines_per_module <= 0 and max_blocks_per_module <= 0:
            return [self._order_blocks(group) for group in groups]

        block_sizes = {
            block.name: (block.end_line - block.start_line + 1)
            for block in self.blocks
            if block.name
        }

        packed: List[List[str]] = []
        current: List[str] = []
        current_lines = 0
        current_blocks = 0

        for group in groups:
            ordered = self._order_blocks(group)
            group_lines = sum(block_sizes.get(name, 0) for name in ordered)
            group_blocks = len(ordered)

            needs_new = False
            if current:
                if target_lines_per_module > 0 and current_lines + group_lines > target_lines_per_module:
                    needs_new = True
                if max_blocks_per_module > 0 and current_blocks + group_blocks > max_blocks_per_module:
                    needs_new = True

            if needs_new:
                packed.append(current)
                current = []
                current_lines = 0
                current_blocks = 0

            current.extend(ordered)
            current_lines += group_lines
            current_blocks += group_blocks

        if current:
            packed.append(current)

        return packed

    def _order_blocks(self, block_names: Set[str]) -> List[str]:
        """Order block names by their appearance in the source."""
        order_map = {block.name: i for i, block in enumerate(self.blocks) if block.name}
        return sorted(block_names, key=lambda name: order_map.get(name, 0))
