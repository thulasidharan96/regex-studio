/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export const jwtTemplate = {
  id: 'jwt',
  name: 'JSON Web Token (JWT)',
  description: 'Matches typical 3-part base64url encoded JWT tokens',
  category: 'Security',
  regex: '^[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$',
  ast: [
    { id: 'j1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'j2',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'j3', type: 'literal', properties: { value: '.' } },
    {
      id: 'j4',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'j5', type: 'literal', properties: { value: '.' } },
    {
      id: 'j6',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: '+', min: 1, max: null, lazy: false }
      }
    },
    { id: 'j7', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c']
};
