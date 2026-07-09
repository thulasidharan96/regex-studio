# Plugins & Extensibility

Regex Studio is designed to be highly modular. New patterns, static analysis algorithms, and language code generators can be registered seamlessly via three distinct extensibility systems.

## 1. Custom Exporters

Exporters take compiled regex string representations and package them into ready-to-use snippets for third-party schemas, libraries, and validation contexts.

### API Definition

```typescript
export interface Exporter {
  name: string;
  language: string;
  extension: string;
  generate(regex: string, flags: string): string;
}
```

### Example Implementation

```typescript
import { registerExporter } from '@regex-studio/regex-exporters';

registerExporter({
  name: "Zod Schema",
  language: "TypeScript",
  extension: "ts",
  generate(regex, flags) {
    return `import { z } from 'zod';\n\nexport const schema = z.string().regex(/${regex}/${flags}, "Invalid input format");`;
  }
});
```

---

## 2. Custom Analyzers

Analyzers statically scan the Abstract Syntax Tree (AST) before execution to detect potential performance issues, security flaws (like ReDoS), or logical errors.

### API Definition

```typescript
export interface AnalysisIssue {
  id: string;
  nodeId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Analyzer {
  name: string;
  check(ast: ASTNode[]): AnalysisIssue[];
}
```

### Example Implementation

```typescript
import { registerAnalyzer } from '@regex-studio/regex-analyzer';

registerAnalyzer({
  name: "Avoid Lazy Any",
  check(ast) {
    const issues: AnalysisIssue[] = [];
    walkAST(ast, (node) => {
      if (node.type === 'character' && node.properties?.charType === 'any') {
        if (node.quantifier?.lazy) {
          issues.push({
            id: 'lazy-any-warning',
            nodeId: node.id,
            title: "Performance Warning",
            description: "Lazy match-all patterns can degrade performance under deep backtracks.",
            severity: 'low'
          });
        }
      }
    });
    return issues;
  }
});
```

---

## 3. Custom Templates

Templates populate the library of standard starting expressions.

### Structure

```typescript
import { ASTNode } from '@regex-studio/regex-core';

export const customTemplate = {
  id: 'subdomain',
  name: 'Subdomain Matcher',
  description: 'Matches valid web domain subdomains',
  category: 'Network',
  regex: '^[a-z0-9-]+\\.domain\\.com$',
  ast: [
    // Array of pre-compiled ASTNodes
  ] as ASTNode[],
  examples: ['api.domain.com', 'blog.domain.com']
};
```
