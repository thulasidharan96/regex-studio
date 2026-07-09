/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode, generateId } from '@regex-studio/regex-core';
import { FlowNode, FlowEdge, FlowGraph } from './types';

export function getNodeLabel(node: ASTNode): string {
  const props = node.properties || {};
  const value = props.value !== undefined ? props.value : node.value;
  const name = props.name !== undefined ? props.name : node.name;

  switch (node.type) {
    case 'literal': return `Text: "${value || ''}"`;
    case 'dot': return 'Any Char (.)';
    case 'digit': return 'Digit (\\d)';
    case 'word': return 'Word (\\w)';
    case 'space': return 'Space (\\s)';
    case 'startAnchor': return 'Start Anchor (^)';
    case 'endAnchor': return 'End Anchor ($)';
    case 'wordBoundary': return 'Word Boundary (\\b)';
    case 'charset': return `Chars: [${props.negated ? '^' : ''}]`;
    case 'range': return `Range: ${props.start || ''}-${props.end || ''}`;
    case 'captureGroup': return 'Capture Group';
    case 'namedGroup': return `Group: "${name || 'name'}"`;
    case 'nonCaptureGroup': return 'Non-Capturing Group';
    case 'lookahead': return 'Lookahead (?=)';
    case 'negativeLookahead': return 'Neg-Lookahead (?!)';
    case 'lookbehind': return 'Lookbehind (?<=)';
    case 'negativeLookbehind': return 'Neg-Lookbehind (?<!)';
    case 'alternation': return 'OR (Alternation)';
    case 'backreference': return `Backref: \\${value || '1'}`;
    case 'quantifier': return 'Quantifier';
    case 'lazyQuantifier': return 'Lazy Quantifier';
    default: return node.type;
  }
}

export function astToFlow(ast: ASTNode[]): FlowGraph {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  function layoutSequence(
    sequence: ASTNode[],
    parentId?: string,
    startX = 30,
    startY = 40
  ): { width: number; height: number; firstId: string | null; lastId: string | null } {
    if (sequence.length === 0) {
      return { width: 0, height: 0, firstId: null, lastId: null };
    }

    let currentX = startX;
    let maxChildHeight = 60;
    let prevNodeId: string | null = null;
    let firstNodeId: string | null = null;

    for (let i = 0; i < sequence.length; i++) {
      const astNode = sequence[i];
      const nodeType = astNode.type;
      const nodeId = astNode.id || generateId();
      
      let nodeWidth = 160;
      let nodeHeight = 60;

      const isGroup = [
        'captureGroup',
        'namedGroup',
        'nonCaptureGroup',
        'lookahead',
        'negativeLookahead',
        'lookbehind',
        'negativeLookbehind'
      ].includes(nodeType);

      if (isGroup && astNode.children && astNode.children.length > 0) {
        const innerLayout = layoutSequence(astNode.children, nodeId, 20, 40);
        nodeWidth = Math.max(180, innerLayout.width + 40);
        nodeHeight = Math.max(80, innerLayout.height + 60);
      } else if (nodeType === 'alternation' && astNode.children && astNode.children.length > 0) {
        let totalBranchHeight = 0;
        let maxBranchWidth = 120;
        
        astNode.children.forEach((branch) => {
          const branchChildren = branch.children || [];
          const branchLayout = layoutSequence(branchChildren, nodeId, 40, totalBranchHeight + 40);
          maxBranchWidth = Math.max(maxBranchWidth, branchLayout.width);
          totalBranchHeight += Math.max(60, branchLayout.height) + 30;
        });

        nodeWidth = maxBranchWidth + 80;
        nodeHeight = totalBranchHeight + 50;
      }

      const flowNode: FlowNode = {
        id: nodeId,
        type: nodeType,
        position: { x: currentX, y: startY },
        data: {
          label: getNodeLabel(astNode),
          astNode
        },
        width: nodeWidth,
        height: nodeHeight
      };

      if (parentId) {
        flowNode.parentNode = parentId;
        flowNode.extent = 'parent';
      }

      nodes.push(flowNode);

      if (!firstNodeId) {
        firstNodeId = nodeId;
      }

      if (prevNodeId) {
        edges.push({
          id: `edge-${prevNodeId}-${nodeId}`,
          source: prevNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2 }
        });
      }

      prevNodeId = nodeId;
      currentX += nodeWidth + 60;
      maxChildHeight = Math.max(maxChildHeight, nodeHeight);
    }

    return {
      width: currentX - startX - 60 + 40,
      height: maxChildHeight + 20,
      firstId: firstNodeId,
      lastId: prevNodeId
    };
  }

  layoutSequence(ast);

  return { nodes, edges };
}
