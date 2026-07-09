/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export const urlTemplate = {
  id: 'url',
  name: 'URL',
  description: 'Standard URL validation matching http and https links',
  category: 'Validation',
  regex: '^https?:\\/\\/[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(\\/\\S*)?$',
  ast: [
    { id: 'u1', type: 'anchor', properties: { boundaryType: 'start' } },
    { id: 'u2', type: 'literal', properties: { value: 'http' } },
    {
      id: 'u3',
      type: 'literal',
      properties: {
        value: 's',
        quantifier: { type: '?', min: 0, max: 1, lazy: false }
      }
    },
    { id: 'u4', type: 'literal', properties: { value: '://' } },
    {
      id: 'u5',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'u6', type: 'literal', properties: { value: '.' } },
    {
      id: 'u7',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: 'custom', min: 2, max: null, lazy: false }
      }
    },
    { id: 'u8', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['https://google.com', 'http://regex-studio.org', 'https://github.com/google']
};
