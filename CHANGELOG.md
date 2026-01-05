# Changelog

All notable changes to ScriptSpliter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-05

### Added
- Initial public release
- JavaScript code parser with support for:
  - Function declarations (standard, arrow, async)
  - Class declarations with inheritance
  - Variable assignments and exports
  - Import statements
- Dependency analysis with:
  - Automatic dependency detection
  - Circular dependency detection
  - Logical grouping suggestions
  - Import order calculation
- Module generation with support for:
  - ES6 Module (ESM) format
  - CommonJS format
  - HTML script tag format
- Command-line interface with full feature set
- Configuration management (JSON/YAML)
- Detailed analysis reports
- Comprehensive documentation and quick start guide
- Support for Python 3.8+

### Features
- Analyzes large JavaScript files (10,000+ lines)
- Automatic intelligent code grouping
- Custom grouping via configuration files
- Dependency tree visualization
- Multiple output formats
- Detailed code structure analysis
- Import/export handling

## [Future]

### Planned
- TypeScript support
- Source map generation
- Performance optimizations
- Visual dependency graph output
- WebAssembly parsing support
- Extended CLI features
