/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';

export const emailTemplate = {
  id: 'email',
  name: 'Email Address',
  description: 'Standard email validation matching user@domain.com',
  category: 'Validation',
  regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  ast: [
    { id: 'e1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'e2',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'e3', type: 'literal', properties: { value: '@' } },
    {
      id: 'e4',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'e5', type: 'literal', properties: { value: '.' } },
    {
      id: 'e6',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: 'custom', min: 2, max: null, lazy: false }
      }
    },
    { id: 'e7', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['user@example.com', 'first.last@domain.org', 'test-123@sub.domain.co']
};
