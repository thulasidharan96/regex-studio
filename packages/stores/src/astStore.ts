/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { ASTNode } from '@regex-studio/regex-core';
import { parseRegexToAST } from '@regex-studio/regex-parser';
import { useProjectStore } from './projectStore';

export interface ASTState {
  selectedNode: ASTNode | null;
  setSelectedNode: (node: ASTNode | null) => void;
  getAST: () => ASTNode[];
  updateAST: (newAST: ASTNode[]) => void;
  updateNode: (id: string, updates: Partial<ASTNode>) => void;
  removeNode: (id: string) => void;
  insertNode: (node: ASTNode, parentId?: string, index?: number) => void;
  importRegExp: (rawPattern: string, flagsStr?: string) => boolean;
}

function updateNodeInTree(nodes: ASTNode[], id: string, updates: Partial<ASTNode>): ASTNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: ASTNode[], id: string): ASTNode[] {
  return nodes
    .filter(node => node.id !== id)
    .map(node => {
      if (node.children && node.children.length > 0) {
        return { ...node, children: removeNodeFromTree(node.children, id) };
      }
      return node;
    });
}

function insertNodeInTree(nodes: ASTNode[], insertNode: ASTNode, parentId?: string, index?: number): ASTNode[] {
  if (!parentId) {
    const newNodes = [...nodes];
    if (typeof index === 'number') {
      newNodes.splice(index, 0, insertNode);
    } else {
      newNodes.push(insertNode);
    }
    return newNodes;
  }
  return nodes.map(node => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children] : [];
      if (typeof index === 'number') {
        children.splice(index, 0, insertNode);
      } else {
        children.push(insertNode);
      }
      return { ...node, children };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: insertNodeInTree(node.children, insertNode, parentId, index) };
    }
    return node;
  });
}

export const useASTStore = create<ASTState>((set, get) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  getAST: () => {
    return useProjectStore.getState().activeProject?.ast || [];
  },

  updateAST: (newAST) => {
    const { updateProjectProperties } = useProjectStore.getState();
    updateProjectProperties({ ast: newAST });
  },

  updateNode: (id, updates) => {
    const currentAST = get().getAST();
    const updatedAST = updateNodeInTree(currentAST, id, updates);
    get().updateAST(updatedAST);

    // If the selected node is updated, update the selectedNode state
    const currentSelected = get().selectedNode;
    if (currentSelected && currentSelected.id === id) {
      set({ selectedNode: { ...currentSelected, ...updates } });
    }
  },

  removeNode: (id) => {
    const currentAST = get().getAST();
    const updatedAST = removeNodeFromTree(currentAST, id);
    get().updateAST(updatedAST);

    const currentSelected = get().selectedNode;
    if (currentSelected && currentSelected.id === id) {
      set({ selectedNode: null });
    }
  },

  insertNode: (node, parentId, index) => {
    const currentAST = get().getAST();
    const updatedAST = insertNodeInTree(currentAST, node, parentId, index);
    get().updateAST(updatedAST);
  },

  importRegExp: (rawPattern, flagsStr = '') => {
    try {
      let pattern = rawPattern;
      let finalFlags = flagsStr;
      
      if (rawPattern.startsWith('/') && rawPattern.lastIndexOf('/') > 0) {
        const lastSlash = rawPattern.lastIndexOf('/');
        pattern = rawPattern.substring(1, lastSlash);
        finalFlags = rawPattern.substring(lastSlash + 1);
      }

      const parsedAST = parseRegexToAST(pattern);
      
      const parsedFlags = {
        global: finalFlags.includes('g'),
        ignoreCase: finalFlags.includes('i'),
        multiline: finalFlags.includes('m'),
        dotAll: finalFlags.includes('s'),
        unicode: finalFlags.includes('u'),
        sticky: finalFlags.includes('y'),
      };

      const { updateProjectProperties } = useProjectStore.getState();
      updateProjectProperties({
        ast: parsedAST,
        flags: parsedFlags,
      });
      return true;
    } catch (err) {
      console.error('Zustand Import RegExp Error:', err);
      return false;
    }
  },
}));
