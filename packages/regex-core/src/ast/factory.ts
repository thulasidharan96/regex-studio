/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ASTNode } from './nodes';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createNode(
  type: ASTNode['type'],
  properties: Record<string, any> = {},
  children?: ASTNode[]
): ASTNode {
  const id = generateId();
  return {
    id,
    type,
    children,
    properties,
    ...properties
  };
}

export function cloneNode(node: ASTNode): ASTNode {
  const newId = generateId();
  const clonedChildren = node.children ? node.children.map(cloneNode) : undefined;
  const properties = node.properties ? { ...node.properties } : {};
  return {
    ...node,
    id: newId,
    children: clonedChildren,
    properties,
    ...properties
  };
}

export function findNode(root: ASTNode[], id: string): ASTNode | null {
  for (const node of root) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function replaceNode(root: ASTNode[], id: string, newNode: ASTNode): boolean {
  for (let i = 0; i < root.length; i++) {
    if (root[i].id === id) {
      root[i] = newNode;
      return true;
    }
    if (root[i].children) {
      const replaced = replaceNode(root[i].children!, id, newNode);
      if (replaced) {
        return true;
      }
    }
  }
  return false;
}

export function removeNode(root: ASTNode[], id: string): boolean {
  for (let i = 0; i < root.length; i++) {
    if (root[i].id === id) {
      root.splice(i, 1);
      return true;
    }
    if (root[i].children) {
      const removed = removeNode(root[i].children!, id);
      if (removed) {
        return true;
      }
    }
  }
  return false;
}

export function insertNode(
  root: ASTNode[],
  parentId: string | null,
  node: ASTNode,
  index?: number
): boolean {
  if (parentId === null) {
    if (index !== undefined) {
      root.splice(index, 0, node);
    } else {
      root.push(node);
    }
    return true;
  }

  for (const item of root) {
    if (item.id === parentId) {
      if (!item.children) {
        item.children = [];
      }
      if (index !== undefined) {
        item.children.splice(index, 0, node);
      } else {
        item.children.push(node);
      }
      return true;
    }
    if (item.children) {
      const inserted = insertNode(item.children, parentId, node, index);
      if (inserted) {
        return true;
      }
    }
  }
  return false;
}

export function moveNode(
  root: ASTNode[],
  id: string,
  targetParentId: string | null,
  targetIndex?: number
): boolean {
  const nodeToMove = findNode(root, id);
  if (!nodeToMove) return false;

  const cloned = { ...nodeToMove };
  const removed = removeNode(root, id);
  if (!removed) return false;

  return insertNode(root, targetParentId, cloned, targetIndex);
}
