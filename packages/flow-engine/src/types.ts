/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from '@thulasidharan96/regex-core';

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    astNode: ASTNode;
    [key: string]: any;
  };
  parentNode?: string;
  extent?: 'parent';
  width?: number;
  height?: number;
  style?: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: any;
}

export interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
