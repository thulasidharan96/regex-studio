/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { analyzeAST, performanceScore } from './index';

describe('Regex Analyzer', () => {
  it('should calculate perfect score for safe ASTs', () => {
    const ast = [{ id: '1', type: 'literal' as const, properties: { value: 'test' } }];
    const score = performanceScore(ast);
    expect(score).toBe(100);
  });

  it('should warn on nested infinite quantifiers', () => {
    const ast = [
      {
        id: '1',
        type: 'captureGroup' as const,
        quantifier: { type: '*' as const, min: 0, max: null, lazy: false },
        properties: {
          quantifier: { type: '*' as const, min: 0, max: null, lazy: false }
        },
        children: [
          {
            id: '2',
            type: 'literal' as const,
            quantifier: { type: '*' as const, min: 0, max: null, lazy: false },
            properties: {
              value: 'a',
              quantifier: { type: '*' as const, min: 0, max: null, lazy: false }
            }
          }
        ]
      }
    ];
    const issues = analyzeAST(ast);
    const hasCatastrophic = issues.some(issue => issue.severity === 'high');
    expect(hasCatastrophic).toBe(true);
  });
});
