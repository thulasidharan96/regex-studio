/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';

export const passwordTemplate = {
  id: 'password',
  name: 'Strong Password',
  description: 'At least 8 characters, containing 1 uppercase, 1 lowercase, 1 digit, and 1 special character',
  category: 'Security',
  regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
  ast: [
    { id: 'pw1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'pw2',
      type: 'lookahead',
      children: [
        {
          id: 'pw2_1',
          type: 'character',
          properties: {
            charType: 'any',
            quantifier: { type: '*', min: 0, max: null, lazy: false }
          }
        },
        {
          id: 'pw2_2',
          type: 'character',
          properties: { charType: 'word' }
        }
      ]
    },
    { id: 'pw3', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['P@ssw0rd123', 'S7r0ng_P@ss', 'Admin!234']
};
