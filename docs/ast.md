# Abstract Syntax Tree (AST) Specification

The Abstract Syntax Tree (AST) is the definitive representation of a regular expression inside Regex Studio. All edits, visual nodes, code outputs, and debug traces are derived from this representation.

## RegexDocument Schema

A Regex Studio workspace is stored as a standard `RegexDocument`:

```json
{
  "id": "project-uuid-1234",
  "version": 3,
  "name": "E-mail Address Validation",
  "root": [
    {
      "id": "e1",
      "type": "anchor",
      "properties": {
        "boundaryType": "start"
      }
    },
    {
      "id": "e2",
      "type": "character",
      "properties": {
        "charType": "word",
        "quantifier": {
          "type": "+",
          "min": 1,
          "max": null,
          "lazy": false
        }
      }
    },
    {
      "id": "e3",
      "type": "literal",
      "properties": {
        "value": "@"
      }
    }
  ],
  "flags": {
    "global": true,
    "ignoreCase": true,
    "multiline": false,
    "dotAll": false,
    "unicode": true,
    "sticky": false
  },
  "createdAt": "2026-07-05T12:00:00Z",
  "updatedAt": "2026-07-05T12:05:00Z",
  "metadata": {}
}
```

## RegexNode Definitions

Every element in the AST extends the base `ASTNode` interface:

```typescript
interface ASTNode {
  id: string;          // Uniquely identifies this node in the canvas
  type: string;        // The syntactic category
  children?: ASTNode[]; // Nested nodes for groups, choices, and lookarounds
  properties?: {       // Custom options per type
    [key: string]: any;
  };
  location?: {         // Optional index ranges mapping back to original input string
    start: number;
    end: number;
  };
}
```

### Supported AST Node Types

1. **`literal`**: A raw text string or literal character sequence.
   - `properties: { value: string }`
2. **`character`**: Character classes (predefined or custom).
   - `properties: { charType: 'word' | 'digit' | 'space' | 'any' | 'custom', customValue?: string }`
3. **`captureGroup` / `group`**: Capturing or non-capturing parenthesis grouping.
   - `properties: { isCapturing: boolean, groupNumber?: number, groupName?: string }`
4. **`choice`**: Alternation representing an OR operator (`|`).
   - `children: ASTNode[]`
5. **`lookaround`**: Forward/backward lookaheads and lookbehinds.
   - `properties: { lookType: 'lookahead' | 'lookbehind', negative: boolean }`
6. **`anchor`**: Start or end boundary anchors (`^`, `$`, `\b`).
   - `properties: { boundaryType: 'start' | 'end' | 'wordBoundary' | 'nonWordBoundary' }`
7. **`reference`**: Backreferences to capture groups.
   - `properties: { groupIndex: number }`

## Quantifiers

Many nodes can possess an optional `quantifier` structure:

```typescript
interface Quantifier {
  type: '?' | '*' | '+' | 'custom';
  min: number;
  max: number | null; // null represents infinity
  lazy: boolean;      // True if non-greedy (e.g. *?)
}
```

## Core AST Utilities

Located in `@thulasidharan96/regex-core`:

- `createNode(type, properties)`: Safely initializes a new Node with a unique UUID.
- `walkAST(nodes, callback)`: Depth-first visitor pattern traversing nodes.
- `validateAST(nodes)`: Inspects nodes for structural anomalies and malformed values.
- `serializeAST(nodes)` / `deserializeAST(str)`: Handles lossless JSON string transformations.
- `migration system`: Automatically handles up-conversions of legacy v1 and v2 formats into version 3 schemas without losing custom user layouts.
