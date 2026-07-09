/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';
import { RegexDocument } from './document';
import { validateRegexDocument } from './validator';
import { migrateNodeToAST2 } from './migration';

import { migrateDocument } from './migration';

export function serializeAST(root: ASTNode[]): string {
  return JSON.stringify(root, null, 2);
}

export function deserializeAST(jsonStr: string): ASTNode[] {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('Deserialized AST must be an array');
  }
  return parsed.map(migrateNodeToAST2);
}

export function serializeDocument(doc: RegexDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function deserializeDocument(jsonStr: string): RegexDocument {
  const parsed = JSON.parse(jsonStr);
  const errors = validateRegexDocument(parsed);
  if (errors.length > 0) {
    throw new Error(`Invalid document schema: ${errors.join('; ')}`);
  }
  return parsed;
}

export function exportDocument(doc: RegexDocument): string {
  return serializeDocument(doc);
}

export function importDocument(jsonStr: string): RegexDocument {
  const parsed = JSON.parse(jsonStr);
  return migrateDocument(parsed);
}
