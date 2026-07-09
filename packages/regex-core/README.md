# @regex-studio/regex-core

The foundation and single source of truth for regular expression Abstract Syntax Trees (AST) in Regex Studio v3.

## Features

- **Standardized AST Typings**: Core TypeScript typings defining modern regular expression structural components (ECMAScript and PCRE).
- **Serialization**: Complete lossless JSON serialization and deserialization utilities (`serializeAST`/`deserializeAST`).
- **Validation**: Strict structural validation to ensure AST safety (`validateAST`).
- **Migration Engine**: Seamless upgrading of legacy v1 and v2 formats to modern v3 specifications.

## Installation

```bash
npm install @regex-studio/regex-core
```

## License

Apache-2.0
