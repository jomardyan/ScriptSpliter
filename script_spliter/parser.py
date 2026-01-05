"""
JavaScript code parser to identify functions, classes, and code blocks.
"""

import re
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass, field


@dataclass
class CodeBlock:
    """Represents a parsed code block (function, class, or statement)."""
    name: Optional[str]
    type: str  # "function", "class", "assignment", "statement"
    start_line: int
    end_line: int
    content: str
    dependencies: Set[str] = field(default_factory=set)
    is_exported: bool = False
    export_default: bool = False
    
    def __hash__(self):
        return hash(self.name or id(self))
    
    def __eq__(self, other):
        if not isinstance(other, CodeBlock):
            return False
        return self.name == other.name and self.type == other.type


class JavaScriptParser:
    """Parses JavaScript code to extract functions, classes, and dependencies."""
    
    # Regex patterns for parsing
    FUNCTION_PATTERN = r'(?:^|\s)(?:async\s+)?function\s+(\w+)\s*\('
    ARROW_FUNCTION_PATTERN = r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?:=>|=\s*async\s*\()'
    CLASS_PATTERN = r'class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{'
    CONST_PATTERN = r'(?:^|\s)(?:const|let|var)\s+(\w+)\s*=\s*(?!(?:async\s*)?\()'
    EXPORT_PATTERN = r'export\s+(?:default\s+)?(?:(?:async\s+)?function|class)\s+(\w+)|export\s*\{\s*([^}]+)\s*\}'
    IMPORT_PATTERN = r'import\s+(?:(?:\{[^}]+\})|(?:\*\s+as\s+\w+)|(?:\w+))\s+from\s+[\'"]([^\'"]+)[\'"]'
    REQUIRE_PATTERN = r'require\s*\(\s*[\'"]([^\'"]+)['\']\s*\)'
    
    def __init__(self, source: str):
        """Initialize parser with JavaScript source code."""
        self.source = source
        self.lines = source.split('\n')
        self.blocks: List[CodeBlock] = []
        self.imports: Set[str] = set()
        self.exports: Dict[str, str] = {}
        
    def parse(self) -> List[CodeBlock]:
        """Parse the JavaScript source and extract all code blocks."""
        self._extract_functions()
        self._extract_classes()
        self._extract_assignments()
        self._extract_dependencies()
        self._extract_exports_imports()
        
        # Sort blocks by start line
        self.blocks.sort(key=lambda b: b.start_line)
        
        return self.blocks
    
    def _extract_functions(self):
        """Extract function declarations."""
        # Standard function declarations
        for match in re.finditer(self.FUNCTION_PATTERN, self.source, re.MULTILINE):
            func_name = match.group(1)
            start_pos = match.start()
            start_line = self.source[:start_pos].count('\n')
            
            # Find matching closing brace
            end_line = self._find_closing_brace(start_pos)
            if end_line is not None:
                content = '\n'.join(self.lines[start_line:end_line + 1])
                block = CodeBlock(
                    name=func_name,
                    type="function",
                    start_line=start_line,
                    end_line=end_line,
                    content=content
                )
                self._add_unique_block(block)
        
        # Arrow function assignments
        for match in re.finditer(self.ARROW_FUNCTION_PATTERN, self.source, re.MULTILINE):
            func_name = match.group(1)
            start_pos = match.start()
            start_line = self.source[:start_pos].count('\n')
            
            # Find end of statement (semicolon or newline)
            end_pos = self.source.find(';', start_pos)
            if end_pos == -1:
                end_pos = self.source.find('\n', start_pos)
            
            end_line = self.source[:end_pos].count('\n')
            if end_line < len(self.lines):
                content = '\n'.join(self.lines[start_line:end_line + 1])
                block = CodeBlock(
                    name=func_name,
                    type="function",
                    start_line=start_line,
                    end_line=end_line,
                    content=content
                )
                self._add_unique_block(block)
    
    def _extract_classes(self):
        """Extract class declarations."""
        for match in re.finditer(self.CLASS_PATTERN, self.source, re.MULTILINE):
            class_name = match.group(1)
            parent_class = match.group(2)
            start_pos = match.start()
            start_line = self.source[:start_pos].count('\n')
            
            # Find matching closing brace
            brace_pos = self.source.find('{', start_pos)
            end_line = self._find_closing_brace(brace_pos)
            
            if end_line is not None:
                content = '\n'.join(self.lines[start_line:end_line + 1])
                block = CodeBlock(
                    name=class_name,
                    type="class",
                    start_line=start_line,
                    end_line=end_line,
                    content=content,
                    dependencies={parent_class} if parent_class else set()
                )
                self._add_unique_block(block)
    
    def _extract_assignments(self):
        """Extract variable assignments (const, let, var)."""
        for match in re.finditer(self.CONST_PATTERN, self.source, re.MULTILINE):
            var_name = match.group(1)
            start_pos = match.start()
            start_line = self.source[:start_pos].count('\n')
            
            # Find end of statement
            end_pos = self.source.find(';', start_pos)
            if end_pos == -1:
                # Find next newline
                end_pos = self.source.find('\n', start_pos)
            
            if end_pos != -1:
                end_line = self.source[:end_pos].count('\n')
                if end_line < len(self.lines):
                    content = '\n'.join(self.lines[start_line:end_line + 1])
                    block = CodeBlock(
                        name=var_name,
                        type="assignment",
                        start_line=start_line,
                        end_line=end_line,
                        content=content
                    )
                    self._add_unique_block(block)
    
    def _extract_dependencies(self):
        """Extract dependencies between code blocks."""
        # Build identifier pattern
        identifiers = {block.name for block in self.blocks if block.name}
        
        for block in self.blocks:
            dependencies = set()
            
            # Find all identifiers used in this block
            for identifier in identifiers:
                if identifier != block.name:
                    # Simple pattern: word boundary around identifier
                    pattern = r'\b' + re.escape(identifier) + r'\b'
                    if re.search(pattern, block.content):
                        dependencies.add(identifier)
            
            block.dependencies = dependencies
    
    def _extract_exports_imports(self):
        """Extract export and import statements."""
        # Extract imports
        for match in re.finditer(self.IMPORT_PATTERN, self.source, re.MULTILINE):
            module_path = match.group(1)
            self.imports.add(module_path)
        
        # Also check for require
        for match in re.finditer(self.REQUIRE_PATTERN, self.source, re.MULTILINE):
            module_path = match.group(1)
            self.imports.add(module_path)
        
        # Extract exports
        export_lines = re.findall(r'export\s+.*', self.source)
        
        for line in export_lines:
            if 'default' in line:
                # Extract default export
                match = re.search(r'export\s+default\s+(\w+)', line)
                if match:
                    self.exports['default'] = match.group(1)
            else:
                # Extract named exports
                match = re.search(r'export\s+(?:(?:async\s+)?function|class)\s+(\w+)', line)
                if match:
                    self.exports[match.group(1)] = match.group(1)
                else:
                    # Extract from export { ... }
                    items = re.findall(r'\w+', line)
                    for item in items:
                        if item != 'export':
                            self.exports[item] = item
        
        # Mark exported blocks
        for block in self.blocks:
            if block.name in self.exports:
                block.is_exported = True
                if self.exports.get('default') == block.name:
                    block.export_default = True
    
    def _find_closing_brace(self, start_pos: int) -> Optional[int]:
        """Find the line number of closing brace matching the one at start_pos."""
        if start_pos >= len(self.source) or self.source[start_pos] != '{':
            return None
        
        brace_count = 0
        in_string = False
        string_char = None
        escape_next = False
        
        for i in range(start_pos, len(self.source)):
            char = self.source[i]
            
            if escape_next:
                escape_next = False
                continue
            
            if char == '\\':
                escape_next = True
                continue
            
            if char in ('"', "'", '`') and not in_string:
                in_string = True
                string_char = char
            elif char == string_char and in_string:
                in_string = False
                string_char = None
            elif not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        return self.source[:i].count('\n')
        
        return None
    
    def _add_unique_block(self, block: CodeBlock):
        """Add block if it doesn't already exist with the same name and type."""
        for existing in self.blocks:
            if existing.name == block.name and existing.type == block.type:
                return
        self.blocks.append(block)
    
    def get_dependencies_for(self, block_name: str) -> Set[str]:
        """Get all dependencies for a specific block."""
        for block in self.blocks:
            if block.name == block_name:
                return block.dependencies
        return set()
    
    def get_block(self, name: str) -> Optional[CodeBlock]:
        """Get a block by name."""
        for block in self.blocks:
            if block.name == name:
                return block
        return None
