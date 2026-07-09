/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface EditorState {
  selectedNodeId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  activePanel: 'canvas' | 'editor' | 'debugger';
  monacoState: {
    lineCount: number;
    cursorPosition: { line: number; ch: number };
  };
  setSelectedNodeId: (id: string | null) => void;
  setZoom: (z: number) => void;
  resetPan: () => void;
  setActivePanel: (panel: 'canvas' | 'editor' | 'debugger') => void;
  setMonacoState: (state: Partial<EditorState['monacoState']>) => void;
  updatePan: (x: number, y: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNodeId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  activePanel: 'canvas',
  monacoState: {
    lineCount: 1,
    cursorPosition: { line: 1, ch: 1 },
  },
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setZoom: (z) => set({ zoom: z }),
  resetPan: () => set({ zoom: 1, panX: 0, panY: 0 }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setMonacoState: (state) => set((prev) => ({
    monacoState: { ...prev.monacoState, ...state }
  })),
  updatePan: (x, y) => set({ panX: x, panY: y }),
}));

// Provide useCanvasStore alias as required by apps/web
export const useCanvasStore = useEditorStore;
