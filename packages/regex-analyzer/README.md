# @regex-studio/regex-analyzer

Static analysis, linting, and safety validation engine for visual Regex Studio AST structures.

## Features

- **ReDoS Protection**: Statically searches for nested infinite quantifiers and overlapping character ranges to prevent catastrophic backtracking.
- **Performance Diagnostics**: Scores expressions dynamically and surfaces real-time performance hints to users.
- **Syntax Suggestions**: Guides users toward cleaner, safer regular expression structures.

## Installation

```bash
npm install @regex-studio/regex-analyzer
```

## License

Apache-2.0
