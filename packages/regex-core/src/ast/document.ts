/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';
import { generateId } from './factory';

export interface RegexDocument {
  id: string;
  version: number;
  name: string;
  root: ASTNode[]; // Supports hierarchical node arrays or single root wrapper
  flags: {
    global: boolean;
    ignoreCase: boolean;
    multiline: boolean;
    dotAll: boolean;
    unicode: boolean;
    sticky: boolean;
  } | string[];
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
    sampleText?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// Legacy container definition (for DB backward-compatibility)
export interface RegexProject {
  id: string;
  name: string;
  ast: ASTNode[];
  flags: {
    global: boolean;
    ignoreCase: boolean;
    multiline: boolean;
    dotAll: boolean;
    unicode: boolean;
    sticky: boolean;
  };
  sampleText: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function createDocument(name = 'Untitled Pattern'): RegexDocument {
  return {
    id: generateId(),
    version: 3,
    name,
    root: [],
    flags: {
      global: true,
      ignoreCase: false,
      multiline: false,
      dotAll: false,
      unicode: false,
      sticky: false,
    },
    metadata: {
      description: '',
      notes: '',
      sampleText: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
