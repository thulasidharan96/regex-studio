/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';

export const ipv4Template = {
  id: 'ipv4',
  name: 'IPv4 Address',
  description: 'Matches standard dotted-quad IPv4 addresses',
  category: 'Network',
  regex: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
  ast: [
    { id: 'ip4_1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'ip4_2',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 1, max: 3, lazy: false }
      }
    },
    { id: 'ip4_3', type: 'literal', properties: { value: '.' } },
    {
      id: 'ip4_4',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 1, max: 3, lazy: false }
      }
    },
    { id: 'ip4_5', type: 'literal', properties: { value: '.' } },
    {
      id: 'ip4_6',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 1, max: 3, lazy: false }
      }
    },
    { id: 'ip4_7', type: 'literal', properties: { value: '.' } },
    {
      id: 'ip4_8',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 1, max: 3, lazy: false }
      }
    },
    { id: 'ip4_9', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['192.168.1.1', '10.0.0.1', '255.255.255.255']
};

export const ipv6Template = {
  id: 'ipv6',
  name: 'IPv6 Address',
  description: 'Matches typical 8-group hexadecimal colon-separated IPv6 addresses',
  category: 'Network',
  regex: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
  ast: [
    { id: 'ip6_1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'ip6_2',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: 'custom', min: 1, max: 4, lazy: false }
      }
    },
    { id: 'ip6_3', type: 'literal', properties: { value: ':' } },
    {
      id: 'ip6_4',
      type: 'character',
      properties: {
        charType: 'word',
        quantifier: { type: 'custom', min: 1, max: 4, lazy: false }
      }
    },
    { id: 'ip6_5', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['2001:db8:3333:4444:5555:6666:7777:8888', 'fe80::1', '::1']
};
