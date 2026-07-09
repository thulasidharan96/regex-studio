/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { parseRegexToAST, parseRegex } from './index';

describe('Regex Parser', () => {
  it('should parse simple literals correctly', () => {
    const ast = parseRegexToAST('hello');
    expect(ast.length).toBeGreaterThan(0);
    expect(ast[0].type).toBe('literal');
    expect(ast.map(node => node.value || node.properties?.value).join('')).toBe('hello');
  });

  it('should flag errors for unclosed groups', () => {
    const res = parseRegex('(hello');
    expect(res.success).toBe(false);
    expect(res.error?.message).toContain('group');
  });
});
