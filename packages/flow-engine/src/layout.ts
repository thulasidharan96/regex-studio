/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FlowGraph, FlowNode, FlowEdge } from './types';
import { flowToAST } from './flow-to-ast';
import { astToFlow } from './ast-to-flow';

/**
 * Recalculates and resets optimal positions for all nodes automatically.
 */
export function autoLayout(nodes: FlowNode[], edges: FlowEdge[]): FlowGraph {
  const ast = flowToAST(nodes, edges);
  return astToFlow(ast);
}
