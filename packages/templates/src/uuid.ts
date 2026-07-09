/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export const uuidTemplate = {
  id: 'uuid',
  name: 'UUID',
  description: 'Standard 36-character v4 UUID pattern validation',
  category: 'Validation',
  regex: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  ast: [
    { id: 'uu1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'uu2',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 8, max: 8, lazy: false }
      }
    },
    { id: 'uu3', type: 'literal', properties: { value: '-' } },
    {
      id: 'uu4',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 4, max: 4, lazy: false }
      }
    },
    { id: 'uu5', type: 'literal', properties: { value: '-' } },
    {
      id: 'uu6',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 12, max: 12, lazy: false }
      }
    },
    { id: 'uu7', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['123e4567-e89b-12d3-a456-426614174000', 'de305d54-75b4-431b-adb2-eb6b9e546014']
};
