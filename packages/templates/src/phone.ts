/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';

export const phoneTemplate = {
  id: 'phone',
  name: 'Phone Number',
  description: 'Matches typical US phone numbers with optional area code and separators',
  category: 'Validation',
  regex: '^(\\+1[- ]?)?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}$',
  ast: [
    { id: 'p1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'p2',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 3, max: 3, lazy: false }
      }
    },
    { id: 'p3', type: 'literal', properties: { value: '-' } },
    {
      id: 'p4',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 3, max: 3, lazy: false }
      }
    },
    { id: 'p5', type: 'literal', properties: { value: '-' } },
    {
      id: 'p6',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 4, max: 4, lazy: false }
      }
    },
    { id: 'p7', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['555-123-4567', '800-555-0199', '123-456-7890']
};
