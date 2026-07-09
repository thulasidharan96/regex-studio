/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';
import { FlowNode, FlowEdge } from './types';

export function flowToAST(nodes: FlowNode[], edges: FlowEdge[]): ASTNode[] {
  const nodeMap = new Map<string, FlowNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const outEdges = new Map<string, string[]>();
  const inEdges = new Map<string, string[]>();

  edges.forEach(e => {
    if (!outEdges.has(e.source)) outEdges.set(e.source, []);
    outEdges.get(e.source)!.push(e.target);

    if (!inEdges.has(e.target)) inEdges.set(e.target, []);
    inEdges.get(e.target)!.push(e.source);
  });

  function buildSubAST(parentId?: string): ASTNode[] {
    const levelNodes = nodes.filter(n => n.parentNode === parentId);
    
    const roots = levelNodes.filter(n => {
      const incoming = inEdges.get(n.id) || [];
      const sameLevelIncoming = incoming.filter(src => {
        const srcNode = nodeMap.get(src);
        return srcNode && srcNode.parentNode === parentId;
      });
      return sameLevelIncoming.length === 0;
    });

    if (roots.length === 0 && levelNodes.length > 0) {
      roots.push(levelNodes[0]);
    }

    const astList: ASTNode[] = [];
    const visited = new Set<string>();

    roots.forEach(root => {
      let current: FlowNode | undefined = root;

      while (current && !visited.has(current.id)) {
        visited.add(current.id);

        const originalNode = current.data.astNode;
        const reconstructedNode: ASTNode = {
          ...originalNode,
          id: current.id,
          type: current.type as any,
          children: undefined
        };

        const canHaveChildren = [
          'captureGroup',
          'namedGroup',
          'nonCaptureGroup',
          'lookahead',
          'negativeLookahead',
          'lookbehind',
          'negativeLookbehind',
          'alternation',
          'charset',
          'quantifier',
          'lazyQuantifier'
        ].includes(current.type);

        if (canHaveChildren) {
          reconstructedNode.children = buildSubAST(current.id);
        }

        astList.push(reconstructedNode);

        const outgoing: string[] = outEdges.get(current.id) || [];
        const nextNodeId: string | undefined = outgoing.find((target: string) => {
          const tgtNode = nodeMap.get(target);
          return tgtNode && tgtNode.parentNode === parentId;
        });

        current = nextNodeId ? nodeMap.get(nextNodeId) : undefined;
      }
    });

    return astList;
  }

  return buildSubAST(undefined);
}
