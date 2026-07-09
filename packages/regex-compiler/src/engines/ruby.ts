/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';
import { compileASTNode, CompilerOptions } from '../compiler';

export function compileRuby(nodes: ASTNode[]): string {
  return nodes.map(node => compileASTNode(node, { engine: 'pcre' as any })).join('');
}

export function generateCode(ast: ASTNode[], options?: CompilerOptions): string {
  return compileRuby(ast);
}
