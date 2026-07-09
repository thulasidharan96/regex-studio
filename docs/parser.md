# Regex Studio Parser

The `@regex-studio/regex-parser` package is responsible for compiling standard regular expression strings into the visual Abstract Syntax Tree (AST) structures used across the application.

## Parser Pipeline

The conversion process consists of four linear, robust stages:

```
Regex String Input  ➔  [Tokenizer]  ➔  [Lexer]  ➔  [Parser]  ➔  Regex AST Output
```

1. **Tokenizer**: Scans the input character-by-character and generates atomic string slices (e.g., separating literal characters from structural tokens like `(`, `[`, `*`, `+`).
2. **Lexer**: Aggregates raw tokens into higher-level syntactic units called lexemes, processing escape sequences and character sequences (e.g., transforming `\d` or `\w` into character class units).
3. **Parser**: Recursively builds an AST by matching lexemes to the grammar of modern regex systems (ECMAScript and PCRE).
4. **AST Formatter**: Validates parent-child relationships and assigns unique stable IDs (`id`) to every node so that visual representations persist flawlessly.

## Error Recovery & Intelligent Suggestions

The parser is designed with an **intelligent fault-tolerant parser** that catches typical typing errors and syntax violations instead of outright crashing.

### Example Case: Unclosed Groups
When the parser detects a missing closing grouping parenthesis:

- **Malformed Input**: `(\d+`
- **Parser Diagnostics**: Generates a parsing error structure.
- **Suggestion Engine**: Under the hood, recommends adding a `)` token at the appropriate location.

```typescript
const result = parseRegex("(\\d+");
if (!result.success) {
  console.log(result.error.message); // "Unclosed capture group detected at position 1."
  console.log(result.error.suggestion); // "Append ')' to resolve the unclosed group."
}
```

## Known Limitations

- **Complex Extended Conditionals**: Extremely complex nested engine-specific conditionals (e.g., `(?(DEFINE)...)`) may fall back to parsing as literal collections.
- **PCRE-Specific Directives**: Core PCRE controls like `(*SKIP)` are recognized as literal blocks rather than first-class interactive flow objects.
