/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { compileAST } from './compiler';
import { javascript, python } from './index';

describe('Regex Compiler', () => {
  it('should compile AST to JavaScript regex', () => {
    const ast = [{ id: '1', type: 'literal' as const, properties: { value: 'test' } }];
    const code = javascript.generateCode(ast);
    expect(code).toBe('test');
  });

  it('should compile AST to Python regex', () => {
    const ast = [{ id: '1', type: 'character' as const, properties: { charType: 'digit' } }];
    const code = python.generateCode(ast);
    expect(code).toBe('\\d');
  });
});
