/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@regex-studio/regex-core';
import { compileASTNode, CompilerOptions } from '../compiler';

export function compileJS(nodes: ASTNode[]): string {
  return nodes.map(node => compileASTNode(node, { engine: 'javascript' })).join('');
}

export function generateCode(ast: ASTNode[], options?: CompilerOptions): string {
  return compileJS(ast);
}
