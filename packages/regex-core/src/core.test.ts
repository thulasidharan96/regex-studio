/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { serializeAST, deserializeAST, exportDocument, importDocument } from './ast/serializer';
import { ASTNode } from './ast/nodes';

describe('Regex Core AST', () => {
  it('should serialize and deserialize AST correctly', () => {
    const ast: ASTNode[] = [
      { id: '1', type: 'literal', properties: { value: 'test' } }
    ];
    const serialized = serializeAST(ast);
    const deserialized = deserializeAST(serialized);
    expect(deserialized[0].type).toBe('literal');
    expect(deserialized[0].properties?.value).toBe('test');
  });

  it('should export and import documents cleanly', () => {
    const doc = {
      id: 'doc-1',
      version: 3,
      name: 'Test Document',
      root: [{ id: '2', type: 'character', properties: { charType: 'digit' } }],
      flags: { global: true, ignoreCase: false, multiline: false, dotAll: false, unicode: false, sticky: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };
    const exported = exportDocument(doc);
    const imported = importDocument(exported);
    expect(imported.id).toBe('doc-1');
    expect(imported.version).toBe(3);
    expect(imported.root[0].type).toBe('character');
  });
});
