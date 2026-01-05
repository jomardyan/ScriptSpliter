"""
Configuration handling for ScriptSpliter.
"""

import json
from typing import Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass, asdict
import yaml


@dataclass
class SplitterConfig:
    """Configuration for the script splitter."""
    format: str = "esm"  # esm, commonjs, scripts
    auto_group: bool = True
    include_comments: bool = True
    include_source_maps: bool = False
    preserve_original: bool = True
    min_block_size: int = 0  # Minimum lines for a block to be extracted
    max_blocks_per_module: int = 0  # 0 means unlimited
    exclude_patterns: list = None
    include_patterns: list = None
    
    def __post_init__(self):
        if self.exclude_patterns is None:
            self.exclude_patterns = []
        if self.include_patterns is None:
            self.include_patterns = []


class ConfigLoader:
    """Load and manage configuration files."""
    
    SUPPORTED_FORMATS = ['.json', '.yaml', '.yml']
    
    @staticmethod
    def load_from_file(config_path: str) -> SplitterConfig:
        """Load configuration from a file."""
        path = Path(config_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        
        if path.suffix == '.json':
            return ConfigLoader._load_json(path)
        elif path.suffix in ['.yaml', '.yml']:
            return ConfigLoader._load_yaml(path)
        else:
            raise ValueError(f"Unsupported config format: {path.suffix}")
    
    @staticmethod
    def _load_json(path: Path) -> SplitterConfig:
        """Load JSON configuration."""
        with open(path, 'r') as f:
            data = json.load(f)
        return SplitterConfig(**data)
    
    @staticmethod
    def _load_yaml(path: Path) -> SplitterConfig:
        """Load YAML configuration."""
        try:
            import yaml
        except ImportError:
            raise ImportError("PyYAML is required to load YAML configuration files")
        
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        return SplitterConfig(**data)
    
    @staticmethod
    def load_grouping(grouping_path: str) -> Dict[str, list]:
        """Load custom grouping from a file."""
        path = Path(grouping_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Grouping file not found: {grouping_path}")
        
        with open(path, 'r') as f:
            return json.load(f)
    
    @staticmethod
    def save_grouping(grouping: Dict[str, list], output_path: str):
        """Save grouping to a JSON file."""
        with open(output_path, 'w') as f:
            json.dump(grouping, f, indent=2)
    
    @staticmethod
    def get_default_config() -> SplitterConfig:
        """Get default configuration."""
        return SplitterConfig()
    
    @staticmethod
    def create_sample_config(output_path: str, format: str = 'json'):
        """Create a sample configuration file."""
        config = SplitterConfig()
        config_dict = asdict(config)
        
        output = Path(output_path)
        
        if format == 'json':
            with open(output, 'w') as f:
                json.dump(config_dict, f, indent=2)
        elif format in ['yaml', 'yml']:
            try:
                import yaml
                with open(output, 'w') as f:
                    yaml.dump(config_dict, f, default_flow_style=False)
            except ImportError:
                raise ImportError("PyYAML is required to create YAML configuration files")
        else:
            raise ValueError(f"Unsupported format: {format}")


class GroupingBuilder:
    """Build custom grouping configurations."""
    
    def __init__(self):
        self.grouping: Dict[str, list] = {}
    
    def add_group(self, module_name: str, blocks: list) -> 'GroupingBuilder':
        """Add a group to the configuration."""
        self.grouping[module_name] = blocks
        return self
    
    def add_block_to_group(self, module_name: str, block_name: str) -> 'GroupingBuilder':
        """Add a block to an existing group."""
        if module_name not in self.grouping:
            self.grouping[module_name] = []
        if block_name not in self.grouping[module_name]:
            self.grouping[module_name].append(block_name)
        return self
    
    def get_grouping(self) -> Dict[str, list]:
        """Get the built grouping."""
        return self.grouping
    
    def save(self, output_path: str):
        """Save grouping to a file."""
        ConfigLoader.save_grouping(self.grouping, output_path)
    
    def clear(self) -> 'GroupingBuilder':
        """Clear all groups."""
        self.grouping = {}
        return self
