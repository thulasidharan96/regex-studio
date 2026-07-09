/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Token, tokenize } from './tokenizer';

export class Lexer {
  private tokens: Token[];
  private index = 0;

  constructor(regexStr: string) {
    this.tokens = tokenize(regexStr);
  }

  getTokens(): Token[] {
    return this.tokens;
  }

  peek(offset = 0): Token | null {
    const target = this.index + offset;
    if (target < 0 || target >= this.tokens.length) {
      return null;
    }
    return this.tokens[target];
  }

  next(): Token | null {
    if (this.index >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.index++];
  }

  consume(): Token | null {
    return this.next();
  }

  getPosition(): number {
    const current = this.peek();
    if (current) return current.start;
    const prev = this.peek(-1);
    if (prev) return prev.end;
    return 0;
  }

  isAtEnd(): boolean {
    return this.index >= this.tokens.length;
  }
}
