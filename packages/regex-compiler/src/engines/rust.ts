/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';
import { compileASTNode, CompilerOptions } from '../compiler';

export function compileRust(nodes: ASTNode[]): string {
  return nodes.map(node => compileASTNode(node, { engine: 'rust' as any })).join('');
}

export function generateCode(ast: ASTNode[], options?: CompilerOptions): string {
  return compileRust(ast);
}
