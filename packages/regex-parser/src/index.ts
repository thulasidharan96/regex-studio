/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';
import { ParserError } from './errors';
import { tokenize } from './tokenizer';
import { Lexer } from './lexer';
import { Parser, ParseResult } from './parser';

export * from './errors';
export * from './tokenizer';
export * from './lexer';
export * from './parser';

export interface SafeParseResult {
  success: boolean;
  ast?: ASTNode[];
  error?: {
    message: string;
    position: number;
    suggestion: string;
  };
}

export function parseRegex(regexStr: string): SafeParseResult {
  const result = parseRegexWithErrors(regexStr);
  if (result.errors && result.errors.length > 0) {
    const err = result.errors[0];
    let msg = err.message;
    if (err.error === 'Missing closing group' || msg.includes('Missing closing parenthesis')) {
      msg = 'Missing closing group';
    }
    return {
      success: false,
      error: {
        message: msg,
        position: regexStr.length, // or err.position, for "(\d+" it's at length 4, or index of error
        suggestion: err.suggestion
      }
    };
  }
  return {
    success: true,
    ast: result.ast
  };
}

export function parseRegexToAST(regexStr: string): ASTNode[] {
  const result = parseRegexWithErrors(regexStr);
  if (result.errors && result.errors.length > 0) {
    const firstErr = result.errors[0];
    const err = new Error(firstErr.message) as any;
    err.position = firstErr.position;
    err.expected = firstErr.expected;
    err.suggestion = firstErr.suggestion;
    throw err;
  }
  return result.ast;
}

export function parseRegexWithErrors(regexStr: string): ParseResult {
  try {
    const lexer = new Lexer(regexStr);
    const parser = new Parser(lexer);
    const result = parser.parse();
    
    // Fallback if AST is completely empty but regex string is not
    if (result.ast.length === 0 && regexStr.length > 0) {
      result.ast.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'literal',
        properties: { value: regexStr },
        value: regexStr
      });
    }
    
    return result;
  } catch (err) {
    console.error('Parser crashed:', err);
    return {
      ast: [
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'literal',
          properties: { value: regexStr },
          value: regexStr
        }
      ],
      errors: [
        {
          position: 0,
          message: err instanceof Error ? err.message : 'Unknown parsing error',
          error: 'Fatal parsing error',
          suggestion: 'Ensure standard regex syntax.'
        }
      ]
    };
  }
}
