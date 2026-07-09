/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export interface ASTDiffItem {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  nodeId?: string;
  nodeType: string;
  description: string;
  path: string; // Breadcrumb path, e.g. "root.1" or "captureGroup.0"
}

/**
 * Helper to compute human-readable description for node types.
 */
function getNodeLabel(node: ASTNode): string {
  const props = node.properties || {};
  const val = props.value !== undefined ? props.value : node.value;
  switch (node.type) {
    case 'literal': return `literal "${val || ''}"`;
    case 'character': return `character class \\${props.charType || 'w'}`;
    case 'charset': return 'character range set';
    case 'alternation': return 'alternation OR branch';
    case 'captureGroup': return 'capture group (...)';
    case 'lookaround': return `${props.lookaroundType || 'lookahead'} anchor`;
    case 'anchor': return `anchor marker ^ or $`;
    default: return node.type;
  }
}

/**
 * Recursively diffs two lists of ASTNodes.
 */
export function diffAST(
  nodesA: ASTNode[] = [],
  nodesB: ASTNode[] = [],
  pathPrefix: string = 'root'
): ASTDiffItem[] {
  const diffs: ASTDiffItem[] = [];
  const maxLen = Math.max(nodesA.length, nodesB.length);

  for (let i = 0; i < maxLen; i++) {
    const nodeA = nodesA[i];
    const nodeB = nodesB[i];
    const currentPath = `${pathPrefix}.${i}`;

    if (nodeA && !nodeB) {
      // Node was deleted
      diffs.push({
        type: 'removed',
        nodeId: nodeA.id,
        nodeType: nodeA.type,
        description: `Removed ${getNodeLabel(nodeA)}`,
        path: currentPath
      });
    } else if (!nodeA && nodeB) {
      // Node was added
      diffs.push({
        type: 'added',
        nodeId: nodeB.id,
        nodeType: nodeB.type,
        description: `Added ${getNodeLabel(nodeB)}`,
        path: currentPath
      });
    } else {
      // Both nodes exist: check if they are identical
      const typeChanged = nodeA.type !== nodeB.type;
      
      // Compare properties
      const propsA = JSON.stringify(nodeA.properties || {});
      const propsB = JSON.stringify(nodeB.properties || {});
      const propsChanged = propsA !== propsB;

      if (typeChanged) {
        diffs.push({
          type: 'changed',
          nodeId: nodeB.id,
          nodeType: nodeB.type,
          description: `Changed node type from "${nodeA.type}" to "${nodeB.type}"`,
          path: currentPath
        });
      } else if (propsChanged) {
        diffs.push({
          type: 'changed',
          nodeId: nodeB.id,
          nodeType: nodeB.type,
          description: `Modified properties of ${getNodeLabel(nodeB)}`,
          path: currentPath
        });
      } else {
        // Unchanged
        diffs.push({
          type: 'unchanged',
          nodeId: nodeB.id,
          nodeType: nodeB.type,
          description: `Unchanged ${getNodeLabel(nodeB)}`,
          path: currentPath
        });
      }

      // Check children recursively
      const childrenA = nodeA.children || [];
      const childrenB = nodeB.children || [];
      if (childrenA.length > 0 || childrenB.length > 0) {
        const childDiffs = diffAST(childrenA, childrenB, `${currentPath}.${nodeB.type}`);
        diffs.push(...childDiffs);
      }
    }
  }

  return diffs;
}

/**
 * Summarizes the comparison reports.
 */
export function summarizeDiff(diffs: ASTDiffItem[]): {
  addedCount: number;
  removedCount: number;
  changedCount: number;
  hasChanges: boolean;
} {
  const addedCount = diffs.filter(d => d.type === 'added').length;
  const removedCount = diffs.filter(d => d.type === 'removed').length;
  const changedCount = diffs.filter(d => d.type === 'changed').length;
  return {
    addedCount,
    removedCount,
    changedCount,
    hasChanges: addedCount > 0 || removedCount > 0 || changedCount > 0
  };
}
