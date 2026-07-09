# Regex Studio Compiler

The `@regex-studio/regex-compiler` module is responsible for compiling the interactive Abstract Syntax Tree (AST) back into standard, optimized, engine-compliant regular expression strings.

## Compiler Architecture

A single visual structure needs to be output into multiple different language environments. The compiler leverages specific **target translation strategies**:

```
            ┌──► JavaScript Target
            ├──► Python Target
Regex AST  ─┼──► Go Target
            ├──► Rust Target
            └──► (and others)
```

## Compilation Engines

The compiler offers full syntax translations for:

1. **JavaScript & TypeScript**: Native engine support (`RegExp`).
2. **Python**: Python-specific syntax, such as named groups like `(?P<name>...)` instead of JavaScript `(?<name>...)`.
3. **Go**: Compiles expressions utilizing the simplified `RE2` specifications (automatically flags and strips unsupported lookaround groups).
4. **Rust**: Target-optimized `regex` crate expressions (converts backreferences to compatible literal classes if needed).
5. **Java**: Native java class compatible patterns.
6. **PHP**: Delimited PCRE expressions.
7. **C#**: System.Text.RegularExpressions patterns.
8. **Ruby**: Oniguruma-compliant patterns.

## Compatibility Layers & Feature Maps

Different engines support different subsets of features. The compiler handles these differences gracefully:

| Feature | JavaScript | Python | Go (RE2) | Rust |
|---|---|---|---|---|
| Lookaheads | ✅ Yes | ✅ Yes | ❌ Stripped | ❌ Stripped |
| Lookbehinds | ✅ Yes | ✅ Yes | ❌ Stripped | ❌ Stripped |
| Named Groups | `(?<name>...)` | `(?P<name>...)` | `(?P<name>...)` | `(?P<name>...)` |
| Backreferences | `\1` | `\1` | ❌ Warns | ❌ Warns |

### Example Compilation

```typescript
import { compileAST } from '@regex-studio/regex-compiler';

const myAST = [
  { id: '1', type: 'character', properties: { charType: 'digit' } }
];

const jsRegexString = compileAST(myAST, 'javascript'); // "\d"
const pythonRegexString = compileAST(myAST, 'python'); // "\d"
```
