/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';

export function walkAST(
  root: ASTNode[],
  callback: (node: ASTNode, parent: ASTNode | null) => void,
  parent: ASTNode | null = null
): void {
  for (const node of root) {
    callback(node, parent);
    if (node.children) {
      walkAST(node.children, callback, node);
    }
  }
}
