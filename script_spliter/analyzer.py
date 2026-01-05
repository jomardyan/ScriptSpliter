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
                    group = self._build_group(block.name)
                    groups.append(group)
                    visited.update(group)
        
        # Then process remaining blocks
        for block in self.blocks:
            if block.name and block.name not in visited:
                group = self._build_group(block.name)
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
        
        def dfs(node: str, path: List[str]) -> bool:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.graph.dependencies.get(node, set()):
                if neighbor not in visited:
                    if dfs(neighbor, path.copy()):
                        return True
                elif neighbor in rec_stack:
                    # Found a cycle
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:] + [neighbor]
                    cycles.append(cycle)
                    return True
            
            rec_stack.discard(node)
            return False
        
        for block in self.blocks:
            if block.name and block.name not in visited:
                dfs(block.name, [])
        
        return cycles
    
    def get_module_suggestions(self) -> Dict[str, List[str]]:
        """Suggest how to group blocks into modules."""
        suggestions = {}
        groups = self.get_logical_groups()
        
        for i, group in enumerate(groups):
            # Generate a module name based on the blocks in the group
            names = sorted(group)
            if len(names) == 1:
                module_name = names[0]
            else:
                # Find a common prefix or use a numbered name
                module_name = f"module_{i + 1}"
            
            suggestions[module_name] = names
        
        return suggestions
