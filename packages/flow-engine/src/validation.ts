/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlowNode, FlowEdge } from './types';

/**
 * Validates whether a connection between source and target nodes is syntactically sound.
 */
export function validateConnection(
  sourceId: string,
  targetId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): boolean {
  if (sourceId === targetId) return false;

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const sourceNode = nodeMap.get(sourceId);
  const targetNode = nodeMap.get(targetId);

  if (!sourceNode || !targetNode) return false;

  // Elements must be in the same parent block
  if (sourceNode.parentNode !== targetNode.parentNode) {
    return false;
  }

  // Prevent back-edges or cycles
  const adj = new Map<string, string[]>();
  edges.forEach(e => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  });

  if (!adj.has(sourceId)) adj.set(sourceId, []);
  adj.get(sourceId)!.push(targetId);

  const visited = new Set<string>();
  const stack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    stack.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (stack.has(neighbor)) {
        return true;
      }
    }

    stack.delete(node);
    return false;
  }

  return !hasCycle(sourceId);
}
