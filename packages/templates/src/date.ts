/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export const dateTemplate = {
  id: 'date',
  name: 'Date (YYYY-MM-DD)',
  description: 'Matches ISO standard date format YYYY-MM-DD',
  category: 'Validation',
  regex: '^\\d{4}-\\d{2}-\\d{2}$',
  ast: [
    { id: 'd1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 'd2',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 4, max: 4, lazy: false }
      }
    },
    { id: 'd3', type: 'literal', properties: { value: '-' } },
    {
      id: 'd4',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 2, max: 2, lazy: false }
      }
    },
    { id: 'd5', type: 'literal', properties: { value: '-' } },
    {
      id: 'd6',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 2, max: 2, lazy: false }
      }
    },
    { id: 'd7', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['2026-07-05', '1999-12-31', '2000-01-01']
};

export const timeTemplate = {
  id: 'time',
  name: 'Time (HH:MM:SS)',
  description: 'Matches 24-hour time format HH:MM:SS with optional seconds',
  category: 'Validation',
  regex: '^(2[0-3]|[01]?[0-9]):[0-5][0-9](:[0-5][0-9])?$',
  ast: [
    { id: 't1', type: 'anchor', properties: { boundaryType: 'start' } },
    {
      id: 't2',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 2, max: 2, lazy: false }
      }
    },
    { id: 't3', type: 'literal', properties: { value: ':' } },
    {
      id: 't4',
      type: 'character',
      properties: {
        charType: 'digit',
        quantifier: { type: 'custom', min: 2, max: 2, lazy: false }
      }
    },
    { id: 't5', type: 'anchor', properties: { boundaryType: 'end' } }
  ] as ASTNode[],
  examples: ['14:15:12', '09:30:00', '23:59:59']
};
