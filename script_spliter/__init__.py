"""
ScriptSpliter - Convert large JavaScript files into modular components.
"""

__version__ = "0.1.0"
__author__ = "Script Spliter Team"

from .spliter import ScriptSpliter
from .parser import JavaScriptParser, CodeBlock
from .analyzer import DependencyAnalyzer
from .generator import ModuleGenerator, ModuleConfig
from .config import ConfigLoader, GroupingBuilder

__all__ = [
    'ScriptSpliter',
    'JavaScriptParser',
    'CodeBlock',
    'DependencyAnalyzer',
    'ModuleGenerator',
    'ModuleConfig',
    'ConfigLoader',
    'GroupingBuilder',
]
