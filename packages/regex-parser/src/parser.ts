/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, generateId, Quantifier } from '@thulasidharan96/regex-core';
import { Token, TokenType } from './tokenizer';
import { Lexer } from './lexer';
import { ParserError } from './errors';

export interface ParseResult {
  ast: ASTNode[];
  errors: ParserError[];
}

export class Parser {
  private lexer: Lexer;
  private errors: ParserError[] = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;
  }

  parse(): ParseResult {
    this.errors = [];
    const ast = this.parseSequence();
    return { ast, errors: this.errors };
  }

  private parseSequence(): ASTNode[] {
    const nodes: ASTNode[] = [];

    while (!this.lexer.isAtEnd()) {
      const token = this.lexer.peek();
      if (!token) break;

      if (token.type === 'GROUP_END') {
        // Handled by group parsing caller
        break;
      }

      if (token.type === 'ALTERNATION') {
        // Handled at sequence level
        break;
      }

      const parsedNode = this.parseNode();
      if (parsedNode) {
        nodes.push(parsedNode);
      }
    }

    // Now, handle alternations
    if (!this.lexer.isAtEnd() && this.lexer.peek()?.type === 'ALTERNATION') {
      const alternatives: ASTNode[][] = [nodes];
      while (!this.lexer.isAtEnd() && this.lexer.peek()?.type === 'ALTERNATION') {
        this.lexer.consume(); // consume '|'
        const nextSeq = this.parseSequence();
        alternatives.push(nextSeq);
      }

      // Wrap in an alternation node
      const children = alternatives.map(alt => {
        return {
          id: generateId(),
          type: 'alternative' as any,
          children: alt,
          properties: {}
        };
      });

      return [{
        id: generateId(),
        type: 'alternation',
        children,
        properties: {}
      }];
    }

    return nodes;
  }

  private parseNode(): ASTNode | null {
    const token = this.lexer.consume();
    if (!token) return null;

    let node: ASTNode | null = null;

    switch (token.type) {
      case 'DOT':
        node = {
          id: generateId(),
          type: 'dot',
          properties: {},
          position: { start: token.start, end: token.end },
          location: { start: token.start, end: token.end }
        };
        break;

      case 'ANCHOR':
        node = {
          id: generateId(),
          type: token.value === '^' ? 'startAnchor' : 'endAnchor',
          properties: {},
          position: { start: token.start, end: token.end },
          location: { start: token.start, end: token.end }
        };
        break;

      case 'BACKREFERENCE':
        node = {
          id: generateId(),
          type: 'backreference',
          properties: { index: token.properties?.index },
          position: { start: token.start, end: token.end },
          location: { start: token.start, end: token.end }
        };
        break;

      case 'ESCAPE': {
        const val = token.properties?.value || '';
        if (val === 'd') {
          node = {
            id: generateId(),
            type: 'digit',
            properties: { charType: 'digit' },
            position: { start: token.start, end: token.end },
            location: { start: token.start, end: token.end },
            charType: 'digit'
          };
        } else if (val === 'w') {
          node = {
            id: generateId(),
            type: 'word',
            properties: { charType: 'word' },
            position: { start: token.start, end: token.end },
            location: { start: token.start, end: token.end },
            charType: 'word'
          };
        } else if (val === 's') {
          node = {
            id: generateId(),
            type: 'space',
            properties: { charType: 'space' },
            position: { start: token.start, end: token.end },
            location: { start: token.start, end: token.end },
            charType: 'space'
          };
        } else if (val === 'b') {
          node = {
            id: generateId(),
            type: 'wordBoundary',
            properties: { boundaryType: 'word' },
            position: { start: token.start, end: token.end },
            location: { start: token.start, end: token.end },
            boundaryType: 'word'
          };
        } else {
          // Standard escaped character (e.g. \*, \+, etc.)
          node = {
            id: generateId(),
            type: 'literal',
            properties: { value: val },
            position: { start: token.start, end: token.end },
            location: { start: token.start, end: token.end },
            value: val
          };
        }
        break;
      }

      case 'LITERAL':
        node = {
          id: generateId(),
          type: 'literal',
          properties: { value: token.value },
          position: { start: token.start, end: token.end },
          location: { start: token.start, end: token.end },
          value: token.value
        };
        break;

      case 'BRACKET_START':
        node = this.parseCharset(token);
        break;

      case 'GROUP_START':
        node = this.parseGroup(token);
        break;

      case 'GROUP_END':
        // Unmatched closing group
        this.errors.push({
          position: token.start,
          message: 'Unmatched closing group parenthesis',
          error: 'Unmatched closing group',
          suggestion: 'Remove ) or add open ('
        });
        return null;

      case 'QUANTIFIER':
        // Floating quantifier without target
        this.errors.push({
          position: token.start,
          message: `Quantifier ${token.value} has no preceding target element`,
          error: 'Orphaned quantifier',
          suggestion: 'Add a character or group before the quantifier'
        });
        return null;

      default:
        break;
    }

    if (!node) return null;

    // Post-processing quantifiers on this node
    const nextToken = this.lexer.peek();
    if (nextToken && nextToken.type === 'QUANTIFIER') {
      const quantToken = this.lexer.consume()!;
      const isLazy = !!quantToken.properties?.lazy;
      
      let min = 0;
      let max: number | null = null;
      let type: 'none' | '*' | '+' | '?' | 'custom' = 'custom';

      if (quantToken.properties?.quantifierType === '*') {
        type = '*';
        min = 0;
        max = null;
      } else if (quantToken.properties?.quantifierType === '+') {
        type = '+';
        min = 1;
        max = null;
      } else if (quantToken.properties?.quantifierType === '?') {
        type = '?';
        min = 0;
        max = 1;
      } else if (quantToken.properties?.quantifierType === 'custom') {
        type = 'custom';
        min = quantToken.properties.min ?? 0;
        max = quantToken.properties.max ?? null;
      }

      const qObj: Quantifier = {
        type,
        min,
        max,
        lazy: isLazy
      };

      // Wrap node in a quantifier or lazyQuantifier node
      node = {
        id: generateId(),
        type: isLazy ? 'lazyQuantifier' : 'quantifier',
        children: [node],
        properties: { quantifier: qObj },
        position: { start: node.position?.start ?? token.start, end: quantToken.end },
        location: { start: node.location?.start ?? token.start, end: quantToken.end },
        quantifier: qObj
      };
    }

    return node;
  }

  private parseGroup(startToken: Token): ASTNode {
    const groupType = startToken.properties?.groupType || 'capture';
    const name = startToken.properties?.name;

    const children = this.parseSequence();

    const endToken = this.lexer.peek();
    if (endToken && endToken.type === 'GROUP_END') {
      this.lexer.consume(); // consume ')'
    } else {
      // Error recovery: missing closing group
      this.errors.push({
        position: startToken.start,
        message: `Missing closing parenthesis for group starting at position ${startToken.start}`,
        error: 'Missing closing group',
        suggestion: 'Add )'
      });
    }

    let nodeType: ASTNode['type'] = 'captureGroup';
    if (groupType === 'namedCapture') {
      nodeType = 'namedGroup';
    } else if (groupType === 'nonCapture') {
      nodeType = 'nonCaptureGroup';
    } else if (groupType === 'lookahead') {
      nodeType = 'lookahead';
    } else if (groupType === 'negativeLookahead') {
      nodeType = 'negativeLookahead';
    } else if (groupType === 'lookbehind') {
      nodeType = 'lookbehind';
    } else if (groupType === 'negativeLookbehind') {
      nodeType = 'negativeLookbehind';
    }

    return {
      id: generateId(),
      type: nodeType,
      children,
      properties: {
        groupType: groupType === 'namedCapture' ? 'named' : groupType === 'nonCapture' ? 'non-capture' : groupType as any,
        name
      },
      position: { start: startToken.start, end: endToken ? endToken.end : this.lexer.getPosition() },
      location: { start: startToken.start, end: endToken ? endToken.end : this.lexer.getPosition() },
      groupType: groupType === 'namedCapture' ? 'named' : groupType === 'nonCapture' ? 'non-capture' : groupType as any,
      name
    };
  }

  private parseCharset(startToken: Token): ASTNode {
    // Read elements until BRACKET_END
    const children: ASTNode[] = [];
    let negated = false;

    // Check for negation right after [
    let firstToken = this.lexer.peek();
    if (firstToken && firstToken.type === 'ANCHOR' && firstToken.value === '^') {
      negated = true;
      this.lexer.consume();
    }

    while (!this.lexer.isAtEnd()) {
      const token = this.lexer.peek();
      if (!token || token.type === 'BRACKET_END') {
        break;
      }

      // Look for a range, e.g. a-z
      const nextToken1 = this.lexer.peek(1);
      const nextToken2 = this.lexer.peek(2);

      if (
        token.type === 'LITERAL' &&
        nextToken1 && nextToken1.type === 'LITERAL' && nextToken1.value === '-' &&
        nextToken2 && nextToken2.type === 'LITERAL'
      ) {
        // It's a range!
        const startChar = token.value;
        const endChar = nextToken2.value;
        this.lexer.consume(); // start
        this.lexer.consume(); // '-'
        this.lexer.consume(); // end

        const rangeItem = {
          id: generateId(),
          start: startChar,
          end: endChar
        };

        children.push({
          id: generateId(),
          type: 'range',
          properties: { start: startChar, end: endChar },
          position: { start: token.start, end: nextToken2.end },
          location: { start: token.start, end: nextToken2.end },
          ranges: [rangeItem] // for backward-compatibility
        });
      } else {
        // Just a single literal inside charset
        const literalToken = this.lexer.consume()!;
        children.push({
          id: generateId(),
          type: 'literal',
          properties: { value: literalToken.value },
          position: { start: literalToken.start, end: literalToken.end },
          location: { start: literalToken.start, end: literalToken.end },
          value: literalToken.value
        });
      }
    }

    const endToken = this.lexer.peek();
    if (endToken && endToken.type === 'BRACKET_END') {
      this.lexer.consume(); // consume ']'
    } else {
      this.errors.push({
        position: startToken.start,
        message: 'Missing closing bracket for character class',
        error: 'Missing closing bracket',
        suggestion: 'Add ]'
      });
    }

    const ranges = children
      .filter(c => c.type === 'range')
      .map(c => ({
        id: c.id,
        start: c.properties?.start || '',
        end: c.properties?.end || ''
      }));

    return {
      id: generateId(),
      type: 'charset',
      children,
      properties: {
        negated,
        ranges
      },
      position: { start: startToken.start, end: endToken ? endToken.end : this.lexer.getPosition() },
      location: { start: startToken.start, end: endToken ? endToken.end : this.lexer.getPosition() },
      negated,
      ranges
    };
  }
}
